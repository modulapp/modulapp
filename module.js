"use strict";

const EventEmitter = require('events').EventEmitter;
const ErrorsFactory = require('errors-factory');
const _ = require('lodash');

/**
 * Provide errors defined in ./resources/errors.json.
 *
 * @const {Object}
 * @enum {Error}
 *
 * @author nauwep <nauwep.dev@gmail.com>
 * @since //TODO since
 * @access private
 */
const _errors = new ErrorsFactory(require('./resources/errors.json'));

/**
 * Provide the Module events as defined in ./resources/events.json.
 *
 * @const {Object}
 * @enum {String}
 *
 * @author nauwep <nauwep.dev@gmail.com>
 * @since //TODO since
 * @access private
 */
const _events = require('./resources/events.json').module;

/**
 * Provide the Module status as defined in ./resources/status.json.
 *
 * @const {Object}
 * @enum {String}
 *
 * @author nauwep <nauwep.dev@gmail.com>
 * @since //TODO since
 * @access private
 */
const _status = require('./resources/status.json').module;

/**
 * Handle all private properties of all Module instances.
 *
 * @type {WeakMap}
 *
 * @readonly
 * @access private
 */
const privateProps = new WeakMap();

/**
 * Removes nulls, duplicates, flatten the Array and check if all dependencies are String.
 *
 * @summary Check a dependency list.
 *
 * @param  {?(Array.<String>|String)} dependencies The list of dependencies to check
 *
 * @return {!Array.<String>}  An Array of the cleaned dependencies
 *
 * @throws {Error} ERR_MOD_005 if a non-String dependency is found
 *
 * @author nauwep <nauwep.dev@gmail.com>
 * @since //TODO since
 * @access private
 */
function checkDependencies(dependencies) {

    if (_.isNull(dependencies)) {
        return [];
    } else if (_.isString(dependencies)) {
        return [dependencies];
    } else if (_.isArray(dependencies)) {

        dependencies = _.flattenDeep(dependencies);

        _.remove(dependencies, (value) => {
            return _.isNull(value);
        });
        _.forEach(dependencies, (value) => {
            if (!_.isString(value)) {
                throw _errors.ERR_MOD_005;
            }
        });
        dependencies = _.flattenDeep(dependencies);
        dependencies = _.uniq(dependencies);

        return dependencies;

    } else {
        throw _errors.ERR_MOD_005;
    }

}

/**
 * Class representing a Module.
 *
 * @emits Module#setting_up
 * @emits Module#setup
 * @emits Module#enabling
 * @emits Module#enabled
 * @emits Module#disabling
 * @emits Module#disabled
 * @emits Module#destroying
 * @emits Module#destroyed
 *
 * @example
 * const Module = require('modulapp').Module;
 * let myModule = new Module('myModule');
 *
 * myModule.foo = 'foo';
 * myModule.bar = function() {
 *     // this is a custom method
 * };
 *
 * myModule.setup = function(app, options, imports, done) {
 *     // this is overriding the setup  method
 *
 *     let logger = imports.logger;
 *     logger.log('setting up myModule');
 *     done(null);
 * };
 *
 * module.exports = myModule;
 *
 * @example
 * <caption>constructor with a String argument</caption>
 *
 * const Module = require('modulapp').Module;
 * let myModule = new Module('myModule');
 * console.log(myModule.id); // -> 'myModule'
 * console.log(myModule.status); // -> 'created'
 * console.log(myModule.version); // -> undefined
 * console.log(myModule.options); // -> {}
 * console.log(myModule.dependencies); // -> []
 *
 * @example
 * <caption>constructor with a Object argument</caption>
 *
 * const packagejson = require('package.json');
 * // {
 * //    name: 'myModule',
 * //    version: '1.0.0',
 * //    module: {
 * //      dependencies: ['logger'],
 * //      options: {
 * //        port: 8080
 * //      }
 * //    }
 * // }
 *
 * const Module = require('modulapp').Module;
 * let myModule = new Module('myModule');
 * console.log(myModule.id); // -> 'myModule'
 * console.log(myModule.status); //  ->'created'
 * console.log(myModule.version); // -> '1.0.0'
 * console.log(myModule.options); // -> {port: 8080}
 * console.log(myModule.dependencies); // -> ['logger']
 *
 * @class
 * @extends EventEmitter
 * @author nauwep <nauwep.dev@gmail.com>
 * @since //TODO since
 * @access public
 */
class Module extends EventEmitter {

    /**
     * The id parameter is required, it could be either a String or an Object representing the package.json.
     *
     * In case of the package.json is provided, the id, version, dependencies and options will be extracted from this Object.
     *
     * @summary Create a new instance of Module.
     *
     * @param {!(String|Object)} id Either a String id of the module or an Object representing the package.json
     * @param {?Object} [initialOptions={}] Options for the module
     *
     * @throws {Error} ERR_MOD_001 if the id parameter is null or undefined
     * @throws {Error} ERR_MOD_005 if something wrong on the dependency
     */
    constructor(id, initialOptions = {}) {

        let packagejson = null;

        if (_.isObject(id)) {
            packagejson = id;
            id = packagejson.name;
        }

        if (!id) {
            throw _errors.ERR_MOD_001;
        }

        super();

        let version;
        let options = {};
        let dependencies = [];

        if (_.isPlainObject(initialOptions)) {
            options = initialOptions;
        }

        if (packagejson) {
            version = packagejson.version;
            if (_.has(packagejson, 'module.dependencies')) {
                dependencies = checkDependencies(packagejson.module.dependencies);
            }
            if (_.has(packagejson, 'module.options')) {
                if (_.isPlainObject(packagejson.module.options)) {
                    options = _.merge(options, packagejson.module.options);
                }
            }
        }

        // store all properties in the private WeakMap
        privateProps.set(this, {
            id: id,
            status: _status.CREATED,
            version: version,
            options: options,
            dependencies: dependencies,
            package: packagejson
        });

    }

    /**
     * ```javascript
     * {
     *     CREATING: 'creating',
     *     CREATED: 'created',
     *     SETTING_UP: 'setting_up',
     *     SETUP: 'setup',
     *     ENABLING: 'enabling',
     *     ENABLED: 'enabled',
     *     DISABLING: 'disabling',
     *     DISABLED: 'disabled',
     *     DESTROYING: 'destroying',
     *     DESTROYED: 'destroyed'
     * }
     * ```
     *
     * @summary All supported events of Module class.
     *
     * @example
     * myModule.on(Module.events.SETUP, () => {
     *     // define behavior when myModule has been setup
     * });
     *
     * @type {!Object}
     * @enum {String}
     *
     * @static
     * @readonly
     * @author nauwep <nauwep.dev@gmail.com>
     * @since //TODO since
     * @access public
     */
    static get events() {
        return _events;
    }

    /**
     * Don't confuse this static method Module.status with the instance method {@link Module#status}.
     *
     * ```javascript
     * {
     *     CREATED: 'created',
     *     SETUP: 'setup',
     *     ENABLED: 'enabled',
     *     DISABLED: 'disabled',
     *     DESTROYED: 'destroyed'
     * }
     * ```
     *
     * @summary All supported status of Module class.
     *
     * @example
     * if (myModule.status === Module.status.ENABLED) {
     *     myModule.foo();
     * }
     *
     * @type {!Object}
     * @enum {String}
     *
     * @static
     * @readonly
     * @author nauwep <nauwep.dev@gmail.com>
     * @since //TODO since
     * @access public
     */
    static get status() {
        return _status;
    }

    /**
     * @summary The id of the module.
     *
     * @type {!String}
     *
     * @example
     * console.log(myModule.id); // -> 'myModule'
     * myModule.id = 'anotherId'; // -> throw Error read-only
     *
     * @readonly
     * @author nauwep <nauwep.dev@gmail.com>
     * @since //TODO since
     * @access public
     */
    get id() {
        return privateProps.get(this).id;
    }

    /**
     * The value is part of the [supported status]{@link Module.status}.
     *
     * @summary The status of the module.
     *
     * @type {!String}
     *
     * @example
     * console.log(myModule.status); // -> 'created'
     * myModule.status = Module.status.RESOLVED; // -> throw Error read-only
     *
     * @readonly
     * @author nauwep <nauwep.dev@gmail.com>
     * @since //TODO since
     * @access public
     */
    get status() {
        return privateProps.get(this).status;
    }

    /**
     * @summary The version of the module.
     *
     * @type {?String}
     *
     * @example
     * console.log(myModule.version); // -> '1.0.0'
     * myModule.version = '1.0.1'; // -> throw Error read-only
     *
     * @readonly
     * @author nauwep <nauwep.dev@gmail.com>
     * @since //TODO since
     * @access public
     */
    get version() {
        return privateProps.get(this).version;
    }

    get options() {
        return privateProps.get(this).options;
    }

    /**
     * Getting options never return null, at least an empty Object {}.
     * Setting null or undefined replaces the current options by an empty Object {}.
     *
     * @summary The options of the module.
     *
     * @param  {?Object} [newOptions={}] The new options
     *
     * @type {!Object}
     *
     * @example
     * console.log(myModule.options); // -> {port: 8080}
     * myModule.options = {url: 'localhost'}; // -> {url: 'localhost'}
     * myModule.options = null; // -> {}
     *
     * @throws {Error} ERR_MOD_002 if the module is not in created status
     * @throws {Error} ERR_MOD_004 if not an Object
     *
     * @author nauwep <nauwep.dev@gmail.com>
     * @since //TODO since
     * @access public
     */
    set options(newOptions = {}) {
        if (this.status !== _status.CREATED) {
            throw _errors.ERR_MOD_002;
        }
        let props = privateProps.get(this);
        if (_.isNull(newOptions)) {
            props.options = {};
        } else if (_.isPlainObject(newOptions)) {
            props.options = newOptions;
        } else {
            throw _errors.ERR_MOD_004;
        }
        privateProps.set(this, props);
    }

    get dependencies() {
        return privateProps.get(this).dependencies;
    }

    /**
     * Getting dependencies never return null, at least an empty Array [].
     * Setting null or undefined replaces the current config by an empty Array [].
     * Setting a String will build an Array with that single String.
     *
     * @summary The dependencies of the module.
     *
     * @param  {?(String|Array.<String>)}  [newDependencies=[]] The new dependencies
     *
     * @type {!Array.<String>}
     *
     * @example
     * console.log(myModule.dependencies); // -> ['logger']
     * myModule.dependencies = ['server', 'db']; // -> ['server', 'db']
     * myModule.dependencies = null; // -> []
     * myModule.dependencies = 'server'; // -> ['server']
     *
     * @throws {Error} ERR_MOD_003 if the module is not in [created status]{@link Module#status}
     * @throws {Error} ERR_MOD_005 if a non-String dependency is found
     *
     * @author nauwep <nauwep.dev@gmail.com>
     * @since //TODO since
     * @access public
     */
    set dependencies(newDependencies = []) {
        if (this.status !== _status.CREATED) {
            throw _errors.ERR_MOD_003;
        }
        privateProps.get(this).dependencies = checkDependencies(newDependencies);
    }

    /**
     * @summary The package of the module.
     *
     * @type {?Object}
     *
     * @readonly
     * @author nauwep <nauwep.dev@gmail.com>
     * @since //TODO since
     * @access private
     */
    get package() {
        return privateProps.get(this).package;
    }

    /**
     * @summary Add options to the module.
     *
     * @param {?Object} [options={}] The options to add
     *
     * @example
     * console.log(myModule.options); // -> {port: 8080}
     * myModule.addOptions ({url: 'localhost'}); // -> {port: 8080, url: 'localhost'}
     * myModule.options(null); // -> {port: 8080, url: 'localhost'}
     * myModule.options(); // -> {port: 8080, url: 'localhost'}
     *
     * @throws {Error} ERR_MOD_004 if the options parameter is not an Object
     *
     * @author nauwep <nauwep.dev@gmail.com>
     * @since //TODO since
     * @access public
     */
    addOptions(options = {}) {
        if (_.isPlainObject(options) || _.isNull(options)) {
            this.options = _.merge(this.options, options);
        } else {
            throw _errors.ERR_MOD_004;
        }
    }

    /**
     * Merge with existing dependencies and check flatten the Array, remove duplicates and remove null.
     *
     * @summary Add dependencies to the module.
     *
     * @param {...?(String|String[])} [dependencies] The dependencies to add
     *
     * @example
     * console.log(myModule.dependencies); // -> ['logger']
     * myModule.addDependencies(['server']); // -> ['logger', 'server']
     * myModule.addDependencies(null); // -> ['logger', 'server']
     * myModule.addDependencies(); // -> ['logger', 'server']
     * myModule.addDependencies('socket'); // -> ['logger', 'server', 'socket']
     * myModule.addDependencies('socket', 'utils', ['db', 'server']); // -> ['logger', 'server', 'socket', 'utils', 'db']
     *
     * @throws {Error} ERR_MOD_005 if a non-String dependency is found
     *
     * @author nauwep <nauwep.dev@gmail.com>
     * @since //TODO since
     * @access public
     */
    addDependencies(...dependencies) {
        dependencies = checkDependencies(dependencies);
        dependencies = _.concat(this.dependencies, dependencies);
        dependencies = _.flattenDeep(dependencies);
        dependencies = _.uniq(dependencies);
        this.dependencies = dependencies;
    }

    /**
     * @summary Change the status of the module.
     *
     * @param {String} newStatus The new status to set
     * @param {ModuleWrapper} wrapper The wrapper of the module
     *
     * @throws {Error} ERR_MOD_014 if the wrapper parameter is not provided or is not a ModuleWrapper instance
     * @throws {Error} ERR_MOD_013 if the status is not a [supported status]{@link Module.status}
     *
     * @author nauwep <nauwep.dev@gmail.com>
     * @since //TODO since
     * @access private
     */
    _changeStatus(newStatus, wrapper) {
        if (_.isUndefined(wrapper) || wrapper.constructor.name !== 'ModuleWrapper') {
            throw _errors.ERR_MOD_014;
        }

        if (!_.includes(_status, newStatus)) {
            throw _errors.ERR_MOD_013;
        }

        let props = privateProps.get(this);
        props.status = newStatus;
        privateProps.set(this, props);
    }

    /**
     * Executed while the app is being setup.
     *
     * Could be overriden, does nothing by default.
     *
     * Once the app is resolved, this method is not available anymore.
     *
     * @summary The setup function of the module.
     *
     * @example
     * const Module = require('modulapp').Module;
     * let myModule = new Module('myModule');
     *
     * // override the default setup function
     * myModule.setup = function(app, options, imports, done) {
     *    // place your custom code to be executed when myModule is setup
     * }
     *
     * @param {!App} app The App instance
     * @param {!Object} options The options of the module
     * @param {!Object} imports The dependencies of the module
     * @param {!Function} done Callback to return passing any error as first argument done(err)
     *
     * @category lifecycle hooks
     * @author nauwep <nauwep.dev@gmail.com>
     * @since //TODO since
     * @access public
     */
    setup(app, options, imports, done) {
        done(null);
    }

    /**
     * Executed while the app is being started.
     *
     * Could be overriden, does nothing by default.
     *
     * Once the app is resolved, this method is not available anymore.
     *
     * @summary The enable function of the module.
     *
     * @example
     * const Module = require('modulapp').Module;
     * let myModule = new Module('myModule');
     *
     * // override the default enable function
     * myModule.enable = function(app, options, imports, done) {
     *    // place your custom code to be executed when myModule is enable
     * }
     *
     * @param {!App} app The App instance
     * @param {!Object} options The options of the module
     * @param {!Object} imports The dependencies of the module
     * @param {!Function} done Callback to return passing any error as first argument done(err)
     *
     * @category lifecycle hooks
     * @author nauwep <nauwep.dev@gmail.com>
     * @since //TODO since
     * @access public
     */
    enable(app, options, imports, done) {
        done(null);
    }

    /**
     * Executed while the app is being stopped.
     *
     * Could be overriden, does nothing by default.
     *
     * Once the app is resolved, this method is not available anymore.
     *
     * @summary The disable function of the module.
     *
     * @example
     * const Module = require('modulapp').Module;
     * let myModule = new Module('myModule');
     *
     * // override the default disable function
     * myModule.disable = function(app, options, imports, done) {
     *    // place your custom code to be executed when myModule is disabled
     * }
     *
     * @param {!App} app The App instance
     * @param {!Object} options The options of the module
     * @param {!Object} imports The dependencies of the module
     * @param {!Function} done Callback to return passing any error as first argument done(err)
     *
     * @category lifecycle hooks
     * @author nauwep <nauwep.dev@gmail.com>
     * @since //TODO since
     * @access public
     */
    disable(app, options, imports, done) {
        done(null);
    }

    /**
     * Executed while the app is being destroyed.
     *
     * Could be overriden, does nothing by default.
     *
     * Once the app is resolved, this method is not available anymore.
     *
     * @summary The destroy function of the module.
     *
     * @example
     * const Module = require('modulapp').Module;
     * let myModule = new Module('myModule');
     *
     * // override the default destroy function
     * myModule.destroy = function(app, options, imports, done) {
     *    // place your custom code to be executed when myModule is destroyed
     * }
     *
     * @param {!App} app The App instance
     * @param {!Object} options The options of the module
     * @param {!Object} imports The dependencies of the module
     * @param {!Function} done Callback to return passing any error as first argument done(err)
     *
     * @category lifecycle hooks
     * @author nauwep <nauwep.dev@gmail.com>
     * @since //TODO since
     * @access public
     */
    destroy(app, options, imports, done) {
        done(null);
    }

}

module.exports = Module;

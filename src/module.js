"use strict";

const EventEmitter = require('events').EventEmitter;
const ErrorsFactory = require('errors-factory');
const MessagesFactory = require('messages-factory');
const _ = require('lodash');

// Provide errors defined in ../resources/errors.json.
const _errors = new ErrorsFactory(require('../resources/errors.json'));

// Provide messages defined in ../resources/messages.json.
const messagesJson = require('../resources/messages.json').module;
const _messages = new MessagesFactory(messagesJson);

// Provide the Module events as defined in ../resources/events.json.
const _events = require('../resources/events.json').module;

// Provide the Module status as defined in ../resources/status.json.
const _status = require('../resources/status.json').module;

// Handle all private properties of all Module instances.
const privateProps = new WeakMap();

// Check a dependency list.
// Removes nulls, duplicates, flatten the Array and check if all dependencies are String.
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
 * @emits Module#setting_up
 * @emits Module#setup
 * @emits Module#enabling
 * @emits Module#enabled
 * @emits Module#disabling
 * @emits Module#disabled
 * @emits Module#destroying
 * @emits Module#destroyed
 * @author nauwep <nauwep.dev@gmail.com>
 * @since 1.0.0
 * @access public
 */
class Module extends EventEmitter {

    /**
     * Create a new instance of Module.
     * The id parameter is required, it could be either a String or an Object representing the package.json.
     *
     * In case of the package.json is provided, the id, version, dependencies and options will be extracted from this Object.
     *
     * @param {!(String|Object)} id Either a String id of the module or an Object representing the package.json
     * @param {?Object} [initialOptions={}] Options for the module
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

        let logger = null;
        if (_.has(options, 'modulapp.logger')) {
            logger = options.modulapp.logger;
        }
        let loggerCategory = `Module ${id}`;
        if (_.has(options, 'modulapp.loggerCategory')) {
            loggerCategory = options.modulapp.loggerCategory;
        }

        if (_.isBoolean(logger) && !logger) {
            this.logger = require('./logger')(loggerCategory);
        } else if (_.isBoolean(logger) && logger) {
            this.logger = require('./logger')(loggerCategory, 'info');
        } else if (_.isString(logger)) {
            this.logger = require('./logger')(loggerCategory, logger);
        } else if (_.isPlainObject()) {
            this.logger = logger;
        } else {
            this.logger = require('./logger')(loggerCategory);
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

        this.logger(_messages.MOD_005(id));
    }

    /**
     * All supported events of Module class.
     *
     * ```javascript
     * {
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
     * @example
     * myModule.on(Module.events.SETUP, () => {
     *     // define behavior when myModule has been setup
     * });
     *
     * @type {!Object}
     * @enum {String}
     * @static
     * @readonly
     * @author nauwep <nauwep.dev@gmail.com>
     * @since 1.0.0
     * @access public
     */
    static get events() {
        return _events;
    }

    /**
     * All supported status of Module class.
     *
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
     * @example
     * if (myModule.status === Module.status.ENABLED) {
     *     myModule.foo();
     * }
     *
     * @type {!Object}
     * @enum {String}
     * @static
     * @readonly
     * @author nauwep <nauwep.dev@gmail.com>
     * @since 1.0.0
     * @access public
     */
    static get status() {
        return _status;
    }

    /**
     * The id of the module.
     *
     * @example
     * console.log(myModule.id); // -> 'myModule'
     * myModule.id = 'anotherId'; // -> throw Error read-only
     *
     * @type {!String}
     * @readonly
     * @author nauwep <nauwep.dev@gmail.com>
     * @since 1.0.0
     * @access public
     */
    get id() {
        this.logger.verbose(_messages.MOD_006());
        return privateProps.get(this).id;
    }

    /**
     * The status of the module.
     * The value is part of the [supported status]{@link Module.status}.
     *
     * @example
     * console.log(myModule.status); // -> 'created'
     * myModule.status = Module.status.SETUP; // -> throw Error read-only
     *
     * @type {!String}
     * @readonly
     * @author nauwep <nauwep.dev@gmail.com>
     * @since 1.0.0
     * @access public
     */
    get status() {
        this.logger.verbose(_messages.MOD_007());
        return privateProps.get(this).status;
    }

    /**
     * The version of the module.
     *
     * @example
     * console.log(myModule.version); // -> '1.0.0'
     * myModule.version = '1.0.1'; // -> throw Error read-only
     *
     * @type {?String}
     * @readonly
     * @author nauwep <nauwep.dev@gmail.com>
     * @since 1.0.0
     * @access public
     */
    get version() {
        this.logger.verbose(_messages.MOD_008());
        return privateProps.get(this).version;
    }

    get options() {
        this.logger.verbose(_messages.MOD_009());
        return privateProps.get(this).options;
    }

    /**
     * The options of the module.
     * Getting options never return null, at least an empty Object {}.
     * Setting null or undefined replaces the current options by an empty Object {}.
     *
     * @example
     * console.log(myModule.options); // -> {port: 8080}
     * myModule.options = {host: 'localhost'}; // -> {host: 'localhost'}
     * myModule.options = null; // -> {}
     *
     * @type {!Object}
     * @param  {?Object} [newOptions={}] The new options
     * @throws {Error} ERR_MOD_002 if the module is not in created status
     * @throws {Error} ERR_MOD_004 if not an Object
     * @author nauwep <nauwep.dev@gmail.com>
     * @since 1.0.0
     * @access public
     */
    set options(newOptions = {}) {
        this.logger.verbose(_messages.MOD_010());
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
        this.logger.info(_messages.MOD_020());
    }

    get dependencies() {
        this.logger.verbose(_messages.MOD_011());
        return privateProps.get(this).dependencies;
    }

    /**
     * The dependencies of the module.
     * Getting dependencies never return null, at least an empty Array [].
     * Setting null or undefined replaces the current config by an empty Array [].
     * Setting a String will build an Array with that single String.
     *
     * @example
     * console.log(myModule.dependencies); // -> ['logger']
     * myModule.dependencies = ['server', 'db']; // -> ['server', 'db']
     * myModule.dependencies = null; // -> []
     * myModule.dependencies = 'server'; // -> ['server']
     *
     * @type {!Array.<String>}
     * @param  {?(String|Array.<String>)}  [newDependencies=[]] The new dependencies
     * @throws {Error} ERR_MOD_003 if the module is not in [created status]{@link Module#status}
     * @throws {Error} ERR_MOD_005 if a non-String dependency is found
     * @author nauwep <nauwep.dev@gmail.com>
     * @since 1.0.0
     * @access public
     */
    set dependencies(newDependencies = []) {
        this.logger.verbose(_messages.MOD_012());
        if (this.status !== _status.CREATED) {
            throw _errors.ERR_MOD_003;
        }
        privateProps.get(this).dependencies = checkDependencies(newDependencies);
        this.logger.info(_messages.MOD_019());
    }

    /**
     * The package of the module.
     *
     * @type {?Object}
     * @readonly
     * @author nauwep <nauwep.dev@gmail.com>
     * @since 1.0.0
     * @access private
     */
    get package() {
        this.logger.verbose(_messages.MOD_013());
        return privateProps.get(this).package;
    }

    /**
     * Add options to the module.
     * Merge with existing options.
     *
     * @example
     * console.log(myModule.options); // -> {port: 8080}
     * myModule.addOptions({host: 'localhost'}); // -> {port: 8080, host: 'localhost'}
     * myModule.addOptions(null); // -> {port: 8080, host: 'localhost'}
     * myModule.addOptions(); // -> {port: 8080, host: 'localhost'}
     *
     * @param {?Object} [options={}] The options to add
     * @throws {Error} ERR_MOD_004 if the options parameter is not an Object
     * @author nauwep <nauwep.dev@gmail.com>
     * @since 1.0.0
     * @access public
     */
    addOptions(options = {}) {
        this.logger.verbose(_messages.MOD_014());
        if (_.isPlainObject(options) || _.isNull(options)) {
            this.options = _.merge(this.options, options);
            this.logger.info(_messages.MOD_015());
        } else {
            throw _errors.ERR_MOD_004;
        }
    }

    /**
     * Add dependencies to the module.
     * Merge with existing dependencies and check the new dependencies, flatten the Array and remove duplicates and null.
     *
     * @example
     * console.log(myModule.dependencies); // -> ['logger']
     * myModule.addDependencies(['server']); // -> ['logger', 'server']
     * myModule.addDependencies(null); // -> ['logger', 'server']
     * myModule.addDependencies(); // -> ['logger', 'server']
     * myModule.addDependencies('socket'); // -> ['logger', 'server', 'socket']
     * myModule.addDependencies('socket', 'utils', ['db', 'server']); // -> ['logger', 'server', 'socket', 'utils', 'db']
     *
     * @param {...?(String|String[])} [dependencies] The dependencies to add
     * @throws {Error} ERR_MOD_005 if a non-String dependency is found
     * @author nauwep <nauwep.dev@gmail.com>
     * @since 1.0.0
     * @access public
     */
    addDependencies(...dependencies) {
        this.logger.verbose(_messages.MOD_016());
        dependencies = checkDependencies(dependencies);
        dependencies = _.concat(this.dependencies, dependencies);
        dependencies = _.flattenDeep(dependencies);
        dependencies = _.uniq(dependencies);
        this.dependencies = dependencies;
        this.logger.info(_messages.MOD_017());
    }

    /**
     * Change the status of the module.
     *
     * @param {String} newStatus The new status to set
     * @param {ModuleWrapper} wrapper The wrapper of the module
     * @throws {Error} ERR_MOD_014 if the wrapper parameter is not provided or is not a ModuleWrapper instance
     * @throws {Error} ERR_MOD_013 if the status is not a [supported status]{@link Module.status}
     * @author nauwep <nauwep.dev@gmail.com>
     * @since 1.0.0
     * @access private
     */
    _changeStatus(newStatus, wrapper) {
        this.logger.debug(_messages.MOD_018(newStatus));
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
     * The setup function of the module.
     * Executed while the app is being setup.
     * Could be overriden, does nothing by default.
     * Once the app is resolved, this method is not available anymore.
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
     * @category lifecycle hooks
     * @author nauwep <nauwep.dev@gmail.com>
     * @since 1.0.0
     * @access public
     */
    setup(app, options, imports, done) {
        this.logger.info(_messages.MOD_001(this.id));
        done(null);
    }

    /**
     * The enable function of the module.
     * Executed while the app is being started.
     * Could be overriden, does nothing by default.
     * Once the app is resolved, this method is not available anymore.
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
     * @category lifecycle hooks
     * @author nauwep <nauwep.dev@gmail.com>
     * @since 1.0.0
     * @access public
     */
    enable(app, options, imports, done) {
        this.logger.info(_messages.MOD_002(this.id));
        done(null);
    }

    /**
     * The disable function of the module.
     * Executed while the app is being stopped.
     * Could be overriden, does nothing by default.
     * Once the app is resolved, this method is not available anymore.
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
     * @category lifecycle hooks
     * @author nauwep <nauwep.dev@gmail.com>
     * @since 1.0.0
     * @access public
     */
    disable(app, options, imports, done) {
        this.logger.info(_messages.MOD_003(this.id));
        done(null);
    }

    /**
     * The destroy function of the module.
     * Executed while the app is being destroyed.
     * Could be overriden, does nothing by default.
     * Once the app is resolved, this method is not available anymore.
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
     * @category lifecycle hooks
     * @author nauwep <nauwep.dev@gmail.com>
     * @since 1.0.0
     * @access public
     */
    destroy(app, options, imports, done) {
        this.logger.info(_messages.MOD_004(this.id));
        done(null);
    }

}

module.exports = Module;

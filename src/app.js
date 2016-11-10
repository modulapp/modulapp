"use strict";

const EventEmitter = require('events').EventEmitter;
const ErrorsFactory = require('errors-factory');
const _ = require('lodash');
const async = require('async');
const DepGraph = require('dependency-graph').DepGraph;

const ModuleWrapper = require('./moduleWrapper');

// Provide errors defined in ../resources/errors.json.
const _errors = new ErrorsFactory(require('../resources/errors.json'));

// Provide the App events as defined in ../resources/events.json.
const _events = require('../resources/events.json').app;

// Provide the App status as defined in ../resources/status.json.
const _status = require('../resources/status.json').app;

// Handle all private properties of all App instances.
const privateProps = new WeakMap();

// Change the status of an App instance.
function changeStatus(appInstance, newStatus) {

    if (!_.includes(_status, newStatus)) {
        throw _errors.ERR_APP_015;
    }

    let props = privateProps.get(appInstance);
    props.status = newStatus;
    privateProps.set(appInstance, props);
}

// Check a configuration module list. Remove nulls, duplicates, flatten the Array and check if all module are Module instance.
function checkConfig(config) {
    if (_.isNull(config)) {
        return [];
    } else if (config.constructor.name === 'Module') {
        return [config];
    } else if (_.isArray(config)) {

        config = _.flattenDeep(config);

        _.remove(config, (value) => {
            return _.isNull(value);
        });
        _.forEach(config, (value) => {
            if (value.constructor.name !== 'Module') {
                throw _errors.ERR_APP_013;
            }
        });
        config = _.flattenDeep(config);
        config = _.uniq(config);

        return config;
    } else {
        throw _errors.ERR_APP_013;
    }
}

/**
 * Class representing an App.
 *
 * @example
 * const App = require('modulapp').App;
 * let app = new App();
 *
 * let serverModule = require('./server.js');
 * let dbModule = require('./db.js');
 *
 * app.addConfig(serverModule, dbModule);
 *
 * app.start((err) => {
 *     console.log('App started!');
 * });
 *
 * @class
 * @extends EventEmitter
 * @emits App#resolving
 * @emits App#resolved
 * @emits App#setting_up
 * @emits App#setup
 * @emits App#starting
 * @emits App#started
 * @emits App#stopping
 * @emits App#stopped
 * @emits App#destroying
 * @emits App#destroyed
 * @author nauwep <nauwep.dev@gmail.com>
 * @since 1.0.0
 * @access public
 */
class App extends EventEmitter {

    /**
     * Provide a new instance of App.
     * The config and options are optionnal.
     *
     * @param {?(Module|Array.<Module>)} [config=[]] The list of modules.
     * @param {?Object} [options={}] Options for the modules.
     * @throws {Error} ERR_APP_011 if options is not an Object.
     * @throws {Error} ERR_APP_013 if a module is not a Module instance.
     */
    constructor(config = [], options = {}) {

        if (_.isNull(config)) {
            config = [];
        }
        if (_.isNull(options)) {
            options = {};
        }

        if (_.isPlainObject(config)) {
            options = config;
            config = [];
        }

        config = checkConfig(config);

        if (!_.isPlainObject(options)) {
            throw _errors.ERR_APP_011;
        }

        super();

        // store all properties in the private WeakMap
        privateProps.set(this, {
            id: _.uniqueId(),
            config: config,
            graph: new DepGraph(),
            options: options,
            status: _status.CREATED
        });
    }

    /**
     * All supported events of App class.
     *
     * ```javascript
     * {
     *     RESOLVING: 'resolving',
     *     RESOLVED: 'resolved',
     *     SETTING_UP: 'setting_up',
     *     SETUP: 'setup',
     *     STARTING: 'starting',
     *     STARTED: 'started',
     *     STOPPING: 'stopping',
     *     STOPPED: 'stopped',
     *     DESTROYING: 'destroying',
     *     DESTROYED: 'destroyed'
     * }
     * ```
     *
     * @example
     * app.on(App.events.SETUP, () => {
     *     // define behavior when app has been setup
     * });
     *
     * @type {!Object}
     * @enum {String}
     * @readonly
     * @static
     * @author nauwep <nauwep.dev@gmail.com>
     * @since 1.0.0
     * @access public
     */
    static get events() {
        return _events;
    }

    /**
     * All supported status of App class.
     *
     * Don't confuse this static method App.status with the instance method {@link App#status}.
     *
     * ```javascript
     * {
     *     CREATED: 'created',
     *     RESOLVED: 'resolved',
     *     SETUP: 'setup',
     *     STARTED: 'started',
     *     STOPPED: 'stopped'
     * }
     * ```
     *
     * @example
     * if (app.status === App.status.ENABLED) {
     *     app.foo();
     * }
     *
     * @type {!Object}
     * @enum {String}
     * @readonly
     * @static
     * @author nauwep <nauwep.dev@gmail.com>
     * @since 1.0.0
     * @access public
     */
    static get status() {
        return _status;
    }

    /**
     * The id of the app, randomly generated.
     *
     * @example
     * console.log(app.id); // -> '123456789'
     * app.id = 'anotherId'; // -> throw Error read-only
     *
     * @type {!String}
     * @readonly
     * @author nauwep <nauwep.dev@gmail.com>
     * @since 1.0.0
     * @access public
     */
    get id() {
        return privateProps.get(this).id;
    }

    get config() {
        return privateProps.get(this).config;
    }

    /**
     * The configuration of the app.
     * Getting config never return null, at least an empty Array [].
     * Setting null or undefined replaces the current config by an empty Array [].
     * Setting a module will build an Array with that single module.
     *
     * @example
     * console.log(app.config); // -> [loggerModule]
     * app.config = [serverModule, dbModule]; // -> [serverModule, dbModule]
     * app.config = null; // -> []
     * app.config = serverModule; // -> [serverModule]
     *
     * @type {!Array.<Module>}
     * @param  {?(Module|Array.<Module>)}  [newConfig=[]] The new config.
     * @throws {Error} ERR_APP_013 if a module is not a Module instance.
     * @throws {Error} ERR_APP_014 if the module is not in [created status]{@link App#status}.
     * @author nauwep <nauwep.dev@gmail.com>
     * @since 1.0.0
     * @access public
     */
    set config(newConfig = []) {
        // TODO if status in resolved, update the config and resolve again?
        if (this.status !== _status.CREATED) {
            throw _errors.ERR_APP_014;
        }
        privateProps.get(this).config = checkConfig(newConfig);
    }

    /**
     * The module dependency graph of the app.
     * Using [dependency-graph package]{@link https://www.npmjs.com/package/dependency-graph} to help resolve the dependency tree of the modules.
     * Getting graph never return null, at least an empty graph once the app has not been resolved yet.
     *
     * @type {!DepGraph}
     * @readonly
     * @author nauwep <nauwep.dev@gmail.com>
     * @since 1.0.0
     * @access private
     */
    get graph() {
        return privateProps.get(this).graph;
    }

    get options() {
        return privateProps.get(this).options;
    }

    /**
     * The options of the app's modules.
     * Read-write property.
     * Getting options never return null, at least an empty Object {}.
     * Setting null or undefined replaces the current options by an empty Object {}.
     *
     * @example
     * console.log(app.options); // -> {server: {port: 8080}}
     * app.options = {server: {host: 'localhost'}}; // -> {server: {host: 'localhost'}}
     * app.options = null; // -> {}
     *
     * @type {!Object}
     * @param  {?Object} [newOptions={}] The new options.
     * @throws {Error} ERR_APP_009 if the app is not in created status.
     * @throws {Error} ERR_APP_008 if not an Object
     * @author nauwep <nauwep.dev@gmail.com>
     * @since 1.0.0
     * @access public
     */
    set options(newOptions = {}) {
        // TODO if status in resolved, update the wrapper in the graph?
        if (this.status !== _status.CREATED) {
            throw _errors.ERR_APP_009;
        }
        let props = privateProps.get(this);
        if (_.isNull(newOptions)) {
            props.options = {};
        } else if (_.isPlainObject(newOptions)) {
            props.options = newOptions;
        } else {
            throw _errors.ERR_APP_008;
        }
        privateProps.set(this, props);
    }

    /**
     * The status of the module.
     * The value is part of the [supported status]{@link App.status}.
     *
     * @example
     * console.log(app.status); // -> 'created'
     * app.status = App.status.RESOLVED; // -> throw Error read-only
     *
     * @type {!String}
     * @readonly
     * @author nauwep <nauwep.dev@gmail.com>
     * @since 1.0.0
     * @access public
     */
    get status() {
        return privateProps.get(this).status;
    }

    /**
     * Add options to the app's modules.
     * Merge with existing options.
     *
     * @example
     * console.log(app.options); // -> {server: {port: 8080}}
     * app.addOptions({server: {host: 'localhost'}}); // -> {server: {port: 8080, host: 'localhost'}}
     * app.addOptions(null); // -> {server: {port: 8080, host: 'localhost'}}
     * app.addOptions(); // -> {server: {port: 8080, host: 'localhost'}}
     * app.addOptions({db: {host: '127.0.0.0'}}); // -> {server: {port: 8080, host: 'localhost'}, db: {host: '127.0.0.0'}}
     *
     * @param {?Object} [options={}] The options to add.
     * @throws {Error} ERR_APP_008 if the options parameter is not an Object.
     * @author nauwep <nauwep.dev@gmail.com>
     * @since 1.0.0
     * @access public
     */
    addOptions(options = {}) {
        if (_.isPlainObject(options) || _.isNull(options)) {
            this.options = _.merge(this.options, options);
        } else {
            throw _errors.ERR_APP_008;
        }
    }

    /**
     * Add modules to the app's configuration.
     * Merge with existing config and check the new modules and remove duplicates and null.
     *
     * @example
     * console.log(app.config); // -> [loggerModule]
     * app.addConfig([serverModule]); // -> [loggerModule, serverModule]
     * app.addConfig(null); // -> [loggerModule, serverModule]
     * app.addConfig(); // -> [loggerModule, serverModule]
     * app.addConfig(socketModule); // -> [loggerModule, serverModule, socketModule]
     * app.addConfig(socketModule, utilsModule, [dbModule, serverModule]); // -> [loggerModule, serverModule, socketModule, utilsModule, dbModule]
     *
     * @param {...?(Module|Array.<Module>)} [config] The modules to add.
     * @throws {Error} ERR_APP_013 if a module is not a Module instance.
     * @author nauwep <nauwep.dev@gmail.com>
     * @since 1.0.0
     * @access public
     */
    addConfig(...config) {
        config = checkConfig(config);
        config = _.concat(this.config, config);
        config = _.flattenDeep(config);
        config = _.uniq(config);
        this.config = config;
    }

    /**
     * Change the status of the app.
     *
     * @param {String} newStatus The new status to set.
     * @throws {Error} ERR_APP_015 if the status is not a [supported status]{@link App.status}.
     * @author nauwep <nauwep.dev@gmail.com>
     * @since 1.0.0
     * @access private
     */
    _changeStatus(newStatus) {
        changeStatus(this, newStatus);
    }

    /**
     * Resolve the dependencies of the modules.
     * This method is synchronous, callback is not required.
     *
     * @example
     * const App = require('modulapp').App;
     *
     * let serverModule = require('./server.js');
     * let dbModule = require('./db.js');
     *
     * let app = new App([serverModule, dbModule]);
     *
     * app.resolve((err) => {
     *     console.log('modules resolved!');
     * });
     *
     * @example
     * <caption>resolve with callback</caption>
     * app.resolve((err) => {
     *     console.error(err); // -> in case of error in resolve, the error is passed to the callback
     * });
     *
     * @example
     * <caption>resolve with no callback</caption>
     * try {
     *     app.resolve();
     * } catch (err) {
     *     console.error(err); // -> in case of error in resolve, the error is thrown
     * }
     *
     * @param {?Function} [callback] The callback executed after resolving. Raised error is passed as first argument, no other argument: `callback(err)`
     * @throws {Error} ERR_APP_001 if the app is started
     * @throws {Error} ERR_APP_006 in case of dependency cycle
     * @throws {Error} ERR_APP_007 in case of missing module
     * @category lifecycle management
     * @author nauwep <nauwep.dev@gmail.com>
     * @since 1.0.0
     * @access public
     */
    resolve(callback) {
        if (_.isNull(callback)) {
            callback = _.noop;
        }
        if (this.status === _status.STARTED) {
            if (_.isFunction(callback)) {
                return callback(_errors.ERR_APP_001);
            } else {
                throw _errors.ERR_APP_001;
            }
        }

        /**
         * Resolving event. When the app is about to be resolved.
         * @event App#resolving
         * @category events
         * @since 1.0.0
         */
        this.emit(_events.RESOLVING);

        const nbModuleDefInConfig = this.config.length;

        _.forEach(this.config, (moduleDef) => {

            let moduleWrapper = new ModuleWrapper(moduleDef, this);
            let id = moduleWrapper.id;
            let dependencies = moduleWrapper.dependencies;

            if (_.has(this.options, id)) {
                moduleWrapper.addOptions(this.options[id]);
            }

            if (this.graph.hasNode(id)) {
                this.graph.setNodeData(id, moduleWrapper);
            } else {
                this.graph.addNode(id, moduleWrapper);
            }

            _.forEach(dependencies, (depId) => {
                if (!this.graph.hasNode(depId)) {
                    this.graph.addNode(depId);
                }
                this.graph.addDependency(id, depId);
            });

        });

        // Dependency cycle check
        let nodeIds = [];
        try {
            nodeIds = this.graph.overallOrder();
        } catch (err) {
            if (_.isFunction(callback)) {
                return callback(_errors.ERR_APP_006);
            } else {
                throw _errors.ERR_APP_006;
            }
        }

        // Missing module check
        if (nodeIds.length !== nbModuleDefInConfig) {
            let nodeIds = this.graph.overallOrder();
            let missingModule = [];
            _.forEach(nodeIds, (nodeId) => {
                let data = this.graph.getNodeData(nodeId);
                if (data.constructor.name !== 'ModuleWrapper') {
                    missingModule.push(nodeId);
                }
            });
            let missingModuleError = _errors.ERR_APP_007;
            missingModuleError.data = missingModule;
            if (_.isFunction(callback)) {
                return callback(missingModuleError);
            } else {
                throw missingModuleError;
            }
        }

        // Set the imports in each wrapper
        _.forEach(nodeIds, (nodeId) => {
            let wrapper = this.graph.getNodeData(nodeId);
            let depNodeIds = this.graph.dependenciesOf(nodeId);
            let imports = {};
            _.forEach(depNodeIds, (depNodeId) => {
                let depWrapper = this.graph.getNodeData(depNodeId);
                if (depWrapper.constructor.name === 'ModuleWrapper') {
                    imports[depNodeId] = depWrapper;
                }
            });
            wrapper.addImports(imports);
            this.graph.setNodeData(nodeId, wrapper); // TODO required ?
        });

        /**
         * Resolved event. When the app has been resolved.
         * @event App#resolved
         * @category events
         * @since 1.0.0
         */
        this.emit(_events.RESOLVED);
        changeStatus(this, _status.RESOLVED);
        if (_.isFunction(callback)) {
            return callback(null);
        }
    }

    /**
     * Setup every modules following the dependency graph.
     *
     * @example
     * const App = require('modulapp').App;
     *
     * let serverModule = require('./server.js');
     * let dbModule = require('./db.js');
     *
     * let app = new App([serverModule, dbModule]);
     *
     * app.setup((err) => {
     *     console.log('modules setup!');
     * });
     * // setup() will resolve() itself if not done before
     *
     * @param {?Function} [callback] The callback executed after setting up. Raised error is passed as first argument, no other argument: `callback(err)`
     * @see Module#setup
     * @category lifecycle management
     * @author nauwep <nauwep.dev@gmail.com>
     * @since 1.0.0
     * @access public
     */
    setup(callback = _.noop) {
        if (_.isNull(callback)) {
            callback = _.noop;
        }
        if (this.status === _status.STARTED) {
            return callback(_errors.ERR_APP_002);
        }

        if (this.status === _status.CREATED) {
            try {
                this.resolve();
            } catch (err) {
                return callback(err);
            }
        }

        /**
         * Setting up event. When the app is about to be setup.
         * @event App#setting_up
         * @category events
         * @since 1.0.0
         */
        this.emit(_events.SETTING_UP);

        let nodeIds = this.graph.overallOrder();
        async.eachSeries(nodeIds, (nodeId, asyncCallback) => {
            let wrapper = this.graph.getNodeData(nodeId);
            if (wrapper.constructor.name === 'ModuleWrapper') {
                wrapper.setupModule(asyncCallback);
            } else {
                asyncCallback(null);
            }

        }, (err) => {
            if (err) {
                callback(err);
            } else {
                /**
                 * Setup event. When the app has been setup.
                 * @event App#setup
                 * @category events
                 * @since 1.0.0
                 */
                this.emit(_events.SETUP);
                changeStatus(this, _status.SETUP);
                callback(null);
            }
        });

    }

    /**
     * Enable every modules following the dependency graph.
     *
     * @example
     * const App = require('modulapp').App;
     *
     * let serverModule = require('./server.js');
     * let dbModule = require('./db.js');
     *
     * let app = new App([serverModule, dbModule]);
     *
     * app.start((err) => {
     *     console.log('app started!');
     * });
     * // start() will setup() and resolve() itself if not done before
     *
     * @param {?Function} [callback] The callback executed after starting. Raised error is passed as first argument, no other argument: `callback(err)`
     * @see Module#enable
     * @category lifecycle management
     * @author nauwep <nauwep.dev@gmail.com>
     * @since 1.0.0
     * @access public
     */
    start(callback = _.noop) {
        if (_.isNull(callback)) {
            callback = _.noop;
        }
        if (this.status === _status.STARTED) {
            return callback(_errors.ERR_APP_003);
        }

        if (this.status === _status.CREATED || this.status === _status.RESOLVED) {
            return this.setup((err) => {
                if (err) {
                    callback(err);
                } else {
                    this.start(callback);
                }
            });
        }

        /**
         * Starting event. When the app is about to be started.
         * @event App#starting
         * @category events
         * @since 1.0.0
         */
        this.emit(_events.STARTING);

        let nodeIds = this.graph.overallOrder();
        async.eachSeries(nodeIds, (nodeId, asyncCallback) => {
            let wrapper = this.graph.getNodeData(nodeId);
            if (wrapper.constructor.name === 'ModuleWrapper') {
                wrapper.enableModule(asyncCallback);
            } else {
                asyncCallback(null);
            }

        }, (err) => {
            if (err) {
                callback(err);
            } else {
                /**
                 * Started event. When the app has been started.
                 * @event App#started
                 * @category events
                 * @since 1.0.0
                 */
                this.emit(_events.STARTED);
                changeStatus(this, _status.STARTED);
                callback(null);
            }
        });

    }

    /**
     * Disable every modules following the dependency graph.
     *
     * @example
     * const App = require('modulapp').App;
     *
     * let serverModule = require('./server.js');
     * let dbModule = require('./db.js');
     *
     * let app = new App([serverModule, dbModule]);
     *
     * app.start((err) => {
     *     console.log('app started!');
     *
     *     // Do some stuff
     *
     *     app.stop((err) => {
     *         console.log('app stopped!');
     *     });
     * });
     * // app has to be started to be stopped
     *
     * @param {?Function} [callback] The callback executed after stopping. Raised error is passed as first argument, no other argument: `callback(err)`
     * @see Module#disable
     * @category lifecycle management
     * @author nauwep <nauwep.dev@gmail.com>
     * @since 1.0.0
     * @access public
     */
    stop(callback = _.noop) {
        if (_.isNull(callback)) {
            callback = _.noop;
        }
        if (this.status !== _status.STARTED) {
            return callback(_errors.ERR_APP_004);
        }

        /**
         * Stopping event. When the app is about to be stopped.
         * @event App#stopping
         * @category events
         * @since 1.0.0
         */
        this.emit(_events.STOPPING);

        let nodeIds = _.reverse(this.graph.overallOrder());
        async.eachSeries(nodeIds, (nodeId, asyncCallback) => {

            let wrapper = this.graph.getNodeData(nodeId);
            if (wrapper.constructor.name === 'ModuleWrapper') {
                wrapper.disableModule(asyncCallback);
            } else {
                asyncCallback(null);
            }

        }, (err) => {
            if (err) {
                callback(err);
            } else {
                /**
                 * Stopped event. When the app has been stopped.
                 * @event App#stopped
                 * @category events
                 * @since 1.0.0
                 */
                this.emit(_events.STOPPED);
                changeStatus(this, _status.STOPPED);
                callback(null);
            }
        });

    }

    /**
     * Destroy every modules following the dependency graph.
     *
     * @example
     * const App = require('modulapp').App;
     *
     * let serverModule = require('./server.js');
     * let dbModule = require('./db.js');
     *
     * let app = new App([serverModule, dbModule]);
     *
     * app.start((err) => {
     *     console.log('app started!');
     *
     *     // Do some stuff
     *
     *     app.stop((err) => {
     *         console.log('app stopped!');
     *
     *         // Do some stuff
     *
     *         app.destroy((err) => {
     *             console.log('app destroyed!');
     *         });
     *     });
     * });
     * // app has to be stopped to be destroyed
     *
     * @param {?Function} [callback] The callback executed after destroying. Raised error is passed as first argument, no other argument: `callback(err)`
     * @see Module#destroy
     * @category lifecycle management
     * @author nauwep <nauwep.dev@gmail.com>
     * @since 1.0.0
     * @access public
     */
    destroy(callback = _.noop) {
        if (_.isNull(callback)) {
            callback = _.noop;
        }
        if (this.status !== _status.STOPPED) {
            return callback(_errors.ERR_APP_005);
        }

        /**
         * Destroying event. When the app is about to be destroyed.
         * @event App#destroying
         * @category events
         * @since 1.0.0
         */
        this.emit(_events.DESTROYING);

        let nodeIds = _.reverse(this.graph.overallOrder());
        async.eachSeries(nodeIds, (nodeId, asyncCallback) => {
            let wrapper = this.graph.getNodeData(nodeId);
            if (wrapper.constructor.name === 'ModuleWrapper') {
                wrapper.destroyModule(asyncCallback);
            } else {
                asyncCallback(null);
            }

        }, (err) => {
            if (err) {
                callback(err);
            } else {
                /**
                 * Destroyed event. When the app has been destroyed.
                 * @event App#destroyed
                 * @category events
                 * @since 1.0.0
                 */
                this.emit(_events.DESTROYED);
                callback(null);
            }
        });
    }
}

module.exports = App;

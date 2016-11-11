(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.modulapp = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports=[{
    "code": "ERR_APP_XXX",
    "message": "Something's wrong."
}, {
    "code": "ERR_APP_000",
    "message": "Not implemented yet."
}, {
    "code": "ERR_APP_001",
    "message": "App already started, stop the app before resolving again."
}, {
    "code": "ERR_APP_002",
    "message": "App already started, stop the app before setting up again."
}, {
    "code": "ERR_APP_003",
    "message": "App already started, stop the app before starting again."
}, {
    "code": "ERR_APP_004",
    "message": "App not started, cannot be stopped."
}, {
    "code": "ERR_APP_005",
    "message": "App not stopped, cannot be destroyed."
}, {
    "code": "ERR_APP_006",
    "message": "Cycles have been found in the dependency graph."
}, {
    "code": "ERR_APP_007",
    "message": "Module dependencies are missing in the configuration."
}, {
    "code": "ERR_APP_008",
    "message": "Only an object argument is accepted as options."
}, {
    "code": "ERR_APP_009",
    "message": "Options cannot be changed in app after resolve."
}, {
    "code": "ERR_APP_010",
    "message": "First argument for App constructor must be an array or an object."
}, {
    "code": "ERR_APP_011",
    "message": "Second argument for App constructor must be an object."
}, {
    "code": "ERR_APP_012",
    "message": "Non-array argument cannot be accepted as config."
}, {
    "code": "ERR_APP_013",
    "message": "Only module instance can be accepted as part of the config array."
}, {
    "code": "ERR_APP_014",
    "message": "Config cannot be changed in app after resolve."
}, {
    "code": "ERR_APP_015",
    "message": "The status must be one of the defined status."
}, {
    "code": "ERR_MOD_000",
    "message": "Not implemented yet."
}, {
    "code": "ERR_MOD_XXX",
    "message": "Something's wrong."
}, {
    "code": "ERR_MOD_001",
    "message": "The module id must be provided."
}, {
    "code": "ERR_MOD_002",
    "message": "Options cannot be changed in module after setup."
}, {
    "code": "ERR_MOD_003",
    "message": "Dependencies cannot be changed in module after setup."
}, {
    "code": "ERR_MOD_004",
    "message": "Only an object argument is accepted as options."
}, {
    "code": "ERR_MOD_005",
    "message": "Non-string argument cannot be accepted as dependencies."
}, {
    "code": "ERR_MOD_006",
    "message": "ModuleWrapper cannot be instanciated with null or missing module and app arguments."
}, {
    "code": "ERR_MOD_007",
    "message": "ModuleWrapper must be instanciated with an instance of Module."
}, {
    "code": "ERR_MOD_008",
    "message": "ModuleWrapper must be instanciated with an instance of App."
}, {
    "code": "ERR_MOD_009",
    "message": "Only an object argument is accepted as imports."
}, {
    "code": "ERR_MOD_010",
    "message": "Options cannot be changed in module wrapper after setup."
}, {
    "code": "ERR_MOD_011",
    "message": "Imports cannot be changed in module wrapper after setup."
}, {
    "code": "ERR_MOD_012",
    "message": "Only ModuleWrapper instances can be part of the object argument for imports."
}, {
    "code": "ERR_MOD_013",
    "message": "The status must be one of the defined status."
}, {
    "code": "ERR_MOD_014",
    "message": "The status update can only be done from its internal wrapper."
}, {
    "code": "ERR_MOD_015",
    "message": "setupModule can only be executed in created status."
}, {
    "code": "ERR_MOD_016",
    "message": "enableModule can only be executed in setup status."
}, {
    "code": "ERR_MOD_017",
    "message": "disableModule can only be executed in enabled status."
}, {
    "code": "ERR_MOD_018",
    "message": "destroyModule can only be executed in disabled status."
}]

},{}],2:[function(require,module,exports){
module.exports={
    "app": {
        "RESOLVING": "resolving",
        "RESOLVED": "resolved",
        "SETTING_UP": "setting_up",
        "SETUP": "setup",
        "STARTING": "starting",
        "STARTED": "started",
        "STOPPING": "stopping",
        "STOPPED": "stopped",
        "DESTROYING": "destroying",
        "DESTROYED": "destroyed"
    },
    "module": {
        "CREATING": "creating",
        "CREATED": "created",
        "SETTING_UP": "setting_up",
        "SETUP": "setup",
        "ENABLING": "enabling",
        "ENABLED": "enabled",
        "DISABLING": "disabling",
        "DISABLED": "disabled",
        "DESTROYING": "destroying",
        "DESTROYED": "destroyed"
    }
}

},{}],3:[function(require,module,exports){
module.exports={
    "app": {
        "CREATED": "created",
        "RESOLVED": "resolved",
        "SETUP": "setup",
        "STARTED": "started",
        "STOPPED": "stopped"
    },
    "module": {
        "CREATED": "created",
        "SETUP": "setup",
        "ENABLED": "enabled",
        "DISABLED": "disabled",
        "DESTROYED": "destroyed"
    }
}

},{}],4:[function(require,module,exports){
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

},{"../resources/errors.json":1,"../resources/events.json":2,"../resources/status.json":3,"./moduleWrapper":7,"async":undefined,"dependency-graph":undefined,"errors-factory":undefined,"events":undefined,"lodash":undefined}],5:[function(require,module,exports){
"use strict";

module.exports.App = require('./app');
module.exports.Module = require('./module');
module.exports._ModuleWrapper = require('./moduleWrapper');

},{"./app":4,"./module":6,"./moduleWrapper":7}],6:[function(require,module,exports){
"use strict";

const EventEmitter = require('events').EventEmitter;
const ErrorsFactory = require('errors-factory');
const _ = require('lodash');

// Provide errors defined in ../resources/errors.json.
const _errors = new ErrorsFactory(require('../resources/errors.json'));

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
        return privateProps.get(this).version;
    }

    get options() {
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
        if (this.status !== _status.CREATED) {
            throw _errors.ERR_MOD_003;
        }
        privateProps.get(this).dependencies = checkDependencies(newDependencies);
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
        if (_.isPlainObject(options) || _.isNull(options)) {
            this.options = _.merge(this.options, options);
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
        dependencies = checkDependencies(dependencies);
        dependencies = _.concat(this.dependencies, dependencies);
        dependencies = _.flattenDeep(dependencies);
        dependencies = _.uniq(dependencies);
        this.dependencies = dependencies;
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
        done(null);
    }

}

module.exports = Module;

},{"../resources/errors.json":1,"../resources/events.json":2,"../resources/status.json":3,"errors-factory":undefined,"events":undefined,"lodash":undefined}],7:[function(require,module,exports){
"use strict";

const EventEmitter = require('events').EventEmitter;
const ErrorsFactory = require('errors-factory');
const _ = require('lodash');

// Provide errors defined in ../resources/errors.json.
const _errors = new ErrorsFactory(require('../resources/errors.json'));

// Provide the Module events as defined in ../resources/events.json.
const _events = require('../resources/events.json').module;

// Provide the Module status as defined in ../resources/status.json.
const _status = require('../resources/status.json').module;

/**
 * Class representing a ModuleWrapper.
 *
 * @class
 * @extends EventEmitter
 * @author nauwep <nauwep.dev@gmail.com>
 * @since 1.0.0
 * @access private
 */
class ModuleWrapper extends EventEmitter {

    /**
     * Create a new instance of ModuleWrapper.
     *
     * @param {!Module} _module The module to wrap
     * @param {!App} _app The reference to the app
     * @param {?Object} [_options] The options of the module
     * @param {?Object} [_imports] The dependencies of the module
     * @throws {Error} ERR_MOD_006 if _module or _app are null or undefined
     * @throws {Error} ERR_MOD_007 if _module is not an instance of {@link Module}
     * @throws {Error} ERR_MOD_008 if _app is not an instance of {@link App}
     */
    constructor(_module, _app, _options = {}, _imports = {}) {

        if (_.isUndefined(_module) || _.isUndefined(_app) || _.isNull(_module) || _.isNull(_app)) {
            throw _errors.ERR_MOD_006;
        }

        if (_module.constructor.name !== 'Module') {
            throw _errors.ERR_MOD_007;
        }

        if (_app.constructor.name !== 'App') {
            throw _errors.ERR_MOD_008;
        }

        super();

        /**
         * The {@link Module} instance to wrap.
         *
         * @name module
         * @memberof ModuleWrapper
         * @instance
         * @type {!Module}
         * @since 1.0.0
         * @access private
         */
        this.module = _module;

        /**
         * The app managing the module.
         *
         * @name app
         * @memberof ModuleWrapper
         * @instance
         * @type {!App}
         * @since 1.0.0
         * @access private
         */
        this.app = _app;

        /**
         * The list of dependencies of the module.
         * A dependency is accessed by its id as key of this imports object.
         * Dependencies are instance of ModuleWrapper wrapping an instance of Module.
         *
         * @name imports
         * @memberof ModuleWrapper
         * @instance
         * @type {?Object}
         * @since 1.0.0
         * @access private
         */
        this.imports = _imports;

        // Get properties from module

        /**
         * The id of the module.
         *
         * @name id
         * @memberof ModuleWrapper
         * @instance
         * @type {!String}
         * @since 1.0.0
         * @access private
         */
        this.id = this.module.id;
        if (_.isString(this.module.version)) {

            /**
             * The version of the module.
             *
             * @name version
             * @memberof ModuleWrapper
             * @instance
             * @type {?String}
             * @since 1.0.0
             * @access private
             */
            this.version = this.module.version;
        }

        /**
         * The status of the moduleWrapper.
         * The value is part of the [supported status]{@link Module.status}.
         *
         * @name status
         * @memberof ModuleWrapper
         * @instance
         * @type {!String}
         * @since 1.0.0
         * @access private
         */
        this.status = _status.CREATED;

        /**
         * The consolidated options for the module.
         *
         * @name options
         * @memberof ModuleWrapper
         * @instance
         * @type {?Object}
         * @since 1.0.0
         * @access private
         */
        this.options = _.merge(_options, this.module.options);

        /**
         * The package.json information from the module.
         *
         * @name package
         * @memberof ModuleWrapper
         * @instance
         * @type {?Object}
         * @since 1.0.0
         * @access private
         */
        this.package = this.module.package;

        /**
         * The list of dependency ids from the module.
         *
         * @name dependencies
         * @memberof ModuleWrapper
         * @instance
         * @type {!Array.<String>}
         * @since 1.0.0
         * @access private
         */
        this.dependencies = this.module.dependencies;

        // Get lifecycle functions then remove them from module

        // Setup

        /**
         * Keep the initial [setup]{@link Module#setup} Function of the module.
         *
         * @name _initialFuncSetup
         * @memberof ModuleWrapper
         * @instance
         * @type {Function}
         * @since 1.0.0
         * @access private
         */
        this._initialFuncSetup = this.module.setup;

        /**
         * Create a setup Function at wrapper level to call the [setup]{@link Module#setup} Function of the module with predefined parameters.
         *
         * @name setup
         * @memberof ModuleWrapper
         * @instance
         * @type {Function}
         * @since 1.0.0
         * @access private
         */
        this.setup = _.bind(this._initialFuncSetup, this.module, this.app, this.options, this.imports);
        this.module.setup = undefined;

        // Enable

        /**
         * Keep the initial [enable]{@link Module#enable} Function of the module.
         *
         * @name _initialFuncEnable
         * @memberof ModuleWrapper
         * @instance
         * @type {Function}
         * @since 1.0.0
         * @access private
         */
        this._initialFuncEnable = this.module.enable;

        /**
         * Create a enable Function at wrapper level to call the [enable]{@link Module#enable} Function of the module with predefined parameters.
         *
         * @name enable
         * @memberof ModuleWrapper
         * @instance
         * @type {Function}
         * @since 1.0.0
         * @access private
         */
        this.enable = _.bind(this._initialFuncEnable, this.module, this.app, this.options, this
            .imports);
        this.module.enable = undefined;

        // Disable

        /**
         * Keep the initial [disable]{@link Module#disable} Function of the module.
         *
         * @name _initialFuncDisable
         * @memberof ModuleWrapper
         * @instance
         * @type {Function}
         * @since 1.0.0
         * @access private
         */
        this._initialFuncDisable = this.module.disable;

        /**
         * Create a disable Function at wrapper level to call the [disable]{@link Module#disable} Function of the module with predefined parameters.
         *
         * @name disable
         * @memberof ModuleWrapper
         * @instance
         * @type {Function}
         * @since 1.0.0
         * @access private
         */
        this.disable = _.bind(this._initialFuncDisable, this.module, this.app, this.options,
            this.imports);
        this.module.disable = undefined;

        // Destroy

        /**
         * Keep the initial [destroy]{@link Module#destroy} Function of the module.
         *
         * @name _initialFuncDestroy
         * @memberof ModuleWrapper
         * @instance
         * @type {Function}
         * @since 1.0.0
         * @access private
         */
        this._initialFuncDestroy = this.module.destroy;

        /**
         * Create a destroy Function at wrapper level to call the [destroy]{@link Module#destroy} Function of the module with predefined parameters.
         *
         * @name destroy
         * @memberof ModuleWrapper
         * @instance
         * @type {Function}
         * @since 1.0.0
         * @access private
         */
        this.destroy = _.bind(this._initialFuncDestroy, this.module, this.app, this.options,
            this.imports);
        this.module.destroy = undefined;

    }

    /**
     * Add options to the moduleWrapper.
     * Merge with existing options.
     * Options are passed to the module in the different lifecycle hook functions.
     *
     * @param {?Object} [newOptions={}] The options to add
     * @throws {Error} ERR_MOD_004 if the options parameter is not an Object
     * @throws {Error} ERR_MOD_010 if not in created status
     * @author nauwep <nauwep.dev@gmail.com>
     * @since 1.0.0
     * @access private
     */
    addOptions(newOptions = {}) {
        if (this.status !== _status.CREATED) {
            throw _errors.ERR_MOD_010;
        }
        if (_.isPlainObject(newOptions) || _.isNull(newOptions)) {
            this.options = _.merge(this.options, newOptions);
        } else {
            throw _errors.ERR_MOD_004;
        }
    }

    /**
     * Add imports to the moduleWrapper.
     * Merge the existing imports.
     * Imports are passed to the module in the different lifecycle hook functions.
     *
     * ```javascript
     * // example of imports object
     * {
     *     logger: loggerModuleWrapper,
     *     server: serverModuleWrapper
     * }
     * ```
     *
     * @param {?Object} [newImports={}] The imports Object to add
     * @throws {Error} ERR_MOD_009 if the imports parameter is not an Object
     * @throws {Error} ERR_MOD_011 if not in created status
     * @throws {Error} ERR_MOD_012 if a value of the imports Object is not a ModuleWrapper instance
     * @author nauwep <nauwep.dev@gmail.com>
     * @since 1.0.0
     * @access private
     */
    addImports(newImports = {}) {
        if (this.status !== _status.CREATED) {
            throw _errors.ERR_MOD_011;
        }
        if (_.isPlainObject(newImports) || _.isNull(newImports)) {
            _.forEach(newImports, (wrapperInstance) => {
                if (wrapperInstance.constructor.name !== 'ModuleWrapper') {
                    throw _errors.ERR_MOD_012;
                }
            });
            this.imports = _.merge(this.imports, newImports);
        } else {
            throw _errors.ERR_MOD_009;
        }
    }

    /**
     * Execute the {@link ModuleWrapper#setup} function, check the status and emit events.
     *
     * @param {!Function} done Callback executed at the end of the execution or if any error
     * @throws {Error} ERR_MOD_015 if not in created status
     * @author nauwep <nauwep.dev@gmail.com>
     * @since 1.0.0
     * @access private
     */
    setupModule(done) {
        if (this.status !== _status.CREATED || this.module.status !== _status.CREATED) {
            return done(_errors.ERR_MOD_015);
        }

        /**
         * Setting up event. When the module is beginning its setup.
         * @event Module#setting_up
         * @category events
         */
        this.module.emit(_events.SETTING_UP);
        this.setup((err) => {
            if (err) {
                done(err);
            } else {
                this.status = _status.SETUP;
                this.module._changeStatus(_status.SETUP, this);

                /**
                 * Setup event. When the module has been setup.
                 * @event Module#setup
                 * @category events
                 */
                this.module.emit(_events.SETUP);
                done(null);
            }
        });
    }

    /**
     * Execute the {@link ModuleWrapper#enable} function, check the status and emit events.
     *
     * @param {!Function} done Callback executed at the end of the execution or if any error
     * @throws {Error} ERR_MOD_016 if not in setup status
     * @author nauwep <nauwep.dev@gmail.com>
     * @since 1.0.0
     * @access private
     */
    enableModule(done) {
        if (this.status !== _status.SETUP || this.module.status !== _status.SETUP) {
            return done(_errors.ERR_MOD_016);
        }

        /**
         * Enabling event. When the module is about to be enabled.
         * @event Module#enabling
         * @category events
         */
        this.module.emit(_events.ENABLING);
        this.enable((err) => {
            if (err) {
                done(err);
            } else {
                this.status = _status.ENABLED;
                this.module._changeStatus(_status.ENABLED, this);

                /**
                 * Enabled event. When the module has been enabled.
                 * @event Module#enabled
                 * @category events
                 */
                this.module.emit(_events.ENABLED);
                done(null);
            }
        });
    }

    /**
     * Execute the {@link ModuleWrapper#disable} function, check the status and emit events.
     *
     * @param {!Function} done Callback executed at the end of the execution or if any error
     * @throws {Error} ERR_MOD_016 if not in enabled status
     * @author nauwep <nauwep.dev@gmail.com>
     * @since 1.0.0
     * @access private
     */
    disableModule(done) {
        if (this.status !== _status.ENABLED || this.module.status !== _status.ENABLED) {
            return done(_errors.ERR_MOD_017);
        }

        /**
         * Disabling event. When the module is about to be disabled.
         * @event Module#disabling
         * @category events
         */
        this.module.emit(_events.DISABLING);
        this.disable((err) => {
            if (err) {
                done(err);
            } else {
                this.status = _status.DISABLED;
                this.module._changeStatus(_status.DISABLED, this);

                /**
                 * Disabled event. When the module has been disabled.
                 * @event Module#disabled
                 * @category events
                 */
                this.module.emit(_events.DISABLED);
                done(null);
            }
        });
    }

    /**
     * Execute the {@link ModuleWrapper#destroy} function, check the status and emit events.
     *
     * @param {!Function} done Callback executed at the end of the execution or if any error
     * @throws {Error} ERR_MOD_016 if not in disabled status
     * @author nauwep <nauwep.dev@gmail.com>
     * @since 1.0.0
     * @access private
     */
    destroyModule(done) {
        if (this.status !== _status.DISABLED || this.module.status !== _status.DISABLED) {
            return done(_errors.ERR_MOD_018);
        }

        /**
         * Destroying event. When the module is about to be destroyed.
         * @event Module#destroying
         * @category events
         */
        this.module.emit(_events.DESTROYING);
        this.destroy((err) => {
            if (err) {
                done(err);
            } else {
                this.status = _status.DESTROYED;
                this.module._changeStatus(_status.DESTROYED, this);

                /**
                 * Destroyed event. When the module has been destroyed.
                 * @event Module#destroyed
                 * @category events
                 */
                this.module.emit(_events.DESTROYED);
                done(null);
            }
        });
    }

}

module.exports = ModuleWrapper;

},{"../resources/errors.json":1,"../resources/events.json":2,"../resources/status.json":3,"errors-factory":undefined,"events":undefined,"lodash":undefined}]},{},[5])(5)
});
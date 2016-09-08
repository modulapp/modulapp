"use strict";

const EventEmitter = require('events').EventEmitter;
const _ = require('lodash');
const async = require('async');
const DepGraph = require('dependency-graph').DepGraph;

const errors = require('./errors');
const events = require('./events.json').app;
const status = require('./status.json').app;

class App extends EventEmitter {

    constructor(config = [], options = {}) {
        super();
        this.config = config;
        this.graph = new DepGraph();
        this.options = options;
        this.status = status.CREATED;
    }

    addOptions(options = {}) {
        // TODO raise an error depending on the status
        // TODO if already resolved, update the wrapper in the graph
        this.options = _.merge(this.options, options);
    }

    addConfig(config = []) {
        // TODO if status in resolved, update the config and resolve again
        // TODO raise an error depending on the status
        this.config = this.config.concat(config);
    }

    // Resolve the dependencies of the modules
    resolve(callback) { // TODO callback required?
        if (this.status === status.STARTED) {
            callback(errors.ERR_APP_001);
            return this;
        }

        this.emit(this.events.RESOLVING);

        // - iterate on this.config
        //   - create a wrapper
        //   - check if the node is already existing
        //   - if no, create a graph node with the wrapper as data
        //   - if yes, use it and the wrapper as its data
        //   - create the graph dependencies based on the dependencies defined in the wrapper
        //     - if the target node is not existing create it without data
        // - check the graph for cycles, raise error if any
        // - check missing module by checking the data of all graph node
        //   - if missing module, check its dependants and raise an error

        const nbModuleDefInConfig = this.config;

        _.forEach(this.config, (moduleDef) => {

            let moduleWrapper = new ModuleWrapper(moduleDef, this);
            let id = moduleWrapper.id;
            let dependencies = moduleWrapper.dependencies;

            if (this.options[id]) { // TODO find the equivalent in lodash
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
            if (_.startsWith(err.message, 'Dependency Cycle Found')) {
                callback(errors.ERR_APP_006);
                return this;
            } else {
                callback(err);
                return this;
            }
        }

        // Missing module check
        if (nodeIds.length !== nbModuleDefInConfig) {
            let nodeIds = this.graph.overallOrder();
            let missingModule = [];
            _.forEach(nodeIds, (nodeId) => {
                let data = this.graph.getNodeData(nodeId);
                if (!(data instanceof ModuleWrapper)) {
                    missingModule.push(nodeId);
                }
            });
            let missingModuleError = errors.ERR_APP_007;
            missingModuleError.data = missingModule;
            callback(missingModuleError);
            return this;
        }

        // Set the imports in each wrapper
        _.forEach(nodeIds, (nodeId) => {
            let wrapper = this.graph.getNodeData(nodeId);
            let depNodeIds = this.graph.dependenciesOf(nodeId);
            let imports = {};
            _.forEach(depNodeIds, (depNodeId) => {
                let depWrapper = this.graph.getNodeData(depNodeId);
                if (depWrapper instanceof ModuleWrapper) {
                    imports[depNodeId] = depWrapper;
                }
            });
            wrapper.addImports(imports);
            this.graph.getNodeData(nodeId, wrapper); // TODO required ?
        });

        this.emit(this.events.RESOLVED);
        this.status = status.RESOLVED;
        callback(null); // TODO return null when implemented
        return this;
    }

    // Setup every modules following the dependency graph
    setup(callback) {
        if (this.status === status.STARTED) {
            callback(errors.ERR_APP_002);
            return this;
        }

        if (this.status === status.CREATED) {
            this.resolve((err) => { // TODO callback required ?
                if (err) {
                    callback(err);
                    return this;
                }
                return this.setup(callback);
            });
        }

        this.emit(this.events.SETTING_UP);

        let nodeIds = this.graph.overallOrder();
        async.eachSeries(nodeIds, (nodeId, asyncCallback) => {

            let wrapper = this.graph.getNodeData(nodeId);
            if (!(wrapper instanceof ModuleWrapper)) {
                asyncCallback(null); // TODO Should raise an error ?
                return;
            }
            wrapper.setupModule(asyncCallback);
            // TODO what to do if something wrong in the function

        }, (err) => {
            if (err) {
                callback(err);
                return;
            }
            this.emit(this.events.SETUP);
            this.status = status.SETUP;
            callback(null);
            return this;
        });

    }

    // Enable every modules following the dependency graph
    start(callback) {
        if (this.status === status.STARTED) {
            callback(errors.ERR_APP_003);
            return;
        }

        if (this.status === status.CREATED) {
            this.setup((err) => {
                if (err) {
                    callback(err);
                    return;
                }
                return this.start(callback);
            });
        }

        this.emit(this.events.STARTING);

        let nodeIds = this.graph.overallOrder();
        async.eachSeries(nodeIds, (nodeId, asyncCallback) => {

            let wrapper = this.graph.getNodeData(nodeId);
            if (!(wrapper instanceof ModuleWrapper)) {
                asyncCallback(null); // TODO Should raise an error ?
                return;
            }
            wrapper.startModule(asyncCallback);
            // TODO what to do if something wrong in the function

        }, (err) => {
            if (err) {
                callback(err);
                return;
            }
            this.emit(this.events.STARTED);
            this.status = status.STARTED;
            callback(null);
        });

    }

    // Disable every modules following the dependency graph
    stop(callback) {
        if (this.status !== status.STARTED) {
            callback(errors.ERR_APP_004);
            return this;
        }

        this.emit(this.events.STOPPING);

        let nodeIds = _.reverse(this.graph.overallOrder());
        async.eachSeries(nodeIds, (nodeId, asyncCallback) => {

            let wrapper = this.graph.getNodeData(nodeId);
            if (!(wrapper instanceof ModuleWrapper)) {
                asyncCallback(null); // TODO Should raise an error ?
                return;
            }
            wrapper.stopModule(asyncCallback);
            // TODO what to do if something wrong in the function

        }, (err) => {
            if (err) {
                callback(err);
                return;
            }
            this.emit(this.events.STOPPED);
            this.status = status.STOPPED;
            callback(null);
            return this;
        });

    }

    // Destroy every modules following the dependency graph
    destroy(callback) {
        if (this.status !== status.STOPPED) {
            callback(errors.ERR_APP_005);
            return;
        }

        this.emit(this.events.DESTROYING);

        let nodeIds = _.reverse(this.graph.overallOrder());
        async.eachSeries(nodeIds, (nodeId, asyncCallback) => {

            let wrapper = this.graph.getNodeData(nodeId);
            if (!(wrapper instanceof ModuleWrapper)) {
                asyncCallback(null); // TODO Should raise an error ?
                return;
            }
            wrapper.destroyModule(asyncCallback);
            // TODO what to do if something wrong in the function

        }, (err) => {
            if (err) {
                callback(err);
                return;
            }
            this.emit(this.events.DESTROYED);
            callback(null);
        });

    }

    // TODO listen process exit events to destroy app before

    // TODO Add a dedicated function to resolve a specific module? What about the dependants?
    // TODO Add a dedicated function to setup a specific module? What about the dependants?
    // TODO Add a dedicated function to start a specific module? What about the dependants?
    // TODO Add a dedicated function to stop a specific module? What about the dependants?
    // TODO Add a dedicated function to destroy a specific module? What about the dependants?

}

module.exports = App;

"use strict";

const EventEmitter = require('events').EventEmitter;
const ErrorsFactory = require('errors-factory');
const _ = require('lodash');
const async = require('async');
const DepGraph = require('dependency-graph').DepGraph;

const ModuleWrapper = require('./moduleWrapper');

const _errors = new ErrorsFactory(require('./resources/errors.json'));
const _events = require('./resources/events.json').app;
const _status = require('./resources/status.json').app;

const privateProps = new WeakMap();

function changeStatus(appInstance, newStatus) {

    if (!_.includes(_status, newStatus)) {
        throw _errors.ERR_APP_015;
    }

    let props = privateProps.get(appInstance);
    props.status = newStatus;
    privateProps.set(appInstance, props);
}

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

class App extends EventEmitter {

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

        privateProps.set(this, {
            id: _.uniqueId(),
            config: config,
            graph: new DepGraph(),
            options: options,
            status: _status.CREATED
        });
    }

    // Static methods -----------------------------------------------------------------------------

    static get events() {
        return _events;
    }

    static get status() {
        return _status;
    }

    // Getters and Setters ------------------------------------------------------------------------

    get id() {
        return privateProps.get(this).id;
    }

    get config() {
        return privateProps.get(this).config;
    }

    set config(newConfig = []) {
        // TODO if status in resolved, update the config and resolve again?
        if (this.status !== _status.CREATED) {
            throw _errors.ERR_APP_014;
        }
        privateProps.get(this).config = checkConfig(newConfig);
    }

    get graph() {
        return privateProps.get(this).graph;
    }

    get options() {
        return privateProps.get(this).options;
    }

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

    get status() {
        return privateProps.get(this).status;
    }

    // Public instance methods --------------------------------------------------------------------

    addOptions(options = {}) {
        if (_.isPlainObject(options) || _.isNull(options)) {
            this.options = _.merge(this.options, options);
        } else {
            throw _errors.ERR_APP_008;
        }
    }

    addConfig(...config) {
        config = checkConfig(config);
        config = _.concat(this.config, config);
        config = _.flattenDeep(config);
        config = _.uniq(config);
        this.config = config;
    }

    // Resolve the dependencies of the modules
    resolve(callback) { // TODO callback required?
        if (this.status === _status.STARTED) {
            return callback(_errors.ERR_APP_001);
        }

        this.emit(_events.RESOLVING);

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

        const nbModuleDefInConfig = this.config.length;

        _.forEach(this.config, (moduleDef) => {

            let moduleWrapper = new ModuleWrapper(moduleDef, this);
            let id = moduleWrapper.id;
            let dependencies = moduleWrapper.dependencies;

            if (_.has(this.options, 'id')) {
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
                return callback(_errors.ERR_APP_006);
            } else {
                return callback(err);
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
            return callback(missingModuleError);
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
            this.graph.getNodeData(nodeId, wrapper); // TODO required ?
        });

        this.emit(_events.RESOLVED);
        changeStatus(this, _status.RESOLVED);
        callback(null);
    }

    // Setup every modules following the dependency graph
    setup(callback) {
        if (this.status === _status.STARTED) {
            return callback(_errors.ERR_APP_002);
        }

        if (this.status === _status.CREATED) {
            return this.resolve((err) => { // TODO callback required ?
                if (err) {
                    callback(err);
                } else {
                    this.setup(callback);
                }
            });
        }

        this.emit(_events.SETTING_UP);

        let nodeIds = this.graph.overallOrder();
        async.eachSeries(nodeIds, (nodeId, asyncCallback) => {
            let wrapper = this.graph.getNodeData(nodeId);
            if (wrapper.constructor.name !== 'ModuleWrapper') {
                return asyncCallback(null); // TODO Should raise an error ?
            }
            wrapper.setupModule(asyncCallback);
            // TODO what to do if something wrong in the function

        }, (err) => {
            if (err) {
                callback(err);
            } else {
                this.emit(_events.SETUP);
                changeStatus(this, _status.SETUP);
                callback(null);
            }
        });

    }

    // Enable every modules following the dependency graph
    start(callback) {
        if (this.status === _status.STARTED) {
            return callback(_errors.ERR_APP_003);
        }

        if (this.status === _status.CREATED) {
            return this.setup((err) => {
                if (err) {
                    callback(err);
                } else {
                    this.start(callback);
                }
            });
        }

        this.emit(_events.STARTING);

        let nodeIds = this.graph.overallOrder();
        async.eachSeries(nodeIds, (nodeId, asyncCallback) => {
            let wrapper = this.graph.getNodeData(nodeId);
            if (wrapper.constructor.name !== 'ModuleWrapper') {
                return asyncCallback(null); // TODO Should raise an error ?
            }
            wrapper.enableModule(asyncCallback);
            // TODO what to do if something wrong in the function

        }, (err) => {
            if (err) {
                callback(err);
            } else {
                this.emit(_events.STARTED);
                changeStatus(this, _status.STARTED);
                callback(null);
            }
        });

    }

    // Disable every modules following the dependency graph
    stop(callback) {
        if (this.status !== _status.STARTED) {
            return callback(_errors.ERR_APP_004);
        }

        this.emit(_events.STOPPING);

        let nodeIds = _.reverse(this.graph.overallOrder());
        async.eachSeries(nodeIds, (nodeId, asyncCallback) => {

            let wrapper = this.graph.getNodeData(nodeId);
            if (wrapper.constructor.name !== 'ModuleWrapper') {
                return asyncCallback(null); // TODO Should raise an error ?
            }
            wrapper.disableModule(asyncCallback);
            // TODO what to do if something wrong in the function

        }, (err) => {
            if (err) {
                callback(err);
            } else {
                this.emit(_events.STOPPED);
                changeStatus(this, _status.STOPPED);
                callback(null);
            }
        });

    }

    // Destroy every modules following the dependency graph
    destroy(callback) {
        if (this.status !== _status.STOPPED) {
            return callback(_errors.ERR_APP_005);
        }

        this.emit(_events.DESTROYING);

        let nodeIds = _.reverse(this.graph.overallOrder());
        async.eachSeries(nodeIds, (nodeId, asyncCallback) => {

            let wrapper = this.graph.getNodeData(nodeId);
            if (wrapper.constructor.name !== 'ModuleWrapper') {
                return asyncCallback(null); // TODO Should raise an error ?
            }
            wrapper.destroyModule(asyncCallback);
            // TODO what to do if something wrong in the function

        }, (err) => {
            if (err) {
                callback(err);
            } else {
                this.emit(_events.DESTROYED);
                callback(null);
            }
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

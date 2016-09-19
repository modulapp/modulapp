"use strict";

const EventEmitter = require('events').EventEmitter;
const _ = require('lodash');

const _errors = require('./errors');
const _events = require('./events.json').module;
const _status = require('./status.json').module;

const privateProps = new WeakMap();

// Private functions ------------------------------------------------------------------------------

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

// Class definition -------------------------------------------------------------------------------

class Module extends EventEmitter {

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

        privateProps.set(this, {
            id: id,
            status: _status.CREATED,
            version: version,
            options: options,
            dependencies: dependencies,
            package: packagejson
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

    get status() {
        return privateProps.get(this).status;
    }

    get version() {
        return privateProps.get(this).version;
    }

    get options() {
        return privateProps.get(this).options;
    }

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

    set dependencies(newDependencies = []) {
        if (this.status !== _status.CREATED) {
            throw _errors.ERR_MOD_003;
        }
        privateProps.get(this).dependencies = checkDependencies(newDependencies);
    }

    get package() {
        return privateProps.get(this).package;
    }

    // Public instance methods --------------------------------------------------------------------

    addOptions(options = {}) {
        if (this.status !== _status.CREATED) {
            throw _errors.ERR_MOD_002;
        }
        if (_.isPlainObject(options) || _.isNull(options)) {
            this.options = _.merge(this.options, options);
        } else {
            throw _errors.ERR_MOD_004;
        }
    }

    addDependencies(...dependencies) {
        if (this.status !== _status.CREATED) {
            throw _errors.ERR_MOD_003;
        }
        dependencies = checkDependencies(dependencies);
        dependencies = _.concat(this.dependencies, dependencies);
        dependencies = _.flattenDeep(dependencies);
        dependencies = _.uniq(dependencies);
        this.dependencies = dependencies;
    }

    _changeStatus(newStatus, wrapper) {
        if (!_.has(wrapper, 'module')) {
            throw _errors.ERR_MOD_014;
        }

        if (!_.includes(_status, newStatus)) {
            throw _errors.ERR_MOD_013;
        }

        let props = privateProps.get(this);
        props.status = newStatus;
        privateProps.set(this, props);
    }

    setup(app, options, imports, done) {
        done(null);
    }

    enable(app, options, imports, done) {
        done(null);
    }

    disable(app, options, imports, done) {
        done(null);
    }

    destroy(app, options, imports, done) {
        done(null);
    }

}

module.exports = Module;

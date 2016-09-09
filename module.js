"use strict";

const EventEmitter = require('events').EventEmitter;
const _ = require('lodash');

const errors = require('./errors');
const events = require('./events.json').module;
const status = require('./status.json').module;

class Module extends EventEmitter {

    constructor(id, options = {}) {

        let packagejson = null;

        if (_.isObject(id)) {
            packagejson = id;
            id = packagejson.name;
        }

        if (!id) {
            throw errors.ERR_MOD_001;
        }

        super();

        this._id = id; // TODO Should be private
        this._status = status.CREATED; // TODO Should be private

        if (_.isPlainObject(options)) {
            this._options = options;
        }
        this._dependencies = []; // TODO Should be private
        this._package = {}; // TODO Should be private

        if (packagejson) {
            this._package = packagejson; // TODO Should be private
            this._version = this._package.version; // TODO Should be private
            if (_.has(this._package, 'module.dependencies')) {
                this._dependencies = this._package.module.dependencies;
            }
            if (_.has(this._package, 'module.options')) {
                if (_.isPlainObject(this._package.module.options)) {
                    this._options = _.merge(this._options, this._package.module.options);
                }
            }
        }

    }

    // Static methods -----------------------------------------------------------------------------

    static get events() {
        return events;
    }

    static get status() {
        return status;
    }

    // Getters and Setters ------------------------------------------------------------------------

    get id() {
        return this._id;
    }

    get status() {
        return this._status;
    }

    get version() {
        return this._version;
    }

    get options() {
        return this._options;
    }

    set options(newOptions = {}) {
        if (this.status !== status.CREATED) {
            throw errors.ERR_MOD_002;
        }
        if (_.isNull(newOptions)) {
            this._options = {};
        } else if (_.isPlainObject(newOptions)) {
            this._options = newOptions;
        } else {
            throw errors.ERR_MOD_004;
        }
    }

    get dependencies() {
        return this._dependencies;
    }

    set dependencies(newDependencies = []) {
        // TODO check arguments
        if (this.status !== status.CREATED) {
            throw errors.ERR_MOD_003;
        }
        if (_.isNull(newDependencies)) {
            this._dependencies = [];
        } else if (_.isString(newDependencies)) {
            this._dependencies = [newDependencies];
        } else if (_.isArray(newDependencies)) {

            newDependencies = _.flattenDeep(newDependencies);

            _.remove(newDependencies, (value) => {
                return _.isNull(value);
            });
            _.forEach(newDependencies, (value) => {
                if (!_.isString(value)) {
                    throw errors.ERR_MOD_005;
                }
            });
            newDependencies = _.flattenDeep(newDependencies);
            newDependencies = _.uniq(newDependencies);

            this._dependencies = newDependencies;

        } else {
            throw errors.ERR_MOD_005;
        }
    }

    get package() {
        return this._package;
    }

    // Public instance methods --------------------------------------------------------------------

    addOptions(options = {}) {
        if (this.status !== status.CREATED) {
            throw errors.ERR_MOD_002;
        }
        if (_.isPlainObject(options) || _.isNull(options)) {
            this._options = _.merge(this._options, options);
        } else {
            throw errors.ERR_MOD_004;
        }
    }

    addDependencies(...dependencies) {
        if (this.status !== status.CREATED) {
            throw errors.ERR_MOD_003;
        }
        dependencies = _.flattenDeep(dependencies);
        _.remove(dependencies, (value) => {
            return _.isNull(value);
        });
        _.forEach(dependencies, (value) => {
            if (!_.isString(value)) {
                throw errors.ERR_MOD_005;
            }
        });
        this._dependencies = _.concat(this._dependencies, dependencies);
        this._dependencies = _.flattenDeep(this._dependencies);
        this._dependencies = _.uniq(this._dependencies);
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

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

        this.id = id;
        this.status = status.CREATED;

        if (_.isPlainObject(options)) {
            this._options = options;
        }
        this._dependencies = [];
        this._package = {};

        if (packagejson) {
            this._package = packagejson;
            this.version = this._package.version;
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

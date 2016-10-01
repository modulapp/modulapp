"use strict";

const EventEmitter = require('events').EventEmitter;
const _ = require('lodash');

const _errors = require('./errors');
const _events = require('./resources/events.json').module;
const _status = require('./resources/status.json').module;

const App = require('./app');
const Module = require('./module');

class ModuleWrapper extends EventEmitter {

    constructor(_module, _app, _options = {}, _imports = {}) {

        if (_.isUndefined(_module) || _.isUndefined(_app) || _.isNull(_module) || _.isNull(_app)) {
            throw _errors.ERR_MOD_006;
        }

        if (!(_module.constructor.name === 'Module')) {
            throw _errors.ERR_MOD_007;
        }

        if (!(_app.constructor.name === 'App')) {
            throw _errors.ERR_MOD_008;
        }

        super();

        this.module = _module;
        this.app = _app;
        this.imports = _imports;

        // Get properties from module

        this.id = this.module.id;
        if (_.isString(this.module.version)) {
            this.version = this.module.version;
        }
        this.status = _status.CREATED;
        this.options = _.merge(_options, this.module.options);
        this.package = this.module.package;
        this.dependencies = this.module.dependencies;

        // Get lifecycle functions then remove them from module

        // Setup
        this._initialFuncSetup = this.module.setup;
        this.setup = _.bind(this._initialFuncSetup, this.module, this.app, this.options, this.imports);
        this.module.setup = undefined;

        // Enable
        this._initialFuncEnable = this.module.enable;
        this.enable = _.bind(this._initialFuncEnable, this.module, this.app, this.options, this
            .imports);
        this.module.enable = undefined;

        // Disable
        this._initialFuncDisable = this.module.disable;
        this.disable = _.bind(this._initialFuncDisable, this.module, this.app, this.options,
            this.imports);
        this.module.disable = undefined;

        // Destroy
        this._initialFuncDestroy = this.module.destroy;
        this.destroy = _.bind(this._initialFuncDestroy, this.module, this.app, this.options,
            this.imports);
        this.module.destroy = undefined;

    }

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

    addImports(newImports = {}) {
        if (this.status !== _status.CREATED) {
            throw _errors.ERR_MOD_011;
        }
        if (_.isPlainObject(newImports) || _.isNull(newImports)) {
            _.forEach(newImports, (wrapperInstance) => {
                if (!(wrapperInstance.constructor.name === 'ModuleWrapper')) {
                    throw _errors.ERR_MOD_012;
                }
            });
            this.imports = _.merge(this.imports, newImports);
        } else {
            throw _errors.ERR_MOD_009;
        }
    }

    setupModule(done) {
        if (this.status !== _status.CREATED || this.module.status !== _status.CREATED) {
            return done(_errors.ERR_MOD_015);
        }
        this.module.emit(_events.SETTING_UP);
        this.setup((err) => {
            if (err) {
                done(err);
            } else {
                this.status = _status.SETUP;
                this.module._changeStatus(_status.SETUP, this);
                this.module.emit(_events.SETUP);
                done(null);
            }
        });
    }

    enableModule(done) {
        if (this.status !== _status.SETUP || this.module.status !== _status.SETUP) {
            return done(_errors.ERR_MOD_016);
        }
        this.module.emit(_events.ENABLING);
        this.enable((err) => {
            if (err) {
                done(err);
            } else {
                this.status = _status.ENABLED;
                this.module._changeStatus(_status.ENABLED, this);
                this.module.emit(_events.ENABLED);
                done(null);
            }
        });
    }

    disableModule(done) {
        if (this.status !== _status.ENABLED || this.module.status !== _status.ENABLED) {
            return done(_errors.ERR_MOD_017);
        }
        this.module.emit(_events.DISABLING);
        this.disable((err) => {
            if (err) {
                done(err);
            } else {
                this.status = _status.DISABLED;
                this.module._changeStatus(_status.DISABLED, this);
                this.module.emit(_events.DISABLED);
                done(null);
            }
        });
    }

    destroyModule(done) {
        if (this.status !== _status.DISABLED || this.module.status !== _status.DISABLED) {
            return done(_errors.ERR_MOD_018);
        }
        this.module.emit(_events.DESTROYING);
        this.destroy((err) => {
            if (err) {
                done(err);
            } else {
                this.status = _status.DESTROYED;
                this.module._changeStatus(_status.DESTROYED, this);
                this.module.emit(_events.DESTROYED);
                done(null);
            }
        });
    }

}

module.exports = ModuleWrapper;

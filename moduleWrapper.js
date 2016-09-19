"use strict";

const EventEmitter = require('events').EventEmitter;
const _ = require('lodash');

const _errors = require('./errors');
const _events = require('./events.json').module;
const _status = require('./status.json').module;

const App = require('./app.js');
const Module = require('./module.js');

class ModuleWrapper extends EventEmitter {

    constructor(_module, app, options = {}, imports = {}) {

        if (_.isUndefined(_module) || _.isUndefined(app) || _.isNull(_module) || _.isNull(app)) {
            throw _errors.ERR_MOD_006;
        }

        if (!(_module instanceof Module)) {
            throw _errors.ERR_MOD_007;
        }

        if (!(app instanceof App)) {
            throw _errors.ERR_MOD_008;
        }

        super();

        this.module = _module;
        this.app = app;
        this.imports = imports;

        // Get properties from module

        this.id = this.module.id;
        if (_.isString(this.module.version)) {
            this.version = this.module.version;
        }
        this.status = _status.CREATED;
        this.options = _.merge(options, this.module.options);
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
                if (!(wrapperInstance instanceof ModuleWrapper)) {
                    throw _errors.ERR_MOD_012;
                }
            });
            this.imports = _.merge(this.imports, newImports);
        } else {
            throw _errors.ERR_MOD_009;
        }
    }

    setupModule(done) {
        this.module.emit(_events.SETTING_UP);
        //this.module.setup(this.app, this.options, this.imports, (err) => { // TODO To check
        this.setup((err) => {
            if (err) {
                done(err);
            } else {
                this.status = _status.SETUP;
                this.module.status = _status.SETUP;
                this.module.emit(_events.SETUP);
                done(null);
            }
        });
    }

    enableModule(done) {
        this.module.emit(_events.ENABLING);
        //this.module.enable(this.app, this.options, this.imports, (err) => { // TODO To check
        this.enable((err) => {
            if (err) {
                done(err);
            } else {
                this.status = _status.ENABLED;
                this.module.status = _status.ENABLED;
                this.module.emit(_events.ENABLED);
                done(null);
            }
        });
    }

    disableModule(done) {
        this.module.emit(_events.DISABLING);
        //this.module.disable(this.app, this.options, this.imports, (err) => { // TODO To check
        this.disable((err) => {
            if (err) {
                done(err);
            } else {
                this.status = _status.DISABLED;
                this.module.status = _status.DISABLED;
                this.module.emit(_events.DISABLED);
                done(null);
            }
        });
    }

    destroyModule(done) {
        this.module.emit(_events.DESTROYING);
        //this.module.destroy(this.app, this.options, this.imports, (err) => { // TODO To check
        this.destroy((err) => {
            if (err) {
                done(err);
            } else {
                this.status = _status.DESTROYED;
                this.module.status = _status.DESTROYED;
                this.module.emit(_events.DESTROYED);
                done(null);
            }
        });
    }

};

module.exports = ModuleWrapper;

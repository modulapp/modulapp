"use strict";

const EventEmitter = require('events').EventEmitter;
const _ = require('lodash');

const errors = require('./errors');
const events = require('./events.json').module;
const status = require('./status.json').module;

const App = require('./app.js');
const Module = require('./module.js');

class ModuleWrapper extends EventEmitter {

    constructor(_module, app, imports = {}, options = {}) {

        if (_.isUndefined(_module) || _.isUndefined(app) || _.isNull(_module) || _.isNull(app)) {
            throw errors.ERR_MOD_006;
        }

        if (!(_module instanceof Module)) {
            throw errors.ERR_MOD_007;
        }

        if (!(app instanceof App)) {
            throw errors.ERR_MOD_008;
        }

        super();

        this.module = _module;
        this.app = app;
        this.imports = imports;

        this.id = this.module.id;
        if (_.has(this.module, 'version')) {
            this.version = this.module.version;
        }
        this.status = status.CREATED;

        // Get properties then remove them from module

        this.options = _.merge(options, this.module._options);
        _.unset(this.module, '_options');
        this.package = this.module._package;
        _.unset(this.module, '_package');
        this.dependencies = this.module._dependencies;
        _.unset(this.module, '_dependencies');

        // Get lifecycle functions then remove them from module

        // Setup
        this._initialFuncSetup = this.module.setup;
        this.setup = _.bind(this._initialFuncSetup, this.module, this.app, this.options, this.imports);
        _.unset(this.module, 'setup');

        // Enable
        this._initialFuncEnable = this.module.enable;
        this.enable = _.bind(this._initialFuncEnable, this.module, this.app, this.options, this
            .imports);
        _.unset(this.module, 'enable');

        // Disable
        this._initialFuncDisable = this.module.disable;
        this.disable = _.bind(this._initialFuncDisable, this.module, this.app, this.options,
            this.imports);
        _.unset(this.module, 'disable');

        // Destroy
        this._initialFuncDestroy = this.module.destroy;
        this.destroy = _.bind(this._initialFuncDestroy, this.module, this.app, this.options,
            this.imports);
        _.unset(this.module, 'destroy');

    }

    addOptions(newOptions = {}) {
        if (this.status !== status.CREATED) {
            throw errors.ERR_MOD_XXX; // TODO define the error
        }
        if (_.isPlainObject(newOptions) || _.isNull(newOptions)) {
            this.options = _.merge(this.options, newOptions);
        } else {
            throw errors.ERR_MOD_XXX; // TODO define the error
        }
    }

    addImports(newImports = {}) {
        if (this.status !== status.CREATED) {
            throw errors.ERR_MOD_XXX; // TODO define the error
        }
        if (_.isPlainObject(newImports) || _.isNull(newImports)) {
            this.imports = _.merge(this.imports, newImports);
        } else {
            throw errors.ERR_MOD_XXX; // TODO define the error
        }
    }

    setupModule(done) {
        this.module.emit(events.SETTING_UP);
        //this.module.setup(this.app, this.options, this.imports, (err) => { // TODO To check
        this.setup((err) => {
            if (err) {
                done(err);
            } else {
                this.status = status.SETUP;
                this.module.status = status.SETUP;
                this.module.emit(events.SETUP);
                done(null);
            }
        });
    }

    enableModule(done) {
        this.module.emit(events.ENABLING);
        //this.module.enable(this.app, this.options, this.imports, (err) => { // TODO To check
        this.enable((err) => {
            if (err) {
                done(err);
            } else {
                this.status = status.ENABLED;
                this.module.status = status.ENABLED;
                this.module.emit(events.ENABLED);
                done(null);
            }
        });
    }

    disableModule(done) {
        this.module.emit(events.DISABLING);
        //this.module.disable(this.app, this.options, this.imports, (err) => { // TODO To check
        this.disable((err) => {
            if (err) {
                done(err);
            } else {
                this.status = status.DISABLED;
                this.module.status = status.DISABLED;
                this.module.emit(events.DISABLED);
                done(null);
            }
        });
    }

    destroyModule(done) {
        this.module.emit(events.DESTROYING);
        //this.module.destroy(this.app, this.options, this.imports, (err) => { // TODO To check
        this.destroy((err) => {
            if (err) {
                done(err);
            } else {
                this.status = status.DESTROYED;
                this.module.status = status.DESTROYED;
                this.module.emit(events.DESTROYED);
                done(null);
            }
        });
    }

};

module.exports = ModuleWrapper;

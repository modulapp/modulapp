"use strict";

const EventEmitter = require('events').EventEmitter;
const ErrorsFactory = require('errors-factory');
const _ = require('lodash');

// Provide errors defined in ./resources/errors.json.
const _errors = new ErrorsFactory(require('./resources/errors.json'));

// Provide the Module events as defined in ./resources/events.json.
const _events = require('./resources/events.json').module;

// Provide the Module status as defined in ./resources/status.json.
const _status = require('./resources/status.json').module;

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
         * Dependencies are instance of Module.
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
     *     logger: loggerModule,
     *     server: serverModule
     * }
     * ```
     *
     * @param {?Object} [newImports={}] The imports Object to add
     * @throws {Error} ERR_MOD_009 if the imports parameter is not an Object
     * @throws {Error} ERR_MOD_011 if not in created status
     * @throws {Error} ERR_MOD_012 if a value of the imports Object is not a Module instance
     * @author nauwep <nauwep.dev@gmail.com>
     * @since 1.0.0
     * @access private
     */
    addImports(newImports = {}) {
        if (this.status !== _status.CREATED) {
            throw _errors.ERR_MOD_011;
        }
        if (_.isPlainObject(newImports) || _.isNull(newImports)) {
            _.forEach(newImports, (moduleInstance) => {
                if (moduleInstance.constructor.name !== 'Module') {
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

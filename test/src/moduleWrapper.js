"use strict";

const should = require('should');
const sinon = require('sinon');
const ErrorsFactory = require('errors-factory');
const errorsJson = require('../../resources/errors.json');
const errors = new ErrorsFactory(errorsJson);

module.exports = function(Module, ModuleWrapper, App) {

    describe('ModuleWrapper', function() {

        let app;
        let testModule;
        let wrapper;

        describe('Constructor()', function() {

            describe('with illegal arguments', function() {

                before('initialize wrapper', function() {

                    testModule = new Module({
                        name: 'testModule',
                        version: '1.0.0',
                        module: {
                            dependencies: [],
                            options: {
                                db_url: 'localhost',
                                db_port: 8080
                            }
                        }
                    });

                    app = new App();

                });

                it('should throw an error with no argument', function() {
                    should(function() {
                        new ModuleWrapper();
                    }).throw(errors.ERR_MOD_006);
                });

                it('should throw an error with a null as 1st argument',
                    function() {
                        should(function() {
                            new ModuleWrapper(null, app);
                        }).throw(errors.ERR_MOD_006);
                    });

                it('should throw an error with a null as 2nd argument',
                    function() {
                        should(function() {
                            new ModuleWrapper(testModule,
                                null);
                        }).throw(errors.ERR_MOD_006);
                    });

                it(
                    'should throw an error if 1st argument is not a Module instance',
                    function() {
                        should(function() {
                            let notModule = {
                                id: 'a'
                            };
                            new ModuleWrapper(notModule,
                                app);
                        }).throw(errors.ERR_MOD_007);
                    });

                it(
                    'should throw an error if 2nd argument is not an App instance',
                    function() {
                        should(function() {
                            let notApp = {
                                id: 'a'
                            };
                            new ModuleWrapper(testModule,
                                notApp);
                        }).throw(errors.ERR_MOD_008);
                    });

            });

            describe('with minimum arguments', function() {

                before('initialize wrapper', function() {

                    wrapper = new ModuleWrapper(testModule, app);

                });

                it('should return an instance of ModuleWrapper',
                    function() {
                        should(wrapper).be.an.instanceOf(
                            ModuleWrapper);
                    });

                it('should have an id property', function() {
                    should(wrapper).have.property('id',
                        'testModule');
                });

                it('should have a status property ("created")',
                    function() {
                        should(wrapper).have.property('status',
                            'created');
                    });

                it('should have a version property', function() {
                    should(wrapper).have.property('version',
                        '1.0.0');
                });

                it('should have a module property', function() {
                    should(wrapper.module).be.an.instanceOf(
                        Module);
                });

                it('should have an app property', function() {
                    should(wrapper.app).be.an.instanceOf(App);
                });

                it('should have an empty object imports property',
                    function() {
                        should(wrapper.imports).be.empty();
                    });

                it('should have an options property', function() {
                    should(wrapper.options).have.properties([
                        'db_url', 'db_port'
                    ]);
                });

                it('should have a package property', function() {
                    should(wrapper.package).have.properties([
                        'name', 'version', 'module'
                    ]);
                });

                it('should have a dependencies property', function() {
                    should(wrapper).have.property(
                        'dependencies');
                });

            });

            describe('with optional arguments', function() {

                before('initialize wrapper', function() {

                    testModule = new Module({
                        name: 'testModule',
                        version: '1.0.0',
                        module: {
                            dependencies: [],
                            options: {
                                db_url: 'localhost',
                                db_port: 8080
                            }
                        }
                    });

                    let logger = new ModuleWrapper(new Module(
                            'logger'),
                        app);
                    let db = new ModuleWrapper(new Module('db'),
                        app);

                    let imports = {
                        logger, db
                    };

                    let otherOptions = {
                        timeout: 1000
                    };

                    wrapper = new ModuleWrapper(testModule, app,
                        otherOptions, imports);

                });

                it('should return an instance of ModuleWrapper',
                    function() {
                        should(wrapper).be.an.instanceOf(
                            ModuleWrapper);
                    });

                it('should have an id property', function() {
                    (wrapper).should.have.property('id',
                        'testModule');
                });

                it('should have a status property ("created")',
                    function() {
                        (wrapper).should.have.property('status',
                            'created');
                    });

                it('should have a version property', function() {
                    (wrapper).should.have.property('version',
                        '1.0.0');
                });

                it('should have a module property', function() {
                    should(wrapper.module).be.an.instanceOf(
                        Module);
                });

                it('should have an app property', function() {
                    should(wrapper.app).be.an.instanceOf(App);
                });

                it('should have an empty object imports property',
                    function() {
                        (wrapper.imports).should.have.properties([
                            'db',
                            'logger'
                        ]);
                    });

                it('should have an options property', function() {
                    (wrapper.options).should.have.properties([
                        'db_url', 'db_port', 'timeout'
                    ]);
                });

                it('should have a package property', function() {
                    (wrapper.package).should.have.properties([
                        'name', 'version', 'module'
                    ]);
                });

                it('should have a dependencies property', function() {
                    (wrapper).should.have.property(
                        'dependencies');
                });

            });

        });

        describe('#addOptions()', function() {

            const testOptions1 = {
                db_url: 'localhost',
                db_port: 8080
            };

            const testOptions2 = {
                db_url: '127.0.0.0',
                timeout: 1000
            };

            beforeEach('Clear options before each tests', function() {
                wrapper.options = {};
                wrapper.status = 'created';
            });

            it('should exist in the instance', function() {
                should(wrapper.addOptions).be.a.Function();
            });

            it('should handle empty argument', function() {
                should(function() {
                    wrapper.addOptions();
                }).not.throw();
            });

            it('should handle null argument', function() {
                should(function() {
                    wrapper.addOptions(null);
                }).not.throw();
            });

            it('should handle empty object argument', function() {
                should(function() {
                    wrapper.addOptions({});
                }).not.throw();
            });

            it('should not accept non-object argument', function() {
                should(function() {
                    wrapper.addOptions([]);
                }).throw(errors.ERR_MOD_004);
                should(function() {
                    wrapper.addOptions(['new option']);
                }).throw(errors.ERR_MOD_004);
                should(function() {
                    wrapper.addOptions('new option');
                }).throw(errors.ERR_MOD_004);
                should(function() {
                    wrapper.addOptions(123);
                }).throw(errors.ERR_MOD_004);
                should(function() {
                    wrapper.addOptions(true);
                }).throw(errors.ERR_MOD_004);
                should(function() {
                    wrapper.addOptions(function() {});
                }).throw(errors.ERR_MOD_004);
            });

            it('should accept an object argument', function() {
                should(function() {
                    wrapper.addOptions(testOptions1);
                }).not.throw();
            });

            it('should merge argument object with existing options', function() {
                should(wrapper.options).not.have.property('db_url');
                should(wrapper.options).not.have.property('db_port');
                should(wrapper.options).not.have.property('timeout');

                wrapper.addOptions(testOptions1);

                should(wrapper.options).have.property('db_url',
                    'localhost');
                should(wrapper.options).have.property('db_port', 8080);
                should(wrapper.options).not.have.property('timeout');

                wrapper.addOptions(testOptions2);

                should(wrapper.options).have.property('db_url',
                    '127.0.0.0');
                should(wrapper.options).have.property('db_port', 8080);
                should(wrapper.options).have.property('timeout', 1000);
            });

            it('should throw an error if not in created status', function() {
                wrapper.status = 'otherThanCreated';
                should(function() {
                    wrapper.addOptions(testOptions1);
                }).throw(errors.ERR_MOD_010);
            });

        });

        describe('#addImports()', function() {

            const anotherApp = new App();
            const loggerModule = new Module('logger');
            const dbModule = new Module('db');
            const serverModule = new Module('server');

            const testImports1 = {
                logger: new ModuleWrapper(loggerModule, anotherApp),
                db: new ModuleWrapper(dbModule, anotherApp)
            };

            const testImports2 = {
                server: new ModuleWrapper(serverModule, anotherApp)
            };

            beforeEach('Clear options before each tests', function() {
                wrapper.imports = {};
                wrapper.status = 'created';
            });

            it('should exist in the instance', function() {
                should(wrapper.addImports).be.a.Function();
            });

            it('should handle empty argument', function() {
                should(function() {
                    wrapper.addImports();
                }).not.throw();
            });

            it('should handle null argument', function() {
                should(function() {
                    wrapper.addImports(null);
                }).not.throw();
            });

            it('should handle empty object argument', function() {
                should(function() {
                    wrapper.addImports({});
                }).not.throw();
            });

            it('should not accept non-object argument', function() {
                should(function() {
                    wrapper.addImports([]);
                }).throw(errors.ERR_MOD_009);
                should(function() {
                    wrapper.addImports(['new option']);
                }).throw(errors.ERR_MOD_009);
                should(function() {
                    wrapper.addImports('new option');
                }).throw(errors.ERR_MOD_009);
                should(function() {
                    wrapper.addImports(123);
                }).throw(errors.ERR_MOD_009);
                should(function() {
                    wrapper.addImports(true);
                }).throw(errors.ERR_MOD_009);
                should(function() {
                    wrapper.addImports(function() {});
                }).throw(errors.ERR_MOD_009);
            });

            it('should accept an object as argument', function() {
                should(function() {
                    wrapper.addImports(testImports1);
                }).not.throw();
            });

            it(
                'should not accept an object with non ModuleWrapper instances',
                function() {
                    const nonWrapperImport = {
                        logger: 'logger'
                    };
                    should(function() {
                        wrapper.addImports(nonWrapperImport);
                    }).throw(errors.ERR_MOD_012);
                });

            it('should merge argument object with existing imports', function() {
                should(wrapper.imports).not.have.property('logger');
                should(wrapper.imports).not.have.property('db');
                should(wrapper.imports).not.have.property('server');

                wrapper.addImports(testImports1);

                should(wrapper.imports).have.property('logger');
                should(wrapper.imports).have.property('db');
                should(wrapper.imports).not.have.property('server');

                wrapper.addImports(testImports2);

                should(wrapper.imports).have.property('logger');
                should(wrapper.imports).have.property('db');
                should(wrapper.imports).have.property('server');
            });

            it('should throw an error if not in created status', function() {
                wrapper.status = 'otherThanCreated';
                should(function() {
                    wrapper.addImports();
                }).throw(errors.ERR_MOD_011);
            });

        });

        describe('#setup()', function() {

            before('add spy', function() {

                testModule = new Module({
                    name: 'testModule',
                    version: '1.0.0',
                    module: {
                        dependencies: [],
                        options: {
                            db_url: 'localhost',
                            db_port: 8080
                        }
                    }
                });

                sinon.spy(testModule, 'setup');
                wrapper = new ModuleWrapper(testModule, app);

            });

            it('should exist in the instance', function() {
                should(wrapper.setup).be.a.Function();
            });

            it('should not be available in the wrapped module', function() {
                should(wrapper.module.setup).not.be.a.Function();
            });

            it('should not be available in the original module object',
                function() {
                    should(testModule.setup).not.be.a.Function();
                    should((new Module('anotherModule')).setup).be.a.Function();
                });

            it('should keep the initial function', function() {
                should(wrapper._initialFuncSetup).be.a.Function();
                // TODO check it's the same function as the initial
            });

            it('should execute the initial function', function(done) {
                wrapper.setup(function() {
                    should(wrapper._initialFuncSetup.calledOnce)
                        .be.true();
                    done();
                });
            });

            it('should inject the module wrapper properties as arguments',
                function(
                    done) {
                    wrapper.setup(function() {
                        should(wrapper._initialFuncSetup.alwaysCalledWith(
                            wrapper.app, wrapper.options,
                            wrapper.imports
                        )).be.true();
                        done();
                    });
                });

        });

        describe('#enable()', function() {

            before('add spy', function() {

                testModule = new Module({
                    name: 'testModule',
                    version: '1.0.0',
                    module: {
                        dependencies: [],
                        options: {
                            db_url: 'localhost',
                            db_port: 8080
                        }
                    }
                });

                sinon.spy(testModule, 'enable');
                wrapper = new ModuleWrapper(testModule, app);

            });

            it('should exist in the instance', function() {
                should(wrapper.enable).be.a.Function();
            });

            it('should not be available in the wrapped module', function() {
                should(wrapper.module.enable).not.be.a.Function();
            });

            it('should not be available in the original module object',
                function() {
                    should(testModule.enable).not.be.a.Function();
                    should((new Module('anotherModule')).enable).be.a.Function();
                });

            it('should keep the initial function', function() {
                should(wrapper._initialFuncEnable).be.a.Function();
                // TODO check it's the same function as the initial
            });

            it('should execute the initial function', function(done) {
                wrapper.enable(function() {
                    should(wrapper._initialFuncEnable.calledOnce)
                        .be.true();
                    done();
                });
            });

            it('should inject the module wrapper properties as arguments',
                function(
                    done) {
                    wrapper.enable(function() {
                        should(wrapper._initialFuncEnable.alwaysCalledWith(
                            wrapper.app, wrapper.options,
                            wrapper.imports
                        )).be.true();
                        done();
                    });
                });

        });

        describe('#disable()', function() {

            before('add spy', function() {

                testModule = new Module({
                    name: 'testModule',
                    version: '1.0.0',
                    module: {
                        dependencies: [],
                        options: {
                            db_url: 'localhost',
                            db_port: 8080
                        }
                    }
                });

                sinon.spy(testModule, 'disable');
                wrapper = new ModuleWrapper(testModule, app);

            });

            it('should exist in the instance', function() {
                should(wrapper.disable).be.a.Function();
            });

            it('should not be available in the wrapped module', function() {
                should(wrapper.module.disable).not.be.a.Function();
            });

            it('should not be available in the original module object',
                function() {
                    should(testModule.disable).not.be.a.Function();
                    should((new Module('anotherModule')).disable).be.a.Function();
                });

            it('should keep the initial function', function() {
                should(wrapper._initialFuncDisable).be.a.Function();
                // TODO check it's the same function as the initial
            });

            it('should execute the initial function', function(done) {
                wrapper.disable(function() {
                    should(wrapper._initialFuncDisable.calledOnce)
                        .be.true();
                    done();
                });
            });

            it('should inject the module wrapper properties as arguments',
                function(
                    done) {
                    wrapper.disable(function() {
                        should(wrapper._initialFuncDisable.alwaysCalledWith(
                            wrapper.app, wrapper.options,
                            wrapper.imports
                        )).be.true();
                        done();
                    });
                });

        });

        describe('#destroy()', function() {

            before('add spy', function() {

                testModule = new Module({
                    name: 'testModule',
                    version: '1.0.0',
                    module: {
                        dependencies: [],
                        options: {
                            db_url: 'localhost',
                            db_port: 8080
                        }
                    }
                });

                sinon.spy(testModule, 'destroy');
                wrapper = new ModuleWrapper(testModule, app);

            });

            it('should exist in the instance', function() {
                should(wrapper.destroy).be.a.Function();
            });

            it('should not be available in the wrapped module', function() {
                should(wrapper.module.destroy).not.be.a.Function();
            });

            it('should not be available in the original module object',
                function() {
                    should(testModule.destroy).not.be.a.Function();
                    should((new Module('anotherModule')).destroy).be.a.Function();
                });

            it('should keep the initial function', function() {
                should(wrapper._initialFuncDestroy).be.a.Function();
                // TODO check it's the same function as the initial
            });

            it('should execute the initial function', function(done) {
                wrapper.destroy(function() {
                    should(wrapper._initialFuncDestroy.calledOnce)
                        .be.true();
                    done();
                });
            });

            it('should inject the module wrapper properties as arguments',
                function(
                    done) {
                    wrapper.destroy(function() {
                        should(wrapper._initialFuncDestroy.alwaysCalledWith(
                            wrapper.app, wrapper.options,
                            wrapper.imports
                        )).be.true();
                        done();
                    });
                });

        });

        describe('#setupModule()', function() {

            beforeEach('reset status and set spy before each test', function() {

                testModule = new Module({
                    name: 'testModule',
                    version: '1.0.0',
                    module: {
                        dependencies: [],
                        options: {
                            db_url: 'localhost',
                            db_port: 8080
                        }
                    }
                });

                wrapper = new ModuleWrapper(testModule, app);
                sinon.spy(wrapper, 'setup');

            });

            it('should exist in the instance', function() {
                should(wrapper.setupModule).be.a.Function();
            });

            it('should first emit a setting_up event from the module', function(
                done) {
                wrapper.module.on(Module.events.SETTING_UP, function() {
                    done();
                });
                wrapper.setupModule(function() {});
            });

            it('should call #setup()', function(done) {
                wrapper.setupModule(function() {
                    should(wrapper.setup.called).be.true();
                    done();
                });
            });

            it('should change the status to "setup" if successful', function() {
                should(wrapper.status).be.exactly(Module.status.CREATED);
                wrapper.setupModule(function() {});
                should(wrapper.status).be.exactly(Module.status.SETUP);
            });

            it(
                'should change the status of the module to "setup" if successful',
                function() {
                    should(wrapper.module.status).be.exactly(Module.status.CREATED);
                    wrapper.setupModule(function() {});
                    should(wrapper.module.status).be.exactly(Module.status.SETUP);
                });

            it('should emit a setup event from the module if successful',
                function(done) {
                    wrapper.module.on(Module.events.SETUP, function() {
                        done();
                    });
                    wrapper.setupModule(function() {});
                });

            it('should execute the callback if successful', function(done) {
                wrapper.setupModule(done);
            });

            it('should pass the error to the callback', function(done) {
                let testErr = new Error('testErr');
                testModule = new Module('testModule');
                testModule.setup = function(app, options, imports,
                    setupDone) {
                    setupDone(testErr);
                };

                wrapper = new ModuleWrapper(testModule, new App(), {}, {});

                wrapper.setupModule(function(err) {
                    should(err).be.exactly(testErr);
                    done();
                });
            });

            it('should pass an error if not in created status', function(done) {
                wrapper.status = 'otherThanCreated';
                wrapper.setupModule(function(err) {
                    should(function() {
                        throw err;
                    }).throw(errors.ERR_MOD_015);
                    done();
                });
            });

        });

        describe('#enableModule()', function() {

            beforeEach('reset status and set spy before each test', function() {

                testModule = new Module({
                    name: 'testModule',
                    version: '1.0.0',
                    module: {
                        dependencies: [],
                        options: {
                            db_url: 'localhost',
                            db_port: 8080
                        }
                    }
                });

                wrapper = new ModuleWrapper(testModule, app);
                sinon.spy(wrapper, 'enable');

                wrapper.status = Module.status.SETUP;
                wrapper.module._changeStatus(Module.status.SETUP,
                    wrapper);

            });

            it('should exist in the instance', function() {
                should(wrapper.enableModule).be.a.Function();
            });

            it('should first emit a enabling event from the module', function(
                done) {
                wrapper.module.on(Module.events.ENABLING, function() {
                    done();
                });
                wrapper.enableModule(function() {});
            });

            it('should call #enable()', function(done) {
                wrapper.enableModule(function() {
                    should(wrapper.enable.called).be.true();
                    done();
                });
            });

            it('should change the status to "enabled" if successful', function() {
                should(wrapper.status).be.exactly(Module.status.SETUP);
                wrapper.enableModule(function() {});
                should(wrapper.status).be.exactly(Module.status.ENABLED);
            });

            it(
                'should change the status of the module to "enabled" if successful',
                function() {
                    should(wrapper.module.status).be.exactly(Module.status.SETUP);
                    wrapper.enableModule(function() {});
                    should(wrapper.module.status).be.exactly(Module.status.ENABLED);
                });

            it('should emit a enabled event from the module if successful',
                function(
                    done) {
                    wrapper.module.on(Module.events.ENABLED, function() {
                        done();
                    });
                    wrapper.enableModule(function() {});
                });

            it('should execute the callback if successful', function(done) {
                wrapper.enableModule(done);
            });

            it('should pass the error to the callback', function(done) {
                let testErr = new Error('testErr');
                testModule = new Module('testModule');
                testModule.enable = function(app, options, imports,
                    enableDone) {
                    enableDone(testErr);
                };

                wrapper = new ModuleWrapper(testModule, new App(), {}, {});

                wrapper.status = Module.status.SETUP;
                wrapper.module._changeStatus(Module.status.SETUP,
                    wrapper);

                wrapper.enableModule(function(err) {
                    should(err).be.exactly(testErr);
                    done();
                });
            });

            it('should pass an error if not in setup status', function(done) {
                wrapper.status = 'otherThanSetup';
                wrapper.enableModule(function(err) {
                    should(function() {
                        throw err;
                    }).throw(errors.ERR_MOD_016);
                    done();
                });
            });

        });

        describe('#disableModule()', function() {

            beforeEach('reset status and set spy before each test', function() {

                testModule = new Module({
                    name: 'testModule',
                    version: '1.0.0',
                    module: {
                        dependencies: [],
                        options: {
                            db_url: 'localhost',
                            db_port: 8080
                        }
                    }
                });

                wrapper = new ModuleWrapper(testModule, app);
                sinon.spy(wrapper, 'disable');

                wrapper.status = Module.status.ENABLED;
                wrapper.module._changeStatus(Module.status.ENABLED,
                    wrapper);

            });

            it('should exist in the instance', function() {
                should(wrapper.disableModule).be.a.Function();
            });

            it('should first emit a disabling event from the module', function(
                done) {
                wrapper.module.on(Module.events.DISABLING, function() {
                    done();
                });
                wrapper.disableModule(function() {});
            });

            it('should call #disable()', function(done) {
                wrapper.disableModule(function() {
                    should(wrapper.disable.called).be.true();
                    done();
                });
            });

            it('should change the status to "disabled" if successful', function() {
                should(wrapper.status).be.exactly(Module.status.ENABLED);
                wrapper.disableModule(function() {});
                should(wrapper.status).be.exactly(Module.status.DISABLED);
            });

            it(
                'should change the status of the module to "disabled" if successful',
                function() {
                    should(wrapper.module.status).be.exactly(Module.status.ENABLED);
                    wrapper.disableModule(function() {});
                    should(wrapper.module.status).be.exactly(Module.status.DISABLED);
                });

            it('should emit a disabled event from the module if successful',
                function(
                    done) {
                    wrapper.module.on(Module.events.DISABLED, function() {
                        done();
                    });
                    wrapper.disableModule(function() {});
                });

            it('should execute the callback if successful', function(done) {
                wrapper.disableModule(done);
            });

            it('should pass the error to the callback', function(done) {
                let testErr = new Error('testErr');
                testModule = new Module('testModule');
                testModule.disable = function(app, options, imports,
                    disableDone) {
                    disableDone(testErr);
                };

                wrapper = new ModuleWrapper(testModule, new App(), {}, {});

                wrapper.status = Module.status.ENABLED;
                wrapper.module._changeStatus(Module.status.ENABLED,
                    wrapper);

                wrapper.disableModule(function(err) {
                    should(err).be.exactly(testErr);
                    done();
                });
            });

            it('should pass an error if not in enabled status', function(done) {
                wrapper.status = 'otherThanEnabled';
                wrapper.disableModule(function(err) {
                    should(function() {
                        throw err;
                    }).throw(errors.ERR_MOD_017);
                    done();
                });
            });

        });

        describe('#destroyModule()', function() {

            beforeEach('reset status and set spy before each test', function() {

                testModule = new Module({
                    name: 'testModule',
                    version: '1.0.0',
                    module: {
                        dependencies: [],
                        options: {
                            db_url: 'localhost',
                            db_port: 8080
                        }
                    }
                });

                wrapper = new ModuleWrapper(testModule, app);
                sinon.spy(wrapper, 'destroy');

                wrapper.status = Module.status.DISABLED;
                wrapper.module._changeStatus(Module.status.DISABLED,
                    wrapper);

            });

            it('should exist in the instance', function() {
                should(wrapper.destroyModule).be.a.Function();
            });

            it('should first emit a destroying event from the module', function(
                done) {
                wrapper.module.on(Module.events.DESTROYING, function() {
                    done();
                });

                wrapper.destroyModule(function() {});
            });

            it('should call #destroy()', function(done) {
                wrapper.destroyModule(function() {
                    should(wrapper.destroy.called).be.true();
                    done();
                });
            });

            it('should change the status to "destroyed" if successful',
                function() {
                    should(wrapper.status).be.exactly(Module.status.DISABLED);
                    wrapper.destroyModule(function() {});
                    should(wrapper.status).be.exactly(Module.status.DESTROYED);
                });

            it(
                'should change the status of the module to "destroyed" if successful',
                function() {
                    should(wrapper.module.status).be.exactly(Module.status.DISABLED);
                    wrapper.destroyModule(function() {});
                    should(wrapper.module.status).be.exactly(Module.status.DESTROYED);
                });

            it('should emit a destroyed event from the module if successful',
                function(
                    done) {
                    wrapper.module.on(Module.events.DESTROYED, function() {
                        done();
                    });
                    wrapper.destroyModule(function() {});
                });

            it('should execute the callback if successful', function(done) {
                wrapper.destroyModule(done);
            });

            it('should pass the error to the callback', function(done) {
                let testErr = new Error('testErr');
                testModule = new Module('testModule');
                testModule.destroy = function(app, options, imports,
                    destroyDone) {
                    destroyDone(testErr);
                };

                wrapper = new ModuleWrapper(testModule, new App(), {}, {});

                wrapper.status = Module.status.DISABLED;
                wrapper.module._changeStatus(Module.status.DISABLED,
                    wrapper);

                wrapper.destroyModule(function(err) {
                    should(err).be.exactly(testErr);
                    done();
                });
            });

            it('should pass an error if not in disabled status', function(done) {
                wrapper.status = 'otherThanDisabled';
                wrapper.destroyModule(function(err) {
                    should(function() {
                        throw err;
                    }).throw(errors.ERR_MOD_018);
                    done();
                });
            });

        });

    });

};

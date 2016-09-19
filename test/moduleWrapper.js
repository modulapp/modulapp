const should = require('should');
const sinon = require('sinon');
const _ = require('lodash');
const errors = require('../errors.js');
const Module = require('../module.js');
const App = require('../app.js');

const ModuleWrapper = require('../moduleWrapper.js');

describe('ModuleWrapper', function() {
    "use strict";

    let wrapper;
    let testModule;
    let app;

    beforeEach('initialize wrapper', function() {

        testModule = new Module({
            name: 'testModule',
            version: '1.0.0',
            module: {
                dependencies: ['logger', 'db'],
                options: {
                    db_url: 'localhost',
                    db_port: 8080
                }
            }
        });

        app = new App();

        let logger = new ModuleWrapper(new Module('logger'), app);
        let db = new ModuleWrapper(new Module('db'), app);

        let imports = {
            logger, db
        };

        let otherOptions = {
            timeout: 1000
        };

        wrapper = new ModuleWrapper(testModule, app, otherOptions, imports);
    });

    describe('Constructor()', function() {

        describe('with illegal arguments', function() {

            it('should throw an error with no argument', function() {
                should(function() {
                    wrapper = new ModuleWrapper();
                }).throw(errors.ERR_MOD_006);
            });

            it('should throw an error with a null as 1st argument',
                function() {
                    should(function() {
                        wrapper = new ModuleWrapper(null, app);
                    }).throw(errors.ERR_MOD_006);
                });

            it('should throw an error with a null as 2nd argument',
                function() {
                    should(function() {
                        wrapper = new ModuleWrapper(testModule,
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
                        wrapper = new ModuleWrapper(notModule,
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
                        wrapper = new ModuleWrapper(testModule,
                            notApp);
                    }).throw(errors.ERR_MOD_008);
                });

        });

        describe('with minimum arguments', function() {

            beforeEach('initialize wrapper', function() {

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

            });

            it('should return an instance of ModuleWrapper', function() {
                should(wrapper).be.an.instanceOf(ModuleWrapper);
            });

            it('should have an id property', function() {
                should(wrapper).have.property('id', 'testModule');
            });

            it('should have a status property ("created")', function() {
                should(wrapper).have.property('status', 'created');
            });

            it('should have a version property', function() {
                should(wrapper).have.property('version', '1.0.0');
            });

            it('should have a module property', function() {
                should(wrapper.module).be.an.instanceOf(Module);
            });

            it('should have an app property', function() {
                should(wrapper.app).be.an.instanceOf(App);
            });

            it('should have an empty object imports property', function() {
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
                should(wrapper).have.property('dependencies');
            });

        });

        describe('with optional arguments', function() {

            it('should return an instance of ModuleWrapper', function() {
                should(wrapper).be.an.instanceOf(ModuleWrapper);
            });

            it('should have an id property', function() {
                (wrapper).should.have.property('id', 'testModule');
            });

            it('should have a status property ("created")', function() {
                (wrapper).should.have.property('status', 'created');
            });

            it('should have a version property', function() {
                (wrapper).should.have.property('version', '1.0.0');
            });

            it('should have a module property', function() {
                should(wrapper.module).be.an.instanceOf(Module);
            });

            it('should have an app property', function() {
                should(wrapper.app).be.an.instanceOf(App);
            });

            it('should have an empty object imports property', function() {
                (wrapper.imports).should.have.properties(['db',
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
                (wrapper).should.have.property('dependencies');
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
                wrapper.addImports(testImports1); // TODO
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

        it('should exist in the instance', function() {
            should(wrapper.setup).be.a.Function();
        });

        it('should not be available in the wrapped module', function() {
            should(wrapper.module.setup).not.be.a.Function();
        });

        it('should not be available in the original module object', function() {
            should(testModule.setup).not.be.a.Function();
            should((new Module('anotherModule')).setup).be.a.Function();
        });

    });

    describe('#enable()', function() {

        it('should exist in the instance', function() {
            should(wrapper.enable).be.a.Function();
        });

        it('should not be available in the wrapped module', function() {
            should(wrapper.module.enable).not.be.a.Function();
        });

        it('should not be available in the original module object', function() {
            should(testModule.enable).not.be.a.Function();
            should((new Module('anotherModule')).enable).be.a.Function();
        });

    });

    describe('#disable()', function() {

        it('should exist in the instance', function() {
            should(wrapper.disable).be.a.Function();
        });

        it('should not be available in the wrapped module', function() {
            should(wrapper.module.disable).not.be.a.Function();
        });

        it('should not be available in the original module object', function() {
            should(testModule.disable).not.be.a.Function();
            should((new Module('anotherModule')).disable).be.a.Function();
        });

    });

    describe('#destroy()', function() {

        it('should exist in the instance', function() {
            should(wrapper.destroy).be.a.Function();
        });

        it('should not be available in the wrapped module', function() {
            should(wrapper.module.destroy).not.be.a.Function();
        });

        it('should not be available in the original module object', function() {
            should(testModule.destroy).not.be.a.Function();
            should((new Module('anotherModule')).destroy).be.a.Function();
        });

    });

    describe('#setupModule()', function() {

        it('should exist in the instance', function() {
            should(wrapper.setupModule).be.a.Function();
        });

    });

    describe('#enableModule()', function() {

        it('should exist in the instance', function() {
            should(wrapper.enableModule).be.a.Function();
        });

    });

    describe('#disableModule()', function() {

        it('should exist in the instance', function() {
            should(wrapper.disableModule).be.a.Function();
        });

    });

    describe('#destroyModule()', function() {

        it('should exist in the instance', function() {
            should(wrapper.destroyModule).be.a.Function();
        });

    });

});

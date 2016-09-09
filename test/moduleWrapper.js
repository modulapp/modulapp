const should = require('should');
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
                (function() {
                    wrapper = new ModuleWrapper();
                }).should.throw(errors.ERR_MOD_006);
            });

            it('should throw an error with a null as 1st argument',
                function() {
                    (function() {
                        wrapper = new ModuleWrapper(null, app);
                    }).should.throw(errors.ERR_MOD_006);
                });

            it('should throw an error with a null as 2nd argument',
                function() {
                    (function() {
                        wrapper = new ModuleWrapper(testModule,
                            null);
                    }).should.throw(errors.ERR_MOD_006);
                });

            it(
                'should throw an error if 1st argument is not a Module instance',
                function() {
                    (function() {
                        let notModule = {
                            id: 'a'
                        };
                        wrapper = new ModuleWrapper(notModule, app);
                    }).should.throw(errors.ERR_MOD_007);
                });

            it(
                'should throw an error if 2nd argument is not an App instance',
                function() {
                    (function() {
                        let notApp = {
                            id: 'a'
                        };
                        wrapper = new ModuleWrapper(testModule,
                            notApp);
                    }).should.throw(errors.ERR_MOD_008);
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
                (wrapper.imports).should.be.empty();
            });

            it('should have an options property', function() {
                (wrapper.options).should.have.properties([
                    'db_url', 'db_port'
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

            describe('wrapped module', function() {

                it('should still have an id property', function() {
                    (wrapper.module).should.have.property(
                        'id', 'testModule');
                });

                it('should still have a status property', function() {
                    (wrapper.module).should.have.property(
                        'status', 'created');
                });

                it('should still have a version property', function() {
                    (wrapper.module).should.have.property(
                        'version', '1.0.0');
                });

                it('should not have a _options property', function() {
                    (wrapper.module).should.not.have.property(
                        '_options');
                });

                it('should not have a _dependencies property',
                    function() {
                        (wrapper.module).should.not.have.property(
                            '_dependencies');
                    });

                it('should not have a _package property', function() {
                    (wrapper.module).should.not.have.property(
                        '_package');
                });

            });

            describe('original object of wrapped module', function() {

                it('should still have an id property', function() {
                    (testModule).should.have.property(
                        'id', 'testModule');
                });

                it('should still have a status property', function() {
                    (testModule).should.have.property(
                        'status', 'created');
                });

                it('should still have a version property', function() {
                    (testModule).should.have.property(
                        'version', '1.0.0');
                });

                it('should not have a _options property', function() {
                    (testModule).should.not.have.property(
                        '_options');
                });

                it('should not have a _dependencies property',
                    function() {
                        (testModule).should.not.have.property(
                            '_dependencies');
                    });

                it('should not have a _package property', function() {
                    (testModule).should.not.have.property(
                        '_package');
                });
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

            describe('wrapped module', function() {

                it('should still have an id property', function() {
                    (wrapper.module).should.have.property(
                        'id', 'testModule');
                });

                it('should still have a status property', function() {
                    (wrapper.module).should.have.property(
                        'status', 'created');
                });

                it('should still have a version property', function() {
                    (wrapper.module).should.have.property(
                        'version', '1.0.0');
                });

                it('should not have a _options property', function() {
                    (wrapper.module).should.not.have.property(
                        '_options');
                });

                it('should not have a _dependencies property',
                    function() {
                        (wrapper.module).should.not.have.property(
                            '_dependencies');
                    });

                it('should not have a _package property', function() {
                    (wrapper.module).should.not.have.property(
                        '_package');
                });

            });

            describe('original object of wrapped module', function() {

                it('should still have an id property', function() {
                    (testModule).should.have.property(
                        'id', 'testModule');
                });

                it('should still have a status property', function() {
                    (testModule).should.have.property(
                        'status', 'created');
                });

                it('should still have a version property', function() {
                    (testModule).should.have.property(
                        'version', '1.0.0');
                });

                it('should not have a _options property', function() {
                    (testModule).should.not.have.property(
                        '_options');
                });

                it('should not have a _dependencies property',
                    function() {
                        (testModule).should.not.have.property(
                            '_dependencies');
                    });

                it('should not have a _package property', function() {
                    (testModule).should.not.have.property(
                        '_package');
                });
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
            (wrapper.addOptions).should.be.a.Function();
        });

        it('should handle empty argument', function() {
            (function() {
                wrapper.addOptions();
            }).should.not.throw();
        });

        it('should handle null argument', function() {
            (function() {
                wrapper.addOptions(null);
            }).should.not.throw();
        });

        it('should handle empty object argument', function() {
            (function() {
                wrapper.addOptions({});
            }).should.not.throw();
        });

        it('should not accept non-object argument', function() {
            (function() {
                wrapper.addOptions([]);
            }).should.throw(errors.ERR_MOD_004);
            (function() {
                wrapper.addOptions(['new option']);
            }).should.throw(errors.ERR_MOD_004);
            (function() {
                wrapper.addOptions('new option');
            }).should.throw(errors.ERR_MOD_004);
            (function() {
                wrapper.addOptions(123);
            }).should.throw(errors.ERR_MOD_004);
            (function() {
                wrapper.addOptions(true);
            }).should.throw(errors.ERR_MOD_004);
            (function() {
                wrapper.addOptions(function() {});
            }).should.throw(errors.ERR_MOD_004);
        });

        it('should accept an object argument', function() {
            (function() {
                wrapper.addOptions(testOptions1);
            }).should.not.throw();
        });

        it('should merge argument object with existing options', function() {
            (wrapper.options).should.not.have.property('db_url');
            (wrapper.options).should.not.have.property('db_port');
            (wrapper.options).should.not.have.property('timeout');

            wrapper.addOptions(testOptions1);

            (wrapper.options).should.have.property('db_url',
                'localhost');
            (wrapper.options).should.have.property('db_port', 8080);
            (wrapper.options).should.not.have.property('timeout');

            wrapper.addOptions(testOptions2);

            (wrapper.options).should.have.property('db_url',
                '127.0.0.0');
            (wrapper.options).should.have.property('db_port', 8080);
            (wrapper.options).should.have.property('timeout', 1000);
        });

        it('should throw an error if not in created status', function() {
            wrapper.status = 'otherThanCreated';
            (function() {
                wrapper.addOptions(testOptions1);
            }).should.throw(errors.ERR_MOD_010);
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
        }

        beforeEach('Clear options before each tests', function() {
            wrapper.imports = {};
            wrapper.status = 'created';
        });

        it('should exist in the instance', function() {
            (wrapper.addImports).should.be.a.Function();
        });

        it('should handle empty argument', function() {
            (function() {
                wrapper.addImports();
            }).should.not.throw();
        });

        it('should handle null argument', function() {
            (function() {
                wrapper.addImports(null);
            }).should.not.throw();
        });

        it('should handle empty object argument', function() {
            (function() {
                wrapper.addImports({});
            }).should.not.throw();
        });

        it('should not accept non-object argument', function() {
            (function() {
                wrapper.addImports([]);
            }).should.throw(errors.ERR_MOD_009);
            (function() {
                wrapper.addImports(['new option']);
            }).should.throw(errors.ERR_MOD_009);
            (function() {
                wrapper.addImports('new option');
            }).should.throw(errors.ERR_MOD_009);
            (function() {
                wrapper.addImports(123);
            }).should.throw(errors.ERR_MOD_009);
            (function() {
                wrapper.addImports(true);
            }).should.throw(errors.ERR_MOD_009);
            (function() {
                wrapper.addImports(function() {});
            }).should.throw(errors.ERR_MOD_009);
        });

        it('should accept an object as argument', function() {
            (function() {
                wrapper.addImports(testImports1); // TODO
            }).should.not.throw();
        });

        it(
            'should not accept an object with non ModuleWrapper instances',
            function() {
                const nonWrapperImport = {
                    logger: 'logger'
                };
                (function() {
                    wrapper.addImports(nonWrapperImport);
                }).should.throw(errors.ERR_MOD_012);
            });

        it('should merge argument object with existing imports', function() {
            (wrapper.imports).should.not.have.property('logger');
            (wrapper.imports).should.not.have.property('db');
            (wrapper.imports).should.not.have.property('server');

            wrapper.addImports(testImports1);

            (wrapper.imports).should.have.property('logger');
            (wrapper.imports).should.have.property('db');
            (wrapper.imports).should.not.have.property('server');

            wrapper.addImports(testImports2);

            (wrapper.imports).should.have.property('logger');
            (wrapper.imports).should.have.property('db');
            (wrapper.imports).should.have.property('server');
        });

        it('should throw an error if not in created status', function() {
            wrapper.status = 'otherThanCreated';
            (function() {
                wrapper.addImports();
            }).should.throw(errors.ERR_MOD_011);
        });

    });

    describe('#setup()', function() {

        it('should exist in the instance', function() {
            (wrapper.setup).should.be.a.Function();
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
            (wrapper.enable).should.be.a.Function();
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
            (wrapper.disable).should.be.a.Function();
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
            (wrapper.destroy).should.be.a.Function();
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
            (wrapper.setupModule).should.be.a.Function();
        });

    });

    describe('#enableModule()', function() {

        it('should exist in the instance', function() {
            (wrapper.enableModule).should.be.a.Function();
        });

    });

    describe('#disableModule()', function() {

        it('should exist in the instance', function() {
            (wrapper.disableModule).should.be.a.Function();
        });

    });

    describe('#destroyModule()', function() {

        it('should exist in the instance', function() {
            (wrapper.destroyModule).should.be.a.Function();
        });

    });

});

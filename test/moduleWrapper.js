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

        let logger = new Module('logger');
        let db = new Module('db');

        let imports = {
            logger, db
        };

        let otherOptions = {
            timeout: 1000
        };

        app = new App();

        wrapper = new ModuleWrapper(testModule, app, imports, otherOptions);
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

                it('should still have an id property');

                it('should still have a version property');

                it('should still have a status property');

                it('should not have a _options property');

                it('should not have a _dependencies property');

                it('should not have a _package property');

            });

            describe('original object of wrapped module', function() {

                it('should still have an id property');

                it('should still have a version property');

                it('should still have a status property');

                it('should not have a _options property');

                it('should not have a _dependencies property');

                it('should not have a _package property');
            });

        });

        describe('with optional arguments', function() {

            it('should return an instance of ModuleWrapper', function() {
                should(wrapper).be.an.instanceOf(ModuleWrapper);
            });

        });

    });

    describe('#setup()', function() {

    });

    describe('#enable()', function() {

    });

    describe('#disable()', function() {

    });

    describe('#destroy()', function() {

    });

    describe('#setupModule()', function() {

    });

    describe('#enableModule()', function() {

    });

    describe('#disableModule()', function() {

    });

    describe('#destroyModule()', function() {

    });

});

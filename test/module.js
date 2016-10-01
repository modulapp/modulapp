const should = require('should');
const _ = require('lodash');
const errors = require('../errors');

const Module = require('../module');

describe('Module', function() {
    "use strict";

    let testModule;
    let testWrapper = {
        module: new Module("test")
    };

    beforeEach('initialize testModule', function() {
        testModule = new Module('myModule');
    });

    describe('static getter events', function() {

        it('should be available on Class def', function() {
            should.exist(Module.events);
        });

        it('should not be available on Class instance', function() {
            should.not.exist(testModule.events);
        });

        it('should return the list of events', function() {
            should(Module.events).be.exactly(require('../events.json').module);
        });

        it('should not be overridable', function() {
            should(function() {
                Module.events = {};
            }).throw();
        });

    });

    describe('static getter status', function() {

        it('should be available on Class def', function() {
            should.exist(Module.status);
        });

        it('should return the list of status', function() {
            should(Module.status).be.exactly(require('../status.json').module);
        });

        it('should not return the list of status on Class instance', function() {
            should(testModule.status).not.be.exactly(require(
                '../status.json').module);
        });

        it('should not be overridable', function() {
            should(function() {
                Module.status = {};
            }).throw();
        });

    });

    describe('constructor()', function() {

        describe('with illegal argument', function() {

            it('should throw an error with no argument', function() {
                should(function() {
                    testModule = new Module();
                }).throw(errors.ERR_MOD_001);
            });

            it('should throw an error with null argument', function() {
                should(function() {
                    testModule = new Module(null);
                }).throw(errors.ERR_MOD_001);
            });

            it('should throw an error with an empty String (\'\') argument',
                function() {
                    should(function() {
                        testModule = new Module('');
                    }).throw(errors.ERR_MOD_001);
                });

        });

        describe('with a string argument', function() {

            it('should return an instance of Module', function() {
                should(testModule).be.an.instanceOf(Module);
            });

            it('should have an id', function() {
                should(testModule.id).be.exactly('myModule');
            });

            it('should have a status', function() {
                should(testModule.status).be.exactly(Module.status.CREATED);
            });

            it('should have an undefined version', function() {
                should(testModule.version).be.Undefined();
            });

            it('should have no option', function() {
                should(testModule.options).be.empty();
            });

            it('should have no dependency',
                function() {
                    should(testModule.dependencies).be.empty();
                });

            it('should have no package information', function() {
                should(testModule.package).be.Null();
            });

            describe('if another argument options', function() {

                beforeEach('initialize testModule', function() {
                    testModule = new Module('myModule', {
                        timeout: 1000
                    });
                });

                it(
                    'should have corresponding options',
                    function() {
                        should(testModule.options.timeout).be.exactly(
                            1000);
                    });

            });

        });

        describe('with the package.json object (light)', function() {

            beforeEach('initialize testModule', function() {
                testModule = new Module({
                    name: 'myModule',
                    version: '1.0.0'
                });
            });

            it('should return an instance of Module', function() {
                should(testModule).be.an.instanceOf(Module);
            });

            it('should have an id', function() {
                should(testModule.id).be.exactly('myModule');
            });

            it('should have a status', function() {
                should(testModule.status).be.exactly(Module.status.CREATED);
            });

            it('should have a version', function() {
                should(testModule.version).be.exactly('1.0.0');
            });

            it('should have no option',
                function() {
                    should(testModule.options).be.empty();
                });

            it('should have no dependency',
                function() {
                    should(testModule.dependencies).be.empty();
                });

            it('should have package information', function() {
                should(testModule.package.name).be.exactly(
                    'myModule');
                should(testModule.package.version).be.exactly(
                    '1.0.0');
            });

            describe('if another argument options', function() {

                beforeEach('initialize testModule', function() {
                    testModule = new Module({
                        name: 'myModule',
                        version: '1.0.0'
                    }, {
                        timeout: 1000
                    });
                });

                it(
                    'should have corresponding options',
                    function() {
                        should(testModule.options.timeout).be.exactly(
                            1000);
                    });

            });

        });

        describe('with the package.json object (full)', function() {

            beforeEach('initialize testModule', function() {
                testModule = new Module({
                    name: 'myModule',
                    version: '1.0.0',
                    module: {
                        dependencies: ['logger', 'db'],
                        options: {
                            db_url: 'localhost',
                            db_port: 8080
                        }
                    }
                });
            });

            it('should return an instance of Module', function() {
                should(testModule).be.an.instanceOf(Module);
            });

            it('should have an id', function() {
                should(testModule.id).be.exactly('myModule');
            });

            it('should have a status', function() {
                should(testModule.status).be.exactly(Module.status.CREATED);
            });

            it('should have a version', function() {
                should(testModule.version).be.exactly('1.0.0');
            });

            it('should have appropriate options',
                function() {
                    should(testModule.options.db_url).be.exactly(
                        'localhost');
                    should(testModule.options.db_port).be.exactly(
                        8080);
                });

            it('should have appropriate dependencies',
                function() {
                    should(testModule.dependencies).have.length(2);
                });

            it('should have package information', function() {
                should(testModule.package.name).be.exactly(
                    'myModule');
                should(testModule.package.version).be.exactly(
                    '1.0.0');
                should(testModule.package.module).have.property(
                    'dependencies');
                should(testModule.package.module).have.property(
                    'options');
            });

            describe('if another argument options', function() {

                beforeEach('initialize testModule', function() {
                    testModule = new Module({
                        name: 'myModule',
                        version: '1.0.0',
                        module: {
                            dependencies: ['logger',
                                'db'
                            ],
                            options: {
                                db_url: 'localhost',
                                db_port: 8080
                            }
                        }
                    }, {
                        timeout: 1000
                    });
                });

                it(
                    'should have corresponding options',
                    function() {
                        should(testModule.options.db_url).be.exactly(
                            'localhost');
                        should(testModule.options.db_port).be.exactly(
                            8080);
                        should(testModule.options.timeout).be.exactly(
                            1000);
                    });

            });

        });

    });

    describe('setter options', function() {

        const testOptions1 = {
            db_url: 'localhost',
            db_port: 8080
        };

        const testOptions2 = {
            db_url: '127.0.0.0',
            timeout: 1000
        };

        beforeEach('Clear options before each tests', function() {
            testModule = new Module('myModule');
        });

        it('should handle empty value', function() {
            should(function() {
                testModule.options = undefined;
            }).not.throw();
            should(testModule.options).be.an.Object();
            should(testModule.options).be.empty();
        });

        it('should handle null value', function() {
            should(function() {
                testModule.options = null;
            }).not.throw();
            should(testModule.options).be.an.Object();
            should(testModule.options).be.empty();
        });

        it('should handle empty object', function() {
            should(function() {
                testModule.options = {};
            }).not.throw();
            should(testModule.options).be.an.Object();
            should(testModule.options).be.empty();
        });

        it('should not accept non-object value', function() {
            should(function() {
                testModule.options = [];
            }).throw(errors.ERR_MOD_004);
            should(function() {
                testModule.options = ['new option'];
            }).throw(errors.ERR_MOD_004);
            should(function() {
                testModule.options = 'new option';
            }).throw(errors.ERR_MOD_004);
            should(function() {
                testModule.options = 123;
            }).throw(errors.ERR_MOD_004);
            should(function() {
                testModule.options = true;
            }).throw(errors.ERR_MOD_004);
            should(function() {
                testModule.options = function() {};
            }).throw(errors.ERR_MOD_004);
        });

        it('should accept an object value', function() {
            should(function() {
                testModule.options = testOptions1;
            }).not.throw();
        });

        it('should replace existing options', function() {
            should(testModule.options.db_url).be.Undefined();
            should(testModule.options.db_port).be.Undefined();
            should(testModule.options.timeout).be.Undefined();

            testModule.options = testOptions1;

            should(testModule.options.db_url).be.exactly('localhost');
            should(testModule.options.db_port).be.exactly(8080);
            should(testModule.options.timeout).be.Undefined();

            testModule.options = testOptions2;

            should(testModule.options.db_url).be.exactly('127.0.0.0');
            should(testModule.options.db_port).be.Undefined();
            should(testModule.options.timeout).be.exactly(1000);
        });

        it('should throw an error if not in created status', function() {
            testModule._changeStatus(Module.status.ENABLED, testWrapper);
            should(function() {
                testModule.options = testOptions1;
            }).throw(errors.ERR_MOD_002);
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
            testModule.options = {};
            testModule._changeStatus(Module.status.CREATED, testWrapper);
        });

        it('should exist in the instance', function() {
            should(testModule.addOptions).be.a.Function();
        });

        it('should handle empty argument', function() {
            should(function() {
                testModule.addOptions();
            }).not.throw();
        });

        it('should handle null argument', function() {
            should(function() {
                testModule.addOptions(null);
            }).not.throw();
        });

        it('should handle empty object argument', function() {
            should(function() {
                testModule.addOptions({});
            }).not.throw();
        });

        it('should not accept non-object argument', function() {
            should(function() {
                testModule.addOptions([]);
            }).throw(errors.ERR_MOD_004);
            should(function() {
                testModule.addOptions(['new option']);
            }).throw(errors.ERR_MOD_004);
            should(function() {
                testModule.addOptions('new option');
            }).throw(errors.ERR_MOD_004);
            should(function() {
                testModule.addOptions(123);
            }).throw(errors.ERR_MOD_004);
            should(function() {
                testModule.addOptions(true);
            }).throw(errors.ERR_MOD_004);
            should(function() {
                testModule.addOptions(function() {});
            }).throw(errors.ERR_MOD_004);
        });

        it('should accept an object argument', function() {
            should(function() {
                testModule.addOptions(testOptions1);
            }).not.throw();
        });

        it('should merge argument object with existing options', function() {
            should(testModule.options.db_url).be.Undefined();
            should(testModule.options.db_port).be.Undefined();
            should(testModule.options.timeout).be.Undefined();

            testModule.addOptions(testOptions1);

            should(testModule.options.db_url).be.exactly('localhost');
            should(testModule.options.db_port).be.exactly(8080);
            should(testModule.options.timeout).be.Undefined();

            testModule.addOptions(testOptions2);

            should(testModule.options.db_url).be.exactly('127.0.0.0');
            should(testModule.options.db_port).be.exactly(8080);
            should(testModule.options.timeout).be.exactly(1000);
        });

        it('should throw an error if not in created status', function() {
            testModule._changeStatus(Module.status.ENABLED, testWrapper);
            should(function() {
                testModule.addOptions(testOptions1);
            }).throw(errors.ERR_MOD_002);
        });

    });

    describe('setter dependencies', function() {

        it('should handle empty value', function() {
            should(function() {
                testModule.dependencies = undefined;
            }).not.throw();
            should(testModule.dependencies).be.an.Array();
            should(testModule.dependencies).be.empty();
        });

        it('should handle null value', function() {
            should(function() {
                testModule.dependencies = null;
            }).not.throw();
            should(testModule.dependencies).be.an.Array();
            should(testModule.dependencies).be.empty();
        });

        it('should handle empty array value', function() {
            should(function() {
                testModule.dependencies = [];
            }).not.throw();
            should(testModule.dependencies).be.an.Array();
            should(testModule.dependencies).be.empty();
        });

        it('should accept a string argument', function() {
            should(function() {
                testModule.dependencies = 'logger';
            }).not.throw();
        });

        it('should accept an array of string value', function() {
            should(function() {
                testModule.dependencies = ['logger'];
            }).not.throw();
            should(function() {
                testModule.dependencies = ['db', 'server'];
            }).not.throw();
        });

        it('should not accept a non-string value', function() {
            should(function() {
                testModule.dependencies = 123;
            }).throw(errors.ERR_MOD_005);
            should(function() {
                testModule.dependencies = {
                    a: 'a'
                };
            }).throw(errors.ERR_MOD_005);
            should(function() {
                testModule.dependencies = true;
            }).throw(errors.ERR_MOD_005);
            should(function() {
                testModule.dependencies = function() {};
            }).throw(errors.ERR_MOD_005);
        });

        it('should not accept an array of non-string value', function() {
            const nonStringArray = [123, 456];
            const mixArray = ['a', 123];
            should(function() {
                testModule.dependencies = nonStringArray;
            }).throw(errors.ERR_MOD_005);
            should(function() {
                testModule.dependencies = mixArray;
            }).throw(errors.ERR_MOD_005);
        });

        describe('replace existing dependencies', function() {

            beforeEach('Clear options before each tests', function() {
                testModule = new Module('myModule');
            });

            it('should handle single string argument', function() {
                should(testModule.dependencies).be.empty();

                testModule.dependencies = 'db';
                should(testModule.dependencies).be.an.Array();
                should(testModule.dependencies).containDeep(
                    ['db']);
                should(testModule.dependencies).have.length(1);
            });

            it('should handle a single array of string argument', function() {
                should(testModule.dependencies).be.empty();

                testModule.dependencies = ['db', 'server'];

                should(testModule.dependencies).be.an.Array();
                should(testModule.dependencies).containDeep(
                    ['db', 'server']);
                should(testModule.dependencies).not.containDeep(
                    ['logger']);
                should(testModule.dependencies).have.length(2);

                testModule.dependencies = ['logger', 'server'];

                should(testModule.dependencies).be.an.Array();
                should(testModule.dependencies).containDeep(
                    ['logger', 'server']);
                should(testModule.dependencies).not.containDeep(
                    ['db']);
                should(testModule.dependencies).have.length(2);
            });

        });

        it('should remove duplicates', function() {
            testModule.dependencies = ['logger', 'db',
                'db', 'server', 'server'
            ];

            let nbDep = testModule.dependencies.length;
            let nbDepAfterUniq = _.uniq(testModule.dependencies).length;
            should
                .equal(nbDepAfterUniq, nbDep,
                    'The dependencies contains exact duplicates');
        });

        it('should throw an error if not in created status', function() {
            testModule._changeStatus(Module.status.ENABLED, testWrapper);
            should(function() {
                testModule.dependencies = 'db';
            }).throw(errors.ERR_MOD_003);
        });

    });

    describe('#addDependencies()', function() {

        beforeEach('Clear dependencies before each tests', function() {
            testModule.dependencies = [];
            testModule._changeStatus(Module.status.CREATED, testWrapper);
        });

        it('should exist in the instance', function() {
            should(testModule.addDependencies).be.a.Function();
        });

        it('should handle empty argument', function() {
            should(function() {
                testModule.addDependencies();
            }).not.throw();
        });

        it('should handle null argument', function() {
            should(function() {
                testModule.addDependencies(null);
            }).not.throw();
        });

        it('should handle empty array argument', function() {
            should(function() {
                testModule.addDependencies([]);
            }).not.throw();
        });

        it('should accept a string argument', function() {
            should(function() {
                testModule.addDependencies('logger');
            }).not.throw();
            should(function() {
                testModule.addDependencies('db');
            }).not.throw();
        });

        it('should accept an array of string argument', function() {
            should(function() {
                testModule.addDependencies(['logger']);
            }).not.throw();
            should(function() {
                testModule.addDependencies(['db', 'server']);
            }).not.throw();
        });

        it('should accept multiple string arguments', function() {
            should(function() {
                testModule.addDependencies('logger',
                    'db', 'server');
            }).not.throw();
        });

        it('should accept a mix of multiple string and array of string arguments',
            function() {
                should(function() {
                    testModule.addDependencies('logger', ['logger'],
                        'db', [
                            'db', 'server'
                        ]);
                }).not.throw();
            });

        it('should not accept a non-string argument', function() {
            should(function() {
                testModule.addDependencies(123);
            }).throw(errors.ERR_MOD_005);
            should(function() {
                testModule.addDependencies('logger', 123);
            }).throw(errors.ERR_MOD_005);
        });

        it('should not accept an array of non-string argument', function() {
            const stringArray = ['a', 'b'];
            const nonStringArray = [123, 456];
            const mixArray = ['a', 123];
            should(function() {
                testModule.addDependencies(nonStringArray);
            }).throw(errors.ERR_MOD_005);
            should(function() {
                testModule.addDependencies('logger', 123);
            }).throw(errors.ERR_MOD_005);
            should(function() {
                testModule.addDependencies(mixArray);
            }).throw(errors.ERR_MOD_005);
            should(function() {
                testModule.addDependencies(stringArray, mixArray);
            }).throw(errors.ERR_MOD_005);
        });

        describe('merge arguments with existing dependencies', function() {

            beforeEach('initialize dependencies with [\'logger\']',
                function() {
                    testModule.dependencies = ['logger'];
                });

            it('should handle single string argument', function() {
                testModule.addDependencies('db');

                should(testModule.dependencies).containDeep(
                    ['logger', 'db']);
                should(testModule.dependencies).have.length(2);
            });

            it('should handle multiple string arguments', function() {
                testModule.addDependencies('db', 'server', 'utils');

                should(testModule.dependencies).containDeep(
                    ['logger', 'db', 'server', 'utils']);
                should(testModule.dependencies).have.length(4);
            });

            it('should handle a single array of string argument', function() {
                testModule.addDependencies(['db', 'server']);

                should(testModule.dependencies).containDeep(
                    ['logger', 'db', 'server']);
                should(testModule.dependencies).have.length(3);
            });

            it('should handle multiple arrays of string arguments',
                function() {
                    testModule.addDependencies(['db', 'server'], [
                        'utils', 'logger'
                    ]);

                    should(testModule.dependencies).containDeep(
                        ['logger', 'db', 'server', 'utils']);
                    should(testModule.dependencies).have.length(4);
                });

            it('should handle a mix of string and array of string argument',
                function() {
                    testModule.addDependencies('db', ['server'],
                        'utils', ['socket', 'server']);

                    should(testModule.dependencies).containDeep(
                        ['logger', 'db', 'server', 'utils',
                            'socket'
                        ]);
                    should(testModule.dependencies).have.length(5);
                });

        });

        it('should remove duplicates', function() {
            testModule.addDependencies('logger', ['db'],
                'db', ['server', 'server']);

            let nbDep = testModule.dependencies.length;
            let nbDepAfterUniq = _.uniq(testModule.dependencies).length;
            should.equal(nbDepAfterUniq, nbDep,
                'The dependencies contains exact duplicates');
        });

        it('should throw an error if not in created status', function() {
            testModule._changeStatus(Module.status.ENABLED, testWrapper);
            should(function() {
                testModule.addDependencies(['db', 'server']);
            }).throw(errors.ERR_MOD_003);
        });

    });

    describe('#_changeStatus()', function() {

        beforeEach('initialize testModule', function() {
            testModule = new Module('myModule');
        });

        it('should exist in the instance', function() {
            should(testModule._changeStatus).be.a.Function();
        });

        it('should be used only from a ModuleWrapper instance', function() {
            should(function() {
                testModule._changeStatus(Module.status.SETUP);
            }).throw(errors.ERR_MOD_014);
            should(function() {
                testModule._changeStatus(Module.status.ENABLED,
                    testWrapper);
            }).not.throw();
        });

        it('should only accept a string from the predefined list', function() {
            should(function() {
                testModule._changeStatus('notACorrectStatus',
                    testWrapper);
            }).throw(errors.ERR_MOD_013);
            should(function() {
                testModule._changeStatus(Module.status.SETUP,
                    testWrapper);
            }).not.throw();
        });

        it('should update the status', function() {
            should(testModule.status).be.exactly(Module.status.CREATED);
            testModule._changeStatus(Module.status.SETUP, testWrapper);
            should(testModule.status).be.exactly(Module.status.SETUP);
            testModule._changeStatus(Module.status.ENABLED, testWrapper);
            should(testModule.status).be.exactly(Module.status.ENABLED);
        });

    });

    describe('#setup()', function() {

        it('should exist in the instance', function() {
            should(testModule.setup).be.a.Function();
        });

        it('should have a callback as 4th argument passing a null error by default',
            function(done) {
                testModule.setup(null, null, null, done);
            });

        it('should be overridable', function(done) {
            testModule.setup = function(app, options, imports, donecb) {
                donecb(null, `The id of the module is ${this.id}`);
            };

            testModule.setup(null, null, null, function(err, message) {
                if (message === 'The id of the module is myModule') {
                    done();
                } else {
                    done(new Error('function setup not overriden'));
                }
            });
        });

    });

    describe('#enable()', function() {

        it('should exist in the instance', function() {
            should(testModule.enable).be.a.Function();
        });

        it('should have a callback as 4th argument passing a null error by default',
            function(done) {
                testModule.enable(null, null, null, done);
            });

        it('should be overridable', function(done) {
            testModule.enable = function(app, options, imports, donecb) {
                donecb(null, `The id of the module is ${this.id}`);
            };

            testModule.enable(null, null, null, function(err, message) {
                if (message === 'The id of the module is myModule') {
                    done();
                } else {
                    done(new Error('function enable not overriden'));
                }
            });
        });

    });

    describe('#disable()', function() {

        it('should exist in the instance', function() {
            should(testModule.disable).be.a.Function();
        });

        it('should have a callback as 4th argument passing a null error by default',
            function(done) {
                testModule.disable(null, null, null, done);
            });

        it('should be overridable', function(done) {
            testModule.disable = function(app, options, imports, donecb) {
                donecb(null, `The id of the module is ${this.id}`);
            };

            testModule.disable(null, null, null, function(err, message) {
                if (message === 'The id of the module is myModule') {
                    done();
                } else {
                    done(new Error('function disable not overriden'));
                }
            });
        });

    });

    describe('#destroy()', function() {

        it('should exist in the instance', function() {
            should(testModule.destroy).be.a.Function();
        });

        it('should have a callback as 4th argument passing a null error by default',
            function(done) {
                testModule.destroy(null, null, null, done);
            });

        it('should be overridable', function(done) {
            testModule.destroy = function(app, options, imports, donecb) {
                donecb(null, `The id of the module is ${this.id}`);
            };

            testModule.destroy(null, null, null, function(err, message) {
                if (message === 'The id of the module is myModule') {
                    done();
                } else {
                    done(new Error('function destroy not overriden'));
                }
            });
        });

    });

    describe('events', function() {

        it('#on() should exist in the instance', function() {
            should(testModule.on).be.a.Function();
        });

        it('#emit() should exist in the instance', function() {
            should(testModule.emit).be.a.Function();
        });

        it('should allow emitting events', function(done) {
            testModule.on('test', function() {
                done();
            });
            testModule.emit('test');
        });

    });

    describe('custom properties and methods', function() {

        it('should allow custom property', function() {
            testModule.duration = 10;
            should(testModule).have.property('duration', 10);
        });

        it('should allow custom methods', function() {
            testModule.turnOff = function(id) {
                return `${id} turned off`;
            };
            should(testModule.turnOff('01')).be.exactly('01 turned off');
        });

    });

});

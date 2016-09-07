const should = require('should');
const _ = require('lodash');
const errors = require('../errors.js');

const Module = require('../module.js');

describe('Module', function() {
    "use strict";

    let testModule;

    beforeEach('initialize testModule', function() {
        testModule = new Module('myModule');
    });

    describe('constructor()', function() {

        describe('with illegal argument', function() {

            it('should throw an error with no argument', function() {

                (function() {
                    testModule = new Module();
                }).should.throw(errors.ERR_MOD_001);

            });

            it('should throw an error with null argument', function() {

                (function() {
                    testModule = new Module(null);
                }).should.throw(errors.ERR_MOD_001);

            });

            it('should throw an error with an empty String (\'\') argument',
                function() {

                    (function() {
                        testModule = new Module('');
                    }).should.throw(errors.ERR_MOD_001);

                });

        });

        describe('with a string argument ("myModule")', function() {

            it('should return an instance of Module', function() {
                should(testModule).be.an.instanceOf(Module);
            });

            it('should have an id property ("myModule")', function() {
                (testModule).should.have.property('id', 'myModule');
            });

            it('should have a status property ("created")', function() {
                (testModule).should.have.property('status',
                    'created');
            });

            it('should not have a version property', function() {
                (testModule).should.not.have.property('version');
            });

            it('should have an empty object _options property', function() {
                (testModule._options).should.be.empty();
            });

            it('should have an empty array _dependencies property',
                function() {
                    testModule._dependencies.should.be.empty();
                });

            it('should have an empty object _package property', function() {
                (testModule._package).should.be.empty();
            });

            describe('if another argument options', function() {

                beforeEach('initialize testModule', function() {
                    testModule = new Module('myModule', {
                        timeout: 1000
                    });
                });

                it(
                    'should not have an _options property representing the argument',
                    function() {
                        (testModule._options).should.have.properties(
                            [
                                'timeout'
                            ]);
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

            it('should have an id property', function() {
                (testModule).should.have.property('id', 'myModule');
            });

            it('should have a status property ("created")', function() {
                (testModule).should.have.property('status',
                    'created');
            });

            it('should have a version property', function() {
                (testModule).should.have.property('version',
                    '1.0.0');
            });

            it('should have an empty object _options property',
                function() {
                    (testModule._options).should.be.empty();
                });

            it('should have an empty array _dependencies property',
                function() {
                    testModule._dependencies.should.be.empty();
                });

            it('should have a _package property', function() {
                (testModule._package).should.have.property('name',
                    'myModule');
                (testModule._package).should.have.property(
                    'version',
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
                    'should not have an _options property representing the argument',
                    function() {
                        (testModule._options).should.have.properties(
                            [
                                'timeout'
                            ]);
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

            it('should have an id property', function() {
                (testModule).should.have.property('id', 'myModule');
            });

            it('should have a status property ("created")', function() {
                (testModule).should.have.property('status',
                    'created');
            });

            it('should have a version property', function() {
                (testModule).should.have.property('version',
                    '1.0.0');
            });

            it('should not have an _options property',
                function() {
                    (testModule._options).should.have.properties([
                        'db_url', 'db_port'
                    ]);
                });

            it('should not have a _dependencies property',
                function() {
                    testModule._dependencies.should.have.length(2);
                });

            it('should have a _package property', function() {
                (testModule._package).should.have.property('name',
                    'myModule');
                (testModule._package).should.have.property(
                    'version',
                    '1.0.0');
                (testModule._package).should.have.propertyByPath(
                    'module',
                    'dependencies');
                (testModule._package).should.have.propertyByPath(
                    'module',
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
                    'should not have an _options property representing the argument',
                    function() {
                        (testModule._options).should.have.properties(
                            [
                                'timeout', 'db_url',
                                'db_port'
                            ]);
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
            testModule._options = {};
            testModule.status = 'created';
        });

        it('should exist in the instance', function() {
            (testModule).should.have.property('addOptions');
        });

        it('should handle empty argument', function() {
            (function() {
                testModule.addOptions();
            }).should.not.throw();
        });

        it('should handle null argument', function() {
            (function() {
                testModule.addOptions(null);
            }).should.not.throw();
        });

        it('should handle empty object argument', function() {
            (function() {
                testModule.addOptions({});
            }).should.not.throw();
        });

        it('should not accept non-object argument', function() {
            (function() {
                testModule.addOptions([]);
            }).should.throw(errors.ERR_MOD_004);
            (function() {
                testModule.addOptions(['new option']);
            }).should.throw(errors.ERR_MOD_004);
            (function() {
                testModule.addOptions('new option');
            }).should.throw(errors.ERR_MOD_004);
            (function() {
                testModule.addOptions(123);
            }).should.throw(errors.ERR_MOD_004);
            (function() {
                testModule.addOptions(true);
            }).should.throw(errors.ERR_MOD_004);
            (function() {
                testModule.addOptions(function() {});
            }).should.throw(errors.ERR_MOD_004);
        });

        it('should accept an object argument', function() {
            (function() {
                testModule.addOptions(testOptions1);
            }).should.not.throw();
        });

        it('should merge argument object with existing options', function() {
            (testModule._options).should.not.have.property('db_url');
            (testModule._options).should.not.have.property('db_port');
            (testModule._options).should.not.have.property('timeout');

            testModule.addOptions(testOptions1);

            (testModule._options).should.have.property('db_url',
                'localhost');
            (testModule._options).should.have.property('db_port', 8080);
            (testModule._options).should.not.have.property('timeout');

            testModule.addOptions(testOptions2);

            (testModule._options).should.have.property('db_url',
                '127.0.0.0');
            (testModule._options).should.have.property('db_port', 8080);
            (testModule._options).should.have.property('timeout', 1000);
        });

        it('should throw an error if not in created status', function() {
            testModule.status = 'otherThanCreated';
            (function() {
                testModule.addOptions(testOptions1);
            }).should.throw(errors.ERR_MOD_002);
        });

    });

    describe('#addDependencies()', function() {

        beforeEach('Clear dependencies before each tests', function() {
            testModule._dependencies = [];
            testModule.status = 'created';
        });

        it('should exist in the instance', function() {
            (testModule).should.have.property('addDependencies');
        });

        it('should handle empty argument', function() {
            (function() {
                testModule.addDependencies();
            }).should.not.throw();
        });

        it('should handle null argument', function() {
            (function() {
                testModule.addDependencies(null);
            }).should.not.throw();
        });

        it('should handle empty array argument', function() {
            (function() {
                testModule.addDependencies([]);
            }).should.not.throw();
        });

        it('should accept a string argument', function() {
            (function() {
                testModule.addDependencies('logger');
            }).should.not.throw();
            (function() {
                testModule.addDependencies('db');
            }).should.not.throw();
        });

        it('should accept an array of string argument', function() {
            (function() {
                testModule.addDependencies(['logger']);
            }).should.not.throw();
            (function() {
                testModule.addDependencies(['db', 'server']);
            }).should.not.throw();
        });

        it('should accept multiple string arguments', function() {
            (function() {
                testModule.addDependencies('logger',
                    'db', 'server');
            }).should.not.throw();
        });

        it('should accept a mix of multiple string and array of string arguments',
            function() {
                (function() {
                    testModule.addDependencies('logger', ['logger'], 'db', [
                        'db', 'server'
                    ]);
                }).should.not.throw();
            });

        it('should not accept a non-string argument', function() {
            (function() {
                testModule.addDependencies(123);
            }).should.throw(errors.ERR_MOD_005);
            (function() {
                testModule.addDependencies('logger', 123);
            }).should.throw(errors.ERR_MOD_005);
        });

        it('should not accept an array of non-string argument', function() {
            const stringArray = ['a', 'b'];
            const nonStringArray = [123, 456];
            const mixArray = ['a', 123];
            (function() {
                testModule.addDependencies(nonStringArray);
            }).should.throw(errors.ERR_MOD_005);
            (function() {
                testModule.addDependencies('logger', 123);
            }).should.throw(errors.ERR_MOD_005);
            (function() {
                testModule.addDependencies(mixArray);
            }).should.throw(errors.ERR_MOD_005);
            (function() {
                testModule.addDependencies(stringArray, mixArray);
            }).should.throw(errors.ERR_MOD_005);
        });

        describe('merge arguments with existing dependencies', function() {

            beforeEach('initialize dependencies with [\'logger\']',
                function() {
                    testModule._dependencies = ['logger'];
                });

            it('should handle single string argument', function() {
                testModule.addDependencies('db');

                testModule._dependencies.should.containDeep(
                    ['logger', 'db']);
                testModule._dependencies.should.have.length(2);
            });

            it('should handle multiple string arguments', function() {
                testModule.addDependencies('db', 'server', 'utils');

                testModule._dependencies.should.containDeep(
                    ['logger', 'db', 'server', 'utils']);
                testModule._dependencies.should.have.length(4);
            });

            it('should handle a single array of string argument', function() {
                testModule.addDependencies(['db', 'server']);

                testModule._dependencies.should.containDeep(
                    ['logger', 'db', 'server']);
                testModule._dependencies.should.have.length(3);
            });

            it('should handle multiple arrays of string arguments',
                function() {
                    testModule.addDependencies(['db', 'server'], [
                        'utils', 'logger'
                    ]);

                    testModule._dependencies.should.containDeep(
                        ['logger', 'db', 'server', 'utils']);
                    testModule._dependencies.should.have.length(4);
                });

            it('should handle a mix of string and array of string argument',
                function() {
                    testModule.addDependencies('db', ['server'],
                        'utils', ['socket', 'server']);

                    testModule._dependencies.should.containDeep(
                        ['logger', 'db', 'server', 'utils',
                            'socket'
                        ]);
                    testModule._dependencies.should.have.length(5);
                });

        });

        it('should remove duplicates', function() {
            testModule.addDependencies('logger', ['db'],
                'db', ['server', 'server']);

            let nbDep = testModule._dependencies.length;
            let nbDepAfterUniq = _.uniq(testModule._dependencies).length;
            should.equal(nbDepAfterUniq, nbDep,
                'The dependencies contains exact duplicates');
        });

        it('should throw an error if not in created status', function() {
            testModule.status = 'otherThanCreated';
            (function() {
                testModule.addDependencies(['db', 'server']);
            }).should.throw(errors.ERR_MOD_003);
        });

    });

    describe('#setup()', function() {

        it('should exist in the instance', function() {
            (testModule).should.have.property('setup');
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
            (testModule).should.have.property('enable');
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
            (testModule).should.have.property('disable');
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
            (testModule).should.have.property('destroy');
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
            (testModule).should.have.property('on');
        });

        it('#emit() should exist in the instance', function() {
            (testModule).should.have.property('emit');
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
            (testModule).should.have.property('duration', 10);
        });

        it('should allow custom methods', function() {
            testModule.turnOff = function(id) {
                return `${id} turned off`;
            };
            should(testModule.turnOff('01')).be.exactly('01 turned off');
        });

    });

});

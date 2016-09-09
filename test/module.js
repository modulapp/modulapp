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

        describe('with a string argument', function() {

            it('should return an instance of Module', function() {
                should(testModule).be.an.instanceOf(Module);
            });

            it('should have an id', function() {
                should(testModule.id).be.exactly('myModule');
            });

            it('should have a status', function() {
                should(testModule.status).be.exactly('created');
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
                should(testModule.package).be.empty();
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
                should(testModule.status).be.exactly('created');
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
                should(testModule.status).be.exactly('created');
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
            (function() {
                testModule.options = undefined;
            }).should.not.throw();
            should(testModule.options).be.an.Object();
            should(testModule.options).be.empty();
        });

        it('should handle null value', function() {
            (function() {
                testModule.options = null;
            }).should.not.throw();
            should(testModule.options).be.an.Object();
            should(testModule.options).be.empty();
        });

        it('should handle empty object', function() {
            (function() {
                testModule.options = {};
            }).should.not.throw();
            should(testModule.options).be.an.Object();
            should(testModule.options).be.empty();
        });

        it('should not accept non-object value', function() {
            (function() {
                testModule.options = [];
            }).should.throw(errors.ERR_MOD_004);
            (function() {
                testModule.options = ['new option'];
            }).should.throw(errors.ERR_MOD_004);
            (function() {
                testModule.options = 'new option';
            }).should.throw(errors.ERR_MOD_004);
            (function() {
                testModule.options = 123;
            }).should.throw(errors.ERR_MOD_004);
            (function() {
                testModule.options = true;
            }).should.throw(errors.ERR_MOD_004);
            (function() {
                testModule.options = function() {};
            }).should.throw(errors.ERR_MOD_004);
        });

        it('should accept an object value', function() {
            (function() {
                testModule.options = testOptions1;
            }).should.not.throw();
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
            testModule._status = 'otherThanCreated';
            (function() {
                testModule.options = testOptions1;
            }).should.throw(errors.ERR_MOD_002);
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
            testModule._status = 'created';
        });

        it('should exist in the instance', function() {
            should(testModule.addOptions).be.a.Function();
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
            testModule._status = 'otherThanCreated';
            (function() {
                testModule.addOptions(testOptions1);
            }).should.throw(errors.ERR_MOD_002);
        });

    });

    describe('setter dependencies', function() {

        it('should handle empty value', function() {
            (function() {
                testModule.dependencies = undefined;
            }).should.not.throw();
            should(testModule.dependencies).be.an.Array();
            should(testModule.dependencies).be.empty();
        });

        it('should handle null value', function() {
            (function() {
                testModule.dependencies = null;
            }).should.not.throw();
            should(testModule.dependencies).be.an.Array();
            should(testModule.dependencies).be.empty();
        });

        it('should handle empty array value', function() {
            (function() {
                testModule.dependencies = [];
            }).should.not.throw();
            should(testModule.dependencies).be.an.Array();
            should(testModule.dependencies).be.empty();
        });

        it('should accept a string argument', function() {
            (function() {
                testModule.dependencies = 'logger';
            }).should.not.throw();
        });

        it('should accept an array of string value', function() {
            (function() {
                testModule.dependencies = ['logger'];
            }).should.not.throw();
            (function() {
                testModule.dependencies = ['db', 'server'];
            }).should.not.throw();
        });

        it('should not accept a non-string value', function() {
            (function() {
                testModule.dependencies = 123;
            }).should.throw(errors.ERR_MOD_005);
            (function() {
                testModule.dependencies = {
                    a: 'a'
                };
            }).should.throw(errors.ERR_MOD_005);
            (function() {
                testModule.dependencies = true;
            }).should.throw(errors.ERR_MOD_005);
            (function() {
                testModule.dependencies = function() {};
            }).should.throw(errors.ERR_MOD_005);
        });

        it('should not accept an array of non-string value', function() {
            const nonStringArray = [123, 456];
            const mixArray = ['a', 123];
            (function() {
                testModule.dependencies = nonStringArray;
            }).should.throw(errors.ERR_MOD_005);
            (function() {
                testModule.dependencies = mixArray;
            }).should.throw(errors.ERR_MOD_005);
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
            testModule._status = 'otherThanCreated';
            (function() {
                testModule.dependencies = 'db';
            }).should.throw(errors.ERR_MOD_003); // TODO
        });

    });

    describe('#addDependencies()', function() {

        beforeEach('Clear dependencies before each tests', function() {
            testModule.dependencies = [];
            testModule._status = 'created';
        });

        it('should exist in the instance', function() {
            (testModule.addDependencies).should.be.a.Function();
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
            testModule._status = 'otherThanCreated';
            (function() {
                testModule.addDependencies(['db', 'server']);
            }).should.throw(errors.ERR_MOD_003);
        });

    });

    describe('#setup()', function() {

        it('should exist in the instance', function() {
            (testModule.setup).should.be.a.Function();
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
            (testModule.enable).should.be.a.Function();
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
            (testModule.disable).should.be.a.Function();
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
            (testModule.destroy).should.be.a.Function();
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
            (testModule.on).should.be.a.Function();
        });

        it('#emit() should exist in the instance', function() {
            (testModule.emit).should.be.a.Function();
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

"use strict";

const should = require('should');
const sinon = require('sinon');
const DepGraph = require('dependency-graph').DepGraph;
const ErrorsFactory = require('errors-factory');
const eventsJson = require('../../resources/events.json');
const statusJson = require('../../resources/status.json');
const errorsJson = require('../../resources/errors.json');
const errors = new ErrorsFactory(errorsJson);

module.exports = function(Module, ModuleWrapper, App) {

    describe('App', function() {

        let serverModule = new Module('server');
        let dbModule = new Module('db');
        let loggerModule = new Module('logger');

        let app = new App();

        describe('static getter events', function() {

            it('should be available on Class def', function() {
                should.exist(App.events);
            });

            it('should not be available on Class instance', function() {
                should.not.exist(app.events);
            });

            it('should return the list of events', function() {
                should(App.events).be.deepEqual(eventsJson.app);
            });

            it('should not be overridable', function() {
                should(function() {
                    App.events = {};
                }).throw();
            });

        });

        describe('static getter status', function() {

            it('should be available on Class def', function() {
                should.exist(App.status);
            });

            it('should return the list of status', function() {
                should(App.status).be.deepEqual(statusJson.app);
            });

            it('should not return the list of status on Class instance',
                function() {
                    should(app.status).not.be.deepEqual(statusJson.app);
                });

            it('should not be overridable', function() {
                should(function() {
                    App.status = {};
                }).throw();
            });

        });

        describe('Constructor()', function() {

            describe('with illegal arguments', function() {

                it(
                    'should throw an error if first argument different than Array, Object or Module instance',
                    function() {
                        should(function() {
                            new App('test');
                        }).throw(errors.ERR_APP_013);
                        should(function() {
                            new App(true);
                        }).throw(errors.ERR_APP_013);
                        should(function() {
                            new App(123);
                        }).throw(errors.ERR_APP_013);
                        should(function() {
                            new App(function() {});
                        }).throw(errors.ERR_APP_013);
                        should(function() {
                            new App({
                                test: 'test'
                            });
                        }).not.throw();
                        should(function() {
                            new App(serverModule);
                        }).not.throw();
                        should(function() {
                            new App([serverModule]);
                        }).not.throw();
                    });

                it(
                    'should throw an error if second argument different than Object while first argument is an Array or a Module instance',
                    function() {
                        should(function() {
                            new App(serverModule,
                                'test');
                        }).throw(errors.ERR_APP_011);
                        should(function() {
                            new App([serverModule],
                                'test');
                        }).throw(errors.ERR_APP_011);
                        should(function() {
                            new App(serverModule,
                                true);
                        }).throw(errors.ERR_APP_011);
                        should(function() {
                            new App([serverModule],
                                true);
                        }).throw(errors.ERR_APP_011);
                        should(function() {
                            new App(serverModule, 123);
                        }).throw(errors.ERR_APP_011);
                        should(function() {
                            new App([serverModule], 123);
                        }).throw(errors.ERR_APP_011);
                        should(function() {
                            new App(serverModule,
                                function() {});
                        }).throw(errors.ERR_APP_011);
                        should(function() {
                            new App([serverModule],
                                function() {});
                        }).throw(errors.ERR_APP_011);
                        should(function() {
                            new App(serverModule, [
                                'test'
                            ]);
                        }).throw(errors.ERR_APP_011);
                        should(function() {
                            new App([serverModule], [
                                'test'
                            ]);
                        }).throw(errors.ERR_APP_011);
                        should(function() {
                            new App(serverModule, {
                                test: 'test'
                            });
                        }).not.throw();
                        should(function() {
                            new App([serverModule], {
                                test: 'test'
                            });
                        }).not.throw();
                    });

                it('should handle null argument', function() {
                    should(function() {
                        new App(null, {
                            test: 'test'
                        });
                    }).not.throw();
                    should(function() {
                        new App([serverModule], null);
                    }).not.throw();
                    should(function() {
                        new App(null, null);
                    }).not.throw();
                });

            });

            describe('with no argument', function() {

                before('initialize app', function() {
                    app = new App();
                });

                it('should return an instance of App', function() {
                    should(app).be.an.instanceOf(App);
                });

                it('should have a non overridable id', function() {
                    should(app.id).be.a.String();
                    should(function() {
                        app.id = 'new id';
                    }).throw();
                });

                it('should have a non overridable status', function() {
                    should(app.status).be.exactly(App.status.CREATED);
                    should(function() {
                        app.status = 'new status';
                    }).throw();
                });

                it('should have no config', function() {
                    should(app.config).be.an.Array();
                    should(app.config).be.empty();
                });

                it('should have no option', function() {
                    should(app.options).be.an.Object();
                    should(app.options).be.empty();
                });

                it('should have a non overridable graph', function() {
                    should(app.graph).be.an.instanceOf(DepGraph);
                    let newGraph = new DepGraph();
                    should(function() {
                        app.graph = newGraph;
                    }).throw();
                });

            });

            describe('with optional arguments', function() {

                describe('config as 1st', function() {

                    before('initialize app', function() {
                        app = new App([serverModule,
                            dbModule
                        ]);
                    });

                    it('should return an instance of App',
                        function() {
                            should(app).be.an.instanceOf(
                                App);
                        });

                    it('should have a non overridable id',
                        function() {
                            should(app.id).be.a.String();
                            should(function() {
                                app.id = 'new id';
                            }).throw();
                        });

                    it('should have a non overridable status',
                        function() {
                            should(app.status).be.exactly(
                                App.status
                                .CREATED);
                            should(function() {
                                app.status =
                                    'new status';
                            }).throw();
                        });

                    it('should have appropriate config',
                        function() {
                            should(app.config).be.an.Array();
                            should(app.config).have.length(
                                2);
                        });

                    it('should have no option', function() {
                        should(app.options).be.an.Object();
                        should(app.options).be.empty();
                    });

                    it('should have a non overridable graph',
                        function() {
                            should(app.graph).be.an.instanceOf(
                                DepGraph);
                            let newGraph = new DepGraph();
                            should(function() {
                                app.graph =
                                    newGraph;
                            }).throw();
                        });

                });

                describe('options as 1st', function() {

                    before('initialize app', function() {

                        let options = {
                            server: {
                                host: 'localhost',
                                port: 8080
                            },
                            db: {
                                host: 'localhost',
                                port: 1234
                            }
                        };

                        app = new App(options);
                    });

                    it('should return an instance of App',
                        function() {
                            should(app).be.an.instanceOf(
                                App);
                        });

                    it('should have a non overridable id',
                        function() {
                            should(app.id).be.a.String();
                            should(function() {
                                app.id = 'new id';
                            }).throw();
                        });

                    it('should have a non overridable status',
                        function() {
                            should(app.status).be.exactly(
                                App.status
                                .CREATED);
                            should(function() {
                                app.status =
                                    'new status';
                            }).throw();
                        });

                    it('should have no config', function() {
                        should(app.config).be.an.Array();
                        should(app.config).be.empty();
                    });

                    it('should have appropriate options',
                        function() {
                            should(app.options).be.an.Object();
                            should(app.options.server.host)
                                .be.exactly(
                                    'localhost');
                            should(app.options.server.port)
                                .be.exactly(
                                    8080);
                            should(app.options.db.host).be.exactly(
                                'localhost');
                            should(app.options.db.port).be.exactly(
                                1234);
                        });

                    it('should have a non overridable graph',
                        function() {
                            should(app.graph).be.an.instanceOf(
                                DepGraph);
                            let newGraph = new DepGraph();
                            should(function() {
                                app.graph =
                                    newGraph;
                            }).throw();
                        });

                });

                describe('config as 1st, options as 2nd', function() {

                    before('initialize app', function() {
                        let options = {
                            server: {
                                host: 'localhost',
                                port: 8080
                            },
                            db: {
                                host: 'localhost',
                                port: 1234
                            }
                        };

                        app = new App([serverModule,
                                dbModule
                            ],
                            options);
                    });

                    it('should return an instance of App',
                        function() {
                            should(app).be.an.instanceOf(
                                App);
                        });

                    it('should have a non overridable id',
                        function() {
                            should(app.id).be.a.String();
                            should(function() {
                                app.id = 'new id';
                            }).throw();
                        });

                    it('should have a non overridable status',
                        function() {
                            should(app.status).be.exactly(
                                App.status
                                .CREATED);
                            should(function() {
                                app.status =
                                    'new status';
                            }).throw();
                        });

                    it('should have appropriate config',
                        function() {
                            should(app.config).be.an.Array();
                            should(app.config).have.length(
                                2);
                        });

                    it('should have appropriate options',
                        function() {
                            should(app.options).be.an.Object();
                            should(app.options.server.host)
                                .be.exactly(
                                    'localhost');
                            should(app.options.server.port)
                                .be.exactly(
                                    8080);
                            should(app.options.db.host).be.exactly(
                                'localhost');
                            should(app.options.db.port).be.exactly(
                                1234);
                        });

                    it('should have a non overridable graph',
                        function() {
                            should(app.graph).be.an.instanceOf(
                                DepGraph);
                            let newGraph = new DepGraph();
                            should(function() {
                                app.graph =
                                    newGraph;
                            }).throw();
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

            beforeEach('clear options before each tests', function() {
                app = new App();
            });

            it('should handle empty value', function() {
                should(function() {
                    app.options = undefined;
                }).not.throw();
                should(app.options).be.an.Object();
                should(app.options).be.empty();
            });

            it('should handle null value', function() {
                should(function() {
                    app.options = null;
                }).not.throw();
                should(app.options).be.an.Object();
                should(app.options).be.empty();
            });

            it('should handle empty object', function() {
                should(function() {
                    app.options = {};
                }).not.throw();
                should(app.options).be.an.Object();
                should(app.options).be.empty();
            });

            it('should not accept non-object value', function() {
                should(function() {
                    app.options = [];
                }).throw(errors.ERR_APP_008);
                should(function() {
                    app.options = ['new option'];
                }).throw(errors.ERR_APP_008);
                should(function() {
                    app.options = 'new option';
                }).throw(errors.ERR_APP_008);
                should(function() {
                    app.options = 123;
                }).throw(errors.ERR_APP_008);
                should(function() {
                    app.options = true;
                }).throw(errors.ERR_APP_008);
                should(function() {
                    app.options = function() {};
                }).throw(errors.ERR_APP_008);
            });

            it('should accept an object value', function() {
                should(function() {
                    app.options = testOptions1;
                }).not.throw();
            });

            it('should replace existing options', function() {
                should(app.options.db_url).be.Undefined();
                should(app.options.db_port).be.Undefined();
                should(app.options.timeout).be.Undefined();

                app.options = testOptions1;

                should(app.options.db_url).be.exactly('localhost');
                should(app.options.db_port).be.exactly(8080);
                should(app.options.timeout).be.Undefined();

                app.options = testOptions2;

                should(app.options.db_url).be.exactly('127.0.0.0');
                should(app.options.db_port).be.Undefined();
                should(app.options.timeout).be.exactly(1000);
            });

            it('should throw an error if not in created status', function(done) {
                app.resolve(function() {
                    should(function() {
                        app.options = testOptions1;
                    }).throw(errors.ERR_APP_009);
                    done();
                });
            });

        });

        describe('#addOptions()', function() {

            const testOptions1 = {
                db: {
                    url: 'localhost',
                    port: 8080
                }
            };

            const testOptions2 = {
                db: {
                    url: '127.0.0.0',
                    timeout: 1000
                }
            };

            beforeEach('clear options before each tests', function() {
                app = new App();
            });

            it('should exist in the instance', function() {
                should(app.addOptions).be.a.Function();
            });

            it('should handle empty argument', function() {
                should(function() {
                    app.addOptions();
                }).not.throw();
            });

            it('should handle null argument', function() {
                should(function() {
                    app.addOptions(null);
                }).not.throw();
            });

            it('should not accept non-object argument', function() {
                should(function() {
                    app.addOptions([]);
                }).throw(errors.ERR_APP_008);
                should(function() {
                    app.addOptions(['new option']);
                }).throw(errors.ERR_APP_008);
                should(function() {
                    app.addOptions('new option');
                }).throw(errors.ERR_APP_008);
                should(function() {
                    app.addOptions(123);
                }).throw(errors.ERR_APP_008);
                should(function() {
                    app.addOptions(true);
                }).throw(errors.ERR_APP_008);
                should(function() {
                    app.addOptions(function() {});
                }).throw(errors.ERR_APP_008);
            });

            it('should accept an object argument', function() {
                should(function() {
                    app.addOptions(testOptions1);
                }).not.throw();
            });

            it('should handle empty object argument', function() {
                should(function() {
                    app.addOptions({});
                }).not.throw();
            });

            it('should merge argument object with existing options', function() {
                should(app.options.db).be.Undefined();

                app.addOptions(testOptions1);

                should(app.options.db.url).be.exactly('localhost');
                should(app.options.db.port).be.exactly(8080);
                should(app.options.db.timeout).be.Undefined();

                app.addOptions(testOptions2);

                should(app.options.db.url).be.exactly('127.0.0.0');
                should(app.options.db.port).be.exactly(8080);
                should(app.options.db.timeout).be.exactly(1000);
            });

            it('should throw an error if not in created status', function(done) {
                app.resolve(function() {
                    should(function() {
                        app.addOptions(testOptions1);
                    }).throw(errors.ERR_APP_009);
                    done();
                });
            });

        });

        describe('setter config', function() {

            beforeEach('Clear config before each tests', function() {
                app = new App();
            });

            it('should handle empty value', function() {
                should(function() {
                    app.config = undefined;
                }).not.throw();
                should(app.config).be.an.Array();
                should(app.config).be.empty();
            });

            it('sould handle null value', function() {
                should(function() {
                    app.config = null;
                }).not.throw();
                should(app.config).be.an.Array();
                should(app.config).be.empty();
            });

            it('should handle empty array value', function() {
                should(function() {
                    app.config = [];
                }).not.throw();
                should(app.config).be.an.Array();
                should(app.config).be.empty();
            });

            it('should not accept non-array value', function() {
                should(function() {
                    app.config = '123';
                }).throw(errors.ERR_APP_013);
                should(function() {
                    app.config = 123;
                }).throw(errors.ERR_APP_013);
                should(function() {
                    app.config = {
                        a: 'a'
                    };
                }).throw(errors.ERR_APP_013);
                should(function() {
                    app.config = true;
                }).throw(errors.ERR_APP_013);
                should(function() {
                    app.config = function() {};
                }).throw(errors.ERR_APP_013);
            });

            it('should only accept an array of Module instances', function() {
                let server = new Module('server');
                should(function() {
                    app.config = [server];
                }).not.throw();
                should(function() {
                    app.config = ['123'];
                }).throw(errors.ERR_APP_013);
                should(function() {
                    app.config = [123];
                }).throw(errors.ERR_APP_013);
                should(function() {
                    app.config = [{
                        a: 'a'
                    }];
                }).throw(errors.ERR_APP_013);
                should(function() {
                    app.config = [true];
                }).throw(errors.ERR_APP_013);
                should(function() {
                    app.config = [function() {}];
                }).throw(errors.ERR_APP_013);
            });

            it('should replace existing config', function() {
                should(app.config).be.empty();

                let server = new Module('server');
                let db = new Module('db');
                app.config = [server, db];
                should(app.config).have.length(2);

                app.config = [db];
                should(app.config).have.length(1);
            });

            it('should remove duplicates', function() {
                should(app.config).be.empty();

                let server = new Module('server');
                let db = new Module('db');
                app.config = [server, server, db];
                should(app.config).have.length(2);
            });

            it('should throw an error if not in created status', function(done) {
                app.resolve(function() {
                    should(function() {
                        app.config = [serverModule];
                    }).throw(errors.ERR_APP_014);
                    done();
                });
            });

        });

        describe('#addConfig()', function() {

            beforeEach('clear config before each tests', function() {
                app = new App();
            });

            it('should exist in the instance', function() {
                should(app.addConfig).be.a.Function();
            });

            it('should handle empty argument', function() {
                should(function() {
                    app.addConfig();
                }).not.throw();
            });

            it('should handle null argument', function() {
                should(function() {
                    app.addConfig(null);
                }).not.throw();
            });

            it('should accept a Module instance argument', function() {
                should(function() {
                    app.addConfig(serverModule);
                }).not.throw();
            });

            it('should accept multiple Module instance arguments', function() {
                should(function() {
                    app.addConfig(serverModule, dbModule);
                }).not.throw();
            });

            it('should accept an array of Module instance argument', function() {
                should(function() {
                    app.addConfig([serverModule, dbModule]);
                }).not.throw();
            });

            it(
                'should accept a mix of multiple Module instance and array of Module instance as arguments',
                function() {
                    should(function() {
                        app.addConfig(serverModule, [dbModule]);
                    }).not.throw();
                });

            it('should handle empty array argument', function() {
                should(function() {
                    app.addConfig([]);
                }).not.throw();
            });

            it('should not accept non-array and non-Module instance argument',
                function() {
                    should(function() {
                        app.addConfig(132);
                    }).throw(errors.ERR_APP_013);
                    should(function() {
                        app.addConfig('132');
                    }).throw(errors.ERR_APP_013);
                    should(function() {
                        app.addConfig(true);
                    }).throw(errors.ERR_APP_013);
                    should(function() {
                        app.addConfig({
                            a: 'a'
                        });
                    }).throw(errors.ERR_APP_013);
                    should(function() {
                        app.addConfig(function() {});
                    }).throw(errors.ERR_APP_013);
                });

            it('should not accept array of non-Module instance argument',
                function() {
                    should(function() {
                        app.addConfig([132]);
                    }).throw(errors.ERR_APP_013);
                    should(function() {
                        app.addConfig(['132']);
                    }).throw(errors.ERR_APP_013);
                    should(function() {
                        app.addConfig([true]);
                    }).throw(errors.ERR_APP_013);
                    should(function() {
                        app.addConfig([{
                            a: 'a'
                        }]);
                    }).throw(errors.ERR_APP_013);
                    should(function() {
                        app.addConfig([function() {}]);
                    }).throw(errors.ERR_APP_013);
                    should(function() {
                        app.addConfig(serverModule, ['132']);
                    }).throw(errors.ERR_APP_013);
                });

            it('should merge argument with existing config', function() {
                let loggerModule = new Module('logger');
                let utilsModule = new Module('utils');

                app.addConfig(serverModule);
                should(app.config).containDeep([serverModule]);
                should(app.config).have.length(1);

                app.addConfig([dbModule]);
                should(app.config).containDeep([serverModule, dbModule]);
                should(app.config).have.length(2);

                app.addConfig(loggerModule, [utilsModule]);
                should(app.config).containDeep([serverModule, dbModule,
                    loggerModule, utilsModule
                ]);
                should(app.config).have.length(4);
            });

            it('should remove duplicates', function() {
                app.addConfig(serverModule, dbModule, serverModule, [
                    dbModule
                ]);
                should(app.config).have.length(2);
            });

            it('should throw an error if not in created status', function(done) {
                app.resolve(function() {
                    should(function() {
                        app.addConfig([serverModule]);
                    }).throw(errors.ERR_APP_014);
                    done();
                });
            });

        });

        describe('#_changeStatus()', function() {

            before('initialize app', function() {
                app = new App();
            });

            it('should exist in the instance', function() {
                should(app._changeStatus).be.a.Function();
            });

            it('should only accept a string from the predefined list', function() {
                should(function() {
                    app._changeStatus('notACorrectStatus');
                }).throw(errors.ERR_APP_015);
                should(function() {
                    app._changeStatus(App.status.RESOLVED);
                }).not.throw();
            });

            it('should update the status', function() {
                should(app.status).be.exactly(App.status.RESOLVED);
                app._changeStatus(App.status.SETUP);
                should(app.status).be.exactly(App.status.SETUP);
                app._changeStatus(App.status.STARTED);
                should(app.status).be.exactly(App.status.STARTED);
            });

        });

        describe('#resolve()', function() {

            beforeEach('initialize app before each test', function() {
                app = new App();
                serverModule = new Module('server');
                dbModule = new Module('db');
                loggerModule = new Module('logger');
            });

            it('should not throw an error if callback is undefined', function() {
                should(function() {
                    app.resolve(undefined);
                }).not.throw();
            });

            it('should not throw an error if callback is null', function() {
                should(function() {
                    app.resolve(null);
                }).not.throw();
            });

            it('should execute the callback argument', function() {
                let spy = sinon.spy();
                app.resolve(spy);
                should(spy.calledOnce).be.true();
            });

            it(
                'should throw an error in case of module dependency cycle (no callback)',
                function() {
                    serverModule.addDependencies('db');
                    dbModule.addDependencies('server');
                    app.addConfig(loggerModule, serverModule, dbModule);

                    should(function() {
                        app.resolve();
                    }).throw(errors.ERR_APP_006);
                });

            it(
                'should pass an error to the callback in case of module dependency cycle',
                function(
                    done) {
                    serverModule.addDependencies('db');
                    dbModule.addDependencies('server');
                    app.addConfig(loggerModule, serverModule, dbModule);

                    app.resolve((err) => {
                        should(err.message).be.exactly(errors.ERR_APP_006
                            .message);
                        done();
                    });
                });

            it(
                'should throw an error in case of missing required dependency module (no callback)',
                function() {
                    serverModule.addDependencies('db', 'utils');
                    app.addConfig(loggerModule, serverModule, dbModule);

                    should(function() {
                        app.resolve();
                    }).throw(errors.ERR_APP_007);
                });

            it(
                'should pass an error to the callback in case of missing required dependency module',
                function(done) {
                    serverModule.addDependencies('db', 'utils');
                    app.addConfig(loggerModule, serverModule, dbModule);

                    app.resolve((err) => {
                        should(err.message).be.exactly(errors.ERR_APP_007
                            .message);
                        done();
                    });
                });

            it('should build the module graph', function() {
                serverModule.addDependencies('logger');
                dbModule.addDependencies('server', 'logger');
                app.addConfig(loggerModule, serverModule, dbModule);

                app.resolve();

                let graph = app.graph;
                should.exist(graph.nodes.logger);
                should.exist(graph.nodes.server);
                should.exist(graph.nodes.db);
            });

            it('should wrap every module in a ModuleWrapper instance', function() {
                app.addConfig(serverModule, dbModule);

                app.resolve();

                let graph = app.graph;

                let serverNode = graph.getNodeData('server');
                should(serverNode).be.an.instanceOf(ModuleWrapper);
                let dbNode = graph.getNodeData('db');
                should(dbNode).be.an.instanceOf(ModuleWrapper);
            });

            it('should pass the dependency module as imports in the wrapper',
                function() {
                    serverModule.addDependencies('logger');
                    dbModule.addDependencies('server', 'logger');
                    app.addConfig(loggerModule, serverModule, dbModule);

                    app.resolve();

                    let graph = app.graph;

                    let serverNode = graph.getNodeData('server');
                    should.exist(serverNode.imports.logger);
                    let loggerServerImport = serverNode.imports.logger;
                    should(loggerServerImport).be.an.instanceOf(
                        ModuleWrapper);

                    let dbNode = graph.getNodeData('db');
                    should.exist(dbNode.imports.server);
                    let serverDbImport = dbNode.imports.server;
                    should(serverDbImport).be.an.instanceOf(ModuleWrapper);
                    should.exist(dbNode.imports.logger);
                    let loggerDbImport = dbNode.imports.logger;
                    should(loggerDbImport).be.an.instanceOf(ModuleWrapper);
                });

            it('should set the appropriate options', function() {
                app.addOptions({
                    server: {
                        host: 'localhost',
                        port: 8080
                    },
                    db: {
                        url: 'localhost'
                    }
                });
                app.addConfig(serverModule, dbModule);

                app.resolve();

                let graph = app.graph;

                let serverNode = graph.getNodeData('server');
                should(serverNode.options.host).be.exactly('localhost');
                should(serverNode.options.port).be.exactly(8080);

                let dbNode = graph.getNodeData('db');
                should(dbNode.options.url).be.exactly('localhost');
            });

            it('should emit a RESOLVING event at the begining', function(done) {
                app.on(App.events.RESOLVING, function() {
                    done();
                });
                app.resolve();
            });

            it('should emit a RESOLVED event if successful', function(done) {
                app.on(App.events.RESOLVED, function() {
                    done();
                });
                app.resolve();
            });

            it('should keep the status at its initial state if failure',
                function() {
                    serverModule.addDependencies('utils');
                    app.addConfig(serverModule);

                    should(app.status).be.exactly(App.status.CREATED);
                    try {
                        app.resolve();
                    } catch (err) {}
                    should(app.status).be.exactly(App.status.CREATED);
                });

            it('should have updated the status to RESOLVED', function() {
                should(app.status).be.exactly(App.status.CREATED);
                app.resolve();
                should(app.status).be.exactly(App.status.RESOLVED);
            });

            it('should not raise an error if in CREATED status', function(done) {
                app._changeStatus(App.status.CREATED);
                should(function() {
                    app.resolve();
                }).not.throw(errors.ERR_APP_001);

                app._changeStatus(App.status.CREATED);
                app.resolve((err) => {
                    should(err).be.null();
                    done();
                });
            });

            it('should not raise an error if in RESOLVED status', function(done) {
                app._changeStatus(App.status.RESOLVED);
                should(function() {
                    app.resolve();
                }).not.throw(errors.ERR_APP_001);

                app._changeStatus(App.status.RESOLVED);
                app.resolve((err) => {
                    should(err).be.null();
                    done();
                });
            });

            it('should not raise an error if in SETUP status', function(done) {
                app._changeStatus(App.status.SETUP);
                should(function() {
                    app.resolve();
                }).not.throw(errors.ERR_APP_001);

                app._changeStatus(App.status.SETUP);
                app.resolve((err) => {
                    should(err).be.null();
                    done();
                });
            });

            it('should raise an error if in STARTED status', function(done) {
                app._changeStatus(App.status.STARTED);
                should(function() {
                    app.resolve();
                }).throw(errors.ERR_APP_001);

                app._changeStatus(App.status.STARTED);
                app.resolve((err) => {
                    should(err.message).be.exactly(errors.ERR_APP_001
                        .message);
                    done();
                });
            });

            it('should not raise an error if in STOPPED status', function(done) {
                app._changeStatus(App.status.STOPPED);
                should(function() {
                    app.resolve();
                }).not.throw(errors.ERR_APP_001);

                app._changeStatus(App.status.STOPPED);
                app.resolve((err) => {
                    should(err).be.null();
                    done();
                });
            });

        });

        describe('#setup()', function() {

            beforeEach('initialize app before each test', function() {
                app = new App();
                serverModule = new Module('server');
                dbModule = new Module('db');
                loggerModule = new Module('logger');
            });

            it('should first call app#resolve() if app in CREATED status',
                function(
                    done) {
                    sinon.spy(app, 'resolve');
                    app.setup(() => {
                        should(app.resolve.calledOnce).be.true();
                        done();
                    });
                });

            it('should pass resolve error in the callback if any', function(
                done) {
                serverModule.addDependencies('db', 'utils');
                app.addConfig(serverModule);

                app.setup((err) => {
                    if (err) {
                        done();
                    }
                });
            });

            it(
                'should synchronously execute setup() on each module in the right order',
                function(done) {
                    let loggerSpy = sinon.spy(loggerModule, 'setup');
                    let serverSpy = sinon.spy(serverModule, 'setup');
                    let dbSpy = sinon.spy(dbModule, 'setup');
                    serverModule.addDependencies('logger');
                    dbModule.addDependencies('logger', 'server');

                    app.addConfig(loggerModule, serverModule, dbModule);

                    app.setup(() => {
                        should(loggerSpy.calledOnce).be.true();
                        should(serverSpy.calledAfter(loggerSpy)).be
                            .true();
                        should(dbSpy.calledAfter(serverSpy)).be.true();
                        done();
                    });
                });

            it('should not throw an error if callback is undefined', function() {
                should(function() {
                    app.setup(undefined);
                }).not.throw();
            });

            it('should not throw an error if callback is null', function() {
                should(function() {
                    app.setup(null);
                }).not.throw();
            });

            it('should emit a SETTING_UP event at the begining', function(done) {
                app.on(App.events.SETTING_UP, function() {
                    done();
                });
                app.setup();
            });

            it('should emit a SETUP event if successful', function(done) {
                app.on(App.events.SETUP, function() {
                    done();
                });
                app.setup();
            });

            it('should keep the status at its initial state if failure',
                function(done) {
                    app = new App();
                    serverModule.setup = function(app, options, imports,
                        moduleDone) {
                        moduleDone(new Error());
                    };
                    app.addConfig(serverModule);
                    app.resolve();

                    should(app.status).be.exactly(App.status.RESOLVED);
                    app.setup((err) => {
                        if (err) {
                            should(app.status).be.exactly(App.status
                                .RESOLVED);
                            done();
                        }
                    });
                });

            it('should have updated the status to SETUP', function() {
                should(app.status).be.exactly(App.status.CREATED);
                app.setup();
                should(app.status).be.exactly(App.status.SETUP);
            });

            it('should not raise an error if in CREATED status', function(done) {
                app._changeStatus(App.status.CREATED);
                app.setup((err) => {
                    should(err).be.null();
                    done();
                });
            });

            it('should not raise an error if in RESOLVED status', function(done) {
                app._changeStatus(App.status.RESOLVED);
                app.setup((err) => {
                    should(err).be.null();
                    done();
                });
            });

            it('should not raise an error if in SETUP status', function(done) {
                app._changeStatus(App.status.SETUP);
                app.setup((err) => {
                    should(err).be.null();
                    done();
                });
            });

            it('should raise an error if in STARTED status', function(done) {
                app._changeStatus(App.status.STARTED);
                app.setup((err) => {
                    should(err.message).be.exactly(errors.ERR_APP_002
                        .message);
                    done();
                });
            });

            it('should not raise an error if in STOPPED status', function(done) {
                app._changeStatus(App.status.STOPPED);
                app.setup((err) => {
                    should(err).be.null();
                    done();
                });
            });

        });

        describe('#start()', function() {

            beforeEach('initialize app before each test', function() {
                app = new App();
                serverModule = new Module('server');
                dbModule = new Module('db');
                loggerModule = new Module('logger');
            });

            it(
                'should first call app#setup() if app in CREATED or RESOLVED status',
                function(
                    done) {
                    app = new App();
                    sinon.spy(app, 'setup');
                    app.start(() => {
                        should(app.setup.calledOnce).be.true();
                        done();
                    });
                });

            it('should pass setup error in the callback if any', function(done) {
                app = new App();
                serverModule.addDependencies('db', 'utils');
                app.addConfig(serverModule);

                app.start((err) => {
                    if (err) {
                        done();
                    }
                });
            });

            it(
                'should synchronously execute enable() on each module in the right order',
                function(done) {
                    let loggerSpy = sinon.spy(loggerModule, 'enable');
                    let serverSpy = sinon.spy(serverModule, 'enable');
                    let dbSpy = sinon.spy(dbModule, 'enable');
                    serverModule.addDependencies('logger');
                    dbModule.addDependencies('logger', 'server');

                    app.addConfig(loggerModule, serverModule, dbModule);

                    app.start(() => {
                        should(loggerSpy.calledOnce).be.true();
                        should(serverSpy.calledAfter(loggerSpy)).be
                            .true();
                        should(dbSpy.calledAfter(serverSpy)).be.true();
                        done();
                    });
                });

            it('should not throw an error if callback is undefined', function() {
                should(function() {
                    app.start(undefined);
                }).not.throw();
            });

            it('should not throw an error if callback is null', function() {
                should(function() {
                    app.start(null);
                }).not.throw();
            });

            it('should emit a STARTING event at the begining', function(done) {
                app.on(App.events.STARTING, function() {
                    done();
                });
                app.start();
            });

            it('should emit a STARTED event if successful', function(done) {
                app.on(App.events.STARTED, function() {
                    done();
                });
                app.start();
            });

            it('should keep the status at its initial state if failure',
                function(done) {
                    app = new App();
                    serverModule.enable = function(app, options, imports,
                        moduleDone) {
                        moduleDone(new Error());
                    };
                    app.addConfig(serverModule);
                    app.resolve();
                    app._changeStatus(App.status.SETUP);

                    should(app.status).be.exactly(App.status.SETUP);
                    app.start((err) => {
                        if (err) {
                            should(app.status).be.exactly(App.status
                                .SETUP);
                            done();
                        }
                    });
                });

            it('should have updated the status to STARTED', function() {
                should(app.status).be.exactly(App.status.CREATED);
                app.start();
                should(app.status).be.exactly(App.status.STARTED);
            });

            it('should not raise an error if in CREATED status', function(done) {
                app._changeStatus(App.status.CREATED);
                app.start((err) => {
                    should(err).be.null();
                    done();
                });
            });

            it('should not raise an error if in RESOLVED status', function(done) {
                app._changeStatus(App.status.RESOLVED);
                app.start((err) => {
                    should(err).be.null();
                    done();
                });
            });

            it('should not raise an error if in SETUP status', function(done) {
                app._changeStatus(App.status.SETUP);
                app.start((err) => {
                    should(err).be.null();
                    done();
                });
            });

            it('should raise an error if in STARTED status', function(done) {
                app._changeStatus(App.status.STARTED);
                app.start((err) => {
                    should(err.message).be.exactly(errors.ERR_APP_003
                        .message);
                    done();
                });
            });

            it('should not raise an error if in STOPPED status', function(done) {
                app._changeStatus(App.status.STOPPED);
                app.start((err) => {
                    should(err).be.null();
                    done();
                });
            });

        });

        describe('#stop()', function() {

            beforeEach('initialize app before each test', function() {
                app = new App();
                serverModule = new Module('server');
                dbModule = new Module('db');
                loggerModule = new Module('logger');

                app.start();
            });

            it(
                'should synchronously execute disable() on each module in the right order',
                function(done) {
                    let loggerSpy = sinon.spy(loggerModule, 'disable');
                    let serverSpy = sinon.spy(serverModule, 'disable');
                    let dbSpy = sinon.spy(dbModule, 'disable');
                    serverModule.addDependencies('logger');
                    dbModule.addDependencies('logger', 'server');

                    app = new App();
                    app.addConfig(loggerModule, serverModule, dbModule);
                    app.start(() => {
                        app.stop(() => {
                            should(dbSpy.calledOnce).be.true();
                            should(serverSpy.calledAfter(
                                    dbSpy)).be
                                .true();
                            should(loggerSpy.calledAfter(
                                    serverSpy))
                                .be.true();
                            done();
                        });
                    });
                }
            );

            it('should not throw an error if callback is undefined', function() {
                should(function() {
                    app.stop(undefined);
                }).not.throw();
            });

            it('should not throw an error if callback is null', function() {
                should(function() {
                    app.stop(null);
                }).not.throw();
            });

            it('should emit a STOPPING event at the begining', function(done) {
                app.on(App.events.STOPPING, function() {
                    done();
                });
                app.stop();
            });

            it('should emit a STOPPED event if successful', function(done) {
                app.on(App.events.STOPPED, function() {
                    done();
                });
                app.stop();
            });

            it('should keep the status at its initial state if failure',
                function(done) {
                    app = new App();
                    serverModule.disable = function(app, options, imports,
                        moduleDone) {
                        moduleDone(new Error());
                    };
                    app.addConfig(serverModule);
                    app.start(() => {
                        should(app.status).be.exactly(App.status.STARTED);
                        app.stop((err) => {
                            if (err) {
                                should(app.status).be.exactly(
                                    App.status
                                    .STARTED);
                                done();
                            }
                        });
                    });
                });

            it('should have updated the status to STOPPED if successful',
                function() {
                    should(app.status).be.exactly(App.status.STARTED);
                    app.stop();
                    should(app.status).be.exactly(App.status.STOPPED);
                });

            it('should raise an error if in CREATED status', function(done) {
                app._changeStatus(App.status.CREATED);
                app.stop((err) => {
                    should(err.message).be.exactly(errors.ERR_APP_004
                        .message);
                    done();
                });
            });

            it('should raise an error if in RESOLVED status', function(done) {
                app._changeStatus(App.status.RESOLVED);
                app.stop((err) => {
                    should(err.message).be.exactly(errors.ERR_APP_004
                        .message);
                    done();
                });
            });

            it('should raise an error if in SETUP status', function(done) {
                app._changeStatus(App.status.SETUP);
                app.stop((err) => {
                    should(err.message).be.exactly(errors.ERR_APP_004
                        .message);
                    done();
                });
            });

            it('should not raise an error if in STARTED status', function(done) {
                app._changeStatus(App.status.STARTED);
                app.stop((err) => {
                    should(err).be.null();
                    done();
                });
            });

            it('should raise an error if in STOPPED status', function(done) {
                app._changeStatus(App.status.STOPPED);
                app.stop((err) => {
                    should(err.message).be.exactly(errors.ERR_APP_004
                        .message);
                    done();
                });
            });

        });

        describe('#destroy()', function() {

            beforeEach('initialize app before each test', function() {
                app = new App();
                serverModule = new Module('server');
                dbModule = new Module('db');
                loggerModule = new Module('logger');

                app.start(() => {
                    app.stop();
                });
            });

            it(
                'should synchronously execute destroy() on each module in the right order',
                function(done) {
                    let loggerSpy = sinon.spy(loggerModule, 'destroy');
                    let serverSpy = sinon.spy(serverModule, 'destroy');
                    let dbSpy = sinon.spy(dbModule, 'destroy');
                    serverModule.addDependencies('logger');
                    dbModule.addDependencies('logger', 'server');

                    app = new App();
                    app.addConfig(loggerModule, serverModule, dbModule);
                    app.start(() => {
                        app.stop(() => {
                            app.destroy(() => {
                                should(dbSpy.calledOnce)
                                    .be
                                    .true();
                                should(serverSpy.calledAfter(
                                    dbSpy)).be.true();
                                should(loggerSpy.calledAfter(
                                    serverSpy
                                )).be.true();
                                done();
                            });
                        });
                    });
                }
            );

            it('should not throw an error if callback is undefined', function() {
                should(function() {
                    app.destroy(undefined);
                }).not.throw();
            });

            it('should not throw an error if callback is null', function() {
                should(function() {
                    app.destroy(null);
                }).not.throw();
            });

            it('should emit a DESTROYING event at the begining', function(done) {
                app.on(App.events.DESTROYING, function() {
                    done();
                });
                app.destroy();
            });

            it('should emit a DESTROYED event if successful', function(done) {
                app.on(App.events.DESTROYED, function() {
                    done();
                });
                app.destroy();
            });

            it('should keep the status at its initial state if failure',
                function(done) {
                    app = new App();
                    serverModule.destroy = function(app, options, imports,
                        moduleDone) {
                        moduleDone(new Error());
                    };
                    app.addConfig(serverModule);
                    app.start(() => {
                        app.stop(() => {
                            should(app.status).be.exactly(
                                App.status
                                .STOPPED);
                            app.destroy((err) => {
                                if (err) {
                                    should(app.status)
                                        .be.exactly(
                                            App.status
                                            .STOPPED
                                        );
                                    done();
                                }
                            });
                        });
                    });
                });

            it('should raise an error if in CREATED status', function(done) {
                app._changeStatus(App.status.CREATED);
                app.destroy((err) => {
                    should(err.message).be.exactly(errors.ERR_APP_005
                        .message);
                    done();
                });
            });

            it('should raise an error if in RESOLVED status', function(done) {
                app._changeStatus(App.status.RESOLVED);
                app.destroy((err) => {
                    should(err.message).be.exactly(errors.ERR_APP_005
                        .message);
                    done();
                });
            });

            it('should raise an error if in SETUP status', function(done) {
                app._changeStatus(App.status.SETUP);
                app.destroy((err) => {
                    should(err.message).be.exactly(errors.ERR_APP_005
                        .message);
                    done();
                });
            });

            it('should raise an error if in STARTED status', function(done) {
                app._changeStatus(App.status.STARTED);
                app.destroy((err) => {
                    should(err.message).be.exactly(errors.ERR_APP_005
                        .message);
                    done();
                });
            });

            it('should not raise an error if in STOPPED status', function(done) {
                app._changeStatus(App.status.STOPPED);
                app.destroy((err) => {
                    should(err).be.null();
                    done();
                });
            });

        });

        describe('events', function() {

            it('#on() should exist in the instance', function() {
                should(app.on).be.a.Function();
            });

            it('#emit() should exist in the instance', function() {
                should(app.emit).be.a.Function();
            });

            it('should allow emitting events', function(done) {
                app.on('test', function() {
                    done();
                });
                app.emit('test');
            });

        });

    });

};

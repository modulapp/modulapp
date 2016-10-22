"use strict";

const should = require('should');
const DepGraph = require('dependency-graph').DepGraph;
const errors = require('../errors');

const Module = require('../module');

const App = require('../app');

describe('App', function() {

    let serverModule = new Module('server');
    let dbModule = new Module('db');

    let app = new App();

    describe('static getter events', function() {

        it('should be available on Class def', function() {
            should.exist(App.events);
        });

        it('should not be available on Class instance', function() {
            should.not.exist(app.events);
        });

        it('should return the list of events', function() {
            should(App.events).be.exactly(require(
                '../resources/events.json').app);
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
            should(App.status).be.exactly(require(
                '../resources/status.json').app);
        });

        it('should not return the list of status on Class instance', function() {
            should(app.status).not.be.exactly(require(
                '../resources/status.json').app);
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
                    app = new App([serverModule, dbModule]);
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
                    should(app.status).be.exactly(App.status
                        .CREATED);
                    should(function() {
                        app.status = 'new status';
                    }).throw();
                });

                it('should have appropriate config', function() {
                    should(app.config).be.an.Array();
                    should(app.config).have.length(2);
                });

                it('should have no option', function() {
                    should(app.options).be.an.Object();
                    should(app.options).be.empty();
                });

                it('should have a non overridable graph', function() {
                    should(app.graph).be.an.instanceOf(
                        DepGraph);
                    let newGraph = new DepGraph();
                    should(function() {
                        app.graph = newGraph;
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
                    should(app.status).be.exactly(App.status
                        .CREATED);
                    should(function() {
                        app.status = 'new status';
                    }).throw();
                });

                it('should have no config', function() {
                    should(app.config).be.an.Array();
                    should(app.config).be.empty();
                });

                it('should have appropriate options', function() {
                    should(app.options).be.an.Object();
                    should(app.options.server.host).be.exactly(
                        'localhost');
                    should(app.options.server.port).be.exactly(
                        8080);
                    should(app.options.db.host).be.exactly(
                        'localhost');
                    should(app.options.db.port).be.exactly(
                        1234);
                });

                it('should have a non overridable graph', function() {
                    should(app.graph).be.an.instanceOf(
                        DepGraph);
                    let newGraph = new DepGraph();
                    should(function() {
                        app.graph = newGraph;
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

                    app = new App([serverModule, dbModule],
                        options);
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
                    should(app.status).be.exactly(App.status
                        .CREATED);
                    should(function() {
                        app.status = 'new status';
                    }).throw();
                });

                it('should have appropriate config', function() {
                    should(app.config).be.an.Array();
                    should(app.config).have.length(2);
                });

                it('should have appropriate options', function() {
                    should(app.options).be.an.Object();
                    should(app.options.server.host).be.exactly(
                        'localhost');
                    should(app.options.server.port).be.exactly(
                        8080);
                    should(app.options.db.host).be.exactly(
                        'localhost');
                    should(app.options.db.port).be.exactly(
                        1234);
                });

                it('should have a non overridable graph', function() {
                    should(app.graph).be.an.instanceOf(
                        DepGraph);
                    let newGraph = new DepGraph();
                    should(function() {
                        app.graph = newGraph;
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

        it('should not accept non-array and non-Module instance argument', function() {
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

        it('should not accept array of non-Module instance argument', function() {
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
            app.addConfig(serverModule, dbModule, serverModule, [dbModule]);
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

    describe('#resolve()', function() {

    });

    describe('#setup()', function() {

    });

    describe('#start()', function() {

    });

    describe('#stop()', function() {

    });

    describe('#destroy()', function() {

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

"use strict";

const should = require('should');
const DepGraph = require('dependency-graph').DepGraph;
const errors = require('../errors');

const Module = require('../module');

const App = require('../app');

describe('App', function() {

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
                'should throw an error if first argument different than Array or Object',
                function() {
                    should(function() {
                        new App('test');
                    }).throw(errors.ERR_APP_010);
                    should(function() {
                        new App(true);
                    }).throw(errors.ERR_APP_010);
                    should(function() {
                        new App(123);
                    }).throw(errors.ERR_APP_010);
                    should(function() {
                        new App(function() {});
                    }).throw(errors.ERR_APP_010);
                    should(function() {
                        new App({
                            test: 'test'
                        });
                    }).not.throw();
                    should(function() {
                        new App([new Module('testModule')]);
                    }).not.throw();
                });

            it(
                'should throw an error if second argument different than Object while first argument is an Array',
                function() {
                    should(function() {
                        new App([new Module('testModule')],
                            'test');
                    }).throw(errors.ERR_APP_011);
                    should(function() {
                        new App([new Module('testModule')],
                            true);
                    }).throw(errors.ERR_APP_011);
                    should(function() {
                        new App([new Module('testModule')], 123);
                    }).throw(errors.ERR_APP_011);
                    should(function() {
                        new App([new Module('testModule')],
                            function() {});
                    }).throw(errors.ERR_APP_011);
                    should(function() {
                        new App([new Module('testModule')], [
                            'test'
                        ]);
                    }).throw(errors.ERR_APP_011);
                    should(function() {
                        new App([new Module('testModule')], {
                            test: 'test'
                        });
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
                should(app.config).be.empty();
            });

            it('should have no option', function() {
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

                    let server = new Module('server');
                    let db = new Module('db');

                    let config = [server, db];

                    app = new App(config);
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
                    should(app.config).have.length(2);
                });

                it('should have no option', function() {
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
                    should(app.config).be.empty();
                });

                it('should have appropriate options', function() {
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

                    let server = new Module('server');
                    let db = new Module('db');

                    let config = [server, db];

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

                    app = new App(config, options);
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
                    should(app.config).have.length(2);
                });

                it('should have appropriate options', function() {
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

        beforeEach('intialize app', function() {
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

    });

    describe('setter config', function() {

    });

    describe('#addConfig()', function() {

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

const should = require('should');
const _ = require('lodash');
const errors = require('../errors');

const App = require('../app');

describe.only('App', function() {
    "use strict";

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

        });

        describe('with minimal argument', function() {

        });

        describe('with optional arguments', function() {

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
            })
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

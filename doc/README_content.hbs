# Modulapp

Modular application framework for node.js

[![npm](https://img.shields.io/npm/v/modulapp.svg)](https://www.npmjs.com/package/modulapp)
[![npm](https://img.shields.io/npm/dm/modulapp.svg)](https://www.npmjs.com/package/modulapp)
[![npm](https://img.shields.io/npm/l/modulapp.svg)](https://www.npmjs.com/package/modulapp)
[![node](https://img.shields.io/node/v/modulapp.svg)]()
[![David](https://img.shields.io/david/modulapp/modulapp.svg)](https://github.com/modulapp/modulapp)

[![Travis build](https://img.shields.io/travis/modulapp/modulapp/master.svg)](https://travis-ci.org/modulapp/modulapp)
[![Coveralls](https://img.shields.io/coveralls/modulapp/modulapp.svg)](https://coveralls.io/github/modulapp/modulapp)
[![David](https://img.shields.io/david/dev/modulapp/modulapp.svg)](https://github.com/modulapp/modulapp)

## Overview

Modulapp is a framework for defining application in a modular way.
It provides an `App` class and a `Module` class.

### Module concept
Basically a module is an autonomous part of the application. It could be a npm package or it could be a dedicated file in the app's repository. A module can have dependencies (ie. other modules) and can also provides its own API to other dependants.

A module is an instance of the `Module` class (which extends EventEmitter). You can add any property and functions to that instance.

Modulapp allows to define hooks for a module. The lifecycle of a module has 4 steps: `setup`, `enable`, `disable` and `destroy`. A specific behavior of the module can be defined during those 4 steps. It's during those hooks that dependencies and options are injected to the module.

The `App` instance is managing the lifecycle of all modules and dealing with the dependencies and options.

### App concept
The App manages the dependencies and the lifecycle of the modules.

An app is an instance of the `App` class (which extends EventEmitter). The modules must be declared to the app. Then the lifecycle of the app can be performed. The app's lifecycle is composed of 5 steps:
* `resolve`: Checks the modules and resolve the dependency tree
* `setup`: Synchronously execute the `setup` hook of every module following the dependency tree order
* `start`: Synchronously execute the `enable` hook of every module following the dependency tree order
* `stop`: Synchronously execute the `disable` hook of every module following the dependency tree reverse order
* `destroy`: Synchronously execute the `destroy` hook of every module following the dependency tree reverse order

As the modules are processed synchronously following the dependency tree, the dependencies of a particular module have already been processed before it.

## Usage

Install from npm

```
npm install modulapp
```

To write a module, import the `Module` class.

```javascript
const Module = require('modulapp').Module;
```

To write an app, import the `App` class.

```javascript
const App = require('modulapp').App;
```

## Example

### Module class

```javascript
// myModule.js
const Module = require('modulapp').Module;
let myModule = new Module("myModule");

// define the dependencies by referencing other modulapp modules' id
myModule.dependencies = ['server', 'db'];

// custom property
myModule.foo = 'foo';

// custom function
myModule.bar = function() {
    myModule.emit('bar'); // Module extends EventEmitter
};

// overwrite the setup hook
myModule.setup = function(app, imports, options, done) {
    console.log('setting up myModule');
    done(null); // executing the done callback is required
};

// overwrite the enable hook
myModule.enable = function(app, imports, options, done) {
    console.log('enabling myModule');

        let db = imports.db;
        db.on('disconnected', () => {
            // Do some stuff on event
        });

        let server = imports.server
        server.doSomething((err) => {
            if (err) {
                done(err);  // if something wrong return done with the error
            } else {
                done(null);
            }
        });
};

// myModule.disable can also be overwritten
// myModule.destroy can also be overwritten

module.exports = myModule;
```

### App class

```javascript
// app.js
const App = require('modulapp').App;
let app = new App();

// Get the modules
let server = require('./server.js');
let db = require('./db.js');
let myModule = require('./myModule.js');

// set the configuration
app.addConfig(server, db, myModule);

// start the application
// start() will itself execute resolve() and setup() if not done
app.start((err) => {
    if (err) {
        console.log(err);
    } else {
        console.log('app started!');
    }
});

someListener.on('destroy app', () => {
    app.stop((err) => {
        if (err) {
            console.log(err);
        } else {
            app.destroy((err) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log('app destroyed!');
                }
            });
        }
    });
});
```

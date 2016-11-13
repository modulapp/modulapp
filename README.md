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

# API References

## Classes

<dl>
<dt><a href="#App">App</a> ⇐ <code>EventEmitter</code></dt>
<dd><p>Class representing an App.</p>
</dd>
<dt><a href="#Module">Module</a> ⇐ <code>EventEmitter</code></dt>
<dd><p>Class representing a Module.</p>
</dd>
</dl>

<a name="App"></a>

## App ⇐ <code>EventEmitter</code>
Class representing an App.

**Kind**: global class  
**Extends:** <code>EventEmitter</code>  
**Emits**: <code>[resolving](#App+event_resolving)</code>, <code>[resolved](#App+event_resolved)</code>, <code>[setting_up](#App+event_setting_up)</code>, <code>[setup](#App+event_setup)</code>, <code>[starting](#App+event_starting)</code>, <code>[started](#App+event_started)</code>, <code>[stopping](#App+event_stopping)</code>, <code>[stopped](#App+event_stopped)</code>, <code>[destroying](#App+event_destroying)</code>, <code>[destroyed](#App+event_destroyed)</code>  
**Access:** public  
**Since**: 1.0.0  
**Author:** nauwep <nauwep.dev@gmail.com>  

* [App](#App) ⇐ <code>EventEmitter</code>
    * [new App([config], [options])](#new_App_new)
    * _instance_
        * [.id](#App+id) : <code>String</code>
        * [.config](#App+config) : <code>[Array.&lt;Module&gt;](#Module)</code>
        * [.options](#App+options) : <code>Object</code>
        * [.status](#App+status) : <code>String</code>
        * [.addOptions([options])](#App+addOptions)
        * [.addConfig([...config])](#App+addConfig)
        * _events_
            * ["resolving"](#App+event_resolving)
            * ["resolved"](#App+event_resolved)
            * ["setting_up"](#App+event_setting_up)
            * ["setup"](#App+event_setup)
            * ["starting"](#App+event_starting)
            * ["started"](#App+event_started)
            * ["stopping"](#App+event_stopping)
            * ["stopped"](#App+event_stopped)
            * ["destroying"](#App+event_destroying)
            * ["destroyed"](#App+event_destroyed)
        * _lifecycle management_
            * [.resolve([callback])](#App+resolve)
            * [.setup([callback])](#App+setup)
            * [.start([callback])](#App+start)
            * [.stop([callback])](#App+stop)
            * [.destroy([callback])](#App+destroy)
    * _static_
        * [.events](#App.events) : <code>enum</code>
        * [.status](#App.status) : <code>enum</code>

<a name="new_App_new"></a>

### new App([config], [options])
Provide a new instance of App.
The config and options are optionnal.

**Throws**:

- <code>Error</code> ERR_APP_011 if options is not an Object.
- <code>Error</code> ERR_APP_013 if a module is not a Module instance.


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [config] | <code>[Module](#Module)</code> &#124; <code>[Array.&lt;Module&gt;](#Module)</code> | <code>[]</code> | The list of modules. |
| [options] | <code>Object</code> | <code>{}</code> | Options for the modules. |

**Example**  
```js
const App = require('modulapp').App;
let app = new App();

let serverModule = require('./server.js');
let dbModule = require('./db.js');

app.addConfig(serverModule, dbModule);

app.start((err) => {
    console.log('App started!');
});
```
<a name="App+id"></a>

### app.id : <code>String</code>
The id of the app, randomly generated.

**Kind**: instance property of <code>[App](#App)</code>  
**Access:** public  
**Read only**: true  
**Since**: 1.0.0  
**Author:** nauwep <nauwep.dev@gmail.com>  
**Example**  
```js
console.log(app.id); // -> '123456789'
app.id = 'anotherId'; // -> throw Error read-only
```
<a name="App+config"></a>

### app.config : <code>[Array.&lt;Module&gt;](#Module)</code>
The configuration of the app.
Getting config never return null, at least an empty Array [].
Setting null or undefined replaces the current config by an empty Array [].
Setting a module will build an Array with that single module.

**Kind**: instance property of <code>[App](#App)</code>  
**Throws**:

- <code>Error</code> ERR_APP_013 if a module is not a Module instance.
- <code>Error</code> ERR_APP_014 if the module is not in [created status](#App+status).

**Access:** public  
**Since**: 1.0.0  
**Author:** nauwep <nauwep.dev@gmail.com>  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [newConfig] | <code>[Module](#Module)</code> &#124; <code>[Array.&lt;Module&gt;](#Module)</code> | <code>[]</code> | The new config. |

**Example**  
```js
console.log(app.config); // -> [loggerModule]
app.config = [serverModule, dbModule]; // -> [serverModule, dbModule]
app.config = null; // -> []
app.config = serverModule; // -> [serverModule]
```
<a name="App+options"></a>

### app.options : <code>Object</code>
The options of the app's modules.
Read-write property.
Getting options never return null, at least an empty Object {}.
Setting null or undefined replaces the current options by an empty Object {}.

**Kind**: instance property of <code>[App](#App)</code>  
**Throws**:

- <code>Error</code> ERR_APP_009 if the app is not in created status.
- <code>Error</code> ERR_APP_008 if not an Object

**Access:** public  
**Since**: 1.0.0  
**Author:** nauwep <nauwep.dev@gmail.com>  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [newOptions] | <code>Object</code> | <code>{}</code> | The new options. |

**Example**  
```js
console.log(app.options); // -> {server: {port: 8080}}
app.options = {server: {host: 'localhost'}}; // -> {server: {host: 'localhost'}}
app.options = null; // -> {}
```
<a name="App+status"></a>

### app.status : <code>String</code>
The status of the module.
The value is part of the [supported status](#App.status).

**Kind**: instance property of <code>[App](#App)</code>  
**Access:** public  
**Read only**: true  
**Since**: 1.0.0  
**Author:** nauwep <nauwep.dev@gmail.com>  
**Example**  
```js
console.log(app.status); // -> 'created'
app.status = App.status.RESOLVED; // -> throw Error read-only
```
<a name="App+addOptions"></a>

### app.addOptions([options])
Add options to the app's modules.
Merge with existing options.

**Kind**: instance method of <code>[App](#App)</code>  
**Throws**:

- <code>Error</code> ERR_APP_008 if the options parameter is not an Object.

**Access:** public  
**Since**: 1.0.0  
**Author:** nauwep <nauwep.dev@gmail.com>  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [options] | <code>Object</code> | <code>{}</code> | The options to add. |

**Example**  
```js
console.log(app.options); // -> {server: {port: 8080}}
app.addOptions({server: {host: 'localhost'}}); // -> {server: {port: 8080, host: 'localhost'}}
app.addOptions(null); // -> {server: {port: 8080, host: 'localhost'}}
app.addOptions(); // -> {server: {port: 8080, host: 'localhost'}}
app.addOptions({db: {host: '127.0.0.0'}}); // -> {server: {port: 8080, host: 'localhost'}, db: {host: '127.0.0.0'}}
```
<a name="App+addConfig"></a>

### app.addConfig([...config])
Add modules to the app's configuration.
Merge with existing config and check the new modules and remove duplicates and null.

**Kind**: instance method of <code>[App](#App)</code>  
**Throws**:

- <code>Error</code> ERR_APP_013 if a module is not a Module instance.

**Access:** public  
**Since**: 1.0.0  
**Author:** nauwep <nauwep.dev@gmail.com>  

| Param | Type | Description |
| --- | --- | --- |
| [...config] | <code>[Module](#Module)</code> &#124; <code>[Array.&lt;Module&gt;](#Module)</code> | The modules to add. |

**Example**  
```js
console.log(app.config); // -> [loggerModule]
app.addConfig([serverModule]); // -> [loggerModule, serverModule]
app.addConfig(null); // -> [loggerModule, serverModule]
app.addConfig(); // -> [loggerModule, serverModule]
app.addConfig(socketModule); // -> [loggerModule, serverModule, socketModule]
app.addConfig(socketModule, utilsModule, [dbModule, serverModule]); // -> [loggerModule, serverModule, socketModule, utilsModule, dbModule]
```
<a name="App+event_resolving"></a>

### "resolving"
Resolving event. When the app is about to be resolved.

**Kind**: event emitted by <code>[App](#App)</code>  
**Category**: events  
**Since**: 1.0.0  
<a name="App+event_resolved"></a>

### "resolved"
Resolved event. When the app has been resolved.

**Kind**: event emitted by <code>[App](#App)</code>  
**Category**: events  
**Since**: 1.0.0  
<a name="App+event_setting_up"></a>

### "setting_up"
Setting up event. When the app is about to be setup.

**Kind**: event emitted by <code>[App](#App)</code>  
**Category**: events  
**Since**: 1.0.0  
<a name="App+event_setup"></a>

### "setup"
Setup event. When the app has been setup.

**Kind**: event emitted by <code>[App](#App)</code>  
**Category**: events  
**Since**: 1.0.0  
<a name="App+event_starting"></a>

### "starting"
Starting event. When the app is about to be started.

**Kind**: event emitted by <code>[App](#App)</code>  
**Category**: events  
**Since**: 1.0.0  
<a name="App+event_started"></a>

### "started"
Started event. When the app has been started.

**Kind**: event emitted by <code>[App](#App)</code>  
**Category**: events  
**Since**: 1.0.0  
<a name="App+event_stopping"></a>

### "stopping"
Stopping event. When the app is about to be stopped.

**Kind**: event emitted by <code>[App](#App)</code>  
**Category**: events  
**Since**: 1.0.0  
<a name="App+event_stopped"></a>

### "stopped"
Stopped event. When the app has been stopped.

**Kind**: event emitted by <code>[App](#App)</code>  
**Category**: events  
**Since**: 1.0.0  
<a name="App+event_destroying"></a>

### "destroying"
Destroying event. When the app is about to be destroyed.

**Kind**: event emitted by <code>[App](#App)</code>  
**Category**: events  
**Since**: 1.0.0  
<a name="App+event_destroyed"></a>

### "destroyed"
Destroyed event. When the app has been destroyed.

**Kind**: event emitted by <code>[App](#App)</code>  
**Category**: events  
**Since**: 1.0.0  
<a name="App+resolve"></a>

### app.resolve([callback])
Resolve the dependencies of the modules.
This method is synchronous, callback is not required.

**Kind**: instance method of <code>[App](#App)</code>  
**Category**: lifecycle management  
**Throws**:

- <code>Error</code> ERR_APP_001 if the app is started
- <code>Error</code> ERR_APP_006 in case of dependency cycle
- <code>Error</code> ERR_APP_007 in case of missing module

**Access:** public  
**Since**: 1.0.0  
**Author:** nauwep <nauwep.dev@gmail.com>  

| Param | Type | Description |
| --- | --- | --- |
| [callback] | <code>function</code> | The callback executed after resolving. Raised error is passed as first argument, no other argument: `callback(err)` |

**Example**  
```js
const App = require('modulapp').App;

let serverModule = require('./server.js');
let dbModule = require('./db.js');

let app = new App([serverModule, dbModule]);

app.resolve((err) => {
    console.log('modules resolved!');
});
```
**Example** *(resolve with callback)*  
```js
app.resolve((err) => {
    console.error(err); // -> in case of error in resolve, the error is passed to the callback
});
```
**Example** *(resolve with no callback)*  
```js
try {
    app.resolve();
} catch (err) {
    console.error(err); // -> in case of error in resolve, the error is thrown
}
```
<a name="App+setup"></a>

### app.setup([callback])
Setup every modules following the dependency graph.

**Kind**: instance method of <code>[App](#App)</code>  
**Category**: lifecycle management  
**Access:** public  
**See**: Module#setup  
**Since**: 1.0.0  
**Author:** nauwep <nauwep.dev@gmail.com>  

| Param | Type | Description |
| --- | --- | --- |
| [callback] | <code>function</code> | The callback executed after setting up. Raised error is passed as first argument, no other argument: `callback(err)` |

**Example**  
```js
const App = require('modulapp').App;

let serverModule = require('./server.js');
let dbModule = require('./db.js');

let app = new App([serverModule, dbModule]);

app.setup((err) => {
    console.log('modules setup!');
});
// setup() will resolve() itself if not done before
```
<a name="App+start"></a>

### app.start([callback])
Enable every modules following the dependency graph.

**Kind**: instance method of <code>[App](#App)</code>  
**Category**: lifecycle management  
**Access:** public  
**See**: Module#enable  
**Since**: 1.0.0  
**Author:** nauwep <nauwep.dev@gmail.com>  

| Param | Type | Description |
| --- | --- | --- |
| [callback] | <code>function</code> | The callback executed after starting. Raised error is passed as first argument, no other argument: `callback(err)` |

**Example**  
```js
const App = require('modulapp').App;

let serverModule = require('./server.js');
let dbModule = require('./db.js');

let app = new App([serverModule, dbModule]);

app.start((err) => {
    console.log('app started!');
});
// start() will setup() and resolve() itself if not done before
```
<a name="App+stop"></a>

### app.stop([callback])
Disable every modules following the dependency graph.

**Kind**: instance method of <code>[App](#App)</code>  
**Category**: lifecycle management  
**Access:** public  
**See**: Module#disable  
**Since**: 1.0.0  
**Author:** nauwep <nauwep.dev@gmail.com>  

| Param | Type | Description |
| --- | --- | --- |
| [callback] | <code>function</code> | The callback executed after stopping. Raised error is passed as first argument, no other argument: `callback(err)` |

**Example**  
```js
const App = require('modulapp').App;

let serverModule = require('./server.js');
let dbModule = require('./db.js');

let app = new App([serverModule, dbModule]);

app.start((err) => {
    console.log('app started!');

    // Do some stuff

    app.stop((err) => {
        console.log('app stopped!');
    });
});
// app has to be started to be stopped
```
<a name="App+destroy"></a>

### app.destroy([callback])
Destroy every modules following the dependency graph.

**Kind**: instance method of <code>[App](#App)</code>  
**Category**: lifecycle management  
**Access:** public  
**See**: Module#destroy  
**Since**: 1.0.0  
**Author:** nauwep <nauwep.dev@gmail.com>  

| Param | Type | Description |
| --- | --- | --- |
| [callback] | <code>function</code> | The callback executed after destroying. Raised error is passed as first argument, no other argument: `callback(err)` |

**Example**  
```js
const App = require('modulapp').App;

let serverModule = require('./server.js');
let dbModule = require('./db.js');

let app = new App([serverModule, dbModule]);

app.start((err) => {
    console.log('app started!');

    // Do some stuff

    app.stop((err) => {
        console.log('app stopped!');

        // Do some stuff

        app.destroy((err) => {
            console.log('app destroyed!');
        });
    });
});
// app has to be stopped to be destroyed
```
<a name="App.events"></a>

### App.events : <code>enum</code>
All supported events of App class.

```javascript
{
    RESOLVING: 'resolving',
    RESOLVED: 'resolved',
    SETTING_UP: 'setting_up',
    SETUP: 'setup',
    STARTING: 'starting',
    STARTED: 'started',
    STOPPING: 'stopping',
    STOPPED: 'stopped',
    DESTROYING: 'destroying',
    DESTROYED: 'destroyed'
}
```

**Kind**: static enum of <code>[App](#App)</code>  
**Access:** public  
**Read only**: true  
**Since**: 1.0.0  
**Author:** nauwep <nauwep.dev@gmail.com>  
**Example**  
```js
app.on(App.events.SETUP, () => {
    // define behavior when app has been setup
});
```
<a name="App.status"></a>

### App.status : <code>enum</code>
All supported status of App class.

Don't confuse this static method App.status with the instance method [status](#App+status).

```javascript
{
    CREATED: 'created',
    RESOLVED: 'resolved',
    SETUP: 'setup',
    STARTED: 'started',
    STOPPED: 'stopped'
}
```

**Kind**: static enum of <code>[App](#App)</code>  
**Access:** public  
**Read only**: true  
**Since**: 1.0.0  
**Author:** nauwep <nauwep.dev@gmail.com>  
**Example**  
```js
if (app.status === App.status.ENABLED) {
    app.foo();
}
```
<a name="Module"></a>

## Module ⇐ <code>EventEmitter</code>
Class representing a Module.

**Kind**: global class  
**Extends:** <code>EventEmitter</code>  
**Emits**: <code>[setting_up](#Module+event_setting_up)</code>, <code>[setup](#Module+event_setup)</code>, <code>[enabling](#Module+event_enabling)</code>, <code>[enabled](#Module+event_enabled)</code>, <code>[disabling](#Module+event_disabling)</code>, <code>[disabled](#Module+event_disabled)</code>, <code>[destroying](#Module+event_destroying)</code>, <code>[destroyed](#Module+event_destroyed)</code>  
**Access:** public  
**Since**: 1.0.0  
**Author:** nauwep <nauwep.dev@gmail.com>  

* [Module](#Module) ⇐ <code>EventEmitter</code>
    * [new Module(id, [initialOptions])](#new_Module_new)
    * _instance_
        * [.id](#Module+id) : <code>String</code>
        * [.status](#Module+status) : <code>String</code>
        * [.version](#Module+version) : <code>String</code>
        * [.options](#Module+options) : <code>Object</code>
        * [.dependencies](#Module+dependencies) : <code>Array.&lt;String&gt;</code>
        * [.addOptions([options])](#Module+addOptions)
        * [.addDependencies([...dependencies])](#Module+addDependencies)
        * _events_
            * ["setting_up"](#Module+event_setting_up)
            * ["setup"](#Module+event_setup)
            * ["enabling"](#Module+event_enabling)
            * ["enabled"](#Module+event_enabled)
            * ["disabling"](#Module+event_disabling)
            * ["disabled"](#Module+event_disabled)
            * ["destroying"](#Module+event_destroying)
            * ["destroyed"](#Module+event_destroyed)
        * _lifecycle hooks_
            * [.setup(app, options, imports, done)](#Module+setup)
            * [.enable(app, options, imports, done)](#Module+enable)
            * [.disable(app, options, imports, done)](#Module+disable)
            * [.destroy(app, options, imports, done)](#Module+destroy)
    * _static_
        * [.events](#Module.events) : <code>enum</code>
        * [.status](#Module.status) : <code>enum</code>

<a name="new_Module_new"></a>

### new Module(id, [initialOptions])
Create a new instance of Module.The id parameter is required, it could be either a String or an Object representing the package.json.In case of the package.json is provided, the id, version, dependencies and options will be extracted from this Object.

**Throws**:

- <code>Error</code> ERR_MOD_001 if the id parameter is null or undefined
- <code>Error</code> ERR_MOD_005 if something wrong on the dependency


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| id | <code>String</code> &#124; <code>Object</code> |  | Either a String id of the module or an Object representing the package.json |
| [initialOptions] | <code>Object</code> | <code>{}</code> | Options for the module |

**Example**  
```js
const Module = require('modulapp').Module;let myModule = new Module('myModule');myModule.foo = 'foo';myModule.bar = function() {    // this is a custom method};myModule.setup = function(app, options, imports, done) {    // this is overriding the setup  method    let logger = imports.logger;    logger.log('setting up myModule');    done(null);};module.exports = myModule;
```
**Example** *(constructor with a String argument)*  
```js

const Module = require('modulapp').Module;
let myModule = new Module('myModule');
console.log(myModule.id); // -> 'myModule'
console.log(myModule.status); // -> 'created'
console.log(myModule.version); // -> undefined
console.log(myModule.options); // -> {}
console.log(myModule.dependencies); // -> []
```
**Example** *(constructor with a Object argument)*  
```js

const packagejson = require('package.json');
// {
//    name: 'myModule',
//    version: '1.0.0',
//    module: {
//      dependencies: ['logger'],
//      options: {
//        port: 8080
//      }
//    }
// }

const Module = require('modulapp').Module;
let myModule = new Module('myModule');
console.log(myModule.id); // -> 'myModule'
console.log(myModule.status); //  ->'created'
console.log(myModule.version); // -> '1.0.0'
console.log(myModule.options); // -> {port: 8080}
console.log(myModule.dependencies); // -> ['logger']
```
<a name="Module+id"></a>

### module.id : <code>String</code>
The id of the module.

**Kind**: instance property of <code>[Module](#Module)</code>  
**Access:** public  
**Read only**: true  
**Since**: 1.0.0  
**Author:** nauwep <nauwep.dev@gmail.com>  
**Example**  
```js
console.log(myModule.id); // -> 'myModule'myModule.id = 'anotherId'; // -> throw Error read-only
```
<a name="Module+status"></a>

### module.status : <code>String</code>
The status of the module.The value is part of the [supported status](#Module.status).

**Kind**: instance property of <code>[Module](#Module)</code>  
**Access:** public  
**Read only**: true  
**Since**: 1.0.0  
**Author:** nauwep <nauwep.dev@gmail.com>  
**Example**  
```js
console.log(myModule.status); // -> 'created'myModule.status = Module.status.SETUP; // -> throw Error read-only
```
<a name="Module+version"></a>

### module.version : <code>String</code>
The version of the module.

**Kind**: instance property of <code>[Module](#Module)</code>  
**Access:** public  
**Read only**: true  
**Since**: 1.0.0  
**Author:** nauwep <nauwep.dev@gmail.com>  
**Example**  
```js
console.log(myModule.version); // -> '1.0.0'myModule.version = '1.0.1'; // -> throw Error read-only
```
<a name="Module+options"></a>

### module.options : <code>Object</code>
The options of the module.Getting options never return null, at least an empty Object {}.Setting null or undefined replaces the current options by an empty Object {}.

**Kind**: instance property of <code>[Module](#Module)</code>  
**Throws**:

- <code>Error</code> ERR_MOD_002 if the module is not in created status
- <code>Error</code> ERR_MOD_004 if not an Object

**Access:** public  
**Since**: 1.0.0  
**Author:** nauwep <nauwep.dev@gmail.com>  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [newOptions] | <code>Object</code> | <code>{}</code> | The new options |

**Example**  
```js
console.log(myModule.options); // -> {port: 8080}myModule.options = {host: 'localhost'}; // -> {host: 'localhost'}myModule.options = null; // -> {}
```
<a name="Module+dependencies"></a>

### module.dependencies : <code>Array.&lt;String&gt;</code>
The dependencies of the module.Getting dependencies never return null, at least an empty Array [].Setting null or undefined replaces the current config by an empty Array [].Setting a String will build an Array with that single String.

**Kind**: instance property of <code>[Module](#Module)</code>  
**Throws**:

- <code>Error</code> ERR_MOD_003 if the module is not in [created status](#Module+status)
- <code>Error</code> ERR_MOD_005 if a non-String dependency is found

**Access:** public  
**Since**: 1.0.0  
**Author:** nauwep <nauwep.dev@gmail.com>  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [newDependencies] | <code>String</code> &#124; <code>Array.&lt;String&gt;</code> | <code>[]</code> | The new dependencies |

**Example**  
```js
console.log(myModule.dependencies); // -> ['logger']myModule.dependencies = ['server', 'db']; // -> ['server', 'db']myModule.dependencies = null; // -> []myModule.dependencies = 'server'; // -> ['server']
```
<a name="Module+addOptions"></a>

### module.addOptions([options])
Add options to the module.Merge with existing options.

**Kind**: instance method of <code>[Module](#Module)</code>  
**Throws**:

- <code>Error</code> ERR_MOD_004 if the options parameter is not an Object

**Access:** public  
**Since**: 1.0.0  
**Author:** nauwep <nauwep.dev@gmail.com>  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [options] | <code>Object</code> | <code>{}</code> | The options to add |

**Example**  
```js
console.log(myModule.options); // -> {port: 8080}myModule.addOptions({host: 'localhost'}); // -> {port: 8080, host: 'localhost'}myModule.addOptions(null); // -> {port: 8080, host: 'localhost'}myModule.addOptions(); // -> {port: 8080, host: 'localhost'}
```
<a name="Module+addDependencies"></a>

### module.addDependencies([...dependencies])
Add dependencies to the module.Merge with existing dependencies and check the new dependencies, flatten the Array and remove duplicates and null.

**Kind**: instance method of <code>[Module](#Module)</code>  
**Throws**:

- <code>Error</code> ERR_MOD_005 if a non-String dependency is found

**Access:** public  
**Since**: 1.0.0  
**Author:** nauwep <nauwep.dev@gmail.com>  

| Param | Type | Description |
| --- | --- | --- |
| [...dependencies] | <code>String</code> &#124; <code>Array.&lt;String&gt;</code> | The dependencies to add |

**Example**  
```js
console.log(myModule.dependencies); // -> ['logger']myModule.addDependencies(['server']); // -> ['logger', 'server']myModule.addDependencies(null); // -> ['logger', 'server']myModule.addDependencies(); // -> ['logger', 'server']myModule.addDependencies('socket'); // -> ['logger', 'server', 'socket']myModule.addDependencies('socket', 'utils', ['db', 'server']); // -> ['logger', 'server', 'socket', 'utils', 'db']
```
<a name="Module+event_setting_up"></a>

### "setting_up"
Setting up event. When the module is beginning its setup.

**Kind**: event emitted by <code>[Module](#Module)</code>  
**Category**: events  
<a name="Module+event_setup"></a>

### "setup"
Setup event. When the module has been setup.

**Kind**: event emitted by <code>[Module](#Module)</code>  
**Category**: events  
<a name="Module+event_enabling"></a>

### "enabling"
Enabling event. When the module is about to be enabled.

**Kind**: event emitted by <code>[Module](#Module)</code>  
**Category**: events  
<a name="Module+event_enabled"></a>

### "enabled"
Enabled event. When the module has been enabled.

**Kind**: event emitted by <code>[Module](#Module)</code>  
**Category**: events  
<a name="Module+event_disabling"></a>

### "disabling"
Disabling event. When the module is about to be disabled.

**Kind**: event emitted by <code>[Module](#Module)</code>  
**Category**: events  
<a name="Module+event_disabled"></a>

### "disabled"
Disabled event. When the module has been disabled.

**Kind**: event emitted by <code>[Module](#Module)</code>  
**Category**: events  
<a name="Module+event_destroying"></a>

### "destroying"
Destroying event. When the module is about to be destroyed.

**Kind**: event emitted by <code>[Module](#Module)</code>  
**Category**: events  
<a name="Module+event_destroyed"></a>

### "destroyed"
Destroyed event. When the module has been destroyed.

**Kind**: event emitted by <code>[Module](#Module)</code>  
**Category**: events  
<a name="Module+setup"></a>

### module.setup(app, options, imports, done)
The setup function of the module.Executed while the app is being setup.Could be overriden, does nothing by default.Once the app is resolved, this method is not available anymore.

**Kind**: instance method of <code>[Module](#Module)</code>  
**Category**: lifecycle hooks  
**Access:** public  
**Since**: 1.0.0  
**Author:** nauwep <nauwep.dev@gmail.com>  

| Param | Type | Description |
| --- | --- | --- |
| app | <code>[App](#App)</code> | The App instance |
| options | <code>Object</code> | The options of the module |
| imports | <code>Object</code> | The dependencies of the module |
| done | <code>function</code> | Callback to return passing any error as first argument done(err) |

**Example**  
```js
const Module = require('modulapp').Module;let myModule = new Module('myModule');// override the default setup functionmyModule.setup = function(app, options, imports, done) {   // place your custom code to be executed when myModule is setup}
```
<a name="Module+enable"></a>

### module.enable(app, options, imports, done)
The enable function of the module.Executed while the app is being started.Could be overriden, does nothing by default.Once the app is resolved, this method is not available anymore.

**Kind**: instance method of <code>[Module](#Module)</code>  
**Category**: lifecycle hooks  
**Access:** public  
**Since**: 1.0.0  
**Author:** nauwep <nauwep.dev@gmail.com>  

| Param | Type | Description |
| --- | --- | --- |
| app | <code>[App](#App)</code> | The App instance |
| options | <code>Object</code> | The options of the module |
| imports | <code>Object</code> | The dependencies of the module |
| done | <code>function</code> | Callback to return passing any error as first argument done(err) |

**Example**  
```js
const Module = require('modulapp').Module;let myModule = new Module('myModule');// override the default enable functionmyModule.enable = function(app, options, imports, done) {   // place your custom code to be executed when myModule is enable}
```
<a name="Module+disable"></a>

### module.disable(app, options, imports, done)
The disable function of the module.Executed while the app is being stopped.Could be overriden, does nothing by default.Once the app is resolved, this method is not available anymore.

**Kind**: instance method of <code>[Module](#Module)</code>  
**Category**: lifecycle hooks  
**Access:** public  
**Since**: 1.0.0  
**Author:** nauwep <nauwep.dev@gmail.com>  

| Param | Type | Description |
| --- | --- | --- |
| app | <code>[App](#App)</code> | The App instance |
| options | <code>Object</code> | The options of the module |
| imports | <code>Object</code> | The dependencies of the module |
| done | <code>function</code> | Callback to return passing any error as first argument done(err) |

**Example**  
```js
const Module = require('modulapp').Module;let myModule = new Module('myModule');// override the default disable functionmyModule.disable = function(app, options, imports, done) {   // place your custom code to be executed when myModule is disabled}
```
<a name="Module+destroy"></a>

### module.destroy(app, options, imports, done)
The destroy function of the module.Executed while the app is being destroyed.Could be overriden, does nothing by default.Once the app is resolved, this method is not available anymore.

**Kind**: instance method of <code>[Module](#Module)</code>  
**Category**: lifecycle hooks  
**Access:** public  
**Since**: 1.0.0  
**Author:** nauwep <nauwep.dev@gmail.com>  

| Param | Type | Description |
| --- | --- | --- |
| app | <code>[App](#App)</code> | The App instance |
| options | <code>Object</code> | The options of the module |
| imports | <code>Object</code> | The dependencies of the module |
| done | <code>function</code> | Callback to return passing any error as first argument done(err) |

**Example**  
```js
const Module = require('modulapp').Module;let myModule = new Module('myModule');// override the default destroy functionmyModule.destroy = function(app, options, imports, done) {   // place your custom code to be executed when myModule is destroyed}
```
<a name="Module.events"></a>

### Module.events : <code>enum</code>
All supported events of Module class.```javascript{    SETTING_UP: 'setting_up',    SETUP: 'setup',    ENABLING: 'enabling',    ENABLED: 'enabled',    DISABLING: 'disabling',    DISABLED: 'disabled',    DESTROYING: 'destroying',    DESTROYED: 'destroyed'}```

**Kind**: static enum of <code>[Module](#Module)</code>  
**Access:** public  
**Read only**: true  
**Since**: 1.0.0  
**Author:** nauwep <nauwep.dev@gmail.com>  
**Example**  
```js
myModule.on(Module.events.SETUP, () => {    // define behavior when myModule has been setup});
```
<a name="Module.status"></a>

### Module.status : <code>enum</code>
All supported status of Module class.Don't confuse this static method Module.status with the instance method [status](#Module+status).```javascript{    CREATED: 'created',    SETUP: 'setup',    ENABLED: 'enabled',    DISABLED: 'disabled',    DESTROYED: 'destroyed'}```

**Kind**: static enum of <code>[Module](#Module)</code>  
**Access:** public  
**Read only**: true  
**Since**: 1.0.0  
**Author:** nauwep <nauwep.dev@gmail.com>  
**Example**  
```js
if (myModule.status === Module.status.ENABLED) {    myModule.foo();}
```

* * *

## License

[MIT](https://github.com/modulapp/modulapp/blob/master/LICENSE.md)

## Classes

<dl>
<dt><a href="#App">App</a> ⇐ <code>EventEmitter</code></dt>
<dd><p>Class representing an App.</p>
</dd>
<dt><a href="#Module">Module</a> ⇐ <code>EventEmitter</code></dt>
<dd><p>Class representing a Module.</p>
</dd>
<dt><a href="#ModuleWrapper">ModuleWrapper</a> ⇐ <code>EventEmitter</code> ℗</dt>
<dd><p>Class representing a ModuleWrapper.</p>
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
        * [.graph](#App+graph) : <code>DepGraph</code> ℗
        * [.options](#App+options) : <code>Object</code>
        * [.status](#App+status) : <code>String</code>
        * [.addOptions([options])](#App+addOptions)
        * [.addConfig([...config])](#App+addConfig)
        * [._changeStatus(newStatus)](#App+_changeStatus) ℗
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
<a name="App+graph"></a>

### app.graph : <code>DepGraph</code> ℗
The module dependency graph of the app.
Using [dependency-graph package](https://www.npmjs.com/package/dependency-graph) to help resolve the dependency tree of the modules.
Getting graph never return null, at least an empty graph once the app has not been resolved yet.

**Kind**: instance property of <code>[App](#App)</code>  
**Access:** private  
**Read only**: true  
**Since**: 1.0.0  
**Author:** nauwep <nauwep.dev@gmail.com>  
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
<a name="App+_changeStatus"></a>

### app._changeStatus(newStatus) ℗
Change the status of the app.

**Kind**: instance method of <code>[App](#App)</code>  
**Throws**:

- <code>Error</code> ERR_APP_015 if the status is not a [supported status](#App.status).

**Access:** private  
**Since**: 1.0.0  
**Author:** nauwep <nauwep.dev@gmail.com>  

| Param | Type | Description |
| --- | --- | --- |
| newStatus | <code>String</code> | The new status to set. |

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
        * [.package](#Module+package) : <code>Object</code> ℗
        * [.addOptions([options])](#Module+addOptions)
        * [.addDependencies([...dependencies])](#Module+addDependencies)
        * [._changeStatus(newStatus, wrapper)](#Module+_changeStatus) ℗
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
<a name="Module+package"></a>

### module.package : <code>Object</code> ℗
The package of the module.

**Kind**: instance property of <code>[Module](#Module)</code>  
**Access:** private  
**Read only**: true  
**Since**: 1.0.0  
**Author:** nauwep <nauwep.dev@gmail.com>  
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
<a name="Module+_changeStatus"></a>

### module._changeStatus(newStatus, wrapper) ℗
Change the status of the module.

**Kind**: instance method of <code>[Module](#Module)</code>  
**Throws**:

- <code>Error</code> ERR_MOD_014 if the wrapper parameter is not provided or is not a ModuleWrapper instance
- <code>Error</code> ERR_MOD_013 if the status is not a [supported status](#Module.status)

**Access:** private  
**Since**: 1.0.0  
**Author:** nauwep <nauwep.dev@gmail.com>  

| Param | Type | Description |
| --- | --- | --- |
| newStatus | <code>String</code> | The new status to set |
| wrapper | <code>[ModuleWrapper](#ModuleWrapper)</code> | The wrapper of the module |

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
<a name="ModuleWrapper"></a>

## ModuleWrapper ⇐ <code>EventEmitter</code> ℗
Class representing a ModuleWrapper.

**Kind**: global class  
**Extends:** <code>EventEmitter</code>  
**Access:** private  
**Since**: 1.0.0  
**Author:** nauwep <nauwep.dev@gmail.com>  

* [ModuleWrapper](#ModuleWrapper) ⇐ <code>EventEmitter</code> ℗
    * [new ModuleWrapper(_module, _app, [_options], [_imports])](#new_ModuleWrapper_new)
    * [.module](#ModuleWrapper+module) : <code>[Module](#Module)</code> ℗
    * [.app](#ModuleWrapper+app) : <code>[App](#App)</code> ℗
    * [.imports](#ModuleWrapper+imports) : <code>Object</code> ℗
    * [.id](#ModuleWrapper+id) : <code>String</code> ℗
    * [.version](#ModuleWrapper+version) : <code>String</code> ℗
    * [.status](#ModuleWrapper+status) : <code>String</code> ℗
    * [.options](#ModuleWrapper+options) : <code>Object</code> ℗
    * [.package](#ModuleWrapper+package) : <code>Object</code> ℗
    * [.dependencies](#ModuleWrapper+dependencies) : <code>Array.&lt;String&gt;</code> ℗
    * [._initialFuncSetup](#ModuleWrapper+_initialFuncSetup) : <code>function</code> ℗
    * [.setup](#ModuleWrapper+setup) : <code>function</code> ℗
    * [._initialFuncEnable](#ModuleWrapper+_initialFuncEnable) : <code>function</code> ℗
    * [.enable](#ModuleWrapper+enable) : <code>function</code> ℗
    * [._initialFuncDisable](#ModuleWrapper+_initialFuncDisable) : <code>function</code> ℗
    * [.disable](#ModuleWrapper+disable) : <code>function</code> ℗
    * [._initialFuncDestroy](#ModuleWrapper+_initialFuncDestroy) : <code>function</code> ℗
    * [.destroy](#ModuleWrapper+destroy) : <code>function</code> ℗
    * [.addOptions([newOptions])](#ModuleWrapper+addOptions) ℗
    * [.addImports([newImports])](#ModuleWrapper+addImports) ℗
    * [.setupModule(done)](#ModuleWrapper+setupModule) ℗
    * [.enableModule(done)](#ModuleWrapper+enableModule) ℗
    * [.disableModule(done)](#ModuleWrapper+disableModule) ℗
    * [.destroyModule(done)](#ModuleWrapper+destroyModule) ℗

<a name="new_ModuleWrapper_new"></a>

### new ModuleWrapper(_module, _app, [_options], [_imports])
Create a new instance of ModuleWrapper.

**Throws**:

- <code>Error</code> ERR_MOD_006 if _module or _app are null or undefined
- <code>Error</code> ERR_MOD_007 if _module is not an instance of [Module](#Module)
- <code>Error</code> ERR_MOD_008 if _app is not an instance of [App](#App)


| Param | Type | Description |
| --- | --- | --- |
| _module | <code>[Module](#Module)</code> | The module to wrap |
| _app | <code>[App](#App)</code> | The reference to the app |
| [_options] | <code>Object</code> | The options of the module |
| [_imports] | <code>Object</code> | The dependencies of the module |

<a name="ModuleWrapper+module"></a>

### moduleWrapper.module : <code>[Module](#Module)</code> ℗
The [Module](#Module) instance to wrap.

**Kind**: instance property of <code>[ModuleWrapper](#ModuleWrapper)</code>  
**Access:** private  
**Since**: 1.0.0  
<a name="ModuleWrapper+app"></a>

### moduleWrapper.app : <code>[App](#App)</code> ℗
The app managing the module.

**Kind**: instance property of <code>[ModuleWrapper](#ModuleWrapper)</code>  
**Access:** private  
**Since**: 1.0.0  
<a name="ModuleWrapper+imports"></a>

### moduleWrapper.imports : <code>Object</code> ℗
The list of dependencies of the module.
A dependency is accessed by its id as key of this imports object.
Dependencies are instance of Module.

**Kind**: instance property of <code>[ModuleWrapper](#ModuleWrapper)</code>  
**Access:** private  
**Since**: 1.0.0  
<a name="ModuleWrapper+id"></a>

### moduleWrapper.id : <code>String</code> ℗
The id of the module.

**Kind**: instance property of <code>[ModuleWrapper](#ModuleWrapper)</code>  
**Access:** private  
**Since**: 1.0.0  
<a name="ModuleWrapper+version"></a>

### moduleWrapper.version : <code>String</code> ℗
The version of the module.

**Kind**: instance property of <code>[ModuleWrapper](#ModuleWrapper)</code>  
**Access:** private  
**Since**: 1.0.0  
<a name="ModuleWrapper+status"></a>

### moduleWrapper.status : <code>String</code> ℗
The status of the moduleWrapper.
The value is part of the [supported status](#Module.status).

**Kind**: instance property of <code>[ModuleWrapper](#ModuleWrapper)</code>  
**Access:** private  
**Since**: 1.0.0  
<a name="ModuleWrapper+options"></a>

### moduleWrapper.options : <code>Object</code> ℗
The consolidated options for the module.

**Kind**: instance property of <code>[ModuleWrapper](#ModuleWrapper)</code>  
**Access:** private  
**Since**: 1.0.0  
<a name="ModuleWrapper+package"></a>

### moduleWrapper.package : <code>Object</code> ℗
The package.json information from the module.

**Kind**: instance property of <code>[ModuleWrapper](#ModuleWrapper)</code>  
**Access:** private  
**Since**: 1.0.0  
<a name="ModuleWrapper+dependencies"></a>

### moduleWrapper.dependencies : <code>Array.&lt;String&gt;</code> ℗
The list of dependency ids from the module.

**Kind**: instance property of <code>[ModuleWrapper](#ModuleWrapper)</code>  
**Access:** private  
**Since**: 1.0.0  
<a name="ModuleWrapper+_initialFuncSetup"></a>

### moduleWrapper._initialFuncSetup : <code>function</code> ℗
Keep the initial [setup](#Module+setup) Function of the module.

**Kind**: instance property of <code>[ModuleWrapper](#ModuleWrapper)</code>  
**Access:** private  
**Since**: 1.0.0  
<a name="ModuleWrapper+setup"></a>

### moduleWrapper.setup : <code>function</code> ℗
Create a setup Function at wrapper level to call the [setup](#Module+setup) Function of the module with predefined parameters.

**Kind**: instance property of <code>[ModuleWrapper](#ModuleWrapper)</code>  
**Access:** private  
**Since**: 1.0.0  
<a name="ModuleWrapper+_initialFuncEnable"></a>

### moduleWrapper._initialFuncEnable : <code>function</code> ℗
Keep the initial [enable](#Module+enable) Function of the module.

**Kind**: instance property of <code>[ModuleWrapper](#ModuleWrapper)</code>  
**Access:** private  
**Since**: 1.0.0  
<a name="ModuleWrapper+enable"></a>

### moduleWrapper.enable : <code>function</code> ℗
Create a enable Function at wrapper level to call the [enable](#Module+enable) Function of the module with predefined parameters.

**Kind**: instance property of <code>[ModuleWrapper](#ModuleWrapper)</code>  
**Access:** private  
**Since**: 1.0.0  
<a name="ModuleWrapper+_initialFuncDisable"></a>

### moduleWrapper._initialFuncDisable : <code>function</code> ℗
Keep the initial [disable](#Module+disable) Function of the module.

**Kind**: instance property of <code>[ModuleWrapper](#ModuleWrapper)</code>  
**Access:** private  
**Since**: 1.0.0  
<a name="ModuleWrapper+disable"></a>

### moduleWrapper.disable : <code>function</code> ℗
Create a disable Function at wrapper level to call the [disable](#Module+disable) Function of the module with predefined parameters.

**Kind**: instance property of <code>[ModuleWrapper](#ModuleWrapper)</code>  
**Access:** private  
**Since**: 1.0.0  
<a name="ModuleWrapper+_initialFuncDestroy"></a>

### moduleWrapper._initialFuncDestroy : <code>function</code> ℗
Keep the initial [destroy](#Module+destroy) Function of the module.

**Kind**: instance property of <code>[ModuleWrapper](#ModuleWrapper)</code>  
**Access:** private  
**Since**: 1.0.0  
<a name="ModuleWrapper+destroy"></a>

### moduleWrapper.destroy : <code>function</code> ℗
Create a destroy Function at wrapper level to call the [destroy](#Module+destroy) Function of the module with predefined parameters.

**Kind**: instance property of <code>[ModuleWrapper](#ModuleWrapper)</code>  
**Access:** private  
**Since**: 1.0.0  
<a name="ModuleWrapper+addOptions"></a>

### moduleWrapper.addOptions([newOptions]) ℗
Add options to the moduleWrapper.
Merge with existing options.
Options are passed to the module in the different lifecycle hook functions.

**Kind**: instance method of <code>[ModuleWrapper](#ModuleWrapper)</code>  
**Throws**:

- <code>Error</code> ERR_MOD_004 if the options parameter is not an Object
- <code>Error</code> ERR_MOD_010 if not in created status

**Access:** private  
**Since**: 1.0.0  
**Author:** nauwep <nauwep.dev@gmail.com>  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [newOptions] | <code>Object</code> | <code>{}</code> | The options to add |

<a name="ModuleWrapper+addImports"></a>

### moduleWrapper.addImports([newImports]) ℗
Add imports to the moduleWrapper.
Merge the existing imports.
Imports are passed to the module in the different lifecycle hook functions.

```javascript
// example of imports object
{
    logger: loggerModule,
    server: serverModule
}
```

**Kind**: instance method of <code>[ModuleWrapper](#ModuleWrapper)</code>  
**Throws**:

- <code>Error</code> ERR_MOD_009 if the imports parameter is not an Object
- <code>Error</code> ERR_MOD_011 if not in created status
- <code>Error</code> ERR_MOD_012 if a value of the imports Object is not a Module instance

**Access:** private  
**Since**: 1.0.0  
**Author:** nauwep <nauwep.dev@gmail.com>  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [newImports] | <code>Object</code> | <code>{}</code> | The imports Object to add |

<a name="ModuleWrapper+setupModule"></a>

### moduleWrapper.setupModule(done) ℗
Execute the [setup](#ModuleWrapper+setup) function, check the status and emit events.

**Kind**: instance method of <code>[ModuleWrapper](#ModuleWrapper)</code>  
**Throws**:

- <code>Error</code> ERR_MOD_015 if not in created status

**Access:** private  
**Since**: 1.0.0  
**Author:** nauwep <nauwep.dev@gmail.com>  

| Param | Type | Description |
| --- | --- | --- |
| done | <code>function</code> | Callback executed at the end of the execution or if any error |

<a name="ModuleWrapper+enableModule"></a>

### moduleWrapper.enableModule(done) ℗
Execute the [enable](#ModuleWrapper+enable) function, check the status and emit events.

**Kind**: instance method of <code>[ModuleWrapper](#ModuleWrapper)</code>  
**Throws**:

- <code>Error</code> ERR_MOD_016 if not in setup status

**Access:** private  
**Since**: 1.0.0  
**Author:** nauwep <nauwep.dev@gmail.com>  

| Param | Type | Description |
| --- | --- | --- |
| done | <code>function</code> | Callback executed at the end of the execution or if any error |

<a name="ModuleWrapper+disableModule"></a>

### moduleWrapper.disableModule(done) ℗
Execute the [disable](#ModuleWrapper+disable) function, check the status and emit events.

**Kind**: instance method of <code>[ModuleWrapper](#ModuleWrapper)</code>  
**Throws**:

- <code>Error</code> ERR_MOD_016 if not in enabled status

**Access:** private  
**Since**: 1.0.0  
**Author:** nauwep <nauwep.dev@gmail.com>  

| Param | Type | Description |
| --- | --- | --- |
| done | <code>function</code> | Callback executed at the end of the execution or if any error |

<a name="ModuleWrapper+destroyModule"></a>

### moduleWrapper.destroyModule(done) ℗
Execute the [destroy](#ModuleWrapper+destroy) function, check the status and emit events.

**Kind**: instance method of <code>[ModuleWrapper](#ModuleWrapper)</code>  
**Throws**:

- <code>Error</code> ERR_MOD_016 if not in disabled status

**Access:** private  
**Since**: 1.0.0  
**Author:** nauwep <nauwep.dev@gmail.com>  

| Param | Type | Description |
| --- | --- | --- |
| done | <code>function</code> | Callback executed at the end of the execution or if any error |


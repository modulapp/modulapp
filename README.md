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

This is a framework for defining application in a modular way.
Modulapp is providing an `App` class and a `Module` class to be instanciated.

The differents Module instances contain the behavior of your app.

The App manages the dependencies and the lifecycle of the modules.

## Example

### Module

    // myModule.js
    const Module = require('modulapp').Module;
    let myModule = new Module("myModule");
    module.exports = myModule;

### App

    // app.js
    const App = require('modulapp').App;
    let myModule = require('./myModule');
    let app = new App([myModule]);

## License

[MIT](https://github.com/modulapp/modulapp/blob/master/LICENSE.md)

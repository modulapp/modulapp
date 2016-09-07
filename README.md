# Modulapp

[![Build Status](https://travis-ci.org/modulapp/modulapp.svg?branch=master)](https://travis-ci.org/modulapp/modulapp)

Modular application framework for node.js

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

    [MIT](LICENSE)

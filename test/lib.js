"use strict";

const Module = require('../lib/modulapp').Module;
const ModuleWrapper = require('../lib/modulapp')._ModuleWrapper;
const App = require('../lib/modulapp').App;

require('./src/module')(Module, ModuleWrapper, App);
require('./src/moduleWrapper')(Module, ModuleWrapper, App);
require('./src/app')(Module, ModuleWrapper, App);

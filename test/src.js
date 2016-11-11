"use strict";

const Module = require('../src/module');
const ModuleWrapper = require('../src/moduleWrapper');
const App = require('../src/app');

require('./src/module')(Module, ModuleWrapper, App);
require('./src/moduleWrapper')(Module, ModuleWrapper, App);
require('./src/app')(Module, ModuleWrapper, App);

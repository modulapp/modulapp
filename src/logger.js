"use strict";

const _ = require('lodash');
const winston = require('winston');

module.exports = function(label = 'modulapp', level = 'silent') {

    let silent = false;
    if (_.isNull(level) || level === 'silent') {
        silent = true;
    }

    return new(winston.Logger)({
        transports: [
            new(winston.transports.Console)({
                level: level,
                silent: silent,
                colorize: true,
                timestamp: true,
                label: label,
                prettyPrint: true,
                depth: 0
            })
        ]
    });
};

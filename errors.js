const _ = require('lodash');

const errorsList = require('./errors.json');

let errors = {};

_.forEach(errorsList, (errorDefinition) => {
    let error = new Error(`${errorDefinition.code} - ${errorDefinition.message}`);
    error.code = errorDefinition.code;
    errors[errorDefinition.code] = error;
});

module.exports = errors;

/**
{
    ERR_APP_001: new Error(
        'ERR_APP_001 - App already started, stop the app before resolving again.'),
    ERR_APP_002: new Error(
        'ERR_APP_002 - App already started, stop the app before setting up again.'),
    ERR_APP_003: new Error(
        'ERR_APP_003 - App already started, stop the app before starting again.'),
    ERR_APP_004: new Error('ERR_APP_004 - App not started cannot be stopped.'),

    ERR_MOD_001: new Error('ERR_MOD_001 - The module id must be provided')
};
*/

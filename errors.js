const _ = require('lodash');

const errorsList = require('./resources/errors.json');

let errors = {};

_.forEach(errorsList, (errorDefinition) => {
    let error = new Error(`${errorDefinition.code} - ${errorDefinition.message}`);
    error.code = errorDefinition.code;
    errors[errorDefinition.code] = error;
});

module.exports = errors;

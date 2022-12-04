'use strict'
const { getCode, getName } = require('country-list');

module.exports = (joi) => {
    return {
        type: 'string',
        base: joi.string(),
        messages: {
            country: '{{#label}}  must be a valid country',
        },
        coerce(value, helpers) {},
        validate(value, helpers) {
            if (helpers.schema.$_getFlag('country') && getCode(value) === undefined) {
                return { value, errors: helpers.error('country') };
            }
        },
        rules: {
            country: {
                alias: 'country',
                method() {
                    return this.$_setFlag('country', true);
                }
            }
        }
    }
};

const Joi = require('joi');
const countryValidator = require('./index');
const joi = Joi.extend(countryValidator);

const test2 = { country: 'ch' };

const schema = joi.object().keys({
    country: joi.string().country(),
})


const { value, error } = Joi.compile(schema)
    .prefs({ errors: { label: 'key' } })
    .validate(test2);

console.log({ value, error});


# joi-country
A simple joi extension to validate countries

# Features
- validates country strings

# Installation
```
npm install joi-country

or

yarn add joi-country
```

# Usage
```
const joi = require('joi');
const joi-country = require('joi-country');

const Joi = joi.extend(joi-counry);

const test2 = { country: 'ch' };

const schema = joi.object().keys({
    country: joi.string().country(),
})


const { value, error } = Joi.compile(schema)
    .prefs({ errors: { label: 'key' } })
    .validate(test2);

console.log({ value, error});
```

# Support 
it will a plus if we get enough donationation so I can continue creating small and meaningful packages

<a href="https://www.buymeacoffee.com/truestbyheart" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/default-orange.png" alt="Buy Me A Coffee" height="41" width="174"></a>
# License
MIT license

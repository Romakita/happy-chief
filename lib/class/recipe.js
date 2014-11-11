"use strict";

module.exports = require('./../utils/mongoose-utils')
    .createModel('Recipe', require('./../schemes/recipe'), require('./../implements/recipe'));
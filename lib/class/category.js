"use strict";

module.exports = require('./../utils/mongoose-utils')
    .createModel('Category', require('./../schemes/category'), require('./../implements/category'));
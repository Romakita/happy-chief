/**
 * Created by romain.lenzotti on 02/06/2014.
 */
"use strict";

module.exports = require('./../utils/mongoose-utils')
    .createModel('Bookmark', require('./../schemes/bookmark'), require('./../implements/bookmark'));

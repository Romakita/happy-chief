"use strict";

var mongoose =      require('./../utils/mongoose-utils');
var bcrypt   =      require('bcrypt-nodejs');

module.exports = mongoose.createModel('User', require('./../schemes/user'), require('./../implements/user'));

mongoose.extend(module.exports.prototype, {
    validPassword: function (password) {
        return bcrypt.compareSync(password, this.password);
    }
});
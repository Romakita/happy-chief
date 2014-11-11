var mongoose = require('mongoose');
/**
 *
 * @type Object
 */
module.exports = {
    _user:       {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    _recipe:     {type: mongoose.Schema.Types.ObjectId, ref: 'Recipe'},
    un:          {type:String, unique:true},
    dateCreate:  {type: Date, default: Date.now}
};
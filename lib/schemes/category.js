
module.exports = {
    id:     {type:Number},
    label:  {type:String, unique:true},
    enabled:{type:Boolean, default:false}
};
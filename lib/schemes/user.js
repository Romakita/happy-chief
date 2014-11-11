
module.exports = {
    name:       String,
    type:       {type:String, match:/^facebook$|^twitter$|^google$|^local$/},
    login:      String,
    email:      {type:String, match:/^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$/},
    password:   String,
    parentID:   String,
    token:      String,
    role:      {type:String, match:'/^admin$|^moderator$|^user$/', default:'user'}
};

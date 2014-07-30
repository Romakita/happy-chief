/**
 * Created by romain.lenzotti on 02/06/2014.
 */
"use strict";
var mongoose =      require('mongoose');
var Promise =       require('promise');
var bcrypt   = require('bcrypt-nodejs');
/**
 * Créée une nouvell instance candidat.
 * @param o Objet d'information à ajouter à l'instance
 * @constructor
 */
var UserSchema = new mongoose.Schema({
    local: {
        name:        String,
        firstName:   String,
        mail:        {type:String, match:/^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$/},
        password:    String
    },
    facebook: {
        id           : String,
        token        : String,
        email        : String,
        name         : String
    },
    twitter: {
        id           : String,
        token        : String,
        displayName  : String,
        username     : String
    },
    google: {
        id           : String,
        token        : String,
        email        : String,
        name         : String
    }
});
//
// Constructors
//
var User = mongoose.model('User', UserSchema);
/**
 *
 * @param password
 * @returns {*}
 */
User.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};
/**
 *
 * @param password
 * @returns {*}
 */
User.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};
/**
 *
 * @param app
 * @param callback
 */
/*User.commit = function(o){
    var self = this;

    if(typeof o._id == 'undefined'){//save

        return new Promise(function(resolve, reject){

            new User(o).save(function(err, o){

                if(err){
                    reject(err);
                }else{
                    resolve(o.toObject());
                }

            });

        });

    }else {//update

        return new Promise(function (resolve, reject) {
            var id = o._id;
            delete o._id;

            User.update({_id: id}, data, {upsert: true}, function (err) {
                if(err){
                    reject(err);
                }else{
                    o._id = id;
                    resolve(o);
                }
            });
        });
    }

};*/
//
// Statics
//
/*
 * Gère les routes liées aux candidats
 */
User.initialize = function(app, passport){

    app

        .post('/signup', function(req, res, next) {
            passport.authenticate('local-signup', function(err, user, info) {
                if (err) { return next(err); }

                if (!user) {
                    return res.send(404, 'No user found');
                }

                req.logIn(user, function(err) {
                    if (err) { return next(err); }

                    return res.json(user);
                });

            })(req, res, next);
        })

        .post('/login', function(req, res, next) {
            passport.authenticate('local-login', function(err, user, info) {
                if (err) { return next(err); }

                if (!user) {
                    return res.send(404, 'No user found');
                }

                req.logIn(user, function(err) {
                    if (err) { return next(err); }

                    return res.json(user);
                });

            })(req, res, next);
        })

        .get('/users/:id', function(request, response) {//Enregistrement du formulaire candidate

            User.get(request.params.id, function(o){

                if(o) {
                    response.setHeader('Content-Type', 'text/json');
                    response.json(o);
                }else{
                    response.setHeader('Content-Type', 'text/plain');
                    response.send(404, 'candidate not Found');
                }
            }, function(err){
                console.log(err);
                response.setHeader('Content-Type', 'text/plain');
                response.send(500, 'User module internal error');
            });
        });


    return this;
};
/**
 *
 * @returns {mongoose.Schema}
 */
User.getSchema =  function(){
    return UserSchema;
};
/**
 *
 * @param id
 * @param callback
 * @param error
 * @returns {Query}
 */
User.get = function(id, callback, error){
    return User.findById(id, function(err, o) {
        if (err) return error.call(this, err);
        callback.call(this, o);
    });
};

module.exports = User;
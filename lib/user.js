/**
 * Created by romain.lenzotti on 02/06/2014.
 */
"use strict";
var mongoose =      require('./mongoose-utils');
var Promise =       require('promise');
var expressJwt =    require('express-jwt');
var jwt =           require('jsonwebtoken');
var bcrypt   =      require('bcrypt-nodejs');
/**
 * Créée une nouvell instance candidat.
 * @param o Objet d'information à ajouter à l'instance
 * @constructor
 */
module.exports = mongoose.createModel('User', {
        name:       String,
        type:       {type:String, match:/^facebook$|^twitter$|^google$|^local$/},
        login:      String,
        email:      {type:String, match:/^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$/},
        password:   String,
        parentID:   String,
        token:      String
    },

    {
        initialize: function(app, passport){
            var self = this;

            app

                .post('/signup', function(req, res, next) {

                    passport.authenticate('local-signup', function(err, user, info) {
                        if (err) { return next(err); }

                        if (!user) {
                            return res.send(404, 'No user found');
                        }

                        req.logIn(user, function(err) {
                            if (err) { return next(err); }

                            require('./bookmark').list({user:user._id})
                                .then(function(bookmarks){

                                    user = user.toObject();
                                    user.bookmarks = bookmarks;

                                    var token = jwt.sign(user, 'secretkeyhappychief77', {expiresInMinutes: 60*5});

                                    return res.json({token: token, user:user});
                                })
                                .catch(function(err){
                                    console.log(err);
                                    res.send(500, 'Bookmark module internal error');
                                });

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

                            require('./bookmark').list({user:user._id})
                                .then(function(bookmarks){

                                    user = user.toObject();
                                    user.bookmarks = bookmarks;

                                    var token = jwt.sign(user, 'secretkeyhappychief77', {expiresInMinutes: 60*5});

                                    return res.json({token: token, user:user});
                                })
                                .catch(function(err){
                                    console.log(err);
                                    res.send(500, 'Bookmark module internal error');
                                });


                        });

                    })(req, res, next);
                })

                // handle the callback after facebook has authenticated the user
                .get('/auth/:network/callback', function(req, res, next) {

                    passport.authenticate(req.params.network, function(err, user, info) {

                        if (!user) {
                            return res.redirect('#/login/error');
                        }

                        req.logIn(user, function(err) {
                            if (err) { return next(err); }

                            require('./bookmark').list({user:user._id})
                                .then(function(bookmarks){

                                    user = user.toObject();
                                    user.bookmarks = bookmarks;

                                    var token = jwt.sign(user, 'secretkeyhappychief77', {expiresInMinutes: 60*5});

                                    return res.redirect('/#/auth/' + JSON.stringify({token: token, user:user}));
                                })
                                .catch(function(err){
                                    console.log(err);
                                    res.send(500, 'Bookmark module internal error');
                                });

                        });

                    })(req, res, next);
                })

                .get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }))
                .get('/auth/twitter', passport.authenticate('twitter'))
                .get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }))

                .get('/logout', function(req, res) {
                    req.logout();
                    res.redirect('/');
                })

                /*.get('/users/:id', function(request, response) {//Enregistrement du formulaire candidate

                 User.get(request.params.id, function(o){

                 if(o) {
                 response.setHeader('Content-Type', 'text/json');
                 response.json(o);
                 }else{
                 response.setHeader('Content-Type', 'text/plain');
                 response.send(404, 'User not Found');
                 }
                 }, function(err){
                 console.log(err);
                 response.setHeader('Content-Type', 'text/plain');
                 response.send(500, 'User module internal error');
                 });
                 })*/;


            return this;
        },

        get:function(o){
            return mongoose.collections.get(this, o);
        },

        generateHash: function (password) {
            return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
        }

    });


/**
 *
 * @param password
 * @returns {*}
 */
mongoose.extend(module.exports.prototype, {
    validPassword: function (password) {
        return bcrypt.compareSync(password, this.password);
    }
});
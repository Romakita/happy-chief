/**
 * Created by romain.lenzotti on 02/06/2014.
 */
"use strict";
var mongoose =      require('./mongoose-utils');
var Promise =       require('promise');

module.exports = mongoose.createModel(
    //Nom du Modèle
    'Bookmark',
    //Structure du Modèle
    {
        _user:       {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
        _recipe:     {type: mongoose.Schema.Types.ObjectId, ref: 'Recipe'},
        un:          {type:String, unique:true},
        dateCreate:  {type: Date, default: Date.now}
    },
    //Méthodes du Modèle
    {
        /**
         * Gère les routes
         * @param app
         * @returns {Bookmark}
         */
        initialize: function(app){
            var self = this;

            app
                .post('/admin/users/:user/bookmarks/:recipe', function(request, response) {//Enregistrement du formulaire candidate

                    self.save(request.params.user, request.params.recipe)
                        .then(function(){
                            response.setHeader('Content-Type', 'text/plain');
                            response.send(200, 'Bookmark added');

                        }, function(err){
                            console.log(err);
                            response.setHeader('Content-Type', 'text/plain');
                            response.send(500, 'Bookmark module internal error');
                        });

                })

                .delete('/admin/users/:user/bookmarks/:recipe', function(request, response) {//Enregistrement du formulaire candidate

                    self.remove(request.params.user, request.params.recipe)
                        .then(function(){
                            response.setHeader('Content-Type', 'text/plain');
                            response.send(200, 'Bookmark removed');

                        }, function(err){
                            console.log(err);
                            response.setHeader('Content-Type', 'text/plain');
                            response.send(500, 'Bookmark module internal error');
                        });

                })

                .get('/admin/users/:user/bookmarks', function(request, response) {//Enregistrement du formulaire candidate

                    self.list({user:request.params.user})
                        .then(function(o){
                            response.setHeader('Content-Type', 'text/json');
                            response.json(200, o);

                        })
                        .catch(function(err){
                            response.setHeader('Content-Type', 'text/plain');
                            response.send(500, 'Bookmark module internal error');
                        }
                    );

                });

        },
        /**
         * Créér une nouvelle entité en base de données.
         * @param userID
         * @param recipeID
         * @returns {Promise}
         */
        save: function(userID, recipeID){
            return mongoose.collections.save(this, {
                _user:      userID,
                _recipe:    recipeID,
                un:         userID + recipeID
            });
        },
        /**
         * Supprime l'entité de la base de données.
         * @param userID
         * @param recipeID
         * @returns {*}
         */
        remove: function(userID, recipeID){
            return mongoose.remove(this, {_user:userID, _recipe:recipeID});
        },
        /**
         * Liste les entités de la base de données.
         * @param options
         * @returns {Promise}
         */
        list: function(options){

            var settings = {

                populates: [
                    '_recipe'
                ],

                sort:{
                    'dateCreate':'asc'
                },

                query: null,

                options:options
            };

            if(typeof options == 'object'){
                settings.query = {
                    '$and': []
                };

                if(options.user){
                    settings.query.$and.push({_user:options.user});
                }
            }

            return mongoose.collections.list(this, settings);
        }
    });

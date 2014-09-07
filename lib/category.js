/**
 * Created by romain.lenzotti on 02/06/2014.
 */
"use strict";
var mongoose =      require('./mongoose-utils');
var Promise =       require('promise');

module.exports = mongoose.createModel(
    //Nom du Modèle
    'Category',
    //Structure du Modèle
    {
        id:     {type:Number},
        label:  {type:String, unique:true},
        enabled:{type:Boolean, default:false}
    },
    //Méthode du Modèle
    {
        /**
         * Gère les routes du module
         * @param app
         * @returns {exports}
         */
        initialize: function(app){

            var self = this;

            app
                .post('/categories', function(request, response) {
                    self.save(request.body.label)
                        .then(function(){
                            response.setHeader('Content-Type', 'text/plain');
                            response.send(200, 'Category added');

                        }, function(err){
                            console.log(err);
                            response.setHeader('Content-Type', 'text/plain');
                            response.send(500, 'Category module internal error');
                        });
                })

                .put('/categories/:id', function(request, response) {

                    self.up(request.body)
                        .then(function(){
                            response.setHeader('Content-Type', 'text/plain');
                            response.send(200, 'Category updated');

                        }, function(err){
                            console.log(err);
                            response.setHeader('Content-Type', 'text/plain');
                            response.send(500, 'Category module internal error');
                        });
                })

                .delete('/categories/:id', function(request, response) {

                })

                .get('/categories', function(request, response) {

                    self.list()
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



            return this;
        },
        /**
         * Ajoute une nouvelle catégorie
         * @param label
         * @returns {Promise}
         */
        save:function(label){

            var f = label.charAt(0)
                .toUpperCase();
            label = f + label.substr(1).toLowerCase();

            return mongoose.collections.save(this, {label:label});
        },

        up:function(obj){

            var f = obj.label.charAt(0).toUpperCase();
            obj.label = f + obj.label.substr(1).toLowerCase();

            return mongoose.collections.update(this, obj);
        },
        /**
         *
         * @param options
         * @returns {Promise}
         */
        list:function(options){
            console.log(options);
            var settings = {
                sort:{
                    'label':'asc'
                },

                query: {
                    //enabled:true
                },

                options:options
            };

            if(typeof options == 'object'){
                if(options.enabled == 'all'){
                    delete settings.query;
                }
                if(options.enabled === false){
                    settings.query.enabled = false;
                }
            }

            return mongoose.collections.list(this, settings);
        }
    });
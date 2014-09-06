/**
 * Created by romain.lenzotti on 02/06/2014.
 */
"use strict";
var mongoose =      require('./mongoose-utils');
var Promise =       require('promise');

module.exports = mongoose.createModel('Recipe', {
        id:                 {type:Number},
        title:              {type:String},
        picture:            String,
        summary:            {type:String},
        description:        {type:String},
        chiefTip:           String,
        timePreparation:    {type:String},
        timeBaking:         {type:String},
        timeRest:           {type:String},
        nbPeople:           {type:Number, default:6},
        level:              String,
        category:           ['Category'],
        dateCreate:         {type:Date, default:Date.now},
        ingredients:        [{
            label:      String,
            shopGroup:  String,
            qte:        String,
            unit:       String,
            step:       String,
            order:      Number
        }]
    },

    {

        initialize: function(app){
            var self = this;

            app
                .get('/recipes/:id', function(request, response) {//Enregistrement du formulaire candidate

                    mongoose.collections.get(self, request.params.id)
                        .then(function(o){
                            response.setHeader('Content-Type', 'text/json');
                            response.json(o);
                        })

                        .catch(function(err){
                            console.log(err);
                            response.setHeader('Content-Type', 'text/plain');
                            response.send(404, 'candidate not Found');
                        });

                })

                /*.post('/recipes/:id', function(request, response) {

                    mongoose.collections.save(self, request.body)
                        .then(function(o){
                            response.setHeader('Content-Type', 'text/json');
                            response.json(o);
                        })

                        .catch(function(err){
                            console.log(err);
                            response.setHeader('Content-Type', 'text/plain');
                            response.send(500, 'Recipe module internal error');
                        });

                })

                .put('/recipes/:id', function(request, response) {

                    mongoose.collections.update(self, request.body)
                        .then(function(o){
                            response.setHeader('Content-Type', 'text/json');
                            response.json(o);
                        })

                        .catch(function(err){
                            console.log(err);
                            response.setHeader('Content-Type', 'text/plain');
                            response.send(500, 'Recipe module internal error');
                        });

                })*/
                .delete('/recipes/:id', function(request, response) {

                    mongoose.collections.remove(self, request.params.id)
                        .then(function(o){

                            response.setHeader('Content-Type', 'text/json');
                            response.json(o);

                        })

                        .catch(function(err){
                            console.log(err);
                            response.setHeader('Content-Type', 'text/plain');
                            response.send(500, 'Recipe module internal error');
                        });

                })
                .get('/recipes/random/:nb?', function(request, response) {//Enregistrement du formulaire candidate

                    self.randomList(request.params.nb)
                        .then(function(array){

                            response.setHeader('Content-Type', 'text/json');
                            response.json(array);

                        })
                        .catch(function(err){
                            // console.log(err);
                            response.setHeader('Content-Type', 'text/plain');
                            response.send(500, 'Recipes module internal error');
                        });
                })

                .get('/recipes', function(request, response) {//Enregistrement du formulaire candidate

                    self.list(request.query)
                        .then(function(array){
                            response.setHeader('Content-Type', 'text/json');
                            response.json(array);
                        })
                        .catch(function(err){
                            console.log(err);
                            response.setHeader('Content-Type', 'text/plain');
                            response.send(500, 'Recipes module internal error');
                        });
                });

            return this;
        },

        randomList: function(size){

            size = size || 5;

            var self = this;

            return new Promise(function(resolve, reject){

                var query  = self.find();
                query.where('picture').ne('');

                query.count()
                    .exec()
                    .then(function(nb){

                        var array = [];
                        var items = [];

                        for(var i = 0; i < size && i < nb; i++){

                            var skip = Math.floor(Math.random() * nb);

                            if(items.indexOf(skip) != -1){
                                i--;
                                continue;
                            }

                            var query  = self.find();
                            query.where('picture').ne('');
                            query.skip(skip).limit(1);

                            query.exec(function(err, o){

                                array.push(o[0]);

                                if(array.length == size || array.length == nb){
                                    resolve(array);
                                }

                            });
                        }

                    }, function(err){
                        reject(err);
                    });
            })
        },

        list:function(options){

            var settings = {

                populates: [
                    '_recipe'
                ],

                sort:{
                    'label':'asc'
                },

                query: null,

                options:options
            };

            if(typeof options == 'object'){
                settings.query = {
                    '$and': []
                };

                if(typeof options.search === 'string'){
                    settings.query.$and.push({'$or':[
                        {title:new RegExp(options.search.split(' ').join('|'), 'gi')},
                        {summary:new RegExp(options.search.split(' ').join('|'), 'gi')},
                        {description:new RegExp(options.search.split(' ').join('|'), 'gi')}
                    ]});
                }

                if(options.havePicture){
                    query.where('picture').ne('');
                }
            }

            return mongoose.collections.list(this, settings);
        }
    });

/**
 *
 * @param options
 * @param callback
 * @param error
 * @returns {Promise|*}
 */
/*Recipe.getList = function(options, callback, error){

    if(typeof options === 'object'){

        var queryOptions = {
            '$and': []
        };

        if(typeof options.search === 'string'){
            queryOptions.$and.push({'$or':[
                {title:new RegExp(options.search.split(' ').join('|'), 'gi')},
                {summary:new RegExp(options.search.split(' ').join('|'), 'gi')},
                {description:new RegExp(options.search.split(' ').join('|'), 'gi')}
            ]});
        }

        var query  = Recipe.find(queryOptions);

        if(options.havePicture){
            query.where('picture').ne('');
        }

        if(typeof options.limit !== 'undefined' && typeof options.skip !== 'undefined'){

            var maxLength;

            return query.count()
                .exec()
                .then(function(max) {
                    maxLength = max;

                    var query  = Recipe.find(queryOptions);

                    if(options.havePicture){
                        query.where('picture').ne('');
                    }

                    if (options.sortOrder && options.sortField) {
                        var obj = {};
                        obj[options.sortField] = options.sortOrder;

                        query.sort(obj);
                    }

                    query.skip(options.skip).limit(options.limit);

                    return query.exec()
                })
                .then(function(array) {
                    //taille max

                    if(callback) {
                        return callback.call(this, {maxLength:maxLength, data:array});
                    }

                    return {maxLength:maxLength, data:array};
                })

                .then(null, function(err){
                    if (err) return error.call(this, err);
                });

        }
    }else{
        var query = Recipe.find(null);
    }

    query.sort({'label':'asc'});

    return query.exec()
        .then(function(array) {

            if(callback) {
                return callback.call(this, array);
            }

            return array;
        })

        .then(null, function(err){
            if (err) return error.call(this, err);
        });
};


module.exports = Recipe;*/


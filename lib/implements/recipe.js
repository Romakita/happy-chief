var mongoose =      require('./../utils/mongoose-utils');
var Promise =       require('promise');

module.exports = {

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
};
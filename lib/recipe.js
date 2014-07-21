/**
 * Created by romain.lenzotti on 02/06/2014.
 */
"use strict";
var mongoose =      require('mongoose');

/**
 * Créée une nouvell instance candidat.
 * @param o Objet d'information à ajouter à l'instance
 * @constructor
 */
var RecipeSchema = new mongoose.Schema({
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
    category:           [{type:'String'}],

    ingredients:        [{
        label:      String,
        shopGroup:  String,
        qte:        String,
        unit:       String,
        step:       String,
        order:      Number
    }]
});


//
// Constructors
//
var Recipe = mongoose.model('Recipe', RecipeSchema);

/**
 *
 * @param app
 * @param callback
 */
Recipe.prototype.commit = function(callback, error){
    var self = this;

    if(!this._id){//save
        //this.invalidate('Nom', 'Le nom est requis');
        //this.invalidate('password', 'Le mot de passe est requis');

        this.validate(function(err){
            if(err && error){
                return error.call(this, err);
            }
        });

        return this.save(function(err){
            if(err){
                return error.call(this, err);
            }

            if(callback){
                return callback.call(this, self);
            }
            return self;
        });
    }else{//update


// Convert the Model instance to a simple object using Model's 'toObject' function
// to prevent weirdness like infinite looping...
        var data = this.toObject();

// Delete the _id property, otherwise Mongo will return a "Mod on _id not allowed" error
        delete data._id;

// Do the upsert, which works like this: If no Contact document exists with
// _id = contact.id, then create a new doc using upsertData.
// Otherwise, update the existing doc with upsertData
        return Recipe.update({_id: this._id}, data, {upsert: true}, function(err){
            if(err){
                return error.call(this, err);
            }

            if(callback){
                callback.call(this, self);
            }

            return self;
        });
    }

};
//
// Statics
//
/*
 * Gère les routes liées aux candidats
 */
Recipe.initialize = function(app){

    app
        .get('/recipes/:id', function(request, response) {//Enregistrement du formulaire candidate

            Recipe.get(request.params.id, function(o){

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
                response.send(500, 'Recipe module internal error');
            });
        })

    /*app.post('/recipes/save', function(request, response) {//Enregistrement du formulaire candidate
        var candidate = new Recipe(request.body);

        response.setHeader('Content-Type', 'text/json');

        candidate.commit(function(o){
            response.json(o);
        }, function(err){
            console.log(err);
            response.setHeader('Content-Type', 'text/plain');
            response.send(500, 'Recipe module internal error');
        });

    });*/

        .get('/recipes', function(request, response) {//Enregistrement du formulaire candidate

            Recipe.getList(request.query, function(array){

                if(array) {
                    response.setHeader('Content-Type', 'text/json');
                    response.json(array);

                }else{
                    response.setHeader('Content-Type', 'text/plain');
                    response.send(404, 'Recipes not Found');
                }
            }, function(err){
                console.log(err);
                response.setHeader('Content-Type', 'text/plain');
                response.send(500, 'Recipes module internal error');
            });
        });

    /*app.delete('/recipes/remove/:id', function(request, response) {//Enregistrement du formulaire candidate

        Recipe.remove(request.params.id, function(candidate){

            if(candidate) {
                response.setHeader('Content-Type', 'text/json');
                response.json(candidate);
            }else{
                response.setHeader('Content-Type', 'text/plain');
                response.send(404, 'Candidature not Found');
            }
        }, function(err){
            console.log(err);
            response.setHeader('Content-Type', 'text/plain');
            response.send(500, 'Candidature module internal error');
        });
    });*/

    return this;
};
/**
 *
 * @returns {mongoose.Schema}
 */
Recipe.getSchema =  function(){
    return RecipeSchema;
};
/**
 *
 * @param id
 * @param callback
 * @param error
 * @returns {Query}
 */
Recipe.get = function(id, callback, error){
    return Recipe.findById(id, function(err, o) {
        if (err) return error.call(this, err);
        callback.call(this, o);
    });
};
/**
 *
 * @param id
 * @param callback
 * @param error
 * @returns {Query}
 */
Recipe.remove = function(id, callback, error){
    return Recipe.findById(id).remove(function(err, o){
        if(err){
            return error.call(this, err);
        }

        if(callback){
            return callback.call(this, o);
        }
    });
};
/**
 *
 * @param options
 * @param callback
 * @param error
 * @returns {Promise|*}
 */
Recipe.getList = function(options, callback, error){

    if(typeof options === 'object'){

        var queryOptions = {
          //  '$and': []
        };

        if(typeof options.search === 'string'){
            /*queryOptions.$and.push({'$or':[
                {name:new RegExp(options.search, 'gi')},
                {firstName:new RegExp(options.search, 'gi')},
                {mail:new RegExp(options.search, 'gi')}
            ]});*/
        }

        var query  = Recipe.find(queryOptions);

        if(typeof options.limit !== 'undefined' && typeof options.skip !== 'undefined'){

            var maxLength;

            return query.count()
                .exec()
                .then(function(max) {
                    maxLength = max;

                    var query  = Recipe.find(queryOptions);

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


module.exports = Recipe;


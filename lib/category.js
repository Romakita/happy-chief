/**
 * Created by romain.lenzotti on 02/06/2014.
 */
"use strict";
var mongoose =      require('mongoose');
var Promise =       require('promise');

/**
 * Créée une nouvell instance candidat.
 * @param o Objet d'information à ajouter à l'instance
 * @constructor
 */
var CategorySchema = new mongoose.Schema({
    id:                 {type:Number},
    label:              {type:String, unique:true}
});
//
// Constructors
//
var Category = mongoose.model('Category', CategorySchema);
/**
 *
 * @param app
 * @param callback
 */
Category.commit = function(o){
    var self = this;

    if(typeof o._id == 'undefined'){//save

        return new Promise(function(resolve, reject){

            new Category(o).save(function(err, o){

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

            Category.update({_id: id}, data, {upsert: true}, function (err) {
                if(err){
                    reject(err);
                }else{
                    o._id = id;
                    resolve(o);
                }
            });
        });
    }

};
//
// Statics
//
/*
 * Gère les routes liées aux candidats
 */
Category.initialize = function(app){

    app
        .get('/categories/:id', function(request, response) {//Enregistrement du formulaire candidate

            Category.get(request.params.id, function(o){

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
                response.send(500, 'Category module internal error');
            });
        })
        .post('/categories/save', function(request, response) {//Enregistrement du formulaire candidate
            var candidate = new Category(request.body);

            response.setHeader('Content-Type', 'text/json');

            candidate.commit(function(o){
                response.json(o);
            }, function(err){
                console.log(err);
                response.setHeader('Content-Type', 'text/plain');
                response.send(500, 'Category module internal error');
            });

        })

        .get('/categories', function(request, response) {//Enregistrement du formulaire candidate

            Category.getList(request.query, function(array){

                if(array) {
                    response.setHeader('Content-Type', 'text/json');
                    response.json(array);

                }else{
                    response.setHeader('Content-Type', 'text/plain');
                    response.send(404, 'Categories not Found');
                }
            }, function(err){
                console.log(err);
                response.setHeader('Content-Type', 'text/plain');
                response.send(500, 'Categories module internal error');
            });
        });

    /*app.delete('/Categorys/remove/:id', function(request, response) {//Enregistrement du formulaire candidate

     Category.remove(request.params.id, function(candidate){

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
Category.getSchema =  function(){
    return CategorySchema;
};
/**
 *
 * @param id
 * @param callback
 * @param error
 * @returns {Query}
 */
Category.get = function(id, callback, error){
    return Category.findById(id, function(err, o) {
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
Category.remove = function(id, callback, error){
    return Category.findById(id).remove(function(err, o){
        if(err){
            return error.call(this, err);
        }

        if(callback){
            return callback.call(this, o);
        }
    });
};
/**
 * Retourne la liste des catégories.
 * @param options
 * @param callback
 * @param error
 * @returns {Promise|*}
 */
Category.getList = function(options, callback, error){

    if(typeof options === 'object'){

        var queryOptions = {
            '$and': []
        };

        if(typeof options.search === 'string'){
            queryOptions.$and.push({'$or':[
                {title:new RegExp(options.search, 'gi')},
                {summary:new RegExp(options.search, 'gi')},
                {description:new RegExp(options.search, 'gi')}
            ]});
        }

        var query  = Category.find(queryOptions);

        if(options.havePicture){
            query.where('picture').ne('');
        }

        if(typeof options.limit !== 'undefined' && typeof options.skip !== 'undefined'){

            var maxLength;

            return query.count()
                .exec()
                .then(function(max) {
                    maxLength = max;

                    var query  = Category.find(queryOptions);

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
        var query = Category.find(null);
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


module.exports = Category;
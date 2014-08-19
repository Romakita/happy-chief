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
var BookmarkSchema = new mongoose.Schema({
    _user:       {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    _recipe:     {type: mongoose.Schema.Types.ObjectId, ref: 'Recipe'},
    un:          {type:String, unique:true},
    dateCreate:  {type: Date, default: Date.now}
});


//
// Constructors
//
var Bookmark = mongoose.model('Bookmark', BookmarkSchema);

/**
 *
 * @param app
 * @param callback
 */
Bookmark.commit = function(userID, recipeID){

    return new Promise(function(resolve, reject){

        new Bookmark({_user:userID, _recipe:recipeID, un: userID + recipeID}).save(function(err){

            if(err){
                reject(err);
            }else{
                resolve();
            }

        });

    });

};
//
// Statics
//
/*
 * Gère les routes liées aux candidats
 */
Bookmark.initialize = function(app){

    app
        .post('/admin/users/:user/bookmarks/:recipe', function(request, response) {//Enregistrement du formulaire candidate

            Bookmark.commit(request.params.user, request.params.recipe).then(function(){
                response.setHeader('Content-Type', 'text/plain');
                response.send(200, 'bookmark added');

            }, function(err){
                response.setHeader('Content-Type', 'text/plain');
                response.send(200, 'Bookmark module internal error');
            });

        })

        .delete('/admin/users/:user/bookmarks/:recipe', function(request, response) {//Enregistrement du formulaire candidate

            Bookmark.remove(request.params.user, request.params.recipe).then(function(){

                response.setHeader('Content-Type', 'text/plain');
                response.send(200, 'bookmark removed');

            }, function(err){
                console.log(err)
                response.setHeader('Content-Type', 'text/plain');
                response.send(500, 'Bookmark module internal error');
            });

        })

        .get('/admin/users/:user/bookmarks', function(request, response) {//Enregistrement du formulaire candidate

            Bookmark.getList({user:request.params.user},
                function(o){
                    response.setHeader('Content-Type', 'text/plain');
                    response.json(200, o);

                }, function(err){
                    response.setHeader('Content-Type', 'text/plain');
                    response.send(200, 'Bookmark module internal error');
                }
            );

        });

    return this;
};
/**
 *
 * @returns {mongoose.Schema}
 */
Bookmark.getSchema =  function(){
    return BookmarkSchema;
};
/**
 *
 * @param id
 * @param callback
 * @param error
 * @returns {Query}
 */
Bookmark.remove = function(userID, recipeID, callback, error){
    return Bookmark.findOne({_user:userID, _recipe:recipeID}).remove(function(err, question){
        if(err){
            return error.call(this, err);
        }

        if(callback){
            return callback.call(question, question);
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
Bookmark.getList = function(options, callback, error){

    if(typeof options === 'object'){

        var queryOptions = {
            '$and': []
        };

        if(options.user){
            queryOptions.$and.push({_user:options.user});
        }

        var query  = Bookmark.find(queryOptions);

        if(typeof options.limit !== 'undefined' && typeof options.skip !== 'undefined'){

            var maxLength;

            return query.count()
                .exec()
                .then(function(max) {
                    maxLength = max;

                    var query  = Bookmark.find(queryOptions);
                    query.populate('_recipe');

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
        var query = Bookmark.find(null);
    }

    query.sort({'dateCreate':'asc'});
    query.populate('_recipe');

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


module.exports = Bookmark;


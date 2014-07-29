/**
 * Created by romain.lenzotti on 02/06/2014.
 */
"use strict";
var mongoose =      require('mongoose');
var Promise =       require('promise');
var md5 =           require('MD5');

/**
 * Créée une nouvell instance candidat.
 * @param o Objet d'information à ajouter à l'instance
 * @constructor
 */
var UserSchema = new mongoose.Schema({
    name:               String,
    firstName:          String,
    mail:               {type:String, required:true, unique:true, match:/^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$/},
    password:           {type:String, required:true}
});


//
// Constructors
//
var User = mongoose.model('User', UserSchema);

/**
 *
 * @param app
 * @param callback
 */
User.commit = function(o){
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

};
//
// Statics
//
/*
 * Gère les routes liées aux candidats
 */
User.initialize = function(app){

    app
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
        })

        /*app.post('/users/save', function(request, response) {//Enregistrement du formulaire candidate
         var candidate = new User(request.body);

         response.setHeader('Content-Type', 'text/json');

         candidate.commit(function(o){
         response.json(o);
         }, function(err){
         console.log(err);
         response.setHeader('Content-Type', 'text/plain');
         response.send(500, 'User module internal error');
         });

         });*/
        .get('/users/random/:nb?', function(request, response) {//Enregistrement du formulaire candidate

            User.randomList(request.params.nb).then(function(array){

                if(array) {
                    response.setHeader('Content-Type', 'text/json');
                    response.json(array);

                }else{
                    response.setHeader('Content-Type', 'text/plain');
                    response.send(404, 'Users not Found');
                }
            }, function(err){
                // console.log(err);
                response.setHeader('Content-Type', 'text/plain');
                response.send(500, 'Users module internal error');
            });
        })
        .get('/users', function(request, response) {//Enregistrement du formulaire candidate

            User.getList(request.query, function(array){

                if(array) {
                    response.setHeader('Content-Type', 'text/json');
                    response.json(array);

                }else{
                    response.setHeader('Content-Type', 'text/plain');
                    response.send(404, 'Users not Found');
                }
            }, function(err){
                console.log(err);
                response.setHeader('Content-Type', 'text/plain');
                response.send(500, 'Users module internal error');
            });
        });

    /*app.delete('/users/remove/:id', function(request, response) {//Enregistrement du formulaire candidate

     User.remove(request.params.id, function(candidate){

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
/**
 *
 * @param id
 * @param callback
 * @param error
 * @returns {Query}
 */
User.remove = function(id, callback, error){
    return User.findById(id).remove(function(err, o){
        if(err){
            return error.call(this, err);
        }

        if(callback){
            return callback.call(this, o);
        }
    });
};

User.randomList = function(size){

    size = size || 5;

    return new Promise(function(resolve, reject){

        var query  = User.find();
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

                    var query  = User.find();
                    query.where('picture').ne('');
                    query.skip(skip).limit(1);

                    query.exec(function(err, o){

                        array.push(o[0]);

                        if(array.length == size || array.length == nb){
                            resolve(array);
                        }

                    });
                }

            })
            .then(null, function(err){
                reject(err);
            });
    })
};
/**
 *
 * @param options
 * @param callback
 * @param error
 * @returns {Promise|*}
 */
User.getList = function(options, callback, error){

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

        var query  = User.find(queryOptions);

        if(options.havePicture){
            query.where('picture').ne('');
        }

        if(typeof options.limit !== 'undefined' && typeof options.skip !== 'undefined'){

            var maxLength;

            return query.count()
                .exec()
                .then(function(max) {
                    maxLength = max;

                    var query  = User.find(queryOptions);

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
        var query = User.find(null);
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


module.exports = User;


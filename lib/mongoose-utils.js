var mongoose = require('mongoose');
var Promise = require('promise');

module.exports = mongoose;

function populate(query, options){
    if(typeof options.populates == 'object') {
        for (var key in options.populates) {
            query.populate(options.populates[key]);
        }
    }
}

function getPaginateList (Schema, settings){

    return new Promise(function(resolve, reject){

        var maxLength;
        var query  = Schema.find(settings.query);

        query.count().exec()

            .then(function(max) {
                maxLength = max;

                var query  = Schema.find(settings.query);

                populate(query, settings);

                if (typeof settings.sort == 'object') {
                    query.sort(settings.sort);
                }

                query.skip(settings.skip).limit(settings.limit);

                return query.exec()
            })

            .then(function(array) {
                resolve({maxLength:maxLength, data:array});
            },

            function(err){
                reject(err)
            });
    });
}

function mergeOptions(settings) {

    if(typeof settings.options === 'object') {
        if (settings.options.sortOrder && settings.options.sortField) {
            settings.sort = {};
            settings.sort[settings.options.sortField] = settings.options.sortOrder;
        }

        if(typeof settings.options.limit !== 'undefined' && typeof settings.options.skip !== 'undefined'){
            settings.paginate = true;
            settings.limit = settings.options.limit;
            settings.skip = settings.options.skip;
        }
    }
}

module.exports.extend = function(target, obj){
    for(var key in obj){
        target[key] = obj[key];
    }

    return target;
};

module.exports.createModel = function(name, schemes, methods){

    var schema = mongoose.model(name, new mongoose.Schema(schemes));

    if(typeof methods == 'object'){
        this.extend(schema, methods);
    }

    return schema;
};

module.exports.collections = {
    /**
     * Récupère une entité à partir de son ID.
     * @param Schema
     * @param id
     * @returns {Promise}
     */
    get: function(Schema, id){
        return new Promise(function(resolve, reject) {
            Schema.findById(id, function (err, o) {
                if(err){
                    reject(err);
                }else{
                    resolve(o.toObject());
                }
            });
        });
    },
    /**
     * Créer une entité ou la sauvegarde si elle existe déjà
     * @param Schema
     * @param o
     * @returns {Promise}
     */
    commit:function(Schema, o){
        return typeof o._id == 'undefined' ? this.save(Schema, o) : this.update(Schema, o);
    },
    /**
     * Sauvegarde les informations d'une entité
     * @param Schema
     * @param o
     * @returns {Promise}
     */
    save: function(Schema, o){

        return new Promise(function(resolve, reject){
            new Schema(o).save(function(err, o){
                if(err){
                    reject(err);
                }else{
                    resolve(o.toObject());
                }
            });

        });
    },
    /**
     * Met à jour les données de l'entité
     * @param Schema
     * @param o
     * @returns {Promise}
     */
    update:function(Schema, o){

        return new Promise(function (resolve, reject) {
            var id = o._id;
            delete o._id;

            Schema.update({_id: id}, o, {upsert: true}, function (err) {
                if(err){
                    reject(err);
                }else{
                    o._id = id;
                    resolve(o);
                }
            });
        });
    },
    /**
     * Supprime une entité du schéma
     * @param Schema
     * @param query
     * @returns {Promise}
     */
    remove:function(Schema, query){
        return new Promise(function(resolve, reject){

            Schema.findOne(query).remove(function(err, o){

                if(err){
                    reject(err);
                }else{
                    resolve(o);
                }
            });

        });
    },
    /**
     * Liste les entités d'un schéma
     * @param Schema
     * @param settings
     * @returns {Promise}
     */
    list: function(Schema, settings){

        mergeOptions(settings);

        if(settings.paginate) {
            return getPaginateList(Schema, settings);
        }

        return new Promise(function(resolve, reject){
            var query  = Schema.find(settings.query);

            populate(query, settings);

            if (typeof settings.sort == 'object') {
                query.sort(settings.sort);
            }

            query.exec()
                .then(function(array) {
                    resolve(array);
                },
                function(err){
                    reject(err);
                });
        });
    }
};

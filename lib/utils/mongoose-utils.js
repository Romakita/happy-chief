var mongoose = require('mongoose');
var Promise = require('promise');

module.exports = mongoose;

/* private */

function populate(query, options) {
    if (typeof options.populates == 'object') {
        for (var key in options.populates) {
            query.populate(options.populates[key]);
        }
    }
}

function getPaginateList(Schema, settings) {

    return new Promise(function (resolve, reject) {

        var maxLength;
        var query = Schema.find(settings.query);

        query
            .count()
            .exec()
            .then(function (max) {
                maxLength = max;

                var query = Schema.find(settings.query);

                populate(query, settings);

                if (typeof settings.sort == 'object') {
                    query.sort(settings.sort);
                }

                query.skip(settings.skip).limit(settings.limit);

                return query.exec()
            })

            .then(function (array) {
                resolve({maxLength: maxLength, data: array});
            },

            function (err) {
                reject(err)
            });
    });
}

/* statics */

/**
 * Convertie la promise Mongoose en Promise standard
 * @param query
 * @returns {Promise}
 */
module.exports.promise = function(query){
    return new Promise(function(resolve, reject){
        query.exec().then(resolve, reject);
    });
};
/**
 * Etend les propriétés d'un objet
 * @param target
 * @param obj
 * @returns {*}
 */
module.exports.extend = function (target, obj) {
    for (var key in obj) {
        target[key] = obj[key];
    }

    return target;
};
/**
 * Créée un model de document mongoose avec une collection de méthode supplémentaire.
 * @param name
 * @param schemes
 * @param methods
 * @returns {*}
 */
module.exports.createModel = function (name, schemes, methods) {

    var schema = mongoose.model(name, new mongoose.Schema(schemes));

    schema._update = schema.update;

    this.extend(schema, {
        save: function (o) {
            return mongoose.collections.save(this, o);
        },

        update: function (o) {
            return mongoose.collections.update(this, o);
        },

        remove: function (o) {
            return mongoose.collections.remove(this, {_id: typeof o === 'object' ? o._id : o});
        },

        get: function (id) {
            return mongoose.collections.get(this, id);
        }
    });

    if (typeof methods == 'object') {
        this.extend(schema, methods);
    }

    return schema;
};
/**
 * Créée les routes REST pour l'accès aux données.
 * @param Schema
 * @param app
 * @param options
 * @returns {*}
 */
module.exports.createREST = function (Schema, app, options) {

    for (var key in options) {

        switch (key) {
            case 'get':
                app.get(options[key] + '/:id', function (request, response) {

                    Schema.get(request.params.id)

                        .then(function (o) {
                            response.setHeader('Content-Type', 'text/json');
                            response.json(o);
                        })

                        .catch(function (err) {
                            if (typeof err === 'string') {
                                response.setHeader('Content-Type', 'text/plain');
                                response.status(404).send(err);
                            } else {
                                console.warn(err);
                                response.setHeader('Content-Type', 'text/plain');
                                response.status(500).send('Internal error');
                            }
                        });
                });
                break;

            case 'list':
                app.get(options[key], function (request, response) {//Enregistrement du formulaire candidate
                    Schema.list(request.query)

                        .then(function (array) {
                            response.setHeader('Content-Type', 'text/json');
                            response.json(array);
                        })

                        .catch(function (err) {
                            if (typeof err === 'string') {
                                response.setHeader('Content-Type', 'text/plain');
                                response.status(404).send(err);
                            } else {
                                console.warn(err);
                                response.setHeader('Content-Type', 'text/plain');
                                response.status(500).send('Internal error');
                            }
                        });

                });
                break;


            case 'post':
                app.post(options[key], function (request, response) {//Enregistrement du formulaire candidate

                    Schema.save(request.body)
                        .then(function (o) {
                            response.setHeader('Content-Type', 'text/json');
                            response.json(o);
                        })
                        .catch(function (err) {
                            if (typeof err === 'string') {
                                response.setHeader('Content-Type', 'text/plain');
                                response.status(404).send(err);
                            } else {
                                console.warn(err);
                                response.setHeader('Content-Type', 'text/plain');
                                response.status(500).send('Internal error');
                            }
                        });

                });

                break;

            case 'put':
                app.put(options[key] + '/:id', function (request, response) {//Enregistrement du formulaire candidate

                    Schema.update(request.body)
                        .then(function (o) {
                            response.setHeader('Content-Type', 'text/json');
                            response.json(o);
                        })
                        .catch(function (err) {
                            if (typeof err === 'string') {
                                response.setHeader('Content-Type', 'text/plain');
                                response.status(404).send(err);
                            } else {
                                console.warn(err);
                                response.setHeader('Content-Type', 'text/plain');
                                response.status(500).send('Internal error');
                            }
                        });

                });

            case 'delete':
                app.delete(options[key] + '/:id', function (request, response) {//Enregistrement du formulaire candidate

                    Schema.remove(request.params.id)
                        .then(function (o) {
                            response.setHeader('Content-Type', 'text/json');
                            response.json(o);
                        })
                        .catch(function (err) {

                            if (typeof err === 'string') {
                                response.setHeader('Content-Type', 'text/plain');
                                response.status(404).send(err);
                            } else {
                                console.warn(err);
                                response.setHeader('Content-Type', 'text/plain');
                                response.status(500).send('Internal error');
                            }
                        });
                });

        }
    }

    return app;
};

module.exports.collections = {
    /**
     * Récupère une entité à partir de son ID.
     * @param Schema
     * @param id
     * @returns {Promise}
     */
    get: function (Schema, id, populates) {
        var query = Schema.findById(id);

        if (populates) {
            for (var key in populates) {
                query.populate(populates[key]);
            }
        }

        return mongoose
            .promise(query)
            .then(function(o){
                return o.toObject();
            });
    },
    /**
     *
     * @param Schema
     * @param query
     * @param populates
     * @returns {Promise|!Promise.<RESULT>|*}
     */
    findOne: function (Schema, query, populates) {
        var o = Schema.findOne(query);

        if (populates) {
            for (var key in populates) {
                o.populate(populates[key]);
            }
        }

        return mongoose
            .promise(o)
            .then(function(o){
                return o != null ? o.toObject() : false;
            });
    },
    /**
     * Créer une entité ou la sauvegarde si elle existe déjà
     * @param Schema
     * @param o
     * @returns {Promise}
     */
    commit: function (Schema, o) {
        return typeof o._id == 'undefined' ? this.save(Schema, o) : this.update(Schema, o);
    },
    /**
     * Sauvegarde les informations d'une entité
     * @param Schema
     * @param o
     * @returns {Promise}
     */
    save: function (Schema, o) {
        return new Promise(function (resolve, reject) {
            new Schema(o).save(function(err, o){
                if(err){
                    reject(err)
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
    update: function (Schema, o) {
        return new Promise(function (resolve, reject) {
            var id = o._id;
            delete o._id;

            Schema._update({_id: id}, o, {upsert: true}, function (err) {
                if (err) {
                    reject(err);
                } else {
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
    remove: function (Schema, query) {
        return mongoose
            .promise(Schema.findOne(query).remove());
    },
    /**
     * Liste les entités d'un schéma
     * @param Schema
     * @param settings
     * @returns {Promise}
     */
    list: function (Schema, settings) {

        this.mergeOptions(settings);

        if (settings.paginate) {
            return getPaginateList(Schema, settings);
        }

        var query = Schema.find(settings.query);

        populate(query, settings);

        if (typeof settings.sort == 'object') {
            query.sort(settings.sort);
        }

        return mongoose.promise(query);
    },
    /**
     *
     * @param settings
     * @returns {*}
     */
    mergeOptions: function (settings) {

        if (typeof settings.options === 'object' && settings.options != null) {

            if (settings.options.sortOrder && settings.options.sortField) {
                settings.sort = {};
                settings.sort[settings.options.sortField] = settings.options.sortOrder;
            }

            if (typeof settings.options.limit !== 'undefined' && typeof settings.options.skip !== 'undefined') {
                settings.paginate = true;
                settings.limit = settings.options.limit;
                settings.skip = settings.options.skip;
            }
        }

        if (typeof settings.query == 'object') {

            try {
                if (typeof settings.query.$and && !settings.query.$and.length) {
                    delete settings.query.$and;
                }
            } catch (er) {
            }
            try {
                if (settings.query.$or && !settings.query.$or.length) {
                    delete settings.query.$or;
                }
            } catch (er) {
            }
            try {
                if (settings.query.$nor && !settings.query.$nor.length) {
                    delete settings.query.$nor;
                }
            } catch (er) {
            }
        }

        return settings;
    }
};


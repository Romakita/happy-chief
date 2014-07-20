/**
 * Created by romak_000 on 19/07/2014.
 */

var Promise = require('promise');
var htmlparser = require("htmlparser2");
var fs = require('fs');
var http = require('http');
var domParser = require('./dom-parser');
var path = require('path'),
    appDir = path.resolve('.');

var Recipe = require('./recipe');

module.exports = {
    initialize:function(app){
        var self = this;

        app.get('/grabber/convert', function(req, res){
            try {
                res.send('CONVERSION EN COURS');

                self.getIDSData(function(id) {
                    console.log(id);



                    self.qualify(id).then(function(o){
                        fs.writeFile(self.folder(id) + '/data.json', JSON.stringify(o));
                    });
                });

            }catch(er){console.log(er)}
        });

        app.get('/grabber/import', function(req, res){
            res.send('IMPORTATION EN COURS');

            self.getIDSData(function(id) {

                fs.readFile(self.folder(id) + '/data.json', function(err, content){
                    if(err){
                        console.log(err);
                        return;
                    }

                    try{
                        console.log('Read ', id);

                        var o = JSON.parse(content);
                        new Recipe(o).commit(function(){
                            //console.log('ID imported ', id);
                        });

                    }catch(er){
                        console.log(er);
                    }

                });

            });
        });


        app.get('/grabber', function(req, res){

            self.grab()
                .then(function(stack){
                    res.setHeader('Content-Type', 'text/plain');
                    res.json(200, stack);
                })

                .catch(function(err){
                    res.setHeader('Content-Type', 'text/plain');
                    res.send(500, 'Erreur 500');
                    console.log(err);
                });

        });

    },

    getIDSData: function(callback){
        var self = this;
        var it = 1;
        for (var i = 1; i < 30000; i++) {

            (function (id) {

                self.exists(id)
                    .then(function (exists) {
                        if(exists){
                            callback.call(this, id);
                        }
                    })

            })(i);
        }

    },
    /**
     * Re-parse stored data. Qualify information and create a new object.
     * @param id
     */
    qualify:function(id){
        var self = this;
        var file = this.folder(id) + '/data.json';

        return new Promise(function(resolve, reject){
            fs.readFile(file, function(err, content){
                if(err){
                    reject({});
                }else {
                    resolve(JSON.parse(content));
                }
            });
        })

            .then(function(obj){

                if(typeof obj.ingredients != 'undefined'){
                    return obj;
                }

                return new Promise(function(resolve, reject){

                    var handler = new htmlparser.DomHandler(function (error, dom) {

                        if (error){
                            reject(error)
                        }
                        else{
                            resolve([obj, dom]);
                        }
                    });

                    var parser = new htmlparser.Parser(handler);
                    parser.write(obj.description);
                    parser.done();

                })

                .then(function(o){

                    return new Promise(function(resolve, reject){

                        var handler = new htmlparser.DomHandler(function (error, dom) {

                            if (error){
                                reject(error)
                            }
                            else{
                                o.push(dom);
                                resolve(o);
                            }
                        });

                        var parser = new htmlparser.Parser(handler);
                        parser.write(o[0].summary);
                        parser.done();

                    });
                })

                .then(function(o){
                    var obj =   o[0];
                    var dom =   o[1];
                    var dom2 =  o[2];

                    var recipe = {};

                    recipe.id = obj.id;
                    recipe.title = obj.title;

                    recipe.description =        domParser.getDescription(dom);
                    recipe.summary =            domParser.getSummary(dom);
                    recipe.timePreparation =    domParser.getTimePreparation(dom);
                    recipe.timeBaking =         domParser.getTimeBaking(dom);
                    recipe.timeRest =           domParser.getTimeRest(dom);
                    recipe.picture =            domParser.getPicture(dom).replace('-c' + obj.id, '-e' + obj.id);
                    recipe.ingredients =        domParser.getIngredients(dom, dom2);

                    return recipe;
                })
            })
    },
    /**
     *
     * @returns {*}
     */
    grab:function(){

        var self = this;
        var stacks = {};

        return this.getConfig().then(function(config){
            self.config = config;

            return new Promise(function(resolve, reject) {

                var it = 1;

                for (var i = 0; i < 30000; i++) {

                    (function (id) {
                        self.mkdir(id);

                        if(typeof self.config[id] != 'undefined'){
                            it++;
                            return;
                        }

                        self.exists(id)
                            .then(function (exists) {
                                if (exists) {
                                    self.config[id] = 'written';

                                    self.setConfig(self.config);

                                    return false;
                                } else {
                                    return self.write(id);
                                }
                            })

                            .then(function (o) {
                                if (!o) {
                                    self.config[id] = 'empty';
                                }else{
                                    self.config[id] = 'written';
                                }

                                self.setConfig(self.config);
                                it++;

                                if (i >= it) {
                                    resolve(stacks);
                                }
                            })

                            .catch(function(err){
                                stacks[id] = err;
                                console.log(id, ' ', err);
                            });

                    })(i);
                }
            })
        });
    },
    /**
     *
     * @param id
     * @returns {Promise|*}
     */
    get:function(id){
        return new Promise(function(resolve, reject){
            var http = require('http');

            var options = {
                host: 'www.atelierdeschefs.fr',
                port: 80,
                path: '/fr/recette/imprimerrecette/id/' + id
            };

            http.get(options, resolve).on('error', reject);
        })
            .then(function(res){

                return new Promise(function(resolve, reject){
                    var content = '';
                    res.setEncoding("utf8");
                    res.on("data", function (chunk) {
                        content += chunk;
                    });

                    res.on("end", function () {
                        resolve(content)
                    });

                })
            })
    },
    /**
     *
     * @returns {Promise}
     */
    getConfig:function(){

        return new Promise(function(resolve){

            fs.readFile(appDir + '/data/config.json', function(err, content){
                if(err){
                    resolve({});
                }else {
                    resolve(content == '' ? {} : JSON.parse(content));
                }
            });

        });

    },
    /**
     *
     * @param o
     * @returns {Promise}
     */
    setConfig:function(o){
        return new Promise(function(resolve){
            fs.writeFile(appDir  + '/data/config.json', JSON.stringify(o), resolve);
        });
    },
    /**
     *
     * @param id
     * @returns {*}
     */
    parse:function(id){
        var self = this;

        return this.get(id)

            .then(function(content){

                return new Promise(function(resolve, reject){

                    var handler = new htmlparser.DomHandler(function (error, dom) {

                        if (error){
                            reject(error)
                        }
                        else{
                            resolve(dom);
                        }
                    });

                    var parser = new htmlparser.Parser(handler);
                    parser.write(content.replace(/\r|\n/gi, ''));
                    parser.done();

                });

            })

            .then(function(dom){

                var title = domParser.getTitle(dom).trim();

                if(title == 'Recette de'){
                    return false;
                }

                var obj = {
                    title: title,
                    summary:domParser.getFirstPart(dom).trim(),
                    description:domParser.getSecondPart(dom).trim()
                };

                return obj;
            });


    },

    mkdir:function(id){
        var self = this;
        var folder = self.folder(id);

        return new Promise(function(resolve, reject){
            fs.mkdir(folder, 0777, function(){
                resolve(folder);
            });
        });
    },

    folder:function(id){
        return appDir + '/data/' + ((''+id).split('').join('/'));
    },

    exists:function(id){
        var old = appDir + '/data/old/'+id;
        var self= this;

        return new Promise(function(resolve, reject){
            fs.exists(self.folder(id)+ '/data.json', resolve);
        });

    },

    write:function(id){
        var self = this;
        var object = null;

        return self.parse(id)

            .then(function(o) {

                if (!o) {
                    return o;
                }

                o.id = id;
                object = o;

                return new Promise(function (resolve, reject) {
                    var file = self.folder(id) + '/data.json';

                    fs.open(file, 'w', 0777, function (err, fd) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(fd);
                        }
                    });
                })

                    .then(function (fd) {

                        return new Promise(function (resolve, reject) {

                            var buffer = new Buffer(JSON.stringify(object), 'UTF-8');

                            fs.write(fd, buffer, 0, buffer.length, null, function (err) {
                                if (err) {
                                    reject(err);
                                    return;
                                }

                                console.log('Recette written in ', self.folder(id));

                                fs.close(fd);
                                resolve(object);
                            });

                        })
                    });
            });
    }

    /*,
     //console.log(recipe.picture);

     /*return new Promise(function(resolve, reject){

     http.get(recipe.picture, function(res){
     var file = fs.createWriteStream(self.folder(id) + '/picture.jpg');
     recipe.picture =

     res.on("data", function (chunk) {
     file.write(chunk);
     });

     res.on("end", function () {
     file.end();
     resolve(recipe);
     });
     });

     });*/

};
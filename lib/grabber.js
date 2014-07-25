/**
 * Created by romak_000 on 19/07/2014.
 */

var Promise = require('promise');
var http = require('http');
var domParser = require('./dom-parser');
var fs = require('fs');

var path = require('path'),
    appDir = path.resolve('.');

var data = require('./data');

module.exports = {
    /**
     *
     * @returns {*}
     */
    getRecipes:function(){

        var self =      this;
        var offset =    18038;
        var size =      29000;
        var files =     [];

        return this.getConfig().then(function(config){

            self.config = config;

            return new Promise(function(resolve, reject) {

                var it = offset;

                console.log('Start get data from website');

                for (var i = offset; i < size; i++) {

                    if(typeof self.config[i] != 'undefined'){
                        it++;

                        if(it >= size){
                            self.setConfig(self.config);
                            resolve(files);
                        }

                        return;
                    }

                    self.config[i] = 'empty';

                    self.create(i)

                        .then(function(data){

                            console.log('written : ', data[1]);

                            self.config[data[0]] = 'written';
                            files.push(data[1]);

                            it++;

                            if(it >= size){
                                self.setConfig(self.config);
                                resolve(files);
                            }
                        })

                        .catch(function(e){
                            if(e){
                                console.log(e);
                            }else {

                                it++;

                                if (it >= size) {
                                    self.setConfig(self.config);
                                    resolve(files);
                                }
                            }
                        });

                }
            })
        });
    },
    /**
     *
     * @param id
     * @returns {*}
     */
    create:function(id){
        var self = this;

        try{
            fs.mkdirSync(data.path(id), 0777);
        }catch(er){}

        //récupération de la fiche
        return this.get(id).then(function(content) {
            return domParser.parse(content);
        })
            .then(function(recipe){
                recipe.id = id;

                //check picture
                return new Promise(function(resolve){
                    self.checkPicture(recipe.picture)
                        .then(function(exists){
                            if(!exists){
                                recipe.picture = '';
                            }

                            return data.write(id, recipe);
                        })
                        .then(function(file){
                            resolve(file);
                        })
                });
            })

            .then(function(file){
                return [id, file];
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

    checkPicture:function(link){
        return new Promise(function(resolve, reject){

            var req = http.get(link, function(res){

                var content = '';

                res.on("data", function (chunk) {
                    content += new Buffer(chunk).toString();

                    if(content.length > 21630){
                        resolve(true);
                    }
                });

                res.on('error', function(){
                    resolve(false);
                });

                res.on('end', function(){
                    resolve(false);
                });
            });

        });
    },
    /**
     *
     * @returns {Promise}
     */
    getConfig:function(){

        return new Promise(function(resolve){

            fs.readFile(appDir + '/data/config/grabber.json', function(err, content){
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
            fs.writeFile(appDir  + '/data/config/grabber.json', JSON.stringify(o), resolve);
        });
    }
};
/**
 * Created by romak_000 on 19/07/2014.
 */

var Promise = require('promise');
var htmlparser = require("htmlparser2");
var fs = require('fs');
var path = require('path'),
    appDir = path.resolve('.');
console.log(appDir);
//var Recette = require('./recette');

module.exports = {
    initialize:function(app){
        var self = this;

        app.get('/grabber/:id', function(req, res){

            self.get(req.params.id)

                .then(function(content){
                    res.setHeader('Content-Type', 'text/html');
                    res.send(content);
                })

                .catch(function(err){
                    res.setHeader('Content-Type', 'text/plain');
                    res.send(500, 'Erreur 500');
                    console.log(err);
                });

        });

        app.get('/grabber', function(req, res){

            new Promise(function(resolve, reject) {

                var it = 1;

                try {

                    for (var i = 0; i < 30000; i++) {

                        (function (id) {
                            self.exists(id)
                                .then(function (exists) {
                                    if (exists) {
                                        return false;
                                    } else {
                                        return self.write(id);
                                    }
                                })

                                .then(function (o) {
                                    if (!o) {
                                        it++;
                                        return;
                                    }

                                    if (o.length >= it) {
                                        resolve();
                                    }

                                    it++;
                                })

                                .catch(function(err){
                                    reject(err);
                                });

                        })(i);
                    }

                } catch (er) {
                    console.log(er);
                }
            })
                .then(function(){
                    res.setHeader('Content-Type', 'text/plain');
                    res.send(200, 'OK');
                })

                .catch(function(err){
                    res.setHeader('Content-Type', 'text/plain');
                    res.send(500, 'Erreur 500');
                    console.log(err);
                });

        });

        app.get('/grabber/parse/:id', function(req, res){

            self.parse(req.params.id)

                .then(function(obj){
                    if(!obj){
                        res.setHeader('Content-Type', 'text/plain');
                        res.send(404, 'Erreur 404');
                    }else {
                        res.setHeader('Content-Type', 'text/html');
                        res.json(obj);
                    }
                })

                .catch(function(err){
                    res.setHeader('Content-Type', 'text/plain');
                    res.send(500, 'Erreur 500');
                    console.log(err);
                });

        });
    },

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
     * @param id
     * @returns {*}
     */
    parse:function(id){
        var self = this;

        return this.get(id)

            .then(function(content){

                return new Promise(function(resolve, reject){
                    //console.log(window);

                    var handler = new htmlparser.DomHandler(function (error, dom) {

                        if (error){
                            reject(error)
                        }
                        else{
                            //console.log(dom);
                            resolve(dom);
                        }
                    });

                    var parser = new htmlparser.Parser(handler);
                    parser.write(content.replace(/\r|\n/gi, ''));
                    parser.done();

                });

            })

            .then(function(dom){

                var title = self.getTitle(dom).trim();

                if(title == 'Recette de'){
                    return false;
                }

                var obj = {
                    title: title,
                    summary:self.getSummary(dom).trim(),
                    description:self.getDescription(dom).trim()
                };

                return obj;
            });


    },

    getTitle:function(dom){

        var document = htmlparser.DomUtils;

        var nodes = document.getElementsByTagName('h1', dom);
        var h1 = document.getElements({class:"marginT0"}, nodes);

        document.removeElement(h1);

        return h1[0].children[0].data;
    },

    getSummary:function(dom){
        var document = htmlparser.DomUtils;
        var nodes = document.getElements({class:"bd_b80d21_R_2px_dot va_top"}, dom);

        return document.getInnerHTML(nodes[0]);

    },
    getDescription:function(dom){
        var document = htmlparser.DomUtils;
        var nodes = document.getElements({class:"f_left marginL20"}, dom);

        var h1 = document.getElements({class:"marginT0"}, document.getElementsByTagName('h1', nodes));

        document.removeElement(h1[0]);

        return document.getInnerHTML(nodes[0]);

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

                console.log('content parsed ', id);

                o.id = id;
                object = o;

                return self.mkdir(id)

                    .then(function () {

                        return new Promise(function (resolve, reject) {
                            var file = self.folder(id) + '/data.json';

                            fs.open(file, 'w', 0777, function (err, fd) {
                                if (err) {
                                    reject(err);
                                } else {
                                    resolve(fd);
                                }
                            });
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
};
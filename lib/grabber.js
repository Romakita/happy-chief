/**
 * Created by romak_000 on 19/07/2014.
 */

var Promise = require('promise');

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
                    res.send(500, err);
                });

        });

        app.get('/grabber/parse/:id', function(req, res){

            self.parse(req.params.id)

                .then(function(obj){
                    res.setHeader('Content-Type', 'text/html');
                    res.json(obj);
                })

                .catch(function(err){
                    res.setHeader('Content-Type', 'text/plain');
                    res.send(500, err);
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

        return this.get(id)

            .then(function(content){

                return new Promise(function(resolve, reject){

                    var handler = new htmlparser.DomHandler(function (error, dom) {
                        if (error){
                            reject(error)
                        }
                        else{
                            console.log(dom);
                            resolve(dom);
                        }
                        console.log(dom);
                    });

                    var htmlparser = require("htmlparser2");

                    var parser = new htmlparser.Parser(handler);
                    parser.write(content);
                    parser.done();

                });

            })

            .then(function(dom){

                return dom;
            });


    }
};
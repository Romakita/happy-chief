/**
 * Created by romain.lenzotti on 21/07/2014.
 */
var fs = require('fs');
var Promise = require('promise');
var path = require('path'),
    appDir = path.resolve('.');


module.exports = {
    console: console.log,
    /**
     *
     * @param done
     * @param c
     */
    install: function(done, c){
        var self = this;

        this.useConsole(c);

        require('./mongoose-connect')
            .initialize()
            .then(function(){

            var Recipe = require('./../class/recipe');

            self.unzip().then(function(files){

                self.console('Install DB');

                var it = 0;
                for(var i = 0; i < files.length; i++){
                    self.read(files[i])
                        .then(function(o){
                            if(typeof o == 'undefined'){
                                console.log('erreur');
                            }
                            o.title = o.title.replace('Recette de ', '');

                            return Recipe.commit(o);
                        })
                        .then(function(o){

                            console.log(o.id, ' inserted ', it);

                            it++;

                            if(it >= files.length){

                                self.console('DB installed, ', it, ' inserted');

                                done();
                            }

                        })
                        .catch(function(err){
                            self.console(err);
                        });
                }
            });
        })
    },
    /**
     *
     * @param console
     */
    useConsole:function(console){
        this.console = console;
    },
    /**
     * Retourne le chemin du dossier de l'ID.
     * @param id
     * @returns {*}
     */
    path:function(id){

        if(typeof id == 'undefined'){
            return appDir + '/data';
        }

        if((''+id).match('data.json')){
            return ''+id.replace('/data.json','');
        }

        return appDir + '/data/' + ((''+id).replace(/\//gi,'').split('').join('/'));
    },
    /**
     * Indique si le fichier existe.
     * @param id
     * @returns {Promise}
     */
    exists:function(id){

        var self = this;

        return new Promise(function(resolve, reject){
            fs.exists(self.path(id)+ '/data.json', function(exists){
                if(exists){
                    resolve(true);
                }else{
                    reject(false);
                }
            });
        });

    },
    /**
     * Ecrit les informations le fichier ID.
     * @param id
     * @param o
     * @returns {Promise}
     */
    write:function(id, o){

        var self = this;

        return new Promise(function(resolve, reject) {

            var buffer = new Buffer(typeof o == 'object' ? JSON.stringify(o) : o, 'utf8');
            var file = self.path(id) + '/data.json';

            fs.writeFile(file, buffer, function (err) {
                if(err){
                    reject(err);
                }else{
                    resolve(file);
                }
            });
        });
    },
    /**
     * Lit le contenu du data.json et renvoi son objet JSON.
     * @param id
     * @returns {Promise}
     */
    read:function(id){

        var self = this;

        return new Promise(function(resolve, reject) {
            fs.readFile(self.path(id) + '/data.json', {encoding:'utf8'}, function (err, content) {
                if (err) {
                    reject(err);
                } else {
                    resolve(JSON.parse(content));
                }
            });
        });

    },
    /**
     *
     * @param id
     * @returns {Promise}
     */
    unzip:function(){

        var self = this;

        return new Promise(function(resolve, reject){

            self.console('Unzip recipes.zip');

            fs.readFile(self.path() + '/recipes.zip', 'binary', function(err, data){

                self.console('Content unzipped');

                if(err){
                    reject(err);
                }else {
                    var zip = new require('node-zip')(data, {base64: false, checkCRC32: true});
                    var it  = 0;

                    for(var key in zip.files){
                        var file = zip.files[key];

                        if(file.options.dir){
                            try{
                                fs.mkdirSync(self.path() + '/' + file.name, 0777);
                            }catch(er){}
                        }else{
                            if(file.name != 'config.json'){
                                it++;
                            }
                        }
                    }

                    self.console(it, ' files to unzip, let\'s go !');
                    var files = [];

                    for(var key in zip.files){
                        var file = zip.files[key];

                        if(!file.options.dir){
                            if(file.name != 'config.json'){

                                self.write(file.name.replace('data.json', ''), new Buffer(file._data, 'ascii').toString())
                                    .then(function(file){

                                        files.push(file);

                                        it--;

                                        if(it <= 0){
                                            self.console(files.length, ' Unzipped files');
                                            resolve(files);
                                        }
                                    })
                                    .catch(function(err){
                                        self.console(err);
                                    });
                            }
                        }
                    }

                }
            });
        });

    }
};
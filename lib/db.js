/**
 * Created by romain.lenzotti on 21/07/2014.
 */
var mongoose = require('mongoose');
var Promise = require('promise');
var fs = require('fs');
var path = require('path'),
    appDir = path.resolve('.');

module.exports = {
    SECRET_KEY:     null,
    connectionDB:   null,
    /**
     *
     */
    initialize:function(app){
        var self = this;

        return this.getConfig().then(function(obj){

            self.SECRET_KEY = obj.DB_NAME + obj.HOST + 'secret';

            self.DB_NAME = obj.DB_NAME;
            self.HOST = obj.HOST;

            self.connect();

            process.on('exit', function(){
                mongoose.disconnect();
            });

            if(app){
                app.use(function(req, res, next){
                    req.db = self.connectionDB;
                    next();
                });
            }
        });


    },
    /**
     *
     * @returns {connectToDB}
     */
    connect:function(){
        if(this.connectionDB === null) {
            this.connectionDB = mongoose.connect('mongodb://' + this.HOST + '/' + this.DB_NAME, function (err) {
                if (err) {
                    throw err;
                }
            });
        }

        return this.connectToDB;
    },
    /**
     *
     * @returns {Promise}
     */
    getConfig:function(){

        return new Promise(function(resolve){

            fs.readFile(appDir + '/data/conf/db.json', function(err, content){
                if(err){
                    resolve({});
                }else {
                    resolve(content == '' ? {} : JSON.parse(content));
                }
            });

        });
    }
};
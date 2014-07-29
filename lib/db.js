/**
 * Created by romain.lenzotti on 21/07/2014.
 */
var mongoose = require('mongoose');
var Promise = require('promise');
var conf = require('../conf/db.js');

module.exports = {
    connectionDB:   null,
    /**
     *
     */
    initialize:function(app){
        var self = this;

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
    },
    /**
     *
     * @returns {connectToDB}
     */
    connect:function(){
        if(this.connectionDB === null) {
            this.connectionDB = mongoose.connect('mongodb://' + conf.HOST + '/' + conf.DB_NAME, function (err) {
                if (err) {
                    throw err;
                }
            });
        }

        return this.connectToDB;
    }
};
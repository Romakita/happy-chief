/**
 * Created by romain.lenzotti on 21/07/2014.
 */
var mongoose = require('mongoose');

module.exports = {
    DB_NAME:       'happy-chief',
    HOST:          'happychief:md77happy@ds027779.mongolab.com:27779',
    SECRET_KEY:     null,
    connectionDB:   null,
    /**
     *
     */
    initialize:function(app){
        var self = this;

        this.SECRET_KEY = this.DB_NAME + this.HOST + 'secret';

        this.connect();

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
            this.connectionDB = mongoose.connect('mongodb://' + this.HOST + '/' + this.DB_NAME, function (err) {
                if (err) {
                    throw err;
                }
            });
        }

        return this.connectToDB;
    }
}
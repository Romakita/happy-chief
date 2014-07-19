/**
 * Created by romain.lenzotti on 30/05/2014.
 */
'use strict';

var express =       require('express'),
    http    =       require('http'),
    path    =       require('path'),
    bodyParser =    require('body-parser'),
    mongoose =      require('mongoose');

var app =  module.exports = express();
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded()); // to support URL-encoded bodies
//
// CONSTANTES
//
app.DB_NAME =       'happy-chief-recettes';
app.HOST =          'localhost';
app.SECRET_KEY =    app.DB_NAME + app.HOST + 'secret';
app.connectionDB =  null;

app.connectToDB = function(){

    if(this.connectionDB === null) {
        this.connectionDB = mongoose.connect('mongodb://' + app.HOST + '/' + app.DB_NAME, function (err) {
            if (err) {
                throw err;
            }
        });
    }

    return app.connectToDB;
};

app.connectToDB();


app.use(function(req, res, next){
    req.db = app.connectionDB;
    next();
});
//app.use('/admin', expressJwt({secret: app.SECRET_KEY}));
//
// Methodes
//


app.closeDB = function(){
    if(this.connectionDB !== null){
        mongoose.disconnect();
        this.connectionDB = null;
        return true;
    }
    return false;
};

process.on('exit', function(){
    var result = db.close();
    console.log('disconnecting db : ', result);
});
//
//
//

//
// install
//
require('./lib/grabber').initialize(app);

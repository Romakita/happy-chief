/**
 * Created by romain.lenzotti on 30/05/2014.
 */
'use strict';

var express =       require('express'),
    bodyParser =    require('body-parser');

var app =  module.exports = express();
app.use(bodyParser.json());                         // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({extended:true}));    // to support URL-encoded bodies

require('./lib/db').initialize(app)
    .then(function(){

        require('./lib/recipe').initialize(app);
        require('./lib/category').initialize(app);

    });



/**
 * Created by romain.lenzotti on 30/05/2014.
 */
'use strict';

var express =       require('express');
var expressSession =require('express-session');
var passport =      require('passport');
var flash =         require('connect-flash');
var morgan =        require('morgan');
var cookieParser =  require('cookie-parser');
var bodyParser =    require('body-parser');
var expressJwt =       require('express-jwt');

var app =  module.exports = express();
//app.use(morgan('dev'));                             // log every request to the console
app.use(cookieParser());                            // read cookies (needed for auth)
app.use(bodyParser.json());                         // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({extended:true}));    // to support URL-encoded bodies

app.use(expressSession({
    secret: 'secretkeyhappychief77',
    maxAge: new Date(Date.now() + 3600000),
    resave:true,
    saveUninitialized:true
}));

app.use('/admin', expressJwt({
    secret: 'secretkeyhappychief77',
    maxAge: new Date(Date.now() + 3600000),
    resave:true,
    saveUninitialized:true
})); // session secret

app.use(passport.initialize());
app.use(passport.session());    // persistent login sessions
app.use(flash());               // use connect-flash for flash messages stored in session

require('./conf/passport')(passport); // pass passport for configuration
require('./lib/db').initialize(app);
require('./lib/recipe').initialize(app, passport);
require('./lib/category').initialize(app, passport);
require('./lib/user').initialize(app, passport);
require('./lib/bookmark').initialize(app, passport);

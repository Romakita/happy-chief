'use strict';

var path = require('path');
var connect = require('connect');
var http = require('http');
var https = require('https');
var serveStatic = require('serve-static');

var options = {
    protocol:       'http',
    port:           80,
    hostname:       'localhost',
    base:           'dist',
    debug:          false
};

if (options.protocol !== 'http' && options.protocol !== 'https') {
    console.log('protocol option must be \'http\' or \'https\'');
}
// Connect will listen to all interfaces if hostname is null.
if (options.hostname === '*') {
    options.hostname = null;
}

var app = connect();

app.use(serveStatic(options.base));
app.use(require('./server.js'));

var server = null;

if (options.protocol === 'https') {
    server = https.createServer({
        key:        options.key,
        cert:       options.cert,
        ca:         options.ca,
        passphrase: options.passphrase
    }, app);
} else {
    server = http.createServer(app);
}

server
    .listen(options.port, options.hostname)
    .on('listening', function() {
        var address = server.address();
        console.log('Started connect web server on ' + (address.address || 'localhost') + ':' + address.port + '.');
    })
    .on('error', function(err) {
        if (err.code === 'EADDRINUSE') {
            console.error('Port ' + options.port + ' is already in use by another process.');
        } else {
            console.error(err);
        }
    });
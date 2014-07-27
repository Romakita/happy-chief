'use strict';

var path = require('path');
var connect = require('connect');
var http = require('http');
var https = require('https');
var open = require('open');
var serveStatic = require('serve-static');

var options = {
    protocol:       'http',
    port:           80,
    hostname:       'localhost',
    base:           'dist',
    directory:      null,
    keepalive:      false,
    debug:          false,
    open:           false
};

if (options.protocol !== 'http' && options.protocol !== 'https') {
    console.log('protocol option must be \'http\' or \'https\'');
}
// Connect will listen to all interfaces if hostname is null.
if (options.hostname === '*') {
    options.hostname = null;
}

// Connect will listen to ephemeral port if asked
if (options.port === '?') {
    options.port = 0;
}

var middleware = options.middleware ? options.middleware.call(null, connect, options) : [];

// Start server.
var keepAlive = options.keepalive;

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

        /*if (options.open === true) {
            open(options.protocol + '://' + address.address + ':' + address.port);
        } else if (typeof options.open === 'string') {
            open(options.open);
        }*/


    })
    .on('error', function(err) {
        if (err.code === 'EADDRINUSE') {
            console.error('Port ' + options.port + ' is already in use by another process.');
        } else {
            console.error(err);
        }
    });

// So many people expect this task to keep alive that I'm adding an option
// for it. Running the task explicitly as grunt:keepalive will override any
// value stored in the config. Have fun, people.
if (keepAlive) {
    // This is now an async task. Since we don't call the "done"
    // function, this task will never, ever, ever terminate. Have fun!
    console.error('Waiting forever...\n');
}
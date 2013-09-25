 /*!
  * SGCA - 2013
 */
var express = require('express');
var path = require('path');
var http = require('http');
var fs = require('fs');

var coreApp  = __dirname + '/core';

//middleware definitions
// Load configurations
// if test env, load example file

// var env = process.env.NODE_ENV || 'development'
//   , config = require('./config/config')[env]
//   , auth = require('./config/middlewares/authorization')
//   , mongoose = require('mongoose')

// Bootstrap db connection
//mongoose.connect(config.db)

// Load configurations
// modified to see if joel notice it
console.log('server: BEGIN at: ['+ __dirname +"]");
console.log('NODE_APP_MODE: ['+process.env.NODE_APP_MODE +"]");
console.log('NODE_PORT: ['+process.env.NODE_PORT +"]");
console.log('NODE_LOG: ['+process.env.NODE_LOG +"]");

var env = process.env.NODE_APP_MODE || 'development'
var config = require(coreApp + '/config/config')[env];

var mongodb = require(coreApp + '/config/dbconnect');
mongodb.connect(config);

var app = express();
config.routesBootstrap(app,express);

http.createServer(app).listen(app.get('port'), function () {
    console.log("Express server listening on port " + app.get('port'));
});
//test2

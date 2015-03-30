var root = '../../../';
var coreApp  = root + 'core';
var env = process.env.NODE_APP_MODE || 'development';
var config = require(coreApp + '/config/config.js')[env];
var dbConnect = require(coreApp + '/config/dbconnect.js');

var mongo = require('mongodb');
var BSON = mongo.BSONPure;


var requireModel = require(root + 'calendar/models/requireModel.js');
var BaseModel = require(root + 'calendar/models/basemodel.js');


it('deberia inicializar DB',function(done){
  
  dbConnect.connect(config,function(err,db){
    expect(err).toBeNull();
    expect(db).not.toBeNull();

    done();
  });
});

module.exports.getDb = dbConnect.getDb;
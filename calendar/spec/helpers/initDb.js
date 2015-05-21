var root = '../../../';

if (process.env.NODE_ENV) {
  // XXX: tomar development por defecto para que las instalaciones actuales siguan funcionando.
  process.env.NODE_ENV = 'development';
}

var config = require(config);
var coreApp  = root + 'core';
var dbConnect = require(coreApp + '/dbconnect.js');

var mongo = require('mongodb');
var BSON = mongo.BSONPure;


var requireModel = require(root + 'calendar/models/requireModel.js');
var BaseModel = require(root + 'calendar/models/basemodel.js');


it('deberia inicializar DB',function(done){

  dbConnect.connect(function(err,db){
    expect(err).toBeNull();
    expect(db).not.toBeNull();
    
    setTimeout(function(){
      done();  
    },10);
  });
});

module.exports.getDb = dbConnect.getDb;

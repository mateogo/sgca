var root = '../../../';
var coreApp  = root + 'core';
var env = process.env.NODE_APP_MODE || 'development';
var config = require(coreApp + '/config/config.js')[env];
var mongodb = require(coreApp + '/config/dbconnect.js');


it('deberia inicializar DB',function(done){
  
  mongodb.connect(config,function(err,db){
    expect(err).toBeNull();
    
    expect(db).not.toBeNull();
    
    done();
  });
});

module.exports.getDb = mongodb.getDb;
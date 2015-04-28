

var async = require('async');
var _ = require('underscore');

var BaseModel = require('./basemodel.js');

var dbi;

var entityCol = 'assets';


var Assets = BaseModel.extend({
  
  constructor: function() {
    this.entityCol = entityCol;
    BaseModel.apply(this,arguments);
  },
  
  defaults: {
  },
  
  validation: function(cb){
    cb(null);
  },
},{
  entityCol: entityCol,
  defaultSort: {cnumber:1},
  findByIds: function(ids,cb){
    if(!ids || ids.length < 1) return cb('',[]);
    console.log('jojo');
   
    var idsArray = [];
    for (var i = 0; i < ids.length; i++) {
      idsArray.push(new BaseModel.ObjectID(ids[i]));
    }
    
    var self = this;
    BaseModel.dbi.collection(this.entityCol, function(err, collection) {
      collection.find({'_id':{$in: idsArray}}).toArray(function(err, item) {
          if(err) return cb(err);
          
          cb(null, item);
      });
    });
  }
});


module.exports.getModel = function(){
  return Assets;
};

module.exports.createNew = function(){
  return new Assets();
};

module.exports.setDb = function(db){
  dbi = db;
  return this;
};
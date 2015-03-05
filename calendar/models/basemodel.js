var rootPath = '../../';


var async = require('async');
var Backbone = require('backbone');
var mongo = require('mongodb');
var BSON = mongo.BSONPure;

var dbconnect = require(rootPath + 'core/config/dbconnect.js');


var onReadyCallbacks = [];

dbconnect.getDb(function(err,db){
  BaseModel.dbi = db;  
  
  for (var i = 0; i < onReadyCallbacks.length; i++) {
    onReadyCallbacks[i](err);
  }
});


var BaseModel = Backbone.Model.extend({
  idAttribute: "_id",
  
  save: function(callback){
    var self = this;
    async.series([this.validation.bind(this),
                   this._beforeSave.bind(this),
                   function(cb){
                     if(self.isNew()){
                       self._insert(cb);
                     }else{
                       self._update(cb);
                     }
                   }
                  ],function(err,results){
                      if(err) return callback(err);
            
                      callback(null,results[results.length-1]);
                  });
  },
  
  validation: function(){
    
  },
  
  remove: function(callback){
    if(!this.entityCol) return callback('entityCol isn\'t defined');
    
    var id = this.id;
    
    BaseModel.dbi.collection(this.entityCol, function(err, collection) {
      collection.remove({'_id':new BaseModel.ObjectID(id)},callback);
    });
  },
  
  _insert: function(cb){
    
  },
  update: function(cb){
    
  },
  
});

BaseModel.ObjectID = BSON.ObjectID;
BaseModel.onReady = function(cb){
  if(!cb) return;
  
  if(BaseModel.dbi){
    cb();
  }else{
    onReadyCallbacks.push(cb);
  }
};
module.exports = BaseModel;
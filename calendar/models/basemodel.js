var rootPath = '../../';


var async = require('async');
var Backbone = require('backbone');



var BaseModel = Backbone.Model.extend({
  idAttribute: "_id",
  
  findById: function(id,cb){
    this.constructor.findById(id,cb);
  },
  
  save: function(callback){
    var self = this;
    async.series([this.validation.bind(this),
                  this._beforeSave.bind(this),
                  function(cb){
                     if(self.isNew()){
                       self._insert(cb);//function(err,reslt){callback(err,reslt);});
                     }else{
                       self._update(cb);
                     }
                   },
                   function(cb){
                     self._afterSave(cb);
                   }
                  ],function(err,results){
                      if(err) return callback(err);
                       
                      callback(null,results[results.length-2]);
                  });
  },
  
  validation: function(cb){
    cb();
  },
  
  remove: function(callback){
    if(!this.entityCol) return callback('entityCol isn\'t defined');
    
    var id = this.id;
    
    BaseModel.dbi.collection(this.entityCol, function(err, collection) {
      collection.remove({'_id':new BaseModel.ObjectID(id)},callback);
    });
  },
  
  _beforeSave: function(cb){
    cb();
  },
  
  _afterSave: function(cb){
    cb();
  },
  
  _insert: function(cb){
    var self = this;
    var raw = this.attributes;
    
    
    BaseModel.dbi.collection(this.entityCol,function(err,collection){
      if(err) return cb(err);
      
      collection.insert(raw,{w:1}, function(err, result) {
          if(err) return cb(err);
          
          var raw = result[0];
          
          self.findById(raw._id,cb);
        });
    });
      
  },
  
  _update: function(cb){
    var self = this;
    var raw = this.attributes;
    var _id = raw._id;
    var id =  new BaseModel.ObjectID(_id);
    delete raw._id;
    BaseModel.dbi.collection(this.entityCol).update({'_id':id}, raw, {safe:true}, function(err, count) {
      if(err) return cb(err);
      
      if(count === 0){
        return cb('No se actualizo');
      }
      
      self.findById(_id,cb);
    });
  }  
  
},{
   //static methods
  findById: function(id,cb){
    var idStr = (typeof(id) === 'object')? id.toString(): id;
    
    if(!id || (idStr.length !== 12 && idStr.length !== 24)){
      return cb('invalid id');
    }
    
    var self = this;
    BaseModel.dbi.collection(this.entityCol, function(err, collection) {
      collection.findOne({'_id':new BaseModel.ObjectID(id)}, function(err, item) {
          if(err) return cb(err);
          
          if(item){
            item = new self(item);
          }
          cb(null, item);
      });
    });
  },
  findByIds: function(ids,cb){
    if(!ids || ids.length < 1) return cb('',[]);
   
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
  },
  find: function(query,cb){
    var sort = this.defaultSort;
    BaseModel.dbi.collection(this.entityCol,function(err,collection){
      if(err) return cb(err);
      
      collection.find(query).sort(sort).toArray(cb);
    });
  }
});


BaseModel.onReady = function(cb){
  if(!cb) return;
  
  if(BaseModel.dbi){
    cb();
  }else{
    onReadyCallbacks.push(cb);
  }
};

var onReadyCallbacks = [];
BaseModel.setDb = function(db){
  BaseModel.dbi = db;
  
  for (var i = 0; i < onReadyCallbacks.length; i++) {
    onReadyCallbacks[i]();
  }
  onReadyCallbacks = [];
  return this;
};

BaseModel.setBSON = function(BSON){
  BaseModel.ObjectID = BSON.ObjectID;
  return this;
};

module.exports = BaseModel;
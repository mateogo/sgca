
var Backbone = require('backbone');
var async = require('async');

var dbi;

var entityCol = 'artactivities';

var ArtActivity = Backbone.Model.extend({
  idAttribute: "_id",
  defaults: {
    
  },
  
  validation: function(cb){
    
    cb(null);
  },
  
  fetch: function(query,cb){
    dbi.collection(entityCol,function(err,collection){
      if(err) cb(err);
      
      collection.find(query).toArray(cb);
    });
  },
  
  find: this.fetch,
  findAll: this.fetch,
  findById: function(id,cb){
    cb('findById under construcction');
  },

  save: function(callback){
    var self = this;
    async.series([function(cb){
                      self.validation(cb);
                   },
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
  
  _insert: function(cb){
    cb('insert under construction');
  },
  
  _update: function(cb){
    cb('update under construction');
  }
  
  
  
});


module.exports.getModel = function(){
  return ArtActivity;
};

module.exports.createNew = function(){
  return new ArtActivity();
};

module.exports.setDb = function(db){
  dbi = db;
  return this;
};
var rootPath = '../../';


var async = require('async');
var Backbone = require('backbone');


var AppError = require(rootPath + 'core/apperror.js');



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

    var id = (this.id)? this.id : this.get('_id');
    var self = this;

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
  find: function(query,sortparam,cb){
    var self = this;
    var sort = this.defaultSort;

    if(cb){
      sort = sortparam;
    }else{
      cb = sortparam;
    }

    if(query.$query && query.$orderby){
      sort = query.$orderby;
      query = query.$query;
    }

    BaseModel.dbi.collection(this.entityCol,function(err,collection){
      if(err) return cb(err);

      collection.find(query).sort(sort).toArray(function(err,array){
        if(err) return cb(err);

        var tmp = [];
        for (var i = 0; i < array.length; i++) {
          tmp.push(new self(array[i]));
        }

        cb(null,tmp);
      });
    });
  },

  count: function(query,cb){
    BaseModel.dbi.collection(this.entityCol,function(err,collection){
      if(err) return cb(err);

      collection.find(query).count(cb);
    });
  },

  /**
   * @param {Object} query: mongo query, but it could have a two special fields:
   *             {int (1-n)} page
   *             {int} per_page
   * return return the PageableCollection structure:
             [{"total_entries": 100}, [{}, {}, ...]]
             reference https://github.com/backbone-paginator/backbone.paginator#id1
   */

  findPageable: function(query,sortparam,cb){
    var self = this;
    var sort = this.defaultSort;

    if(cb){
      sort = sortparam;
    }else{
      cb = sortparam;
    }

    if(query.$query && query.$orderby){
      sort = query.$orderby;
      query = query.$query;
    }

    var pageNumber = 1;
    var per_page = 25;
    if(query.page){
      pageNumber = query.page;
      delete query.page;
    }

    if(query.per_page){
      per_page = query.per_page;
      delete query.per_page;
    }

    var skipValue = pageNumber > 0 ? ((pageNumber-1)*per_page) : 0;

    BaseModel.dbi.collection(this.entityCol,function(err,collection){
      if(err) return cb(err);

      async.series([
        //count total
        function(cb){
          self.count(query,cb);
        },
        // run query
        function(cb){
          collection.find(query).sort(sort).skip(skipValue).limit(per_page).toArray(function(err,array){
            if(err) return cb(err);

            var tmp = [];
            for (var i = 0; i < array.length; i++) {
              tmp.push(new self(array[i]));
            }

            cb(null,tmp);
          });
        }
      ],function(err,results){
        if(err) return cb(err);

        cb(null,[{'total_entries':results[0]},results[1]]);
      });
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

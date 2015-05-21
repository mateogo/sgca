var config = require('config');

var BaseModel = require('./basemodel.js');
var async = require('async');
var _ = require('underscore');


var Serializer = BaseModel.extend({
  
  constructor: function(){
    this.entityCol = config.get('Calendar.collections.seriales');
    this.seriales = {};
    this.adapters = {};
    this.onReadyCallbacks = [];
  },
  
  initSeries: function(adapters,callback){
    var self = this;
    var keys = _.keys(adapters);
    
    BaseModel.onReady(function(err,dbi){
      
      async.each(keys,function(adapterKey,cb){
        
        var adapter = adapters[adapterKey];
        var serieKey = adapter.serie;
        
        self.adapters[serieKey] = adapter;

        self._fetchSerial(serieKey,cb);
        
      },function(err){
        self._isReady = true;
        if(callback) callback(err);
        
        _.each(self.onReadyCallbacks,function(cb){
          cb();
        });
      });  
    });    
  },
  
  
  
  nextSerie: function(serieKey,cb){
    var self = this;
    
    async.series([this.onReady.bind(this),
                  BaseModel.onReady
                  ],
      function(err){
        if(err) return cb(err);
      
        var adapter = self.adapters[serieKey];
        var serial = self.seriales[serieKey];
        
        var nxt = serial.nextnum + adapter.base;
        serial.nextnum += 1;
        serial.feUltMod = new Date();
  
        self._updateSerialCollection(serial);
        
        cb(null,adapter.prefix + nxt);
    });
  },
  
  onReady: function(callback){
    if(this._isReady){
      callback();
    }else{
      this.onReadyCallbacks.push(callback);
    }
  },
  
  _fetchSerial: function(serieKey,cb){
    var serie = serieKey;
    
    var self = this;
    
    BaseModel.dbi.collection(this.entityCol,function(err,collection){
      if(err){
        console.log('Serializer:_fetchSerial:collection not found');
        console.log(err);
        return;
      }
      
      collection.findOne({'serie':serie}, function(err, item) {
        if(!item){
            console.log('INIT:fetchserial:serial not found: [%s]',serie);
            item = self._initSerial(serie);

            collection.insert(item, {safe:true}, function(err, result) {
                if (err) {
                    console.log('Error initializing  [%s] error: %s',self.entityCol,err);
                } else {
                    console.log('NEW serial: se inserto nuevo [%s] [%s] nodos',self.entityCol,result);
                    self._addSerial(serie,result[0]);
                    if(cb) cb();
                }
            });
        }else{
            self._addSerial(serie,item);
            if(cb) cb();
        }  
      });
    });
  },
  
  _updateSerialCollection: function(serial){
    var collection = BaseModel.dbi.collection(this.entityCol);    
    collection.update( {'_id':serial._id}, serial,{w:1},function(err,result){
      if(err) throw err;
    });
  },
  
  _initSerial: function(serie){
    var serial ={
        _id: null,
        serie: serie,
        nextnum: 1,
        feUltMod: new Date()
    };
    return serial;
  },
  
  _addSerial: function(serial,data){
    this.seriales[serial] = data;
  }
  
  
});

module.exports = new Serializer();

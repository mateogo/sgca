
var BaseModel = require('./basemodel.js');
var serializer = require('./serializer.js');

var dbi;

var entityCol = 'artactivities';

var serieKey = 'artactivity101';

serializer.initSeries([
  {
    serie: serieKey,
    base: 1000000,
    prefix: 'AA'
  }]
);


var ArtActivity = BaseModel.extend({
  
  constructor: function() {
    this.entityCol = entityCol;
    BaseModel.apply(this,arguments);
  },
  
  defaults: {
    cnumber: null,
    type_event: '',
    slug: '',
    description: '',
    fevent: '', //debe ser mayor a 40 dias de la fecha de carga
    fdesde: null,
    fhasta: null,
    leyendafecha: '',
    fecomp: null,
    lugar: '',
    airelibre: false,
    provevento: '',
    locevento: '',
    cevento: '',
    
    fcreate: '',
    fupdate: ''
      
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
    
    //dbi.collection(entityCol)
    
    cb('findById under construcction');
  },
  
  _beforeSave: function(cb){
    var self = this;
    if(this.get('cnumber') === null){
      
      serializer.nextSerie(serieKey,function(err,number){
        if(err) return cb(err);
        
        self.set('cnumber',number);
        cb();
      });
      
    }else{
      cb();  
    }
  },
  
  _insert: function(cb){
    var raw = this.attributes;
    
    BaseModel.dbi.collection(entityCol).insert(raw,{w:1}, function(err, result) {
      if(err) cb(err);
      
      var raw = result[0];
      cb(null,new ArtActivity(raw));
    });
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

var BaseModel = require('./basemodel.js');
var serializer = require('./serializer.js');
var async = require('async');

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
    fecomp: '',
    lugar: '',
    airelibre: false,
    provevento: '',
    locevento: '',
    cevento: '',
    
    fealta: null,
    feultmod: null
      
  },
  
  validation: function(cb){
    cb(null);
  },
  
  _beforeSave: function(callback){
    var self = this;
    async.series([
       //setear el número código
       function(cb){
         if(self.get('cnumber') === null){
           
           serializer.nextSerie(serieKey,function(err,number){
             if(err) return cb(err);
             
             self.set('cnumber',number);
             cb();
           });
           
         }else{
           cb();  
         }
       },
       
       //setear fechas
       function(cb){
         if(self.isNew()){
           self.set('fealta',new Date());
         }
         self.set('feultmod',new Date());
         
         cb();
       }
       
    ],
    //done
    function(err,results){
      callback(err);
    });
  }
},{
  entityCol: entityCol,
  defaultSort: {cnumber:1}
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

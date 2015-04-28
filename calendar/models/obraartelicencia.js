

var serializer = require('./serializer.js');
var async = require('async');
var _ = require('underscore');

var BaseModel = require('./basemodel.js');
var Assets = require('./assets.js').getModel();

var dbi;

var entityCol = 'obrasartelicencias';
var serieKey = 'obrasartelicencias101';

serializer.initSeries([
  {
    serie: serieKey,
    base: 1000000,
    prefix: 'LC'
  }]
);


var Licencia = BaseModel.extend({
  
  constructor: function() {
    this.entityCol = entityCol;
    BaseModel.apply(this,arguments);
  },
  
  defaults: {
    cnumber: null,
    type_event: '',
    slug: '',
    description: '',
    procedure: '',
    material: '',
    dimensions: '',
    value: 0,
    madeyear: '',
    
    estado_alta: 'draft',
    nivel_ejecucion: '',
    
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
  return Licencia;
};

module.exports.createNew = function(){
  return new Licencia();
};

module.exports.setDb = function(db){
  dbi = db;
  return this;
};
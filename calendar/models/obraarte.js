

var serializer = require('./serializer.js');
var async = require('async');
var _ = require('underscore');

var BaseModel = require('./basemodel.js');
var Assets = require('./assets.js').getModel();

var dbi;

var entityCol = 'obrasarte';
var serieKey = 'obrasarte101';

serializer.initSeries([
  {
    serie: serieKey,
    base: 1000000,
    prefix: 'OA'
  }]
);


var ObraArte = BaseModel.extend({
  
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
  defaultSort: {cnumber:1},
  findById: function(id,cb){
    console.log('jojo');
   
    var self = this;
    var obra = null;
    async.series([
          //traer la obra
          function(cb){
            BaseModel.findById.apply(self,[id,function(err,model){
              if(err) return cb(err);
              
              obra = model;
              cb();
            }]);
          },
          
          //buscando las fotos
          function(cb){
            Assets.findByIds(obra.get('photos_ids'),function(err,result){
              if(err) return cb(err);
              
              if(obra){
                obra.set('photos',result);  
              }
              cb();  
            });
          }
          
       ],
       //done
       function(err,results){
         cb(err,obra);
       });
  }
});


module.exports.getModel = function(){
  return ObraArte;
};

module.exports.createNew = function(){
  return new ObraArte();
};

module.exports.setDb = function(db){
  dbi = db;
  return this;
};
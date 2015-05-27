

var serializer = require('./serializer.js');
var async = require('async');
var _ = require('underscore');

var BaseModel = require('./basemodel.js');
var Assets = require('./assets.js').getModel();
var ObraArte = require('./obraarte.js').getModel();

var dbi;

var entityCol = 'obrasartesolicitud';
var serieKey = 'obrasartesolicitud101';

serializer.initSeries([
  {
    serie: serieKey,
    base: 1000000,
    prefix: 'SL'
  }]
);


var Solicitud = BaseModel.extend({
  idAttribute: "_id",
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

    estado_alta: 'abierto',
    nivel_ejecucion: 'pendiente',

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
    var self = this;
    var solicitud = null;
    async.series([
          //traer la solicitud
          function(cb){
            BaseModel.findById.apply(self,[id,function(err,model){
              if(err) return cb(err);
              
              if(!model){
                return cb('Solicitud inexistente');
              }
              solicitud = model;
              cb();
            }]);
          },

          //buscando los documentos
          function(cb){
            Assets.findByIds(solicitud.get('docs_ids'),function(err,result){
              if(err) return cb(err);

              if(solicitud){
                solicitud.set('docs',result);
              }
              cb();
            });
          },

          //buscando las obras
          function(cb){
            ObraArte.findByIds(solicitud.get('obras_ids'),function(err,result){
              if(err) return cb(err);

              if(solicitud){
                solicitud.set('obras',result);
              }
              cb();
            });
          }

       ],
       //done
       function(err,results){
         cb(err,solicitud);
       });
  }
});


module.exports.getModel = function(){
  return Solicitud;
};

module.exports.createNew = function(){
  return new Solicitud();
};

module.exports.setDb = function(db){
  dbi = db;
  return this;
};

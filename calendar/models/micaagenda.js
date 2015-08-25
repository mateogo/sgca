

var serializer = require('./serializer.js');
var async = require('async');
var _ = require('underscore');

var BaseModel = require('./basemodel.js');
var Assets = require('./assets.js').getModel();

var dbi;

var entityCol = 'micaagenda';

var MicaAgenda = BaseModel.extend({
  constructor: function() {
    this.entityCol = entityCol;
    BaseModel.apply(this,arguments);
  },

  defaults: {
    comprador: null,
    vendedor: null,
    num_reunion: '',
    estado: '',
    estado_alta: 'alta',

    fealta: null,
    feultmod: null,
    usermod: null

  },

  validation: function(cb){
    cb(null);
  },

  _beforeSave: function(callback){
    var self = this;
    async.series([
       //setear fechas
       function(cb){
         if(self.isNew()){
           self.set('fealta',new Date());
         }
         self.set('feultmod',new Date());

         cb();
       },

       //serializa comprador, vendedor, usuario de alta y usuario modificador
       function(cb){
          var comprador = self.get('comprador');
          var vendedor = self.get('vendedor');
          var useralta = self.get('useralta');
          var usermod = self.get('usermod');


          var suscriptorSerializer = function(model,rol){
            raw = (model.toJSON)? model.toJSON() : model;

            if(rol in raw){
              var actividades = (rol === 'comprador') ? raw.comprador.cactividades : raw.vendedor.vactividades;
              raw.actividades = actividades;
            }

            raw = _.pick(raw,'_id','cnumber','responsable','solicitante','actividades','place');
            raw._id = raw._id.toString();

            return raw;
          };

          var userSerializer = function(model){
            raw = (model.toJSON)? model.toJSON() : model;
            raw = _.pick(raw,'_id','username','name','mail');
            raw._id = raw._id.toString();
            return raw;
          };

         var raw;
         if(comprador){
           raw =  suscriptorSerializer(comprador,'comprador');
           self.set('comprador',raw);
         }

         if(vendedor){
           raw = suscriptorSerializer(vendedor,'vendedor');
           self.set('vendedor',raw);
         }

         if(useralta){
           self.set('useralta',userSerializer(useralta));
         }

         if(usermod){
           self.set('usermod',userSerializer(usermod));
         }

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
  STATUS_FREE: 'libre',
  STATUS_OBS: 'observado',
  STATUS_ASIGNED: 'asignado',
  STATUS_BLOCKED: 'bloqueado',
  STATUS_UNAVAILABLE: 'unavailable',

  statistics: function(cb){
    BaseModel.dbi.collection(this.entityCol, function(err, collection) {
      var match = {
        estado: MicaAgenda.STATUS_ASIGNED
      };

      var group = {
        _id: {number:'$num_reunion',actividad:'$comprador.actividades'},
        subtotal_count: {$sum: 1}
      };

      var sort = {
        '_id.number': 1
      };

      collection.aggregate([{$match:match},{$group:group},{$sort:sort}],function(err,results){
        if(err) return cb(err);

        // console.log('resultado',results);
        for (var i = 0; i < results.length; i++) {
          var row =  results[i];
          _.extend(row,row._id);
          delete row._id;
          results[i] = row;
        }

        cb(null,results);
      });
    });
  }
});


module.exports.getModel = function(){
  return MicaAgenda;
};

module.exports.createNew = function(){
  return new MicaAgenda();
};

module.exports.setDb = function(db){
  dbi = db;
  return this;
};



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
          var suscriptorSerializer = function(model){
            raw = (model.toJSON)? model.toJSON() : model;
            raw = _.pick(raw,'_id','responsable','solicitante');
            raw._id = raw._id.toString();
            return raw;
          };

          var userSerializer = function(model){
            raw = (model.toJSON)? model.toJSON() : model;
            raw = _.pick(raw,'_id','username','name','mail');
            raw._id = raw._id.toString();
            return raw;
          }

         var raw;
         if(comprador){
           raw =  suscriptorSerializer(comprador);
           self.set('comprador',raw);
         }

         if(vendedor){
           raw = suscriptorSerializer(vendedor);
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
  STATUS_DRAFT: 'borrador',
  STATUS_OBS: 'observado',
  STATUS_CONFIRM: 'confirmado',
  STATUS_UNAVAILABLE: 'unavailable',
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

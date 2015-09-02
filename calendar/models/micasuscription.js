

var serializer = require('./serializer.js');
var async = require('async');
var _ = require('underscore');

var BaseModel = require('./basemodel.js');
var Assets = require('./assets.js').getModel();

var dbi;

var entityCol = 'micasuscriptions';

var MicaSuscription = BaseModel.extend({
  constructor: function() {
    this.entityCol = entityCol;
    BaseModel.apply(this,arguments);
  },

  defaults: {
  },

  validation: function(cb){
    cb(null);
  },

  _beforeSave: function(callback){
    callback('No se puede guardar por este medio. Es para solo lectura');
  },

  serialize: function(rol){
    raw = (this.toJSON)? this.toJSON() : this;
    raw = _.pick(raw,'_id','responsable','solicitante','cnumber','place');

    if(rol){
      var actividades = (rol === 'comprador') ? this.get(rol).cactividades : this.get(rol).vactividades;
      raw.actividades = actividades;
    }

    raw._id = raw._id.toString();
    return raw;
  }
},{
  entityCol: entityCol,
  defaultSort: {cnumber:1},
  statisticConfirma: function(cb){
    
  }
});


module.exports.getModel = function(){
  return MicaSuscription;
};

module.exports.createNew = function(){
  return new MicaSuscription();
};

module.exports.setDb = function(db){
  dbi = db;
  return this;
};

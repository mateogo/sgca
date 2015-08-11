

var serializer = require('./serializer.js');
var async = require('async');
var _ = require('underscore');

var BaseModel = require('./basemodel.js');

var dbi;

var entityCol = 'micainteractions';

var MicaInteraction = BaseModel.extend({
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

  serialize: function(){
    raw = (this.toJSON)? this.toJSON() : this;
    raw = _.pick(raw,'_id','responsable','solicitante');
    raw._id = raw._id.toString();
    return raw;
  }
},{
  entityCol: entityCol,
  defaultSort: {cnumber:1}
});


module.exports.getModel = function(){
  return MicaInteraction;
};

module.exports.createNew = function(){
  return new MicaInteraction();
};

module.exports.setDb = function(db){
  dbi = db;
  return this;
};

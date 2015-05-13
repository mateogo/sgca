var rootPath = '../../calendar/models/';

var serializer = require(rootPath + 'serializer.js');
var _ = require('underscore');

var BaseModel = require(rootPath + 'basemodel.js');

var dbi;

var entityCol = 'recursos';
var serieKey = 'recurso';

serializer.initSeries([
  {
    serie: serieKey,
    base: 1000000,
    prefix: 'RS'
  }]
);


var Recurso = BaseModel.extend({
  defaults: {
    cnumber: null,
    parent_id: null,
    childs: null,
    variantes: null,
    nombre: '',
    descripcion_corta: '',
    descripcion: '',
    es_consumible: false,
    codigo_onc: '',
    objeto_gasto: '',
    importes: [],
  },
  entityCol: entityCol,
});


module.exports.getModel = function(){
  return Recurso;
};

module.exports.createNew = function(){
  return new Recurso();
};

module.exports.setDb = function(db){
  dbi = db;
  return this;
};

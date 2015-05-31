var rootPath = '../../calendar/models/';

var serializer = require(rootPath + 'serializer.js');
var _ = require('underscore');

var BaseModel = require(rootPath + 'basemodel.js');

var dbi;

var config = require('config');
var entityCol = config.get('Sisplan.collections.recurso_familias');

var serieKey = 'recurso_familia';

serializer.initSeries([
  {
    serie: serieKey,
    base: 1000000,
    prefix: 'RSF'
  }]
);


var RecursoFamilia = BaseModel.extend({
  defaults: {
    cnumber: null,
    parent_id: null,
    childs: null,
    nombre: '',
    descripcion: '',
  },
  entityCol: entityCol,
});


module.exports.getModel = function(){
  return RecursoFamilia;
};

module.exports.createNew = function(){
  return new RecursoFamilia();
};

module.exports.setDb = function(db){
  dbi = db;
  return this;
};

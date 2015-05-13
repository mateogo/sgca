var rootPath = '../../calendar/models/';

var serializer = require(rootPath + 'serializer.js');
var _ = require('underscore');

var BaseModel = require(rootPath + 'basemodel.js');

var dbi;

var entityCol = 'recurso_tipos';
var serieKey = 'recurso_tipo';

serializer.initSeries([
  {
    serie: serieKey,
    base: 1000000,
    prefix: 'RST'
  }]
);


var RecursoTipo = BaseModel.extend({
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
  return RecursoTipo;
};

module.exports.createNew = function(){
  return new RecursoTipo();
};

module.exports.setDb = function(db){
  dbi = db;
  return this;
};

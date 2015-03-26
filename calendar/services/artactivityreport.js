/**
 * Servicio de búsqueda/filtro e actividades y eventos artisticos
 * 
 * Versión resumida busca en ArtActivy (por defecto)
 * Versión detallada busca en Event (que son de las ArtActivity)
 */
var root = '../';
var Agenda = require(root + 'models/agenda.js').getModel();


function ArtActivityReport(){
  
}

ArtActivityReport.prototype.getParam = function(obj,field,defaultValue){
  if(!obj || !(field in obj)) return defaultValue;
  
  return obj[field];
};

ArtActivityReport.prototype.search = function(params,callback){
  
  var q = {};
  
  var desde = this.getParam(params,'desde');
  var hasta = this.getParam(params,'hasta');
  
  if(!desde || !hasta){
    return callback('Fantan rango de fechas.');
  }
  
  var modo = this.getParam(params,'modo','resumen');
  delete params.modo;
  
  Agenda.find(params,modo,callback);
};



module.exports = ArtActivityReport; 
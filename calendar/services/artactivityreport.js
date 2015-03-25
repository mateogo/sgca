/**
 * Servicio de búsqueda/filtro e actividades y eventos artisticos
 * 
 * Versión resumida busca en ArtActivy (por defecto)
 * Versión detallada busca en Event (que son de las ArtActivity)
 */
var root = '../';
var ArtActivty = require(root + 'models/artactivity.js').getModel();
var Event = require(root + 'models/event.js').getModel();


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
  
  //desde = new Date(desde);
  //hasta = new Date(hasta);
  
  params.fdesde = {'$gte':desde,'$lte':hasta};
  delete params.desde;
  delete params.hasta;
 
  var mode = this.getParam(params,'mode','summary');
  delete params.mode;
  
  if(mode === 'detail'){
    this.searchDetail(params,callback);
  }else{
    this.searchSummary(params,callback);
  }
};

ArtActivityReport.prototype.searchSummary = function(query,callback){
  ArtActivty.find(query,callback);
};

ArtActivityReport.prototype.searchDetail = function(query,callback){
  Event.find(query,callback);
};



module.exports = ArtActivityReport; 
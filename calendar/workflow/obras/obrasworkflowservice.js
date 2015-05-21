var root = '../../';
var Token = require(root + 'models/token.js').getModel();
var TokenService = require('../tokenservice.js');

var tokenTypes = require('./models/tokentypes.js');
var queries = require('./models/queries.js');
var groups = require('./models/groups.js');
var actions = require('./models/actions.js');

var updateObjStateStrg  = require('./strategies/updateObjState.js');
var autoSetUserLoggedStrg = require('./strategies/autoSetUserLogged.js');
var pedidoCorreccionStrg = require('./strategies/pedidoCorreccion.js');
var registroCambioStrg = require('./strategies/registroCambio.js');

/**
 * @param {user.js} user - Usuario logueado
 */
function ObrasWorkflowService(user){
  this.user = user;

  this.tokenService = new TokenService();

  this.tokenService.setActiveGroups(this.user.roles);
  this.tokenService.setQueries(queries);
  this.tokenService.setActions(actions);

  this.tokenService.registerStrategy(updateObjStateStrg);
  this.tokenService.registerStrategy(autoSetUserLoggedStrg,tokenTypes.ASIGNAR_FORMA);
  this.tokenService.registerStrategy(autoSetUserLoggedStrg,tokenTypes.REVISANDO);
  this.tokenService.registerStrategy(pedidoCorreccionStrg,tokenTypes.PEDIDO_CORRECCION);
  this.tokenService.registerStrategy(registroCambioStrg,tokenTypes.CAMBIO);
}

var clazz = ObrasWorkflowService.prototype;

clazz.iniciarSolicitud = function(solicitud,callback){
  var objId = solicitud.attributes._id;

  var token = new Token();
  token.set('type',tokenTypes.ASIGNAR_FORMA);
  token.set('from',this.user);
  token.set('obj_id',objId);
  token.set('obj_type','solicitud');
  token.set('obj_slug',solicitud.get('cnumber'));

  this.tokenService.add(token,function(err,result){
    if(err) return callback(err);

    callback(null,token);
  });
};

clazz.registrarCambioSolicitud = function(solicitud,callback){
  var self = this;

  var objId = solicitud.id;
  
  console.log('REGISTRANDO CMABIO de',objId);
  var token = new Token();
  token.set('type',tokenTypes.CAMBIO);
  token.set('from',this.user);
  token.set('obj_id',objId);
  token.set('obj_type','solicitud');
  token.set('obj_slug',solicitud.get('cnumber'));

  this.tokenService.add(token,function(err,result){
    if(err) return callback(err);

    callback(null,token);
  });
};

clazz.getQueries = function(callback){
  this.tokenService.getQueries(callback);
};

clazz.runQuery = function(code,callback){
  this.tokenService.runQuery(code,callback);
};

clazz.getActions = function(tokenType,callback){
  this.tokenService.getActions(tokenType,callback);
};


clazz.add = function(token,callback){
  token.set('from',this.user);
  this.tokenService.add(token,callback);
};

clazz.getByObject = function(objId,callback){
  this.tokenService.getByObject(objId,callback);
};

clazz.getLastToken = function(objId,callback){
  this.tokenService.getLastToken(objId,callback);
};


module.exports = ObrasWorkflowService;

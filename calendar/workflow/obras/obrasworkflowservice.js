var _ = require('underscore');

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
var registroModificacion = require('./strategies/registroModificacion.js');

/**
 * @param {user.js} user - Usuario logueado
 */
function ObrasWorkflowService(user){
  this.user = user;

  this.tokenService = new TokenService();
  this.tokenService.user = user;

  this.tokenService.setActiveGroups(this.user.roles);
  this.tokenService.setQueries(queries);
  this.tokenService.setActions(actions);

  this.tokenService.registerStrategy(updateObjStateStrg);
  this.tokenService.registerStrategy(autoSetUserLoggedStrg,tokenTypes.FORMALIZANDO);
  this.tokenService.registerStrategy(autoSetUserLoggedStrg,tokenTypes.REVISANDO);
  this.tokenService.registerStrategy(pedidoCorreccionStrg,tokenTypes.PEDIDO_CORRECCION);
  this.tokenService.registerStrategy(registroModificacion,tokenTypes.MODIFICACION);
}

var clazz = ObrasWorkflowService.prototype;

clazz.iniciarSolicitud = function(solicitud,callback){

  var token = new Token();
  token.set('type',tokenTypes.ASIGNAR_FORMA);
  token.set('from',this.user);

  token.set('obj',this._prepareSolicitud(solicitud));

  this.tokenService.add(token,function(err,result){
    if(err) return callback(err);

    callback(null,token);
  });
};

clazz.registrarCambioSolicitud = function(solicitud,callback){
  var self = this;

  var token = new Token();
  token.set('type',tokenTypes.MODIFICACION);
  token.set('from',this.user);

  token.set('obj',this._prepareSolicitud(solicitud));

  this.tokenService.add(token,function(err,result){
    if(err) return callback(err);

    callback(null,token);
  });
};

clazz._prepareSolicitud = function(solicitud){
  var objId = (solicitud.id)? solicitud.id : solicitud.attributes._id ;
  var attrs = solicitud.pick('cnumber','destination','total_value');
  var owner = (this.user.pick) ? this.user.pick('id','name','mail') : _.pick(this.user,'_id','name','mail');

  var obj = {
    id: objId,
    typeModel: 'solicitud',
    slug: solicitud.get('cnumber'),
    owner: owner
  };
  console.log('la solicitud',solicitud);
  console.log('antes de extender',obj);
  obj = _.extend(obj,attrs);
  console.log('despues de extender',obj);

  return obj;
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

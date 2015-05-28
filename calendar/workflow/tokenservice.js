var async = require('async');
var _ = require('underscore');

var root = '../';
var TokenModel = require(root + 'models/token.js').getModel();
var BaseModel = require(root + 'models/basemodel.js');
var AppError = require(root +'../core/apperror.js');


/**
 * @param {Object} configuración de grupos y tipo de tokens,
 *
 * ejemplo:
 *
 * {
 *  groups: ['solicitantes','facilitadores'],
 *  types: ['asignar_forma','formalizando','formalizado','asignar_revisor','revisando','revisado','revisando_externo','revision_externa'],
 *
 * }
 */
function TokenService(config){
  this.strategies = {};
  this.globalStrategies = [];
  this.user = {'name':'dummy','id':'5564b6d7c626942129682e9c',mail:''};
}

/**
* Setea los grupos o perfiles que están habilitados a operar
*  (roles del usuario logueado)
*  @param {string []}
*/
TokenService.prototype.setActiveGroups = function(array){
  this.groups = array;
};

/**
 * @parm {object} queries
 */
TokenService.prototype.setQueries = function(queries){
  this.queries = queries;
};

TokenService.prototype.setActions = function(actions){
  this.actions = actions;
};

TokenService.prototype.setUser = function(user){
  this.user = user;
};


TokenService.prototype.registerStrategy = function(strategy,tokenType){
  if(!tokenType){
    this.globalStrategies.push(strategy);
    return;
  }

  if(!this.strategies[tokenType]){
    this.strategies[tokenType] = [];
  }
  this.strategies[tokenType].push(strategy);
};

/**
* Retorna las estrategias activas para un tipo de token
* @param {string} type - Token type
*/
TokenService.prototype.getStrategies = function(type){
  var strategies = this.globalStrategies;

  if(this.strategies[type]){
    strategies = strategies.concat(this.strategies[type]);
  }

  return strategies;
};

/**
 * Agregar (guarda) un nuevo token
 */
TokenService.prototype.add = function(token,callback){
  var self = this;
  var type = token.get('type');
  var objId = token.get('obj').id;
  var currentToken = null;

  if(!type){
    return callback(new AppError('No se pudo procesar el pedido','tipo de token no definido'));
  }

  var strategies = this.getStrategies(type);

  token.set('global_type',token.get('type'));

  async.series([
      //hay que chequear si el usuario puede agregar un token de cierto tipo
      function(cb){
        cb();
      },

      // obtine el token actual
      function(cb){
        TokenModel.getLastToken(objId,function(err,lastToken){
          currentToken = lastToken;
          cb();
        });
      },

      //dependiendo del tipo de token hay que efectuar ciertas actualizaciones sobre el obj, cambio de estado, generar la licencia, etc...
      // resolver con strategies registradas
      function(cb){
        async.eachSeries(strategies,function(strategy,cb2){
          if(strategy && strategy.beforeAdd){
            strategy.beforeAdd(token,self.user,currentToken,cb2);
          }else{
            cb2();
          }
        },function(err){
            cb(err);
        });
      },

      // desactivar/cerrar token anterior
      function(cb){
        self.upatePreviousTokens(token,cb);
      },

      // guardar nuevo token
      function(cb){
        token.save(cb);
      },

      function(cb){
        async.eachSeries(strategies,function(strategy,cb2){
          if(strategy && strategy.afterAdd){
            strategy.afterAdd(token,self.user,currentToken,cb2);
          }else{
            cb2();
          }
        },function(err){
          cb(err);
        });
      }

  ],function(errs,results){
    if(errs) return callback(errs);

    callback(null,token);
  });
};



/**
* @callback callback - Lista de queries y acciones que tiene asignado los grupos o perfiles
*/
TokenService.prototype.getQueries = function(callback){
 var queries = [];
 if(!this.groups) return callback('No hay grupos habilitantes');
 if(!this.queries) return callback('No hay consultas registradas');

 for (var i = 0; i < this.groups.length; i++) {
   var group = this.groups[i];
   var tmp = this.queries.getByGroup(group);
   queries = queries.concat(tmp);
 }

 callback(null,queries);
};

TokenService.prototype.getActions = function(tokenType,callback){
  if(!this.groups) return callback('No hay grupos habilitantes');
  if(!this.actions) return callback('No hay Acciones registradas');

  var actions = this.actions.getByToken(tokenType,this.groups);
  callback(null,actions);
};


/**
 * @param {string} code - Código del query a correr
 * @param {object} query (opcional) parametros adicionales desde request
 */
TokenService.prototype.runQuery = function(code,queryParams,callback){
  if(!this.groups) return callback('No hay grupos habilitantes');
  if(!this.queries) return callback('No hay consultas registradas');

  //si no hay callback entonces el callback debe ser  el queryParams
  if(callback === undefined){
    callback = queryParams;
  }

  //buscando query
  var queryMeta = this.queries.getByCode(code);
  if(!queryMeta) return callback('No existe el query con ese codigo');

  //verificando que tenga permiso
  if(!queryMeta.hasGroup(this.groups)){
    return callback('Sin permiso para correr la consulta');
  }


  var query = queryMeta.get('query');

  //toma otras condiciones externas
  query = this.mergeQuery(query,queryParams);

  //verificando si es para usuario logueado
  query = this.replaceUserLogged(query);

  //Ejecutando el query
  TokenModel.find(query,function(err,results){
    if(err) return callback(err);

    callback(null,results);
  });
};


TokenService.prototype.mergeQuery = function(query,queryParams){
  if(!queryParams) return query;

  if(queryParams.objId){
    query['obj.id'] = new BaseModel.ObjectID(queryParams.objId);
  }

  return query;
};

/**
* reemplaza los parametros toMe y fromMe de una query de mongodb
* Los cambia por el usuario logueado
*/
TokenService.prototype.replaceUserLogged = function(query){
  if(!this.user || !query){
    console.warn('NO HAY USUARIO logueado O QUERY es null');
    return;
  }

  var id = (this.user.id) ? this.user.id : this.user._id;
  if(typeof(id) === 'string'){
    id = new BaseModel.ObjectID(id);
  }

  var copy = {};

  var tmp;
  for(var key in query){
    if(key === 'toMe'){
      tmp = 'to._id';
      copy[tmp] = id;
    }else if(key === 'fromMe'){
      tmp = 'from._id';
      copy[tmp] = id;
    }else if(query[key] instanceof Array){
      var array = query[key];
      var arrayCopy = [];
      for (var i = 0; i < array.length; i++) {
         arrayCopy[i] = this.replaceUserLogged(array[i]);
      }
      copy[key] = arrayCopy;
    }else if(typeof(query[key]) === 'object'){
      copy[key] = this.replaceUserLogged(query[key]);
    }else{
      copy[key] = query[key];
    }
  }

  return copy;
};


TokenService.prototype.upatePreviousTokens = function(token,callback){
  TokenModel.closePreviousTokens(token,callback);
};



/**
 * Retorna por el callback todos los token asociados a un objeto
 * @callback function(err,<array de token>);
 */
TokenService.prototype.getByObject = function(objId,callback){
  if(!(objId instanceof BaseModel.ObjectID)){
    objId = new BaseModel.ObjectID(objId);
  }

  var query = {'obj.id' : objId };

  TokenModel.find(query,{fealta:-1},function(err,results){
    if(err) return callback(err);

    callback(null,results);
  });
};

/**
 * Busca el último token para un objeto
 * @param {[type]}   objId
 * @param {Function} callback
 */
TokenService.prototype.getLastToken = function(objId,callback){
  TokenModel.getLastToken(objId,callback);
};


module.exports = TokenService;

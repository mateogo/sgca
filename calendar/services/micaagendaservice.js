/**
 * Servicio para Agenda de Reuniones del Mica 2015
 *
 * Metodos:
 * - assign
 * - searchAvailability
 * - getAgenda
 */

var async = require('async');
var _ = require('underscore');

var root = '../';

var AppError = require(root + '../core/apperror.js');

var BaseModel = require(root + 'models/basemodel.js');
var MicaAgenda = require(root + 'models/micaagenda.js').getModel();
var MicaSuscription = require(root + 'models/micasuscription.js').getModel();
var MicaInteraction = require(root + 'models/micainteraction.js').getModel();

var  COUNT_REUNIONES = 3;

var MicaAgendaService = function(userLogged){
  this.userLogged = userLogged;
};

//TODO:
// - verificar caso de reunion disponibles con numero intermedio
// - verificar que ya no esten reunidos un comprador + vendedor
// - guardar FK en interactions

MicaAgendaService.COUNT_REUNIONES = COUNT_REUNIONES;

/**
 * Asignacion de reunion entre un comprador y vendedor
 * @param  {String || Object}   comprador - Id u objeto de micasuscriptions
 * @param  {String || Object}   vendedor  [description] - Id u objeto de micasuscriptions
 * @param  {Function} cb        callback(err,MicaAgenda)
 */
MicaAgendaService.prototype.assign = function(compradorRef,vendedorRef,cb){
  // Pasos del asignador:
  // buscar el comprador y vendedor
  // chequear que no esten ya en una reunión
  // buscar numero de reuniones posibles
  // crear reunion
  //    - con estado asignado si existe numero disponibles
  //    - con estado unavailable si no existe disponible o coincidiencia de numeros

  var self = this;

  var comprador; // MicaSuscription
  var vendedor; // MicaSuscription
  var nums_availables; //array of int

  async.series([
    //busca al comprador y vendedor
    function(cb){
      var idComprador = compradorRef;
      var idVendedor = vendedorRef;
      MicaSuscription.findByIds([idComprador,idVendedor],function(err,result){
        if(err) return cb(err);

        if(result[0]._id.toString() === idComprador){
          comprador = result[0];
          vendedor = result[1];
        }else{
          comprador = result[1];
          vendedor = result[0];
        }
        cb();
      });
    },

    //TODO: chequear que no esten ya en una reunion
    function(cb){
      cb();
    },

    // buscar numero de reuniones posibles
    function(cb){
      self._crossAvailability(comprador,vendedor,function(err,results){
        if(err) return cb(err);
        nums_availables = results;
        cb();
      });
    },

   //crea la reunion si hay disponibles lugar
   function(cb){
     var num_reunion = 0;

     if(nums_availables && nums_availables.length > 0){
       num_reunion  = nums_availables[0];
     }

     var estado = (num_reunion !== 0) ? MicaAgenda.STATUS_DRAFT : MicaAgenda.STATUS_UNAVAILABLE;
     self._createReunion(comprador,vendedor,num_reunion,estado,cb);
   }

  ],function(err,results){
    if(err) return cb(err);

    cb(null,results[results.length-1]);
  });
};

/**
 * Busca lugares disponibles para un suscriptor ( puede ser comprador como vendedor)
 * Retorna array con numeros de las reuniones que tiene disponibles
 * @param {Function} cb - callback(err,<array num reunion>)
 * @param {String} rol - 'comprador' 'vendedor'
 */
MicaAgendaService.prototype.searchAvailability = function(suscriptor,rol,cb){

  this.getAgenda(suscriptor,rol,function(err,result){
    if(err) return cb(err);

    var ret = [];

    for (var i = 0; i < result.length; i++) {
      var reunion = result[i];
      if(reunion.get('estado') === MicaAgenda.STATUS_FREE){
        ret.push(reunion.get('num_reunion'));
      }
    }

    cb(null,ret);
  });
};


/**
 * Busca lugares disponibles para un suscriptor ( puede ser comprador como vendedor)
 * @param {Function} cb - callback(err,<array reunion>)
 * @param {String} rol - 'comprador' 'vendedor'
 */
MicaAgendaService.prototype.getAgenda = function(suscriptor,rol,cb){
  if(rol !== 'comprador' && rol !== 'vendedor'){
    return cb('rol no valido');
  }



  var idSuscriptor = (suscriptor._id) ?  suscriptor._id : suscriptor;
  if(idSuscriptor.toString){
    idSuscriptor = idSuscriptor.toString();
  }



  async.series([
    //busca a la suscriptions
    function(cb){
      MicaSuscription.findById(idSuscriptor,function(err,result){
        if(err) return cb(err);

        if(!result){
          return cb(new AppError('No existe la suscripción','','not_found'));
        }
        suscriptor = result.serialize();
        cb(null,result);
      });
    },

    //busca agenda de la suscripcion
    function(cb){
      var query = {};
      var sortBy = {number: 1};
      query[rol + '._id'] = idSuscriptor;
      MicaAgenda.find(query,sortBy,function(err,results){
          if(err) return cb(err);

          // PROCESO PARA COMPLETAR REUNIONES FALTANTES
          // mapeo de reuniones ya creadas por numero de reunion
          var map = {};
          for (var i = 0; i < results.length; i++) {
            var key = results[i].get('num_reunion');
            if(key in map){
              // hay mas de una reunione con el mismo numero
              // se crea un array para esta key
              if(!('push' in map[key])){
                map[key] = [map[key]];
              }
              map[key].push(results[i]);
            }else{
              map[key] = results[i];
            }
          }

          // agregan las reuiones faltantes, se marcan como libres
          for (var num = 1; num <= COUNT_REUNIONES; num++) {
            if(!(num.toString() in map)){
              var tmp = new MicaAgenda();
              tmp.set('estado',MicaAgenda.STATUS_FREE);
              tmp.set('num_reunion',num);
              tmp.set(rol,suscriptor);
              map[num.toString()] = tmp;
            }
          }

          // se pasa array el mapa de reuniones
          var array = [];
          for (var key in map){
            // si es un array se concatena
            if('push' in map[key]){
              array = array.concat(map[key]);
            }else{
              array.push(map[key]);
            }
          }

          cb(null,array);
      });
    }
  ],function(err,results){
    if(err) return cb(err);

    cb(null,results[results.length-1]);
  });


};

/**
 * Busca numero de reuniones libres de cada uno,
 * buscar disponibilidades de agenda de cada uno
 * buscar coincidiencia
 * @return por callback array de numero de reunion posibles
 */
MicaAgendaService.prototype._crossAvailability = function(comprador,vendedor,cb){
  //busca diponibilidad de agenda de cada uno
  //buscar interseccion
  var self = this;

  async.parallel([
    function(cb){
      self.searchAvailability(comprador,'comprador',cb);
    },

    function(cb){
      self.searchAvailability(vendedor,'vendedor',cb);
    },

  ],function(err,results){
      if(err) return cb(err);

      var a = results[0];
      var b = results[1];

      var intersection = _.intersection(a,b);
      cb(null,intersection);
  });
};

/**
 * Crea una reunion entre un comprador y vendedor
 * pre-condición: se supone que esta libre el numero de reunion para ese
 *     						comprador y vendedor
 *
 * @param  {MicaSuscription}   comprador [description]
 * @param  {MicaSuscription}   vendedor  [description]
 * @param  {int 1..n}  numero    Numero de reunion
 * @param  {Function} cb        callback (err,MicaAgenda)
 */
MicaAgendaService.prototype._createReunion = function(comprador,vendedor,numero,status,cb){
  //guardar en micaagenda
  //guardar fk en micainteractions (buscar si existe una interaccion entre ambos)
  //

  var reunion = new MicaAgenda();
  reunion.set('comprador',comprador);
  reunion.set('vendedor',vendedor);
  reunion.set('num_reunion',numero);
  reunion.set('estado',status);
  reunion.set('usermod',this.userLogged);
  reunion.set('useralta',this.userLogged);

  async.series([
    //GUARDAR REUNION
    function(cb){
      reunion.save(function(err,result){
        if(err) return cb(err);
        reunion = result;
        cb(null,result);
      });
    },

    // ACTUALIZAR INTERACTIONS RELACIONAS
    function(cb){
      // - Cambia el estado en las interacciones entre los do suscriptiores
      // - Agrega referencia a la reunion

      var idComprador = reunion.get('comprador')._id;
      var idVendedor = reunion.get('vendedor')._id;

      var query = {
        $or: [
          {'emisor_inscriptionid': idComprador,'receptor_inscriptionid': idVendedor},
          {'emisor_inscriptionid': idVendedor,'receptor_inscriptionid': idComprador}
        ]
      };
      var data = {
        meeting_number: reunion.get('num_reunion'),
        meeting_estado: reunion.get('estado'),
        meeting_id: reunion.id.toString()
      };

      MicaInteraction.partialupdate(query,data,function(err,countAffected){
        if(err){
          console.warn('[WARN] Al asignar reunión, ERROR al actualizar interactions',err);
        }
        cb(null);
      });
    }

  ],function(err,results){
    if(err) return cb(err);
    // retorna la reunion guardada
    cb(null,results[0]);
  });
};


module.exports = MicaAgendaService;

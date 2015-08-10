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

var MicaAgenda = require(root + 'models/micaagenda.js').getModel();
var MicaSuscription = require(root + 'models/micasuscription.js').getModel();

var  COUNT_REUNIONES = 36;

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
 * @param  {String|| Object}   comprador - Id u objeto de micasuscriptions
 * @param  {String|| Object}   vendedor  [description] - Id u objeto de micasuscriptions
 * @param  {Function} cb        callback(err,MicaAgenda)
 */
MicaAgendaService.prototype.assign = function(compradorRef,vendedorRef,cb){
  // Pasos del asignador:
  // buscar el comprador y vendedor
  // chequear que no esten ya en una reunión
  // buscar numero de reuniones posibles
  // crear reunion si existe coincidiencia

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
     if(!nums_availables || nums_availables.length === 0){
       return cb(new AppError('No hay disponibilidad para el comprado y el vendedor','Sin disponibilidad','unavailable'));
     }

     var num = nums_availables[0];
     self._createReunion(comprador,vendedor,num,cb);
   }

  ],function(err,results){
    if(err) return cb(err);

    cb(null,results[results.length-1]);
  });
};

/**
 * Asignacion de reunion entre un comprador y vendedor
 * @param  {String|| Object}   comprador - Id u objeto de micasuscriptions
 * @param  {String|| Object}   vendedor  [description] - Id u objeto de micasuscriptions
 * @param  {Function} cb        callback
 */
MicaAgendaService.prototype.assignByInteraction = function(interaction,cb){

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

          for (var num = 1; num <= COUNT_REUNIONES; num++) {
            if(!(num.toString() in map)){
              var tmp = new MicaAgenda();
              tmp.set('estado',MicaAgenda.STATUS_FREE);
              tmp.set('num_reunion',num);
              tmp.set(rol,suscriptor);
              map[num.toString()] = tmp;
            }
          }
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
MicaAgendaService.prototype._createReunion = function(comprador,vendedor,numero,cb){
  //guardar en micaagenda
  //guardar fk en micainteractions (buscar si existe una interaccion entre ambos)
  //

  var reunion = new MicaAgenda();
  reunion.set('comprador',comprador);
  reunion.set('vendedor',vendedor);
  reunion.set('num_reunion',numero);
  reunion.set('estado',MicaAgenda.STATUS_DRAFT);
  reunion.set('usermod',this.userLogged);

  reunion.save(function(err,result){
    if(err) return cb(err);

    //TODO: GUARDAR  FK 'reunion_agenda' en micainteractions

    cb(null,result);
  });
};


module.exports = MicaAgendaService;

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

var  COUNT_REUNIONES = 36;

var MicaAgendaService = function(userLogged){
  this.userLogged = userLogged;
};

//TODO:
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

    // buscar numero de reuniones posibles
    function(cb){
      self._crossAvailability(comprador,vendedor,function(err,results){
        if(err) return cb(err);
        nums_availables = results;
        if(!nums_availables){
          nums_availables = [];
        }
        cb();
      });
    },

    // chequea reuniones previas
    function(cb){
      // busca si existe reunion para el comprador y vendedor
      // si existe retorna esa reunion

      var query = {
        'comprador._id': comprador._id.toString(),
        'vendedor._id': vendedor._id.toString()
      };

      MicaAgenda.find(query,function(err,results){
        if(err) return cb(err);

        if(results && results.length > 0){
          var previous = results[0];

          // si ahora hay disponibiliad y la anterior es no disponible, se borra la ultima
          if(previous.get('estado') === MicaAgenda.STATUS_UNAVAILABLE && nums_availables.length > 0){
              self.remove(previous.id,cb);
          }else{
            cb({previous:results[0]});
          }

        }else{
          cb();
        }
      });
    },

   //crea la reunion
   // si no hay disponibles crea una reunion con estado no disponible
   function(cb){
     var num_reunion = 0;

     if(nums_availables.length > 0){
       num_reunion  = nums_availables[0];
     }

     var estado = (num_reunion !== 0) ? MicaAgenda.STATUS_ASIGNED : MicaAgenda.STATUS_UNAVAILABLE;
     self._createReunion(comprador,vendedor,num_reunion,estado,cb);
   }

  ],function(err,results){

    if(err && err.previous) return cb(null,err.previous);
    if(err) return cb(err);

    cb(null,results[results.length-1]);
  });
};


/**
 * Asignacion de reunion entre comprador y vendedor a la reunion especifica
 * Si no esta libre el numero de reunion, retorna error con el detalle de reunion actual
 * @param  {String}   compradorRef - Suscription id o cnumber
 * @param  {String}   vendedorRef  - Suscription id o cnumber
 * @param  {Function} cb           - documento de micaagenda
 */
MicaAgendaService.prototype.assignToNum = function(compradorRef,vendedorRef,numReunion,cb){
  // buscar a comprador y vendedor
  // chequear existencia libre de la reunion
  // crear la reunion

  var self = this;

  var comprador; // MicaSuscription
  var vendedor; // MicaSuscription
  var agenda; //array of MicaAgenda

  async.series([
    //busca al comprador
    function(cb){
      var query  = compradorRef;
      var method =  MicaSuscription.findById;
      if(compradorRef.length === 8){
        method = MicaSuscription.find;
        query = {cnumber: compradorRef};
      }
      method.call(MicaSuscription,query,function(err,result){
          if(err) return cb(err);
          comprador = result;
          comprador = (result.length && result.length > 0) ? result[0] : result;
          if(!comprador || !comprador.id){
            return cb(new AppError('No se encontró al comprador','','comprador_notfound'));
          }
          cb();
      });
    },

    //busca al vendedor
    function(cb){
      var query  = vendedorRef;
      var method =  MicaSuscription.findById;
      if(vendedorRef.length === 8){
        method = MicaSuscription.find;
        query = {cnumber: vendedorRef};
      }
      method.call(MicaSuscription,query,function(err,result){
          if(err) return cb(err);
          vendedor = (result.length && result.length > 0) ? result[0] : result;
          if(!vendedor || !vendedor.id){
            return cb(new AppError('No se encontró al vendendor','','vendedor_notfound'));
          }
          cb();
      });
    },

    // chequea estado de la reunion para el comprador
    function(cb){
      self.getAgenda(comprador.id,'comprador',function(err,result){
        if(err) return cb(err);
        var agenda = result;

        var index = -1;
        for (var i = 0; i < result.length && index === -1; i++) {
            var item = result[i];
            if(item.get('num_reunion') == numReunion ){
              index = i;
            }
        }

        if(!(index in agenda)){
          return cb(new AppError('No se pudo asignar la reunión','No se encontro la reunion en la agenda','meeting_notfound'));
        }

        var reunion = agenda[index];
        if(reunion.get('estado') !== MicaAgenda.STATUS_FREE){
          var error = new AppError('El Comprador no tiene disponible la reunión','reunion ocupada','meeting_unavailable');
          error.reunion = reunion;
          return cb(error);
        }

        cb();
      });
    },

    // chequea estado de la reunion desde el vendedor
    function(cb){
      self.getAgenda(vendedor.id,'vendedor',function(err,result){
        if(err) return cb(err);
        var agenda = result;

        var index = -1;
        for (var i = 0; i < result.length && index === -1; i++) {
            var item = result[i];
            if(item.get('num_reunion') == numReunion ){
              index = i;
            }
        }

        if(!(index in agenda)){
          return cb(new AppError('No se pudo asignar la reunión','No se encontro la reunion en la agenda','meeting_notfound'));
        }

        var reunion = agenda[index];
        if(reunion.get('estado') !== MicaAgenda.STATUS_FREE){
          var error = new AppError('EL vendedor no tiene disponible la reunión','reunion ocupada','meeting_unavailable');
          error.reunion = reunion;
          return cb(error);
        }

        cb();
      });
    },

    // chequea reuniones previas
    function(cb){
      // busca si existe reunion para el comprador y vendedor
      // si existe retorna esa reunion

      var query = {
        'comprador._id': comprador.id.toString(),
        'vendedor._id': vendedor.id.toString()
      };

      MicaAgenda.find(query,function(err,results){
        if(err) return cb(err);

        if(results && results.length > 0){
          var previous = results[0];

          // si ahora hay disponibiliad y la anterior es no disponible, se borra la ultima
          if(previous.get('estado') === MicaAgenda.STATUS_UNAVAILABLE && nums_availables.length > 0){
              self.remove(previous.id,cb);
          }else{
            var apperror = new AppError('Ya están asignados a la reunion #'+previous.get('num_reunion'),'','have_already');
            apperror.reunion = previous;
            cb(apperror);
          }

        }else{
          cb();
        }
      });
    },

   // asigna la reunion
   function(cb){
     self._createReunion(comprador.toJSON(),vendedor.toJSON(),numReunion,MicaAgenda.STATUS_ASIGNED,cb);
   }

  ],function(err,results){
    if(err){
      return cb(err);
    }

    cb(null,results[results.length-1]);
  });
};

/**
 * libera una reunion
 * La forma de liberar es borrandola retorna con id nulo
 * @param  {String || Object}   reunion  String Id o Object
 * @param  {Function} cb      [description]
 * @return {[type]}           [description]
 */
MicaAgendaService.prototype.liberate = function(reunion,cb){
  var self = this;

  var idReunion;
  if(reunion.id){
    idReunion = reunion.id;
  }else if (reunion._id){
    idReunion = reunion._id;
  }else{
    idReunion = reunion;
  }

  if(idReunion.toString){
    idReunion = idReunion.toString();
  }

  async.series([
    //busca la reunion
    function(cb){
      MicaAgenda.findById(idReunion,function(err,result){
          if(err) return cb(err);

          reunion = result;
          cb();
      });
    },

    function(cb){
      self.remove(reunion.id,cb);
    }

  ],function(err,results){
    if(err) return cb(err);

    var libre = new MicaAgenda();
    libre.set('estado',MicaAgenda.STATUS_FREE);
    libre.set('num_reunion',reunion.get('num_reunion'));
    libre.set('_id',null);
    cb(null,libre);
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
    //busca a la suscriptions por CNUMBER o id de profile (micasuscription._id)
    function(cb){
      var query  = idSuscriptor;
      var method =  MicaSuscription.findById;
      if(idSuscriptor.length === 8){
        method = MicaSuscription.find;
        query = {cnumber: idSuscriptor};
      }
      method.call(MicaSuscription,query,function(err,result){
          if(err) return cb(err);
          suscriptor = (result.length && result.length > 0) ? result[0] : result;
          if(!suscriptor || !suscriptor.id){
            return cb(new AppError('No existe la suscripción','','not_found'));
          }

          idSuscriptor = suscriptor.id.toString();
          suscriptor = suscriptor.serialize(rol);
          cb(null,result);
      });
    },

    // function(cb){
    //   MicaSuscription.findById(idSuscriptor,function(err,result){
    //     if(err) return cb(err);
    //
    //     if(!result){
    //       return cb(new AppError('No existe la suscripción','','not_found'));
    //     }
    //     suscriptor = result.serialize(rol);
    //
    //     cb(null,result);
    //   });
    // },

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

          // agregan las reuniones faltantes, se marcan como libres
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
          for (var keyTmp in map){
            // si es un array se concatena
            if('push' in map[keyTmp]){
              array = array.concat(map[keyTmp]);
            }else{
              array.push(map[keyTmp]);
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


MicaAgendaService.prototype.getAgendaCount = function(suscriptor,cb){
  var idSuscriptor = (suscriptor._id) ?  suscriptor._id : suscriptor;
  if(idSuscriptor.toString){
    idSuscriptor = idSuscriptor.toString();
  }

  var compradorCount = 0;
  var vendedorCount = 0;

  async.series([
    //busca cant compradores
    function(cb){
      var query = {
        'comprador._id': idSuscriptor,
        estado: MicaAgenda.STATUS_ASIGNED
      };
      MicaAgenda.count(query,function(err,result){
        if(err) return cb(err);
        compradorCount = result;
        cb(null,compradorCount);
      });
    },

    //busca cant vendedores
    function(cb){
      var query = {
        'vendedor._id': idSuscriptor,
        estado: MicaAgenda.STATUS_ASIGNED
      };
      MicaAgenda.count(query,function(err,result){
        if(err) return cb(err);
        vendedorCount = result;
        cb(null,vendedorCount);
      });
    }
  ],function(err,results){
    if(err) return cb(err);

    cb(null,{profileid:idSuscriptor,comprador:compradorCount,vendedor:vendedorCount});
  });
};

MicaAgendaService.prototype.save = function(obj,callback){
  obj = (obj.toJSON)? obj.toJSON() : obj;
  obj.usermod = this.userLogged;

  async.series([

    // carga perfil completo del comprador
    function(callback){
      if(!obj.comprador){
        return callback();
      }

      MicaSuscription.findById(obj.comprador._id,function(err,result){
        if(err) return callback(err);

        obj.comprador = result.toJSON();
        callback();
      });
    },

    //carga perfil completo del vendedor
    function(callback){
      if(!obj.vendedor){
        return callback();
      }

      MicaSuscription.findById(obj.vendedor._id,function(err,result){
        if(err) return callback(err);

        obj.vendedor = result.toJSON();
        callback();
      });
    },

    // guarda reunion
    function(callback){
      var micaAgenda = new MicaAgenda(obj);
      micaAgenda.save(callback);
    }
  ],function(err,results){
    if(err) return callback(err);

    callback(null,results[results.length-1]);
  });
};

/**
 * guarda parcial de
 * @param  {String}   idReunion String ObjectID
 * @param  {Object}   attrs     [description]
 * @param  {Function} callback  Retorna el objeto guardado con todos los campos
 */
MicaAgendaService.prototype.savePartial = function(idReunion,attrs,callback){
  if('estado' in attrs){
    return this.changeStatus(idReunion,attrs.estado,callback);
  }

  if('estado_alta' in attrs){
    return this.changeStatusAlta(idReunion,attrs.estado_alta,callback);
  }

  callback('Por el momento, solo se puede modificar el estado');
};

MicaAgendaService.prototype.changeStatusAlta = function(idReunion,newStatus,callback){
  if(typeof(idReunion) === 'object'){
    idReunion = idReunion.id.toString();
  }

  var reunion;

  async.series([
    //trae la reunion
    function(cb){
      MicaAgenda.findById(idReunion,function(err,result){
        if(err) return cb(err);

        if(!result){
          return cb(new AppError('No se pudo cambiar el estado','not found row micaagenda','not_found'));
        }

        reunion = result;
        cb();
      });
    },

    // cambia el estado en micaagenda
    function(cb){
      MicaAgenda.partialupdate({_id:reunion.id},{estado_alta:newStatus},cb);
    },

    // retorna el objeto entero
    function(cb){
      MicaAgenda.findById(idReunion,cb);
    }

  ],function(err,results){
    if(err) return callback(err);
    callback(null,results[results.length-1]);
  });
};

/**
 * Cambia el estado de una reunion,
 * Se verifica que no haya otra reunion confirmada con el mismo numero
 * para los solicitantes involucrados.
 *
 * @param  {String || Object}   idReunion  id del MicaAgendaCollection
 * @param  {Function} cb
 */
MicaAgendaService.prototype.changeStatus = function(idReunion,newStatus,callback){
  // verficar que exista la reunion
  // si el estado pasa a confirmado, verificar que no haya conflictos con otras reuniones
  // (para otro estado no hay problema)

  if(typeof(idReunion) === 'object'){
    idReunion = idReunion.id.toString();
  }

  var reunion;

  async.series([
    //trae la reunion
    function(cb){
      MicaAgenda.findById(idReunion,function(err,result){
        if(err) return cb(err);

        if(!result){
          return cb(new AppError('No se pudo cambiar el estado','not found row micaagenda','not_found'));
        }

        reunion = result;
        cb();
      });
    },

    // TODO: verifica que no haya conflictos
    function(cb){
      return cb();
      if(newStatus !== MicaAgenda.STATUS_CONFIRM){
        return cb();
      }

      var query = {
        estado: MicaAgenda.STATUS_CONFIRM,
        num_reunion: reunion.get('num_reunion')
      };

      MicaAgenda.find(query,function(err,results){
        if(err) return cb(err);

        if(results && results.length > 0){
          return cb(new AppError('Hay otras reuniones confirmadas','meeting conflict','conflict'));
        }

        cb();
      });
    },

    // cambia el estado en micaagenda
    function(cb){
      MicaAgenda.partialupdate({_id:reunion.id},{estado:newStatus},cb);
    },

    //TODO: cambia el estado en micainteractions
    function(cb){
      cb();
    },

    // retorna el objeto entero
    function(cb){
      MicaAgenda.findById(idReunion,cb);
    }

  ],function(err,results){
    if(err) return callback(err);
    callback(null,results[results.length-1]);
  });
};

MicaAgendaService.prototype.remove = function(idReunion,cb){
  // verificar que exista
  // borrar reunion
  // borrar fk de micainteractions

  async.series([
    //verificar que existe + borrar
    function(cb){
      MicaAgenda.findById(idReunion,function(err,object){
        if(err) return cb(err);

        if(!object){
          return cb('not found');
        }

        object.remove(function(err,r){
          if(err) return res.status(500).send(err);

          cb();
        });
      });
    },

    // borrar fk de micainteractions
    function(cb){
      if(idReunion.toString){
        idReunion = idReunion.toString();
      }
      var query = {
        meeting_id: idReunion
      };

      var data = {
        meeting_number: -1,
        meeting_estado: 'no_asignada',
        meeting_id: ''
      };

      MicaInteraction.partialupdate(query,data,function(err,countAffected){
        if(err){
          console.warn('[WARN] Al borrar reunión, ERROR al actualizar interactions',err);
        }
        cb();
      });
    },
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

  var self = this;
  async.series([

    //BUSCA REUNION LIBRES ANTERIORES, para eliminarlas
    function(cb){
      // buscar reunion libre para comprador y numero
      // si exite, la borra
      // lo mismo para el vendedor

      var $or = [];
      $or.push({'comprador._id':comprador._id.toString(),num_reunion:numero,estado:'libre'});
      $or.push({'vendedor._id':vendedor._id.toString(),num_reunion:numero,estado:'libre'});

      var query = {$or: $or};
      // console.log('buscando viejas',query);
      MicaAgenda.find(query,function(err,results){
        if(err) console.log('ERROR',err);
        if(err) return cb(err);
        // console.log('BORRANDO',results);
        async.eachSeries(results,function(item,cb){
          self.remove(item.id,cb);
        },function(err,results){
          // console.log('TERMINO');
          if(err) console.log('ERROR',err);
          // termino de borrar las anteriores
          cb(err);
        });
      });
    },

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
    cb(null,reunion);
  });
};


module.exports = MicaAgendaService;

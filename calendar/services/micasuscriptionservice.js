var async = require('async');
var _ = require('underscore');

var root = '../';

var AppError = require(root + '../core/apperror.js');
var MicaAgenda = require(root + 'models/micaagenda.js').getModel();
var MicaSuscription = require(root + 'models/micasuscription.js').getModel();

var MicaSuscriptionService = function(userLogged){
  this.userLogged = userLogged;
};

/**
 * Actualiza el campo place de la suscription
 * @param {Object} data - suscription {_id:String, place: Object};
 */
MicaSuscriptionService.prototype.updatePlace = function(data,callback){
  //pasos:
  // chequear datos y suscripcion existe
  // guardar place en suscription
  // actualizar place en micaagenda para los compradores == suscription

  var suscription;
  async.series([
    // chequear datos y suscripcion existe
    function(cb){
      MicaSuscription.findById(data._id,function(err,result){
        if(err) return cb(err);

        if(!result){
          return cb('not_found');
        }

        suscription = result;
        cb();
      });
    },

    // update suscription
    function(cb){
      var query = {_id: suscription.id};
      MicaSuscription.partialupdate(query,{place:data.place},cb);
    },

    // actualizar place en micaagenda
    function(cb){
      var query = {
        'comprador._id': suscription.id.toString()
      };

      MicaAgenda.partialupdate(query,{place:data.place},cb);
    }

  ],function(err,results){
    if(err) return cb(err);

    callback(null,suscription);
  });
};

/**
 * [function description]
 * @param  {Object}   data     - {_id:String,confirma_asistencia:bool,confirma_rol: String}
 */
MicaSuscriptionService.prototype.confirmAsistencia = function(data,callback){
  if(!data || !data._id || typeof(data.confirma_asistencia) === 'undefined' || !data.confirma_rol || (data.confirma_rol != 'comprador' && data.confirma_rol != 'vendedor')){
    return callback('parametros no validos');
  }

  var suscription;
  async.series([
    // chequear datos y suscripcion existe
    function(cb){
      MicaSuscription.findById(data._id,function(err,result){
        if(err) return cb(err);

        if(!result){
          return cb('not_found');
        }

        suscription = result;
        cb();
      });
    },

    // update suscription
    function(cb){
      var query = {_id: suscription.id};
      var raw = {};
      var key = data.confirma_rol + '.confirma_asistencia';
      raw[key] = data.confirma_asistencia;
      MicaSuscription.partialupdate(query,raw,cb);
    },

    // actualizar confirmacion en micaagenda
    function(cb){
      var query = {};
      query[data.confirma_rol + '._id'] = suscription.id.toString();
      var raw = {};
      var key = data.confirma_rol + '.confirma_asistencia';
      raw[key] = data.confirma_asistencia;

      console.log('ACTUALIZA AGENDAS',query,raw);

      MicaAgenda.partialupdate(query,raw,cb);
    },

    // busca de nuevo la suscripcion
    function(cb){
      MicaSuscription.findById(data._id,function(err,result){
        if(err) return cb(err);

        if(!result){
          return cb('not_found');
        }

        suscription = result;
        cb();
      });
    },

  ],function(err,results){
    if(err) return cb(err);

    callback(null,suscription);
  });
};

module.exports = MicaSuscriptionService;

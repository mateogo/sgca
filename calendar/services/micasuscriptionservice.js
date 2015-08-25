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


module.exports = MicaSuscriptionService;

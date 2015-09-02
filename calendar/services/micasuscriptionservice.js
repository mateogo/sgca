var async = require('async');
var _ = require('underscore');

var root = '../';

var AppError = require(root + '../core/apperror.js');
var BaseModel = require(root + 'models/basemodel.js');
var MicaAgenda = require(root + 'models/micaagenda.js').getModel();
var MicaSuscription = require(root + 'models/micasuscription.js').getModel();

var MicaSuscriptionService = function(userLogged){
  this.userLogged = userLogged;
};


MicaSuscriptionService.prototype.estadisticaConfirmacion = function(cb){
  // buscar todos los compradores que tiene al menos una reunion
  // ver de esos quien confirmaron asistencia, confirmaron no asistencia, y no respondieron
  // lo mismo para los vendedores

  var statics = {
    compradores : {
      asistiran: 0,
      no_asistiran: 0,
      no_contestaron: 0
    },
    vendedores: {
      asistiran: 0,
      no_asistiran: 0,
      no_contestaron: 0
    }
  };

  var compradores;
  var vendedores;

  async.series([
      // busca compradores que tengan alguna reunion
      function(cb){
        BaseModel.dbi.collection(MicaAgenda.entityCol, function(err, collection) {
          collection.distinct('comprador.cnumber',{'estado':'asignado'},function(err,results){
            compradores = results;
            cb();
          });
        });
      },
      function(cb){
        MicaSuscription.count({'comprador.confirma_asistencia':true,'cnumber':{$in:compradores}},function(err,result){
          statics.compradores.asistiran = result;
          cb();
        });
      },
      function(cb){
        MicaSuscription.count({'comprador.confirma_asistencia':false,'cnumber':{$in:compradores}},function(err,result){
          statics.compradores.no_asistiran = result;
          cb();
        });
      },
      function(cb){
        MicaSuscription.count({'comprador.confirma_asistencia':{$exists:false},'cnumber':{$in:compradores}},function(err,result){
          statics.compradores.no_contestaron = result;
          cb();
        });
      },

      // busca vendedores que tengan alguna reunion
      function(cb){
        BaseModel.dbi.collection(MicaAgenda.entityCol, function(err, collection) {
          collection.distinct('vendedor.cnumber',{'estado':'asignado'},function(err,results){
            vendedores = results;
            cb();
          });
        });
      },
      function(cb){
        MicaSuscription.count({'comprador.confirma_asistencia':true,'cnumber':{$in:vendedores}},function(err,result){
          statics.vendedores.asistiran = result;
          cb();
        });
      },
      function(cb){
        MicaSuscription.count({'comprador.confirma_asistencia':false,'cnumber':{$in:vendedores}},function(err,result){
          statics.vendedores.no_asistiran = result;
          cb();
        });
      },
      function(cb){
        MicaSuscription.count({'comprador.confirma_asistencia':{$exists:false},'cnumber':{$in:vendedores}},function(err,result){
          statics.vendedores.no_contestaron = result;
          cb();
        });
      },
  ],function(err,result){
    if(err) return cb(err);

    cb(null,statics);
  });
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

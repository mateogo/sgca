
var async = require('async');
var _ = require('underscore');

var root = '../';

var BaseModel = require(root + 'models/basemodel.js');
var MicaAgenda = require(root + 'models/micaagenda.js').getModel();
var MicaSuscription = require(root + 'models/micasuscription.js').getModel();
var MicaInteraction = require(root + 'models/micainteraction.js').getModel();

var MicaAgendaService = require(root + 'services/micaagendaservice.js');

var MicaToolsService = function(){

};

/**
 * Verifica los compradores y vendedores que no tiene cnumber
 */
MicaToolsService.prototype.checkCNumber = function(cb){
  var self = this;

  async.series([
    function(cb){
      self._checkCNumber('comprador',cb);
    },
    function(cb){
      self._checkCNumber('vendedor',cb);
    }
  ],function(err,results){
    if(err) return cb(err);
    console.log('CANTIDAD DE CASOS comprador',results[0].length);
    console.log('CANTIDAD DE CASOS vendedor',results[1].length);
    cb(null,results[0].concat(results[1]));
  });
};

/**
 * Agrega el cnumber para los compradores y vendedores
 */
MicaToolsService.prototype.fixCNumber = function(cb){
  var self = this;

  async.series([
    function(cb){
      self._fixCNumber('comprador',cb);
    },
    function(cb){
      self._fixCNumber('vendedor',cb);
    }
  ],function(err,results){
    if(err) return cb(err);

    var cantidadArreglados = results[0] + results[1];
    cb(null,cantidadArreglados);
  });
};


/**
 * Busca compradores que tengan repetido numero de reunion
 */
MicaToolsService.prototype.searchRepeatNumReunion = function(cb){
  var self = this;
  async.series([
    function(cb){
      self._searchRepeatNumReunion('comprador',cb);
    },
    function(cb){
      self._searchRepeatNumReunion('vendedor',cb);
    }
  ],function(err,results){
    if(err) return cb(err);

    cb(null,results[0].concat(results[1]));
  });
};

MicaToolsService.prototype.quotaExceeded = function(cb){
  var self = this;
  async.series([
    function(cb){
      self._searchExceedQuota('comprador',cb);
    },
    function(cb){
      self._searchExceedQuota('vendedor',cb);
    }
  ],function(err,results){
    if(err) return cb(err);

    cb(null,results[0].concat(results[1]));
  });
};


MicaToolsService.prototype.crossProfile = function(cb){
  var self = this;
  async.series([
    function(cb){
      self._crossProfile('comprador',cb);
    },
    function(cb){
      self._crossProfile('vendedor',cb);
    }
  ],function(err,results){
    if(err) return cb(err);

    cb(null,results[0].concat(results[1]));
  });
};



MicaToolsService.prototype._searchRepeatNumReunion = function(rol,cb){
  BaseModel.dbi.collection(MicaAgenda.entityCol, function(err, collection) {
    var match = {
      num_reunion: {$ne:0},
    };

    match[rol] = {$ne: null};
    var key = rol + '.cnumber';
    match[key] = {$ne: null};

    var group = {
      _id: {number:'$num_reunion'},
      count: {$sum: 1}
    };

    group._id.cnumber = '$'+rol+'.cnumber';

    var sort = {
      '_id.number': 1,
      '_id.cnumber': 1
    };

    collection.aggregate([{$match:match},{$group:group},{$sort:sort}],function(err,results){
      if(err) return cb(err);

      var toRet = [];
      //traspasa los campos del _id a un nivel superior y aplica having
      for (var i = 0; i < results.length; i++) {
        var row =  results[i];
        if(row.count > 1){
          _.extend(row,row._id);
          delete row._id;
          row.rol = rol; //se agrega que rol tiene para faciltar manejo
          toRet.push(row);
        }
      }

      cb(null,toRet);
    });
  });
};

MicaToolsService.prototype._checkCNumber = function(rol,cb){
  BaseModel.dbi.collection(MicaAgenda.entityCol, function(err, collection) {

    var query = {};
    query[rol] = {$ne:null};
    var key = rol + '.cnumber';
    query[key] = {$exists:false};

    var fieldDistinct = rol + '._id';
    console.log('query',query);
    collection.distinct(fieldDistinct,query,function(err,results){
      if(err) return cb(err);

      cb(null,results);
    });
  });
};

MicaToolsService.prototype._fixCNumber = function(rol,cb){
  var self = this;
  var without = [];
  var count = 0;
  async.series([
      // buscar sin cnumber
      function(cb){
        self._checkCNumber(rol,function(err,results){
          if(err){
            console.log('error al queckar',err);
            return cb(err);
          }

          without = results;
          cb();
        });
      },

      //setear cnumber
      function(cb){
        async.eachSeries(without,function(item,cb){
          // buscar suscripcion
          MicaSuscription.findById(item,function(err,suscription){
            if(err) return cb(err);

            var query = {};
            var key = rol + '._id';
            query[key] = suscription.id.toString();

            var attrs = {};
            key = rol + '.cnumber';
            attrs[key] = suscription.get('cnumber');
            //console.log('query partial update',query,attrs);
            // actualizar cnumber
            MicaAgenda.partialupdate(query,attrs,function(err,result){
              cb(err);
              count++;
            });
          });

        },function(done){
          cb();
        });
      }

  ],function(err,results){
    cb(err,count);
  });

};

MicaToolsService.prototype._searchExceedQuota = function(rol,cb){
  BaseModel.dbi.collection(MicaAgenda.entityCol, function(err, collection) {
    var match = {
      num_reunion: {$ne:0},
    };
    match[rol] = {$ne:null};

    var group = {
      _id: {},
      count: {$sum: 1}
    };

    group._id.cnumber = '$'+rol+'.cnumber';

    var sort = {
      '_id.cnumber': 1
    };

    collection.aggregate([{$match:match},{$group:group},{$sort:sort}],function(err,results){
      if(err) return cb(err);

      var toRet = [];
      //traspasa los campos del _id a un nivel superior y aplica having
      for (var i = 0; i < results.length; i++) {
        var row =  results[i];
        if(row.count > MicaAgendaService.COUNT_REUNIONES){
          _.extend(row,row._id);
          delete row._id;
          row.rol = rol; //se agrega que rol tiene para faciltar manejo
          toRet.push(row);
        }
      }

      cb(null,toRet);
    });
  });
};

MicaToolsService.prototype._crossProfile = function(rol,cb){
  BaseModel.dbi.collection(MicaAgenda.entityCol, function(err, collection) {

    collection.distinct(rol+'.cnumber',function(err,cnumbers){

      var query = {
        cnumber: {$in: cnumbers}
      };

      var key = rol +'.rolePlaying.'+rol;
      query[key] = false;

      MicaSuscription.find(query,function(err,results){
        if(err) return cb(err);

        var toRet = [];
        //traspasa los campos del _id a un nivel superior y aplica having
        for (var i = 0; i < results.length; i++) {
          var suscription =  results[i];
          var raw = suscription.serialize();
          raw.rolDirty = rol;
          raw.comprador = suscription.get('comprador');
          raw.vendedor = suscription.get('vendedor');
          toRet.push(raw);
        }
        cb(null,toRet);
      });
    });
  });
};


module.exports = MicaToolsService;

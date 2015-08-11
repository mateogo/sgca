var root = '../';
var _ = require('underscore');

var MicaAgenda = require(root + 'models/micaagenda.js').getModel();
var MicaAgendaService = require(root + 'services/micaagendaservice.js');

var ctrls = {
    find: function(req,res){

      //PREPRANDO QUERY
      var query =  _.pick(req.query,'page','per_page','textsearch','estado');
      if(query.page){
        query.page = parseInt(query.page);
        if(isNaN(query.page)){
          delete query.page;
        }
      }

      if(query.per_page){
        query.per_page = parseInt(query.per_page);
        if(isNaN(query.per_page)){
          delete query.per_page;
        }
      }

      if(query.textsearch){
        var reg = new RegExp(query.textsearch,'i');
        var $or = [];
        $or.push({'vendedor.responsable.rmail':reg});
        $or.push({'vendedor.responsable.rname':reg});
        $or.push({'comprador.responsable.rmail':reg});
        $or.push({'comprador.responsable.rname':reg});
        query.$or = $or;
        delete query.textsearch;
      }


      console.log('buscando en agenda',query);

      //EJECUNTADO QUERY
      MicaAgenda.findPageable(query,function(err,result){
        if(err) return res.status(500).send(err);

        res.json(result);
      });
    },

    findById: function(req,res){
      var id = req.params.id;

      MicaAgenda.findById(id,function(err,result){
        if(err) return res.status(500).send(err);

        res.json(result);
      });
    },

    agenda: function(req,res){

      var suscriptor = req.params.idSuscriptor;
      var rol = req.params.rol;

      var service = new MicaAgendaService(req.user);
      service.getAgenda(suscriptor,rol,function(err,result){
        if(err) return res.status(500).send(err);

        res.json(result);
      });
    },

    /**
     * Asignacion de reunion entre un comprador y vendedor
     * Se esperan dos parametros 'comprador' y 'vendedor' id de micasuscriptions
     *
     */
    assign: function(req,res){

      var service = new MicaAgendaService(req.user);


      var comprador = req.body.comprador;
      var vendedor = req.body.vendedor;

      if(!comprador || !vendedor){
        return res.status(400).send('datos no validos');
      }

      service.assign(comprador,vendedor,function(err,result){
        if(err) return res.status(500).send(err);

        res.json(result);
      });

      //TODO: poder recibir tambien el id de micainteraction


    },

    save: function(req,res){
      res.status(500).send('en construccion');
    },

    remove: function(req,res){
      // TODO: seguridad,
      // solo se puede borrar los propios

      if(!req.params.id){
        return res.status(500).send('invalid params');
      }

      var id = req.params.id;

      MicaAgenda.findById(id,function(err,object){
        if(err) return res.status(500).send(err);
        object.remove(function(err,r){
          if(err) return res.status(500).send(err);

          res.json(r);
        });
      });
    }

};

var ensureAuthenticated = function (req, res, next) {
  if (req.isAuthenticated()) {
      return next();
  }
  res.send(401);
};

var isAdminMica = function(req, res, next){
  var user = req.user;

  if(!user.roles || !user.modulos){
    return res.send(401);
  }

  if( user.roles.indexOf('admin') === -1 ||  user.modulos.indexOf('mica') === -1 ){
    return res.send(401);
  }
  return next();
};


module.exports.configRoutes = function(app){
  app.get('/micaagenda',[ensureAuthenticated,isAdminMica,ctrls.find]);
  app.get('/micaagenda/:id',[ensureAuthenticated,isAdminMica,ctrls.findById]);

  app.get('/micaagenda/:idSuscriptor/:rol',[ensureAuthenticated,isAdminMica,ctrls.agenda]);

  app.post('/micaagenda/assign',[ensureAuthenticated,isAdminMica,ctrls.assign]);

  app.post('/micaagenda',[ensureAuthenticated,isAdminMica,ctrls.save]);
  app.put('/micaagenda/:id',[ensureAuthenticated,isAdminMica,ctrls.save]);

  app.delete('/micaagenda/:id',[ensureAuthenticated,isAdminMica,ctrls.remove]);
};

// dummy para hacerlo compatible con config
module.exports.setDb = function(db){ return this;};
module.exports.setBSON = function(bson){ return this;};
module.exports.setConfig = function(config){ return this;};


var root = '../';

var ObraArte = require(root + 'models/obraarte.js').getModel();

var ctrls = {
    find: function(req,res){
      //TODO: seguridad,
      // si no hay login no retornar nada
      // si es usuario comun, solo retornar los suyos
      // si es usuario revisor o aprobador o aduana retornar, todos

      var query = req.query;

      //si es usuario comun, solo retornar los suyos
      query.owner_id = req.user._id.toString();

      if(query.$or){
        //transforma las consultas a like;
        for (var i = 0; i < query.$or.length; i++) {
           var item = query.$or[i];
          for(var key in item){
            item[key] = {"$regex": item[key],"$options":"gi"};
          }
        }
      }

      console.log('buscando obra',query);

      ObraArte.find(query,function(err,result){
        if(err) return res.status(500).send(err);

        res.json(result);
      });
    },

    findById: function(req,res){
      var id = req.params.id;

      ObraArte.findById(id,function(err,result){
        if(err) return res.status(500).send(err);

        res.json(result);
      });
    },

    save: function(req,res){
      //TODO: seguridad,
      // solo se puede guardar los propios y mientras no esten activos en una licencia
      // si la obra es nueva, autosetear el owner al usuario logueado.

      var user = req.user;
      var raw = req.body;

      if(req.params.id){
        raw._id = req.params.id;
      }



      ObraArte.findById(raw._id,function(err,result){
        if(result && result.get('owner_id')){
          var owner_id = result.get('owner_id');
          if(owner_id.toString() != user._id.toString()){
            res.send(500,'Solo el creador puede modificar la obra de arte');
            return;
          }
        }

        var obj = new ObraArte(raw);

        var user_id = user._id.toString();
        if(obj.isNew()){
          obj.set('owner_id',user_id);
        }else if(!obj.get('owner_id')){
          obj.set('owner_id',user_id);
        }

        obj.save(function(err,result){
          if(err) return res.status(500).send(err);

          res.json(result);
        });
      });
    },

    remove: function(req,res){
      //TODO: seguridad,
      //solo se puede borrar los propios

      if(!req.params.id){
        return res.status(500).send('invalid params');
      }

      var id = req.params.id;

      ObraArte.findById(id,function(err,object){
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


module.exports.configRoutes = function(app){
  app.get('/obraarte',ensureAuthenticated,ctrls.find);
  app.get('/obraarte/:id',ensureAuthenticated,ctrls.findById);

  app.post('/obraarte',ensureAuthenticated,ctrls.save);
  app.put('/obraarte/:id',ensureAuthenticated,ctrls.save);

  app.delete('/obraarte/:id',ensureAuthenticated,ctrls.remove);
};

//dummy para hacerlo compatible con config
module.exports.setDb = function(db){ return this;};
module.exports.setBSON = function(bson){ return this;};
module.exports.setConfig = function(config){ return this;};

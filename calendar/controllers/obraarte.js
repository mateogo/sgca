
var root = '../';

var ObraArte = require(root + 'models/obraarte.js').getModel();

var ctrls = {
    find: function(req,res){
      //TODO: seguridad, 
      // si no hay login no retornar nada
      // si es usuario comun, solo retornar los suyos
      // si es usuario revisor o aprobador o aduana retornar, todos
      
      var query = req.query;
      
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
      
      var raw = req.body;
      
      if(req.params.id){
        raw._id = req.params.id;
      }
      
      var obj = new ObraArte(raw);
      obj.save(function(err,result){
        if(err) return res.status(500).send(err);
        
        res.json(result);
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


module.exports.configRoutes = function(app){
  app.get('/obraarte',ctrls.find);
  app.get('/obraarte/:id',ctrls.findById);
  
  app.post('/obraarte',ctrls.save);
  app.put('/obraarte/:id',ctrls.save);
  
  app.delete('/obraarte/:id',ctrls.remove);
};

//dummy para hacerlo compatible con config
module.exports.setDb = function(db){ return this;};
module.exports.setBSON = function(bson){ return this;};
module.exports.setConfig = function(config){ return this;};
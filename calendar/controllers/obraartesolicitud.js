
var root = '../';

var Solicitud = require(root + 'models/obraartesolicitud.js').getModel();

var ctrls = {
    find: function(req,res){
      //TODO: seguridad, 
      // si no hay login no retornar nada
      // si es usuario comun, solo retornar los suyos
      // si es usuario revisor o aprobador o aduana retornar, todos
      
      var query = req.query;
      
      Solicitud.find(query,function(err,result){
        if(err) return res.status(500).send(err);
        
        res.json(result);
      });
    },
    
    findById: function(req,res){
      var id = req.params.id;
      
      Solicitud.findById(id,function(err,result){
        if(err) return res.status(500).send(err);
        
        res.json(result);
      });
    },
    
    save: function(req,res){
      //TODO: seguridad,
      //solo se puede guardar los propios
      
      var raw = req.body;
      
      if(req.params.id){
        raw._id = req.params.id;
      }
      
      var obj = new Solicitud(raw);
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
      
      Solicitud.findById(id,function(err,object){
        if(err) return res.status(500).send(err);
        Solicitud.remove(function(err,r){
          if(err) return res.status(500).send(err);
          
          res.json(r);
        });
      });
    }
    
};


module.exports.configRoutes = function(app){
  app.get('/obraartesolicitud',ctrls.find);
  app.get('/obraartesolicitud/:id',ctrls.findById);
  
  app.post('/obraartesolicitud',ctrls.save);
  app.put('/obraartesolicitud/:id',ctrls.save);
  
  app.delete('/obraartesolicitud/:id',ctrls.remove);
};

//dummy para hacerlo compatible con config
module.exports.setDb = function(db){ return this;};
module.exports.setBSON = function(bson){ return this;};
module.exports.setConfig = function(config){ return this;};
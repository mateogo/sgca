
var root = '../';

var Solicitud = require(root + 'models/obraartesolicitud.js').getModel();
var passport = require('passport');


var ctrls = {
    find: function(req,res){
      var query = req.query;
      
      //si es usuario comun, solo retornar los suyos
      query.owner_id = req.user._id.toString();
      //TODO: si es usuario revisor o aprobador o aduana retornar, todos
      
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
      var user = req.user;
      
      var raw = req.body;
      
      if(req.params.id){
        raw._id = req.params.id;
      }
      
      Solicitud.findById(raw._id,function(err,result){
        if(result && result.get('owner_id')){
          var owner_id = result.get('owner_id');
          if(owner_id.toString() != user._id.toString()){
            res.send(500,'Solo el creador puede modificar la solicitud');
            return;
          }
        }
        
        var obj = new Solicitud(raw);
        
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
      var user = req.user;
      
      if(!req.params.id){
        return res.status(500).send('invalid params');
      }
      
      var id = req.params.id;
      
      Solicitud.findById(id,function(err,object){
        if(err) return res.status(500).send(err);
        
        if(object && object.get('owner_id') != user._id){
          res.status(500).send('Solo el creador puede borrar la solicitud');
          return;
        }
        
        Solicitud.remove(function(err,r){
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
  app.get('/obraartesolicitud',ensureAuthenticated,ctrls.find);
  app.get('/obraartesolicitud/:id',ensureAuthenticated,ctrls.findById);
  
  app.post('/obraartesolicitud',ensureAuthenticated,ctrls.save);
  app.put('/obraartesolicitud/:id',ensureAuthenticated,ctrls.save);
  
  app.delete('/obraartesolicitud/:id',ensureAuthenticated,ctrls.remove);
};

//dummy para hacerlo compatible con config
module.exports.setDb = function(db){ return this;};
module.exports.setBSON = function(bson){ return this;};
module.exports.setConfig = function(config){ return this;};
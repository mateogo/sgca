
var root = '../';

var Model = require(root + 'models/event.js').getModel();

var ctrls = {
    find: function(req,res){
      var query = req.query;
      
      Model.find(query,function(err,result){
        if(err) return res.status(500).send(err);
        
        res.json(result);
      });
    },
    
    findById: function(req,res){
      var id = req.params.id;
      
      Model.findById(id,function(err,result){
        if(err) return res.status(500).send(err);
        
        res.json(result);
      });
    },
    
    save: function(req,res){
      var raw = req.body;
      
      if(req.params.id){
        raw._id = req.params.id;
      }
      
      var obj = new Model(raw);
      obj.save(function(err,result){
        if(err) return res.status(500).send(err);
        
        res.json(result);
      });
    },
    
    remove: function(req,res){
      
      
      if(!req.params.id){
        return res.status(500).send('invalid params');
      }
      
      var id = req.params.id;
      
      Model.findById(id,function(err,model){
        if(err) return res.status(500).send(err);
        model.remove(function(err,r){
          if(err) return res.status(500).send(err);
          
          res.json(r);
        });
      });
    }
    
};

module.exports.configRoutes = function(app){
  app.get('/eventos',ctrls.find);
  app.get('/eventos/:id',ctrls.findById);
  
  app.post('/eventos',ctrls.save);
  app.put('/eventos/:id',ctrls.save);
  
  app.delete('/eventos/:id',ctrls.remove);
};

//dummy para hacerlo compatible con config
module.exports.setDb = function(db){ return this;};
module.exports.setBSON = function(bson){ return this;};
module.exports.setConfig = function(config){ return this;};
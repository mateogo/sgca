
var root = '../';

var ArtActivity = require(root + 'models/artactivity.js').getModel();

var ctrls = {
    find: function(req,res){
      var query = req.query;
      
      ArtActivity.find(query,function(err,result){
        if(err) return res.status(500).send(err);
        
        res.json(result);
      });
    },
    
    findById: function(req,res){
      var id = req.params.id;
      
      ArtActivity.findById(id,function(err,result){
        if(err) return res.status(500).send(err);
        
        res.json(result);
      });
    },
    
    save: function(req,res){
      var raw = req.body;
      
      if(req.params.id){
        raw._id = req.params.id;
      }
      
      var obj = new ArtActivity(raw);
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
      
      ArtActivity.findById(id,function(err,artActivity){
        if(err) return res.status(500).send(err);
        artActivity.remove(function(err,r){
          if(err) return res.status(500).send(err);
          
          res.json(r);
        });
      });
    }
    
};


module.exports.configRoutes = function(app){
  app.get('/artactividades',ctrls.find);
  app.get('/artactividades/:id',ctrls.findById);
  
  app.post('/artactividades',ctrls.save);
  app.put('/artactividades/:id',ctrls.save);
  
  app.delete('/artactividades/:id',ctrls.remove);
};

//dummy para hacerlo compatible con config
module.exports.setDb = function(db){ return this;};
module.exports.setBSON = function(bson){ return this;};
module.exports.setConfig = function(config){ return this;};
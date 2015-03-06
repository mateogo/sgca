
var root = '../';

var ArtActivity = require(root + 'models/artactivity.js').getModel();



var ctrls = {
    findAll: function(req,res){
      var query = req.body;
      
      var dao = new ArtActivity();
      dao.fetch(query,function(err,result){
        if(err) return res.status(500).send(err);
        
        res.json(result);
      });
    },
    
    findById: function(req,res){
      var id = req.params.id;
      
      var dao = new ArtActivity();
      dao.findById(id,function(err,result){
        if(err) return res.status(500).send(err);
        
        res.json(result);
      });
    },
    save: function(req,res){
      var raw = req.body;
      
      if(req.param.id){
        raw._id = req.param.id;
      }
      
      var obj = new ArtActivity(raw);
      obj.save(function(err,result){
        if(err) return res.status(500).send(err);
        
        res.json(result);
      });
    } 
};


module.exports.configRoutes = function(app){
  app.get('/artactividades',ctrls.findAll);
  app.get('/artactividades/:id',ctrls.findById);
  
  app.post('/artactividades',ctrls.save);
  app.put('/artactividades/:id',ctrls.save);
};

//dummy para hacerlo compatible con config
module.exports.setDb = function(db){ return this;};
module.exports.setBSON = function(bson){ return this;};
module.exports.setConfig = function(config){ return this;};
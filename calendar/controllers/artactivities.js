
var root = '../';

var ArtActivity = require(root + 'models/artactivity.js').getModel();



var ctrls = {
    findAll: function(req,res){
      var query = req.body;
      
      var dao = new ArtActivity();
      dao.fetch(query,function(err,result){
        res.json(result);
      });
    }
};


module.exports.configRoutes = function(app){
  app.get('/artactividades',ctrls.findAll);
};

//dummy para hacerlo compatible con config
module.exports.setDb = function(db){ return this;};
module.exports.setBSON = function(bson){ return this;};
module.exports.setConfig = function(config){ return this;};
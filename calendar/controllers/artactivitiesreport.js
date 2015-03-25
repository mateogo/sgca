
var root = '../';

var ArtActivityService = require(root + 'services/artactivityreport.js');


var ctrls = {
    search: function(req,res){
      var query = req.query;
      
      var service = new ArtActivityService();
      
      service.search(query,function(err,result){
        if(err) return res.status(500).send(err);
        
        res.json(result);
      });
    }
    
};


module.exports.configRoutes = function(app){
  app.get('/agenda',ctrls.search);
};

//dummy para hacerlo compatible con config
module.exports.setDb = function(db){ return this;};
module.exports.setBSON = function(bson){ return this;};
module.exports.setConfig = function(config){ return this;};
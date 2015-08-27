var root = '../';
var _ = require('underscore');

var MicaToolsService = require(root + 'services/micatoolsservice.js');

var ctrls = {
    run: function(req,res){
      var action = req.body;

      if(!action.name){
        return res.status(400).send('');
      }

      var service = new MicaToolsService();
      var method;
      if(action.name in service){
        method = service[action.name];
      }

      if(!method){
        return res.status(400).send('');
      }

      var params = action.params || [];

      params.push(function(err,results){
        if(err) return res.status(409).send(err);

        res.json(results);
      });
      console.log('los parametros',params);
      method.apply(service,params);
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
  app.post('/micatools',[/*ensureAuthenticated,isAdminMica,*/ctrls.run]);
};

// dummy para hacerlo compatible con config
module.exports.setDb = function(db){
  dbi = db;
  return this;
};
module.exports.setBSON = function(bson){
  BSON = bson;
  return this;
};

module.exports.setConfig = function(config){ return this;};

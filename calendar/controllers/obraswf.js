


var root = '../';

var Solicitud = require(root + 'models/obraartesolicitud.js').getModel();
var Token = require(root + 'models/token.js').getModel();
var passport = require('passport');

var ObrasWorkflowService = require(root + 'workflow/obras/obrasworkflowservice.js');

var factory = {
    getService: function(user){
      return new ObrasWorkflowService(user);
    }
};


var ctrls = {
    findQueries: function(req,res){
      var user = req.user;

      console.log('Buscando queries de workflow para',user);

      var service = factory.getService(user);

      service.getQueries(function(err,result){
          if(err) return res.send(422,err);

          res.json(result);
      });
    },

    runQuery: function(req,res){
        var code = req.params.code;

        var service = factory.getService(req.user);
        service.runQuery(code,function(err,result){
          if(err) return res.send(422,err);

          res.json(result);
        });
    },

    findActions: function(req,res){
      var tokenType = req.query.tokenType;

      var service = factory.getService(req.user);
      service.getActions(tokenType,function(err,result){
        if(err) return res.send(422,err);

        res.json(result);
      });
    },

    addToken: function(req,res){
      var token = new Token(req.body);

      var service = factory.getService(req.user);
      service.add(token,function(err,result){
        if(err) return res.send(422,err);

        res.json(result);
      });
    },

    findTokens: function(req,res){
      var objId = req.params.objId;

      var service = factory.getService(req.user);
      service.getByObject(objId,function(err,result){
        if(err) return res.send(422,err);

        res.json(result);
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
  app.get('/obraswf/queries',ensureAuthenticated,ctrls.findQueries);
  app.get('/obraswf/tokens/query/:code',ensureAuthenticated,ctrls.runQuery);
  app.get('/obraswf/tokens/obj/:objId',ensureAuthenticated,ctrls.findTokens);
  app.get('/obraswf/actions',ensureAuthenticated,ctrls.findActions);
  app.post('/obraswf/tokens',ensureAuthenticated,ctrls.addToken);
};

//dummy para hacerlo compatible con config
module.exports.setDb = function(db){ return this;};
module.exports.setBSON = function(bson){ return this;};
module.exports.setConfig = function(config){ return this;};

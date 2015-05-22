DocManager.module("Entities", function(Entities, DocManager, Backbone, Marionette, $, _){


  Entities.Query = Backbone.Model.extend({
    whoami: 'Query:workflow.js',
    urlRoot: "/obraswf/queries",
    idAttribute: "_id"
  });

  Entities.QueryCollection = Backbone.Collection.extend({
    whoami: 'QueryCollection:workflow.js',
    url: "/obraswf/queries",
    model: Entities.Query
  });


  Entities.Token = Backbone.Model.extend({
    whoami: 'Token:workflow.js',
    urlRoot: "/obraswf/tokens",
  });

  Entities.TokenCollection = Backbone.Collection.extend({
    whoami: 'TokenCollection:workflow.js',
    url: '/obraswf/tokens/query',

    fetchByQuery: function(queryCode){
      this.url = '/obraswf/tokens/query/'+queryCode;
      this.fetch();
    },

    fetchHistory: function(objId){
      this.url = '/obraswf/tokens/obj/'+objId;
      this.fetch();
    }
  });


  Entities.Action = Backbone.Model.extend({
    whoami: 'Action:workflow.js',
    urlRoot: "/obraswf/actions",
  });

  Entities.ActionCollection = Backbone.Collection.extend({
    whoami: 'ActionCollection:workflow.js',
    url: "/obraswf/actions"
  });




  DocManager.reqres.setHandler("token:loadObj", function(token){
    var Model = null;
    var type = token.get('obj_type');
    if(type === 'solicitud'){
      Model = Entities.Solicitud;
    }

    var $def = $.Deferred();
    if(Model){
      var model = new Model({_id:token.get('obj_id')});
      model.fetch().then(function(result){
        $def.resolve(model);
      },function(err){
        $def.reject(err);
      });
    }else{
      $def.reject('Tipo de objeto no reconocido');
    }

    return $def.promise();
  });

});

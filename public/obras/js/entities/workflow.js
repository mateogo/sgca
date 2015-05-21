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

});

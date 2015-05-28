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

    parse: function(data,options){
      if(data.type){
        var deco = tokenDecorators[data.type];
        if(deco){
          data = _.extend(data,deco);
        }
      }
      return data;
    }
  },{
    getDeco: function(type){
      var deco = tokenDecorators[type];
      return deco;
    }
  });

  Entities.TokenCollection = Backbone.Collection.extend({
    whoami: 'TokenCollection:workflow.js',
    url: '/obraswf/tokens/query',

    fetchByQuery: function(queryCode,params){
      this.url = '/obraswf/tokens/query/'+queryCode;

      if(params){
        this.url += '?' + $.param(params);
      }
      this.fetch();
    },

    fetchHistory: function(objId){
      this.url = '/obraswf/tokens/obj/'+objId;
      this.fetch();
    }
  });


  var tokenDecorators = {
    'asignar_forma' : {label: 'para Formalizar', icon: '', color: '#a94442'  },
    'formalizando' : {label: 'Formalizando', icon: '', color: '#337ab7'  },
    'pedido_correccion' : {label: 'Pedido de corrección', icon: '', color: '#8a6d3b'  },
    'autorizado' : {label: 'Autorizado', icon: '', color: '#3c763d'  },
    'cancelado' : {label: 'Cancelado', icon: '', color: '#777'  },
  };


  Entities.Action = Backbone.Model.extend({
    whoami: 'Action:workflow.js',
    urlRoot: "/obraswf/actions",
  });

  Entities.ActionCollection = Backbone.Collection.extend({
    whoami: 'ActionCollection:workflow.js',
    url: "/obraswf/actions"
  });


  DocManager.reqres.setHandler("token:getDeco",function(type){
    return Entities.Token.getDeco(type);
  });

  DocManager.reqres.setHandler("token:loadObj", function(token){
    var Model = null;
    var type = utils.getDeepAttr(token,'obj.typeModel');
    if(type === 'solicitud'){
      Model = Entities.Solicitud;
    }

    var $def = $.Deferred();
    if(Model){
      var id = utils.getDeepAttr(token,'obj.id');
      var model = new Model({_id: id});
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


  DocManager.reqres.setHandler("token:query",function(name,params){
    var col = new Entities.TokenCollection();
    col.fetchByQuery(name,params);
    return col;
  });

});

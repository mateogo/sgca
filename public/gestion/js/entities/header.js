DocManager.module("Entities", function(Entities, DocManager, Backbone, Marionette, $, _){

  Entities.Header = Backbone.Model.extend({
    initialize: function(){
      var selectable = new Backbone.Picky.Selectable(this);
      _.extend(this, selectable);
    }
  });

  Entities.HeaderCollection = Backbone.Collection.extend({
    model: Entities.Header,

    initialize: function(){
      var singleSelect = new Backbone.Picky.SingleSelect(this);
      _.extend(this, singleSelect);
    }
  });

  var initializeHeaders = function(){
    Entities.headeritems = new Entities.HeaderCollection([
      { name: "Comprobantes", url: "comprobantes", navigationTrigger: "documents:list" },
      { name: "Acerca de", url: "about", navigationTrigger: "about:show" }
    ]);
  };

  var initdocumheaders = function(){
    Entities.documitems = new Entities.HeaderCollection([
      { name: "Nuevo", url: "nuevo", navigationTrigger: "documents:list" },
      { name: "Algo", url: "about", navigationTrigger: "about:show" }
    ]);
  };

  var API = {
    getHeaders: function(){
      if(Entities.headeritems === undefined){
        initializeHeaders();
      }
      return Entities.headeritems;
    },
    getDocumNavCol: function(){
      if(Entities.documitems === undefined){
        initdocumheaders();
      }
      return Entities.documitems;
    }
  };

  DocManager.reqres.setHandler("header:entities", function(){
    return API.getHeaders();
  });
  DocManager.reqres.setHandler("docum:nav:entities", function(){
    return API.getDocumNavCol();
  });
});

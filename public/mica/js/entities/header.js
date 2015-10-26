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
    ]);
  };

  var initializeMicasidebar = function(){
    // parent-template: BucketHeaderView.html #js-sidebar-menu
    Entities.micasidebar = new Entities.HeaderCollection([
      { name: "Mi Perfil MICA",                   url: "nuevo",    navigationTrigger: "micarequest:add" },
      { name: "Explorador de emprendimientos",    url: "reporte",  navigationTrigger: "rondas:browse:profiles" },
      { name: "Mis favoritos",                    url: "lista",    navigationTrigger: "rondas:browse:favoritos" },
      //{ name: "Pedidos de reuniones recibidas",   url: "lista",    navigationTrigger: "rondas:browse:receptor",  },
      //{ name: "Pedidos de reuniones solicitadas", url: "lista",    navigationTrigger: "rondas:browse:emisor"  },
      //{ name: "Mi Agenda de rondas como Comprador", url: "lista",    navigationTrigger: "rondas:browse:agenda:comprador", role: "comprador" },
      //{ name: "Mi Agenda de rondas como Vendedor",  url: "lista",    navigationTrigger: "rondas:browse:agenda:vendedor" , role: "vendedor"},
    ]);
  };

  var initdocumheaders = function(){
    Entities.documitems = new Entities.HeaderCollection([
      { name: "Documento", url: "nuevo", navigationTrigger: "document:new" },
      { name: "Informe", url: "reporte", navigationTrigger: "report:new" },
      { name: "Lista", url: "lista", navigationTrigger: "documents:list" }
    ]);
  };

  var initdocumitemheaders = function(){
    Entities.documedititems = new Entities.HeaderCollection([
      { name: "nuevo", url: "nuevo", navigationTrigger: "document:new" },
      { name: "renglón", url: "nuevorenglon", navigationTrigger: "document:item:new" },
      { name: "lista", url: "lista", navigationTrigger: "documents:list" }
    ]);
  };


/*  var initreportheaders = function(){
    Entities.reportitems = new Entities.HeaderCollection([
      { name: "Nuevo", url: "nuevo", navigationTrigger: "report:new" },
      { name: "Lista", url: "lista", navigationTrigger: "reports:list" }
    ]);
  };

  var initreportitemheaders = function(){
    Entities.reportedititems = new Entities.HeaderCollection([
      { name: "nuevo", url: "nuevo", navigationTrigger: "report:new" },
      { name: "lista", url: "lista", navigationTrigger: "reports:list" }
    ]);
  };*/


  var API = {
    getHeaders: function(){
      if(Entities.headeritems === undefined){
        initializeHeaders();
      }
      return Entities.headeritems;
    },
    getSidebarNavCol: function(){
      if(Entities.micasidebar === undefined){
        initializeMicasidebar();
      }
      return Entities.micasidebar;
    },
    getDocumNavCol: function(){
      if(Entities.documitems === undefined){
        initdocumheaders();
      }
      return Entities.documitems;
    },
    getDocumEditCol: function(){
      if(Entities.documedititems === undefined){
        initdocumitemheaders();
      }
      return Entities.documedititems;
    },

/*    getReportEditCol: function(){
      if(Entities.reportedititems === undefined){
        initreportitemheaders();
      }
      return Entities.reportedititems;
    }  */
  };

  DocManager.reqres.setHandler("header:entities", function(){
    return API.getHeaders();
  });

  DocManager.reqres.setHandler("sidebar:nav:entities", function(){
    return API.getSidebarNavCol();
  });

  DocManager.reqres.setHandler("docum:nav:entities", function(){
    return API.getDocumNavCol();
  });
  DocManager.reqres.setHandler("docum:edit:entities", function(){
    return API.getDocumEditCol();
  });

/*  DocManager.reqres.setHandler("report:edit:entities", function(){
    return API.getReportEditCol();
  });*/


});

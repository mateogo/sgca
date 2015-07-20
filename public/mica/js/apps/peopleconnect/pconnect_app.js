DocManager.module("RondasApp", function(RondasApp, DocManager, Backbone, Marionette, $, _){

  RondasApp.Router = Marionette.AppRouter.extend({
    appRoutes: {
      "emprendimientos/explorar": "browseEmprendimientos",
    }
  });

  var API = {
    browseEmprendimientos: function(criterion){
      RondasApp.Browse.Controller.browseProfiles(criterion);
    },
  };

  DocManager.on("rondas:browse:profiles", function(){
    DocManager.navigate("emprendimientos/explorar" );
    API.browseEmprendimientos({});
  });

  DocManager.on("rondas:browse:favoritos", function(){
    DocManager.navigate("emprendimientos/explorar" );
    API.browseEmprendimientos({favorito: true});
  });

  DocManager.on("rondas:browse:emisor", function(){
    DocManager.navigate("emprendimientos/explorar" );
    API.browseEmprendimientos({emisor: 1, receptor: 0});
  });
  
  DocManager.on("rondas:browse:receptor", function(){
    DocManager.navigate("emprendimientos/explorar" );
    API.browseEmprendimientos({emisor: 0, receptor: 1});
  });


  DocManager.addInitializer(function(){
    new RondasApp.Router({
      controller: API
    });
  });
});

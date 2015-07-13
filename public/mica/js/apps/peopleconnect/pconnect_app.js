DocManager.module("RondasApp", function(RondasApp, DocManager, Backbone, Marionette, $, _){

  RondasApp.Router = Marionette.AppRouter.extend({
    appRoutes: {
      "rondas/explorar": "browseInscriptions",
    }
  });

  var API = {
    browseInscriptions: function(criterion){
      console.log('API: listar inscripciones [%s]', criterion);
      RondasApp.Browse.Controller.browseProfiles(criterion);
    },
  };

  DocManager.on("rondas:browse:profiles", function(criterion){
    DocManager.navigate("rondas/" + criterion);
    API.listInscriptions(criterion);
  });

  DocManager.addInitializer(function(){
    new RondasApp.Router({
      controller: API
    });
  });
});

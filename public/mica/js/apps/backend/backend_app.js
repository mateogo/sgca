DocManager.module("BackendApp", function(BackendApp, DocManager, Backbone, Marionette, $, _){

  BackendApp.Router = Marionette.AppRouter.extend({
    appRoutes: {
      "inscripciones": "listInscriptions",
    }
  });

  var API = {
    listInscriptions: function(criterion){
      console.log('API: listar inscripciones [%s]', criterion);
      BackendApp.List.Controller.listInscriptions(criterion);
    },
  };

  DocManager.on("inscriptions:list", function(criterion){
    DocManager.navigate("inscripciones/" + criterion);
    API.listInscriptions(criterion);
  });

  DocManager.addInitializer(function(){
    new BackendApp.Router({
      controller: API
    });
  });
});

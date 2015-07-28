DocManager.module("FondoBackendApp", function(FondoBackendApp, DocManager, Backbone, Marionette, $, _){

  FondoBackendApp.Router = Marionette.AppRouter.extend({
    appRoutes: {
      "inscripciones": "listInscriptions",
    }
  });

  var API = {
    listInscriptions: function(criterion){
      //console.log('API: listar inscripciones [%s]', criterion);
      FondoBackendApp.List.Controller.listInscriptions(criterion);
    },

  };

  DocManager.on("inscriptions:list", function(criterion){
    DocManager.navigate("inscripciones/" + criterion);
    API.listInscriptions(criterion);
  });

  DocManager.addInitializer(function(){
    new FondoBackendApp.Router({
      controller: API
    });
  });
});

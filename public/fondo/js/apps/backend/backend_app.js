DocManager.module("FondoBackendApp", function(FondoBackendApp, DocManager, Backbone, Marionette, $, _){

  FondoBackendApp.Router = Marionette.AppRouter.extend({
    appRoutes: {
      "inscripciones": "listInscriptions",
      "inscripciones/:cnum": "viewInscription",
    }
  });

  var API = {
    listInscriptions: function(criterion){
      //console.log('API: listar inscripciones [%s]', criterion);
      FondoBackendApp.List.Controller.listInscriptions(criterion);
    },

    viewInscription: function(cnum){
      //console.log('API: listar inscripciones [%s]', criterion);
      FondoBackendApp.List.Controller.viewInscription(cnum);
    },


  };

  DocManager.on("inscriptions:list", function(criterion){
    DocManager.navigate("inscripciones/" + criterion);
    API.listInscriptions(criterion);
  });

  DocManager.on("inscriptions:view:cnumber", function(cenum){
    DocManager.navigate("inscripciones/" + cnumber);
    API.viewInscription(cnumber);
  });


  DocManager.addInitializer(function(){
    new FondoBackendApp.Router({
      controller: API
    });
  });
});

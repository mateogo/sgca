DocManager.module("BackendApp", function(BackendApp, DocManager, Backbone, Marionette, $, _){

  BackendApp.Router = Marionette.AppRouter.extend({
    appRoutes: {
      "inscripciones": "listInscriptions",
      "showcase/anotados": "listShowcase",
      "ranking/mica": "browseRanking",
      "agenda": "agenda"
    }
  });

  var API = {
    listInscriptions: function(criterion){
      console.log('API: listar inscripciones [%s]', criterion);
      BackendApp.List.Controller.listInscriptions(criterion);
    },

    listShowcase: function(criterion){
      console.log('API: listar showcase [%s]', criterion);
      BackendApp.ListShowcase.Controller.listInscriptions(criterion);
    },

    browseRanking: function(criterion){
      console.log('API: Ranking interacciones [%s]', criterion);
      BackendApp.RankingMica.Controller.listRanking(criterion);
    },

    agenda: function(){
      BackendApp.AgendaMica.Controller.listAll();
    }
  };

  DocManager.on("inscriptions:list", function(criterion){
    DocManager.navigate("inscripciones/" + criterion);
    API.listInscriptions(criterion);
  });

  DocManager.on("showcases:list", function(criterion){
    DocManager.navigate("showcase/anotados/" + criterion);
    API.listShowcase(criterion);
  });

  DocManager.on("rankingmica:list", function(criterion){
    DocManager.navigate("ranking/mica/" + criterion);
    API.browseRanking(criterion);
  });


  DocManager.addInitializer(function(){
    new BackendApp.Router({
      controller: API
    });
  });
});

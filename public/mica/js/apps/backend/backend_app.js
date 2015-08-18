DocManager.module("BackendApp", function(BackendApp, DocManager, Backbone, Marionette, $, _){

  BackendApp.Router = Marionette.AppRouter.extend({
    appRoutes: {
      "inscripciones": "listInscriptions",
      "showcase/anotados": "listShowcase",
      "ranking/mica": "browseRanking",
      "agenda-rondas": "agenda",
      "agenda-rondas/:idSuscription/:rol": "agendaSuscriptor",
      "agenda-rondas/estadisticas": 'statistics'

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
    },
    agendaSuscriptor: function(idSuscription,rol,place){
      if(place === 'right'){
        BackendApp.AgendaMica.Controller.listRight(idSuscription,rol);
      }else if(place === 'popup'){
        BackendApp.AgendaMica.Controller.listPopup(idSuscription,rol);
      }else{
        BackendApp.AgendaMica.Controller.listBySuscriptor(idSuscription,rol);
      }
    },
    statistics: function(){
      BackendApp.AgendaMica.Controller.showStatistics();
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

  DocManager.on('micaagenda:agendaone:show',function(suscriptor,rol){
    DocManager.navigate("agenda-rondas/" + suscriptor + '/'+rol);
    API.agendaSuscriptor(suscriptor,rol);
  });

  DocManager.on('micaagenda:agendaone:show:right',function(suscriptor,rol){
    API.agendaSuscriptor(suscriptor,rol,'right');
  });
  DocManager.on('micaagenda:agendaone:show:popup',function(suscriptor,rol){
    API.agendaSuscriptor(suscriptor,rol,'popup');
  });

  DocManager.on('micaagenda:statistic',function(){
    DocManager.navigate("agenda-rondas/estadisticas");
    API.statistics();
  });

  DocManager.addInitializer(function(){
    new BackendApp.Router({
      controller: API
    });
  });
});

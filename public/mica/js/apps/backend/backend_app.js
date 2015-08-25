DocManager.module("BackendApp", function(BackendApp, DocManager, Backbone, Marionette, $, _){

  BackendApp.Router = Marionette.AppRouter.extend({
    appRoutes: {
      "inscripciones": "listInscriptions",
      "showcase/anotados": "listShowcase",
      "ranking/mica": "browseRanking",
      "agenda": "agenda",
      "agenda/:idSuscription/:rol": "agendaSuscriptor",
      "agenda/estadisticas": 'statistics',
      "perfil/:idSuscription":  "profileShow",

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
      var navigateUrl = 'agenda/' + idSuscription + '/'+rol;

      if(place === 'right'){
        BackendApp.AgendaMica.Controller.listRight(idSuscription,rol);
      }else if(place === 'popup'){
        BackendApp.AgendaMica.Controller.listPopup(idSuscription,rol,navigateUrl);
      }else{
        DocManager.navigate(navigateUrl);
        BackendApp.AgendaMica.Controller.listBySuscriptor(idSuscription,rol);
      }
    },
    statistics: function(){
      BackendApp.AgendaMica.Controller.showStatistics();
    },

    profileShow: function(idSuscription,place){
      var navigateUrl = 'perfil/' + idSuscription;
      var toPopup = place === 'popup';
      if(!toPopup){
        DocManager.navigate(navigateUrl);
      }
      BackendApp.RankingMica.Controller.profileShow(idSuscription,{popup:toPopup,url:navigateUrl});
    },

    editPlace: function(suscription){
      BackendApp.Places.Controller.settingView(suscription);
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
    API.agendaSuscriptor(suscriptor,rol);
  });

  DocManager.on('micaagenda:agendaone:show:right',function(suscriptor,rol){
    API.agendaSuscriptor(suscriptor,rol,'right');
  });
  DocManager.on('micaagenda:agendaone:show:popup',function(suscriptor,rol){
    API.agendaSuscriptor(suscriptor,rol,'popup');
  });

  DocManager.on('micaagenda:profile:show:popup',function(idSuscription){
    API.profileShow(idSuscription,'popup');
  });

  DocManager.on('micaagenda:profile:show',function(idSuscription){
    API.profileShow(idSuscription);
  });

  DocManager.on('micaagenda:statistic',function(){
    DocManager.navigate("agenda/estadisticas");
    API.statistics();
  });

  DocManager.on('micasuscription:edit:place',function(suscription){
    API.editPlace(suscription);
  });

  DocManager.addInitializer(function(){
    new BackendApp.Router({
      controller: API
    });
  });
});

DocManager.module('AgendaApp', function(AgendaApp, DocManager, Backbone, Marionette, $, _){

  var Entities = DocManager.module('Entities');
  
  AgendaApp.Router = Marionette.AppRouter.extend({
    appRoutes: {
      "agenda(/criterion::criterion)": "list"
    }
  });

  var API = {
    list: function(criterion){
      AgendaApp.List.Controller.list(criterion);
      DocManager.execute("set:active:header", "artactividades");
    }
  };

  DocManager.on('agenda:list', function(){
    API.list();
    DocManager.navigate('agenda');
  });
  
  DocManager.addInitializer(function(){
    new AgendaApp.Router({
      controller: API
    });
  });
  
});
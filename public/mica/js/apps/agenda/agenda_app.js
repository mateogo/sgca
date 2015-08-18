DocManager.module('AgendaApp', function(AgendaApp, DocManager, Backbone, Marionette, $, _){

  var Entities = DocManager.module('Entities');
  
  AgendaApp.Router = Marionette.AppRouter.extend({
    appRoutes: {
      "agenda(/*criterion)": "list"
    }
  });

  var API = {
    list: function(criterion){
      if(!criterion){
        AgendaApp.List.Controller.filterView(criterion);
        return;
      }
      
      if(typeof(criterion) === 'string'){
        criterion = utils.parseQueryString(criterion);
      }
      
      AgendaApp.List.Controller.list(criterion);
      
      DocManager.execute("set:active:header", "artactividades");
    }
  };

  DocManager.on('agenda:list', function(obj,newWin){
    if(obj instanceof Entities.AgendaFilter && newWin){
      var route = 'agenda/'+$.param(obj.toJSON());
      DocManager.navigateNew(route);
    }else{
      DocManager.navigate('agenda');
      API.list(obj);
    }
  });
  
  DocManager.addInitializer(function(){
    new AgendaApp.Router({
      controller: API
    });
  });
  
});
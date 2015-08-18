DocManager.module('ArtActivitiesApp', function(ArtActivitiesApp, DocManager, Backbone, Marionette, $, _){

  var Entities = DocManager.module('Entities');
  
  ArtActivitiesApp.Router = Marionette.AppRouter.extend({
    appRoutes: {
      "artactividades/:id": "edit",
      "artactividades/:id/assets": "editAssets",
      "artactividades/:id/results": "showResults",
      "artactividades(/*criterion)": "list"
    }
  });

  var API = {
    list: function(criterion){
      console.log('API: list: ArtActivities');
      
      if(typeof(criterion) === 'string'){
        criterion = utils.parseQueryString(criterion);
      }
      console.log('ArtActivities ROUTER list criterion:[%s]', criterion);
      ArtActivitiesApp.List.Controller.list(criterion);
      DocManager.execute("set:active:header", "artactividades");
    },
    createAndEdit: function(action){
      var rawAction = (action.toJSON)? action.toJSON() : action;
      var artActivy = new Entities.ArtActivity({action:rawAction});
      ArtActivitiesApp.Edit.Controller.editBasic(artActivy);
      DocManager.execute("set:active:header", "artactividades");
    },
    edit: function(model){
      ArtActivitiesApp.Edit.Controller.showResume(model);
      DocManager.execute("set:active:header", "artactividades");
    },
    editAssets: function(model){
      ArtActivitiesApp.Edit.Controller.artActivityAssets(model);
    },
    showResults: function(model){
      ArtActivitiesApp.Edit.Controller.artActivityResults(model);
    },
    remove: function(artActiviy){
      DocManager.confirm('¿Estás seguro de borrar la actividad?').then(function(){
            artActiviy.destroy({wait:true}).done(function(){
              Message.success('Borrado');
            }).fail(function(e){
              Message.error('No se pudo borrar');
              console.error(e);
            });
      });
    }
  };
  
  DocManager.on('artactivities:list', function(){
    API.list();
    DocManager.navigate('artactividades');
  });
  
  DocManager.on('artactivity:new',function(action){
    if(!action) return console.error('Action is not defined');
    API.createAndEdit(action);
    DocManager.navigate('artactividades/new');
  });
  
  DocManager.on('artActivity:edit',function(model){
    DocManager.navigate('artactividades/'+model.id);
    API.edit(model);
  });
  
  DocManager.on('artActivity:remove',function(model){
    API.remove(model);
  });
  
  DocManager.on('artactivity:showByAction',function(action){
    DocManager.navigate('artactividades/action='+action.get('cnumber'));
    API.list({action:action.get('cnumber')});
  });
  
  DocManager.on('artActivity:assets', function(artActivity){
    API.editAssets(artActivity);
    DocManager.navigate('artactividades/'+artActivity.id+'/assets');
  });

  DocManager.on('artActivity:results', function(artActivity){
    API.showResults(artActivity);
    DocManager.navigate('artactividades/'+artActivity.id+'/results');
  });

  DocManager.addInitializer(function(){
    new ArtActivitiesApp.Router({
      controller: API
    });
  });
  
});

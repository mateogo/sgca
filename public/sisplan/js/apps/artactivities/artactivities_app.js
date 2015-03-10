DocManager.module('ArtActivitiesApp', function(ArtActivitiesApp, DocManager, Backbone, Marionette, $, _){

  var Entities = DocManager.module('Entities');
  
  ArtActivitiesApp.Router = Marionette.AppRouter.extend({
    appRoutes: {
      "artactividades(/filter/criterion::criterion)": "list",
      "artactividades/:id/edit": "edit"

    }
  });

  var API = {
    list: function(criterion){
      console.log('API: list: ArtActivities');
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
      
      ArtActivitiesApp.Edit.Controller.editBasic(model);
      DocManager.execute("set:active:header", "artactividades");
    }
  };

  
  
  DocManager.on('artactivities:list', function(){
    API.list();
    DocManager.navigate('artactividades');
  });
  
  DocManager.on('artactivity:new',function(action){
    if(!action) return console.err('Action is not defined');
    API.createAndEdit(action);
  });
  
  DocManager.on('artActivity:edit',function(model){
    API.edit(model);
    DocManager.navigate("artactividades/"+model.id+'/edit');
  });
  

  DocManager.addInitializer(function(){
    new ArtActivitiesApp.Router({
      controller: API
    });
  });
  
});
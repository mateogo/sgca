DocManager.module("ActivitiesApp", function(ActivitiesApp, DocManager, Backbone, Marionette, $, _){

  ActivitiesApp.Router = Marionette.AppRouter.extend({
    appRoutes: {
      "actividades(/filter/criterion::criterion)": "ListActivities",
      "actividades/informe": "reportActivities",
      "actividades/:id/edit": "editActivity",
      "actividades/:id": "showActivity",
    }
  });

  var API = {
    editActivity: function(id){
      console.log('API: edit actividad', id)
      ActivitiesApp.Edit.Controller.editActivity(id);
      //DocManager.execute("set:active:header", "actividades");
    },
    reportActivities: function(col, opt){
      console.log('API: reportActivities');
      ActivitiesApp.List.Controller.reportActivities();
      //DocManager.execute("set:active:header", "actividades");
    },
    ListActivities: function(criterion){
      console.log('API: ListActivities');
      ActivitiesApp.List.Controller.ListActivities(criterion);
      DocManager.execute("set:active:header", "actividades");
    },
    createNewAction: function(){
      console.log('API: createNewAction');
      DocManager.execute("set:active:header", "nuevaactividad");
      DocManager.request("activity:create:new");
    },
    showActivity: function(id){
      console.log('API: show activity')
      ActivitiesApp.Show.Controller.showActivity(id);
      //DocManager.execute("set:active:header", "actividades");
    },
  };

  DocManager.on("activity:show", function(id){
    DocManager.navigate("actividades/" + id);
    API.showActivity(id);
  });

  DocManager.on("activity:new", function(){
    DocManager.navigate("actividades/nueva");
    API.createNewAction();
  });

  DocManager.on("activities:list", function(){
    DocManager.navigate("actividades");
    API.ListActivities();
  });

  DocManager.on("activities:report", function(){
    console.log('activities_app')
    DocManager.navigate("actividades/informe");
    API.reportActivities();
  });

  DocManager.on("activity:edit", function(model){
    // model is parent ACTION
    var entityid = model.id;
    DocManager.navigate("actividades/" + entityid + "/edit");
    API.editActivity(entityid);
  });

  DocManager.addInitializer(function(){
    new ActivitiesApp.Router({
      controller: API
    });
  });
});

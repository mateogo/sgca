DocManager.module("AdminrequestsApp", function(AdminrequestsApp, DocManager, Backbone, Marionette, $, _){

  AdminrequestsApp.Router = Marionette.AppRouter.extend({
    appRoutes: {
      "tramitaciones(/filter/criterion::criterion)": "ListActivities",
      "tramitaciones/informe": "reportActivities",
      "tramitaciones/:id/edit": "editActivities",
      "tramitaciones/:id": "showActivity",
      "stramite/:id/edit": "editActivity",
    }
  });

  var API = {
    editActivity: function(id){
      console.log('API: edit actividad [%s]', id)
      AdminrequestsApp.Build.Controller.showResume(id);
      //DocManager.execute("set:active:header", "actividades");
    },
    editActivities: function(id){
      console.log('API: edit actividades Action Id: [%s]', id)
      AdminrequestsApp.Edit.Controller.editActivity(id);
      //DocManager.execute("set:active:header", "actividades");
    },
    reportActivities: function(col, opt){
      console.log('API: reportActivities');
      AdminrequestsApp.List.Controller.reportActivities();
      //DocManager.execute("set:active:header", "actividades");
    },
    ListActivities: function(criterion){
      console.log('API: ListActivities');
      AdminrequestsApp.List.Controller.ListActivities(criterion);
      //DocManager.execute("set:active:header", "actividades");
    },
    createNewAction: function(){
      console.log('API: createNewAction');
      DocManager.execute("set:active:header", "nuevaactividad");
      DocManager.request("activity:create:new");
    },
    showActivity: function(id){
      console.log('API: show activity')
      AdminrequestsApp.Show.Controller.showActivity(id);
      //DocManager.execute("set:active:header", "actividades");
    },
  };

  DocManager.on("activity:show", function(id){
    DocManager.navigate("tramitaciones/" + id);
    API.showActivity(id);
  });

  DocManager.on("activity:new", function(){
    DocManager.navigate("tramitaciones/nueva");
    API.createNewAction();
  });

  DocManager.on("activities:list", function(){
    DocManager.navigate("tramitaciones");
    API.ListActivities();
  });

  DocManager.on("activities:report", function(){
    console.log('activities_app')
    DocManager.navigate("tramitaciones/informe");
    API.reportActivities();
  });

  DocManager.on("request:edit", function(model){
    // model is parent ACTION
    var entityid = model.id;
    DocManager.navigate("stramite/" + entityid + "/edit");
    API.editActivity(entityid);
  });

  DocManager.on("activity:edit", function(model){
    // model is parent ACTION
    var entityid = model.id;
    DocManager.navigate("tramitaciones/" + entityid + "/edit");
    API.editActivities(entityid);
  });

  DocManager.addInitializer(function(){
    new AdminrequestsApp.Router({
      controller: API
    });
  });
});

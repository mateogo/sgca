DocManager.module("ArtActivitiesApp", function(ArtActivitiesApp, DocManager, Backbone, Marionette, $, _){

  ArtActivitiesApp.Router = Marionette.AppRouter.extend({
    appRoutes: {
      "artactividades(/filter/criterion::criterion)": "list"

    }
  });

  var API = {
    list: function(criterion){
      console.log('API: list: ArtActivities');
      ArtActivitiesApp.List.Controller.list(criterion);
      DocManager.execute("set:active:header", "artactividades");
    }
  };

  DocManager.on("artactivities:list", function(){
    DocManager.navigate("artactividades");
    API.list();
  });
  

  DocManager.addInitializer(function(){
    new ArtActivitiesApp.Router({
      controller: API
    });
  });
  
});
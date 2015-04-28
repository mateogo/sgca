DocManager.module("HomeApp.Show", function(Show, DocManager, Backbone, Marionette, $, _){
  Show.Controller = {
      home: function(){
        var view = new Show.HomeView();
        
        DocManager.mainRegion.show(view);
      }
  }
  
});
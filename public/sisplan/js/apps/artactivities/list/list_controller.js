DocManager.module("ArtActivitiesApp.List", function(List, DocManager, Backbone, Marionette, $, _){

 
  var Entities = DocManager.module('Entities');
  
  

  List.Controller = {
    list: function(criterion){

      console.log('ArtActivitiesApp.List.Controller.list HEY!');
      
      if(!List.Session) List.Session = {};
      List.Session.layout = new List.Layout();
      
      var collection = new Entities.ArtActivityCollection();
      collection.fetch({});
      
      var table = List.GridCreator(collection);
      var filter = List.FilterCreator(collection);
      
      List.Session.layout.on("show", function(){
        //List.Session.layout.navbarRegion.show(List.Session.navbar);
        List.Session.layout.mainRegion.show(table);
        List.Session.layout.filterRegion.show(filter);
      });
      DocManager.mainRegion.show(List.Session.layout);
      $('body').scrollTop(0);
    }
  };



});

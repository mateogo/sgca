DocManager.module("ArtActivitiesApp.List", function(List, DocManager, Backbone, Marionette, $, _){

 
  var Entities = DocManager.module('Entities');
   
  List.Controller = {
    list: function(criterion){

      console.log('ArtActivitiesApp.List.Controller.list HEY!');
      
      if(!List.Session) List.Session = {};
      List.Session.layout = new List.Layout();
      
      var filterFacet = null; 
      if(criterion){
        filterFacet = new Entities.ArtActivityFilterFacet(criterion);
        List.Session.layout.setFilter(filterFacet);
      }
      var collection = new Entities.ArtActivityCollection();
      
      List.Session.collection = collection;
      
      var table = List.GridCreator(collection);
      var filter = List.FilterCreator(collection);
      
      List.Session.layout.on("show", function(){
        //List.Session.layout.navbarRegion.show(List.Session.navbar);
        List.Session.layout.mainRegion.show(table);
        List.Session.layout.filterRegion.show(filter);
      });
      DocManager.mainRegion.show(List.Session.layout);
      
      List.Controller.filter(filterFacet);
      
      $('body').scrollTop(0);
    },
    filter: function(filter){
      if(!List.Session.collection) return;
      
      List.Session.layout.setFilter(filter);
      
      var query = (filter)? filter.toJSON(): {};
      List.Session.collection.fetch({data:query});
      DocManager.navigate('artactividades/'+$.param(query));
    }
  };
  
  DocManager.on('artactivities:filter',function(filter){
    List.Controller.filter(filter);
  });



});
DocManager.module("EventsApp.List", function(List, DocManager, Backbone, Marionette, $, _){

  var Common = DocManager.module('EventsApp.Common');
  var Entities = DocManager.module('Entities');
  
  var ArtActivitiesEdit = DocManager.module('ArtActivitiesApp.Edit');
  
  
  
  List.Controller = {
    list: function(artActivity,criterion){
      
      if(!List.Session) List.Session = {};
      List.Session.layout = new List.Layout({model:artActivity});
      
      var collection = new Entities.EventCollection();
      collection.fetch({data:{artactivity_id:artActivity.id}});
      
      List.Session.collection = collection;
      
      var table = List.GridCreator(collection);
      //var filter = List.FilterCreator(collection);
      
      var headerInfo = new ArtActivitiesEdit.HeaderInfo({model:artActivity,tab:'event'});
      
      List.Session.layout.on("show", function(){
        List.Session.layout.headerInfoRegion.show(headerInfo);
        List.Session.layout.mainRegion.show(table);
        //List.Session.layout.filterRegion.show(filter);
      });
      
      DocManager.mainRegion.show(List.Session.layout);
      
      $('body').scrollTop(0);
    },
    
    filter: function(filter){
      if(!List.Session.collection) return;
      
      List.Session.layout.setFilter(filter);
      
      var query = (filter)? filter.toJSON(): {};
      List.Session.collection.fetch({data:query});
    }
  };
  
  DocManager.on('event:filter',function(filter){
    List.Controller.filter(filter);
  });

});
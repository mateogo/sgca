DocManager.module("AgendaApp.List", function(List, DocManager, Backbone, Marionette, $, _){

 
  var Entities = DocManager.module('Entities');
   
  List.Controller = {
    list: function(criterion){
      console.log('buscando en agenda',criterion);
      
      if(!List.Session) List.Session = {};
      List.Session.layout = new List.Layout();
      
      var collection = new Entities.AgendaCollection();
      
      var filter = new Entities.AgendaFilter();
      
      collection.fetch({data:filter.toJSON()});
      
      List.Session.collection = collection;
      List.Session.filter = filter;
      
      var table = new List.Table({collection:collection});
      var tagFilterView = new List.TagFilterView({model:filter});
      
      
      List.Session.layout.on("show", function(){
        List.Session.layout.mainRegion.show(table);
        List.Session.layout.tagFiterRegion.show(tagFilterView);
      });
      DocManager.mainRegion.show(List.Session.layout);
    },
    doFilter: function(filter){
      var tagFilterView = new List.TagFilterView({model:filter});
      List.Session.layout.tagFiterRegion.show(tagFilterView);
      
      List.Session.filter = filter;
      List.Session.collection.fetch({data:filter.toJSON()});
    }
  };
  
  
  DocManager.on('agenda:openFilter',function(){
    List.FilterPopup(List.Session.filter);
  });
  
  DocManager.on('agenda:filter',function(filter){
    List.Controller.doFilter(filter);
  });
  

});
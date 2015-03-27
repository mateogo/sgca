DocManager.module("AgendaApp.List", function(List, DocManager, Backbone, Marionette, $, _){

 
  var Entities = DocManager.module('Entities');
   
  List.Controller = {
    list: function(criterion){
      
      if(!List.Session) List.Session = {};
      List.Session.layout = new List.Layout();
      
      var collection = new Entities.AgendaCollection();
      
      var filter;
      if(criterion instanceof Entities.AgendaFilter){
        filter = criterion;
      }else{
        filter = new Entities.AgendaFilter();
        filter.setCriterion(criterion);
      }
      
      List.Session.collection = collection;
      List.Session.filter = filter;
      
      var table = new List.Table({collection:collection});
      
      var self = this;
      List.Session.layout.on("show", function(){
        List.Session.layout.mainRegion.show(table);
        self.doFilter(filter);
      });
      DocManager.mainRegion.show(List.Session.layout);
    },
    filterView: function(){
      var filter = new Entities.AgendaFilter();
      var view = new List.FilterView({model:filter});
      DocManager.mainRegion.show(view);
    },
    doFilter: function(filter){
      var tagFilterView = new List.TagFilterView({model:filter});
      List.Session.layout.tagFiterRegion.show(tagFilterView);
      
      List.Session.filter = filter;
      List.Session.collection.fetch({data:filter.toJSON()});
      DocManager.navigate('/agenda/'+$.param(filter.toJSON()));
    }
  };
  
  
  DocManager.on('agenda:openFilter',function(){
    List.FilterPopup(List.Session.filter);
  });
  
  DocManager.on('agenda:filter',function(filter){
    List.Controller.doFilter(filter);
  });
  

});
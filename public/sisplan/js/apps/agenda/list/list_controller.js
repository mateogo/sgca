DocManager.module("AgendaApp.List", function(List, DocManager, Backbone, Marionette, $, _){

 
  var Entities = DocManager.module('Entities');
   
  List.Controller = {
    list: function(criterion){
      console.log('buscando en agenda',criterion);
      
      if(!List.Session) List.Session = {};
      List.Session.layout = new List.Layout();
      
      var collection = new Entities.AgendaCollection();
      var yestarday = moment().subtract(1,'days');
      var nextMonth = moment().subtract(1,'days').add(1,'months');
      
      collection.fetch({data:{desde:yestarday.format(),hasta:nextMonth.format()}});
      
      List.Session.collection = collection;
      
      var table = new List.Table({collection:collection});
      
      
      List.Session.layout.on("show", function(){
        //List.Session.layout.navbarRegion.show(List.Session.navbar);
        //List.Session.layout.filterRegion.show(filter);
        List.Session.layout.mainRegion.show(table);
      });
      DocManager.mainRegion.show(List.Session.layout);
    }
  };
  

});
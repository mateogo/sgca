DocManager.module("ObrasApp.List", function(List, DocManager, Backbone, Marionette, $, _){
  
  var Common = DocManager.module('ObrasApp.Common');
  
  var Entities = DocManager.module('Entities');
  
  List.Controller = {
      list: function(){
       
        var collection = new Entities.ObrasCollection();
        collection.fetch();
        
        var view = new List.ObrasListView({collection:collection});
        
        var layout = Common.Controller.showMain(view);
        DocManager.mainRegion.show(layout);
      },
      selector: function(callback){
        
        var collection = new Entities.ObrasCollection();
        collection.fetch();
        List.selector(callback,collection);
      }
  }
  
});
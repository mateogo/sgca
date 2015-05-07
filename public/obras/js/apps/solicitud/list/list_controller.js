DocManager.module("SolicitudApp.List", function(List, DocManager, Backbone, Marionette, $, _){
  
  var Common = DocManager.module('ObrasApp.Common');
  
  var Entities = DocManager.module('Entities');
  
  List.Controller = {
      list: function(){
       
        var collection = new Entities.SolicitudCollection();
        collection.fetch();
        
        var view = new List.SolicitudListView({collection:collection});
        
        var layout = Common.Controller.showMain(view);
        DocManager.mainRegion.show(layout);
      }
  }
  
});
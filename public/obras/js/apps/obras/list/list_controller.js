DocManager.module("ObrasApp.List", function(List, DocManager, Backbone, Marionette, $, _){
  
  var Common = DocManager.module('ObrasApp.Common');
  
  List.Controller = {
      list: function(){
       
        var view = new List.ObrasListView();
        
        var layout = Common.Controller.showMain(view);
        DocManager.mainRegion.show(layout);
      }
  }
  
});
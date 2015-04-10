DocManager.module("ObrasApp.List", function(List, DocManager, Backbone, Marionette, $, _){
    
  List.ObrasListView =  Marionette.ItemView.extend({
    getTemplate: function(){
      return utils.templates.ObrasList
    }
  });
  
});
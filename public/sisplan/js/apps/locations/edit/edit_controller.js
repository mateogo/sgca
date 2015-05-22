DocManager.module("LocationsApp.Edit", function(Edit, DocManager, Backbone, Marionette, $, _){
  
  Edit.Controller = {};
  
  Edit.Controller.edit = function(model){
    var editor = new Edit.View({model:model});
    
    DocManager.mainRegion.show(editor);

  };
  
});
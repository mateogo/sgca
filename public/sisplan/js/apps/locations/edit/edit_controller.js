DocManager.module("LocationsApp.Edit", function(Edit, DocManager, Backbone, Marionette, $, _){
  
  Edit.Controller = {};
  
  Edit.Controller.edit = function(action,model){
    Edit.modaledit(action,model);
  };
  
});
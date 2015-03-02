DocManager.module("LocationsApp.Edit", function(Edit, DocManager, Backbone, Marionette, $, _){
  
  Edit.Controller = {};
  
  Edit.Controller.edit = function(action,model){
    var editor = new Edit.View({action:action,model:model});
    
    DocManager.mainRegion.show(editor);
    
    //Edit.modaledit(action,model);
  };
  
});
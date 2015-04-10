DocManager.module("ObrasApp.Edit", function(Edit, DocManager, Backbone, Marionette, $, _){
  
  var Common = DocManager.module('ObrasApp.Common');
  
  Edit.Controller = {
      edit: function(){
          
        var view = new Edit.ObrasEditorView();
        
        var layout = Common.Controller.showMain(view);
        DocManager.mainRegion.show(layout);
      }
  }
  
});
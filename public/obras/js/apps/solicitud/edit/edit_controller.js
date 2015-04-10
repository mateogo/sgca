DocManager.module("SolicitudApp.Edit", function(Edit, DocManager, Backbone, Marionette, $, _){
  
  var Common = DocManager.module('ObrasApp.Common');
  
  Edit.Controller = {
      edit: function(){
          
        var view = new Edit.SolicitudEditorView();
        
        var layout = Common.Controller.showMain(view);
        DocManager.mainRegion.show(layout);
      }
  }
  
});
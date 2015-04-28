DocManager.module("SolicitudApp.Edit", function(Edit, DocManager, Backbone, Marionette, $, _){
  
  var Common = DocManager.module('ObrasApp.Common');
  
  var Entities = DocManager.module('Entities');
  
  Edit.Controller = {
      edit: function(){
        
        var licencia = new Entities.Licencia();
        var view = new Edit.SolicitudWizardView({model:licencia});
        
        var layout = Common.Controller.showMain(view);
        DocManager.mainRegion.show(layout);
        
        view.on('licencia:saved',function(model){
          Edit.Controller.saveSuccess(model);
          view.unbind('licencia:saved');
        })
      },
      
      saveSuccess: function(model){
        var view = new Edit.SolicitudGraciasView({model:model});
        
        var layout = Common.Controller.showMain(view);
        DocManager.mainRegion.show(layout);
        $('body').scrollTop(0);
      }
  }
  
});
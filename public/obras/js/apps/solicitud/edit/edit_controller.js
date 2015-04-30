DocManager.module("SolicitudApp.Edit", function(Edit, DocManager, Backbone, Marionette, $, _){
  
  var Common = DocManager.module('ObrasApp.Common');
  
  var Entities = DocManager.module('Entities');
  
  Edit.Controller = {
      wizard: function(){
        
        var licencia = new Entities.Licencia();
        var view = new Edit.SolicitudWizardView({model:licencia});
        
        var layout = Common.Controller.showMain(view);
        DocManager.mainRegion.show(layout);
        $('body').scrollTop(0);
        
        view.on('licencia:saved',function(model){
          Edit.Controller.saveSuccess(model);
          view.unbind('licencia:saved');
        })
      },
      
      edit: function(licencia){
        
        DocManager.request('licencia:load',licencia).done(function(licencia){
          var view = new Edit.SolicitudEditorView({model:licencia});
          
          var layout = Common.Controller.showMain(view);
          DocManager.mainRegion.show(layout);
          $('body').scrollTop(0);
          
          view.on('licencia:saved',function(model){
            DocManager.trigger('licencia:list');
            view.unbind('licencia:saved');
            view.unbind('licencia:editCanceled');
          });
          
          view.on('licnecia:editCanceled',function(model){
            DocManager.confirm('¿Está seguro que desea cancelar la edición?').done(function(){
              DocManager.trigger('licencia:list');
              view.unbind('licencia:saved');
              view.unbind('licencia:editCanceled');  
            })
          })
          
        }).fail(function(){
          Message.error('No se encontro la licencia');
        });
      },
      
      saveSuccess: function(model){
        var view = new Edit.SolicitudGraciasView({model:model});
        
        var layout = Common.Controller.showMain(view);
        DocManager.mainRegion.show(layout);
        $('body').scrollTop(0);
      }
  }
  
});
DocManager.module("SolicitudApp.Edit", function(Edit, DocManager, Backbone, Marionette, $, _){
  
  var Common = DocManager.module('ObrasApp.Common');
  
  var Entities = DocManager.module('Entities');
  
  Edit.Controller = {
      wizard: function(){
        
        var solicitud = new Entities.Solicitud();
        var view = new Edit.SolicitudWizardView({model:solicitud});
        
        var layout = Common.Controller.showMain(view);
        DocManager.mainRegion.show(layout);
        $('body').scrollTop(0);
        
        view.on('solicitud:saved',function(model){
          Edit.Controller.saveSuccess(model);
          view.unbind('solicitud:saved');
        })
      },
      
      edit: function(solicitud){
        
        DocManager.request('solicitud:load',solicitud).done(function(solicitud){
          var view = new Edit.SolicitudEditorView({model:solicitud});
          
          var layout = Common.Controller.showMain(view);
          DocManager.mainRegion.show(layout);
          $('body').scrollTop(0);
          
          view.on('solicitud:saved',function(model){
            DocManager.trigger('solicitud:list');
            view.unbind('solicitud:saved');
            view.unbind('solicitud:editCanceled');
          });
          
          view.on('licnecia:editCanceled',function(model){
            DocManager.confirm('¿Está seguro que desea cancelar la edición?').done(function(){
              DocManager.trigger('solicitud:list');
              view.unbind('solicitud:saved');
              view.unbind('solicitud:editCanceled');  
            })
          })
          
        }).fail(function(){
          Message.error('No se encontro la solicitud');
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
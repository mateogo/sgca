DocManager.module("ObrasApp.Edit", function(Edit, DocManager, Backbone, Marionette, $, _){
  
  var Common = DocManager.module('ObrasApp.Common');
  var Entities = DocManager.module('Entities');
  
  Edit.Controller = {
      wizard: function(){
          
        var obra = new Entities.Obra();
        var view = new Edit.ObrasWizardView({model:obra});
        
        var layout = Common.Controller.showMain(view);
        DocManager.mainRegion.show(layout);
        
        view.on('obra:saved',function(model){
          Edit.Controller.saveSuccess(model);
          view.unbind('obra:saved');
        })
      },
      
      /** @param {obra} stringId de obra o Entities.Obra  **/
      edit: function(obra){
        
        var loader = DocManager.request('obra:load',obra);
        
        loader.done(function(obra){
          var view = new Edit.ObrasEditorView({model:obra});
          
          var layout = Common.Controller.showMain(view);
          DocManager.mainRegion.show(layout);
          
        }).fail(function(e){
          
        })
      },
      
      saveSuccess: function(obra){
        var view = new Edit.ObraGraciasView({model:obra});
        
        var layout = Common.Controller.showMain(view);
        DocManager.mainRegion.show(layout);
        $('body').scrollTop(0);
      }
  }
  
});
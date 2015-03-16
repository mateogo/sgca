DocManager.module("EventsApp.Edit", function(Edit, DocManager, Backbone, Marionette, $, _){
  
  var ArtActivitiesEdit = DocManager.module('ArtActivitiesApp.Edit');
  var Entities = DocManager.module('Entities');
  
  Edit.Controller = {
      edit: function(event){
        
          if(!Edit.Session) Edit.Session = {};
          Edit.Session.layout = new Edit.Layout();
          
          loadModel(event).done(function(event){
            
            //var headerInfo = new ArtActivitiesEdit.HeaderInfo({model:artActivity,tab:'event'});
            var editor = new Edit.Editor({model:event});
            
            Edit.Session.layout.on("show", function(){
              //Edit.Session.layout.headerInfoRegion.show(headerInfo);
              Edit.Session.layout.mainRegion.show(editor);
            });
            
            DocManager.mainRegion.show(Edit.Session.layout);
          });
          
          $('body').scrollTop(0);
      }
  };
  
  
  function loadModel(param){
      var def = $.Deferred();
      
      if(param instanceof Entities.Event){
          def.resolve(param);
      }else{
          Entities.Event.findById(param).then(function(model){
            
            model.loadArtActivity().done(function(artActivity){
              def.resolve(model);  
            }).fail(function(e){
              Message.error('No se puede editar');
              console.error('Actividad del evento no encontrada');
            });
            
          },function(e){
            //createNotFound();
            def.reject();
          });
      }
      
      return def.promise();
  }
  
  
});
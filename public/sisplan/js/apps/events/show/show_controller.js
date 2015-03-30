DocManager.module("EventsApp.Show", function(Show, DocManager, Backbone, Marionette, $, _){
  
  var Entities = DocManager.module('Entities');
  
   Show.Controller = {
       resume: function(event){
         
         loadModel(event).done(function(event){
           var view = new Show.ResumeView({model:event});
           
           DocManager.mainRegion.show(view);  
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
DocManager.module('EventsApp', function(EventsApp, DocManager, Backbone, Marionette, $, _){

  var Entities = DocManager.module('Entities');
  
  EventsApp.Router = Marionette.AppRouter.extend({
    appRoutes: {
      "eventos/:idArtActivity(/filter/criterion::criterion)": "list",
      "eventos/:id/edit": "edit"

    }
  });

  var API = {
    list: function(idArtActivity,criterion){
      Entities.ArtActivity.findById(idArtActivity).done(function(artActivity){
        EventsApp.List.Controller.list(artActivity,criterion);
        DocManager.execute("set:active:header", "artactividades");  
      });
    },
    createAndEdit: function(artActivity){
      var rawActivity = (artActivity.toJSON)? artActivity.toJSON() : artActivity;
      var event = new Entities.Event({artactivity:rawActivity});
      EventsApp.Edit.Controller.edit(event);
      DocManager.execute("set:active:header", "artactividades");
    },
    edit: function(model){
      EventsApp.Edit.Controller.edit(model);
      DocManager.execute("set:active:header", "artactividades");
    },
    remove: function(event){
      DocManager.confirm('¿Estás seguro de borrar el evento?').then(function(){
        event.destroy({wait:true}).done(function(){
              Message.success('Borrado');
            }).fail(function(e){
              Message.error('No se pudo borrar');
              console.error(e);
            });
      });
    }
  };

  
  
  DocManager.on('events:list', function(artactivity){
    API.list(artactivity.id);
    DocManager.navigate('eventos/'+artactivity.id);
  });
  
  DocManager.on('event:new',function(artActivity){
    if(!artActivity) return console.err('artActivity is not defined');
    API.createAndEdit(artActivity);
    DocManager.navigate('eventos/new');
  });
  
  DocManager.on('event:edit',function(model){
    API.edit(model);
    DocManager.navigate('eventos/'+model.id+'/edit');
  });
  
  DocManager.on('event:remove',function(model){
    API.remove(model);
  });

  DocManager.addInitializer(function(){
    new EventsApp.Router({
      controller: API
    });
  });
  
});
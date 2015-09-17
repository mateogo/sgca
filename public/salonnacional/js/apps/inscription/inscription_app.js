DocManager.module("SalonRequestApp", function(SalonRequestApp, DocManager, Backbone, Marionette, $, _){

  SalonRequestApp.Router = Marionette.AppRouter.extend({
    appRoutes: {
      "inscripcion/:id/edit": "editInscripcion",
      "inscripcion/nueva": "addInscripcion",
    }
  });

  var API = {
    editInscripcion: function(id){
      console.log('API: edit inscripción [%s]', id);
      SalonRequestApp.Edit.Controller.editInscripcion(id);
    },
    addInscripcion: function(){
      console.log('API: nueva inscripción ');
      SalonRequestApp.Edit.Controller.addInscripcion();
    },

  };

  DocManager.on("salonrequest:edit", function(model){
    var entityid = model.id;
    DocManager.navigate("inscripcion/" + entityid + "/edit");
    API.editInscripcion(entityid);
  });
  DocManager.on("salonrequest:add", function(){
    DocManager.navigate("inscripcion/nueva");
    API.addInscripcion();
  });

  DocManager.addInitializer(function(){
    new SalonRequestApp.Router({
      controller: API
    });
  });
});

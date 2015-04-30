DocManager.module("MicaRequestApp", function(MicaRequestApp, DocManager, Backbone, Marionette, $, _){

  MicaRequestApp.Router = Marionette.AppRouter.extend({
    appRoutes: {
      "inscripcion/:id/edit": "editInscripcion",
      "inscripcion/nueva": "addInscripcion",
    }
  });

  var API = {
    editInscripcion: function(id){
      console.log('API: edit inscripción [%s]', id);
      MicaRequestApp.Edit.Controller.editInscripcion(id);
    },
    addInscripcion: function(){
      console.log('API: nueva inscripción ');
      MicaRequestApp.Edit.Controller.addInscripcion();
    },

  };

  DocManager.on("micarequest:edit", function(model){
    var entityid = model.id;
    DocManager.navigate("inscripcion/" + entityid + "/edit");
    API.editInscripcion(entityid);
  });
  DocManager.on("micarequest:add", function(){
    DocManager.navigate("inscripcion/nueva");
    API.addInscripcion();
  });

  DocManager.addInitializer(function(){
    new MicaRequestApp.Router({
      controller: API
    });
  });
});

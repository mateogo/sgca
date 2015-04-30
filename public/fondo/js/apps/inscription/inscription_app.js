DocManager.module("FondoRequestApp", function(FondoRequestApp, DocManager, Backbone, Marionette, $, _){

  FondoRequestApp.Router = Marionette.AppRouter.extend({
    appRoutes: {
      "inscripcion/:id/edit": "editInscripcion",
      "inscripcion/nueva": "addInscripcion",
    }
  });

  var API = {
    editInscripcion: function(id){
      console.log('API: edit inscripción [%s]', id);
      FondoRequestApp.Edit.Controller.editInscripcion(id);
    },
    addInscripcion: function(){
      console.log('API: nueva inscripción ');
      FondoRequestApp.Edit.Controller.addInscripcion();
    },

  };

  DocManager.on("fondorequest:edit", function(model){
    var entityid = model.id;
    DocManager.navigate("inscripcion/" + entityid + "/edit");
    API.editInscripcion(entityid);
  });
  DocManager.on("fondorequest:add", function(){
    DocManager.navigate("inscripcion/nueva");
    API.addInscripcion();
  });

  DocManager.addInitializer(function(){
    new FondoRequestApp.Router({
      controller: API
    });
  });
});

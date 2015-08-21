DocManager.module("MicaRequestApp", function(MicaRequestApp, DocManager, Backbone, Marionette, $, _){

  MicaRequestApp.Router = Marionette.AppRouter.extend({
    appRoutes: {
      "inscripcion/:id/edit": "editInscripcion",
      "inscripcion/nueva": "addInscripcion",
      "inscripcion/tardia": "addInscripcionTardia",
      "showcase/nueva": "addShowcase",
      "showcase/:id/edit": "editShowcase",
    }
  });

  var API = {
    editInscripcion: function(id){
      console.log('API: edit inscripción [%s]', id);
      MicaRequestApp.Edit.Controller.editInscripcion(id);
    },
    editShowcase: function(id){
      console.log('API: edit showcase [%s]', id);
      MicaRequestApp.Showcase.Controller.editInscripcion(id);
    },
    addInscripcion: function(){
      console.log('API: nueva inscripción ');
      MicaRequestApp.Edit.Controller.addInscripcion();
    },
    addInscripcionTardia: function(){
      console.log('API: nueva inscripción tardía');
      MicaRequestApp.Edit.Controller.addInscripcionTardia();
    },
    addShowcase: function(){
      console.log('API: nueva alta showcase ');
      MicaRequestApp.Showcase.Controller.addInscripcion();
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

  DocManager.on("showcase:edit", function(model){
    var entityid = model.id;
    DocManager.navigate("showcase/" + entityid + "/edit");
    API.editShowcase(entityid);
  });
  DocManager.on("showcase:add", function(){
    DocManager.navigate("showcase/nueva");
    API.addShowcase();
  });

  DocManager.addInitializer(function(){
    new MicaRequestApp.Router({
      controller: API
    });
  });
});

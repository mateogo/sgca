DocManager.module("InscripcionApp", function(InscripcionApp, DocManager, Backbone, Marionette, $, _){

  InscripcionApp.Router = Marionette.AppRouter.extend({
    appRoutes: {
      "inscripciones/": "showRegister",
    }
  });

  var API = {

	showRegister: function(){
      console.log('API: showRegister');
	  InscripcionApp.Show.Controller.showRegister();
    },

  };

  DocManager.on("register:show", function(){
    DocManager.navigate("inscripciones/");
    API.showRegister(); //
  });

  DocManager.addInitializer(function(){
    new InscripcionApp.Router({
      controller: API
    });
  });
});
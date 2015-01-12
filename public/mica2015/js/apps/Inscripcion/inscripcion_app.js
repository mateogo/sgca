DocManager.module("InscripcionApp", function(InscripcionApp, DocManager, Backbone, Marionette, $, _){

  InscripcionApp.Router = Marionette.AppRouter.extend({
    appRoutes: {
      "inscripciones/": "showRegister",      
	  "inscripciones/:id/edit": "editRegister",
	  "inscripciones/edit": "editRegister",
     // "inscripciones/:id": "showRegister",
    }
  });

  var API = {

  	showRegister: function(){
      console.log('API: showRegister');
  	  InscripcionApp.Show.Controller.showRegister();
    },
  	  
  	editRegister: function(id){
        console.log('API: edit register', id)
        InscripcionApp.Edit.Controller.editRegister(id);
    },
  };

  DocManager.on("register:show", function(){
    DocManager.navigate("inscripciones/");
    API.showRegister(); //
  });
	
  DocManager.on("register:edit", function(model){
    var registerid = model.id || model.get('registerid');
    DocManager.navigate("inscripciones/" + registerid + "/edit");
    API.editRegister(registerid);
  });

  DocManager.addInitializer(function(){
    new InscripcionApp.Router({
      controller: API
    });
  });
});
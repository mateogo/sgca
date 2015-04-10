DocManager.module("ObrasApp", function(ObrasApp, DocManager, Backbone, Marionette, $, _){
  
  ObrasApp.Router = Marionette.AppRouter.extend({
		appRoutes: {
			"obras/alta": "newObra",
			"obras": "list",
    }
	});

  
  var API = {
    newObra: function(){
			ObrasApp.Edit.Controller.edit();
    },
    list: function(){
      ObrasApp.List.Controller.list();
    }
		
	};

  
  DocManager.on("obras:new", function(){
    DocManager.navigate("obras/alta");
    API.newObra(); 
  });
  
  DocManager.on("obras:list", function(){
    DocManager.navigate("obras");
    API.list(); 
  });

  DocManager.addInitializer(function(){
		new ObrasApp.Router({
			controller: API
    });
  });
});
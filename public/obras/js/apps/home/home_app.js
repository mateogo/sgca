DocManager.module("HomeApp", function(HomeApp, DocManager, Backbone, Marionette, $, _){
  
  HomeApp.Router = Marionette.AppRouter.extend({
		appRoutes: {
			"inicio": "showHome",
    }
	});

  
  var API = {
    showHome: function(){
      HomeApp.Show.Controller.home();
    }
		
	};

  
  DocManager.on("obras:home", function(){
    DocManager.navigate("inicio");
    API.showHome(); 
  });

  DocManager.addInitializer(function(){
		new HomeApp.Router({
			controller: API
    });
  });
});
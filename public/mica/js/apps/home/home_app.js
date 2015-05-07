DocManager.module("HomeApp", function(HomeApp, DocManager, Backbone, Marionette, $, _){
	HomeApp.Router = Marionette.AppRouter.extend({
		appRoutes: {
			"bienvenido": "showHome",
    }
	});

  var API = {
	showHome: function(){
			console.log('API: showHome');
	  	HomeApp.Show.Controller.showHome();
    },
	};

  DocManager.on("home:show", function(){
  	console.log('home:show BEGINS')
    DocManager.navigate("bienvenido");
    API.showHome(); 
  });

  DocManager.addInitializer(function(){
		new HomeApp.Router({
			controller: API
    });
  });
});
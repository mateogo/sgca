DocManager.module("ObrasApp", function(ObrasApp, DocManager, Backbone, Marionette, $, _){
  
  ObrasApp.Router = Marionette.AppRouter.extend({
		appRoutes: {
		  'obras/alta': 'newObra',
			'obras': 'list',
			'obras/edicion/:id': 'edit'
    }
	});

  
  var API = {
    newObra: function(){
			ObrasApp.Edit.Controller.wizard();
    },
    list: function(){
      ObrasApp.List.Controller.list();
    },
    edit: function(obra){
      ObrasApp.Edit.Controller.edit(obra);
    }
	};

  DocManager.on("obras:list", function(){
    DocManager.navigate("obras");
    API.list(); 
  });
  
  DocManager.on("obras:new", function(){
    DocManager.navigate("obras/alta");
    API.newObra(); 
  });
  
  DocManager.on("obras:edit", function(obra){
    DocManager.navigate('obras/edicion/'+obra.id);
    API.edit(obra); 
  });
  
  
  DocManager.reqres.setHandler("obra:selector", function(callback){
    ObrasApp.List.Controller.selector(callback);
  });
  
  

  DocManager.addInitializer(function(){
		new ObrasApp.Router({
			controller: API
    });
  });
});
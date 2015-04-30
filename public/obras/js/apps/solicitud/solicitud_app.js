DocManager.module("SolicitudApp", function(SolicitudApp, DocManager, Backbone, Marionette, $, _){
  
  SolicitudApp.Router = Marionette.AppRouter.extend({
		appRoutes: {
			'licencia/alta': 'newItem',
			'licencia': 'list',
			'licencia/:id/edit': 'edit'
    }
	});

  
  var API = {
    newItem: function(){
      SolicitudApp.Edit.Controller.wizard();
    },
    edit: function(param){
      SolicitudApp.Edit.Controller.edit(param);
    },
    list: function(){
      SolicitudApp.List.Controller.list();
    }
		
	};

  
  DocManager.on("licencia:new", function(){
    DocManager.navigate("licencia/alta");
    API.newItem(); 
  });
  
  DocManager.on("licencia:edit", function(licencia){
    DocManager.navigate('licencia/'+licencia.id+'/edit');
    API.edit(licencia); 
  });
  
  DocManager.on("licencia:list", function(){
    DocManager.navigate("licencia");
    API.list(); 
  });

  DocManager.addInitializer(function(){
		new SolicitudApp.Router({
			controller: API
    });
  });
});
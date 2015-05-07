DocManager.module("SolicitudApp", function(SolicitudApp, DocManager, Backbone, Marionette, $, _){
  
  SolicitudApp.Router = Marionette.AppRouter.extend({
		appRoutes: {
			'solicitud/alta': 'newItem',
			'solicitud': 'list',
			'solicitud/:id/edit': 'edit'
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

  
  DocManager.on("solicitud:new", function(){
    DocManager.navigate("solicitud/alta");
    API.newItem(); 
  });
  
  DocManager.on("solicitud:edit", function(solicitud){
    DocManager.navigate('solicitud/'+solicitud.id+'/edit');
    API.edit(solicitud); 
  });
  
  DocManager.on("solicitud:list", function(){
    DocManager.navigate("solicitud");
    API.list(); 
  });

  DocManager.addInitializer(function(){
		new SolicitudApp.Router({
			controller: API
    });
  });
});
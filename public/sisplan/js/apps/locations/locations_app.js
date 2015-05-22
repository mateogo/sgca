DocManager.module('LocationsApp',function(LocationsApp,DocManager,Backbonone,Marionette,$, _){

	LocationsApp.Router = Marionette.AppRouter.extend({
		appRoutes: {
			'locaciones/:id': 'list'
		}
	});
	
	LocationsApp.Model = {selectedAction: null}; 

	var API = {
		list: function(id){
			console.log('API: listLocations');
			LocationsApp.List.Controller.list(id);
		},

		newLocation: function(){
			API.edit(new DocManager.Entities.Location());
		},
		
		edit: function(location){
		    LocationsApp.Edit.Controller.edit(location);
		},
		
		remove: function(action,location){
		  DocManager.confirm('¿Estás seguro de borrar la locación?').then(function(){
       	  
		      action.removeLocation(location).done(function(){
        	    Message.success('Borrado');
        	  }).fail(function(e){
      		    alert(e);
      		  });
		  });
		}
  };

	DocManager.on('location:list',function(action){
		console.log('mostrar lista locaciones',action);
		DocManager.navigate('locaciones/'+action.id);
		API.list(action.id);
  });
	
  DocManager.on('location:edit',function(location){
    API.edit(location);
  });
	
  DocManager.on('location:new',function(action){
      API.newLocation(action);
  });
	
	DocManager.on('location:remove',function(action,location){
    API.remove(action,location);
  });

	DocManager.addInitializer(function(){
		new LocationsApp.Router({ controller: API });
	});
});
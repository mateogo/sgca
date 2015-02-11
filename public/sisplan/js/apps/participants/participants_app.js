DocManager.module('ParticipantsApp',function(ParticipantsApp,DocManager,Backbonone,Marionette,$, _){

	ParticipantsApp.Router = Marionette.AppRouter.extend({
		appRoutes: {
			'participantes/:id': 'list',
		}
	})
	
	ParticipantsApp.Model = {selectedAction: null} 

	var API = {
		list: function(id){
			console.log('API: listParticipants');
			ParticipantsApp.List.Controller.list(id);
		},
		newParticipant: function(action){
		  if(action){
		    API.edit(action, action.addParticipant());
		  }
		},
		edit: function(action,participant){
		  ParticipantsApp.Edit.Controller.edit(action,participant);
		},
		remove: function(action,participant){
		  action.removeParticipant(participant).done(function(){
		    alert('borrado');
		  }).fail(function(e){
		    alert(e);
		  })
		}
	}

	DocManager.on('participant:list',function(action){
		console.log('mostrar lista participantes',action);
		DocManager.navigate('participantes/'+action.id);
		API.list(action.id);
	})
	
	DocManager.on('participant:edit',function(action,participant){
	  API.edit(action,participant);
	})
	
	DocManager.on('participant:new',function(action){
	  API.newParticipant(action);
	});
	
	DocManager.on('participant:remove',function(action,participant){
    API.remove(action,participant);
  })

	DocManager.addInitializer(function(){
		new ParticipantsApp.Router({
			controller: API
		})
	})
});
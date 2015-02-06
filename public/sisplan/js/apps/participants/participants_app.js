DocManager.module('ParticipantsApp',function(ParticipantsApp,DocManager,Backbonone,Marionette,$, _){

	ParticipantsApp.Router = Marionette.AppRouter.extend({
		appRoutes: {
			'participantes/:id': 'list',
		}
	})

	var API = {
		list: function(id){
			console.log('API: listParticipants');
			ParticipantsApp.List.Controller.list(id);
		}
	}

	DocManager.on('participant:list',function(action){
		console.log('mostrar lista participantes',action);
		DocManager.navigate('participantes/'+action.id);
		API.list(action.id);
	})

	DocManager.addInitializer(function(){
		new ParticipantsApp.Router({
			controller: API
		})
	})
});
DocManager.module('ParticipantsApp.List',function(List, DocManager, Backbone, Marionette, $, _){


	List.Controller = {
		list: function(idAction){
			console.log('listar participantes de ',idAction);


			var fetchingAction = DocManager.request("action:entity", idAction);

			fetchingAction.done(function(action){
				if(!action){
					DocManager.mainRegion.show(new List.ActionNotFound());
					return;
				}

				console.log('done de fetchingAction',action);
				if(!List.Session) List.Session = {};
				List.Session.layout = new List.Layout();
		      
		    	      
		    List.Session.layout.on("show", function(){
			    var ActionsShow = DocManager.module('ActionsApp.Show');
			     
			    var headerAction =  new DocManager.ActionsApp.Report.Branding({model:action});// ActionsShow.Branding({model:action});
			    List.Session.layout.navbarRegion.show(headerAction);
		    });
		    DocManager.mainRegion.show(List.Session.layout);

			});
		}
	}
	
	
});
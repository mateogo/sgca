DocManager.module('ParticipantsApp.List',function(List, DocManager, Backbone, Marionette, $, _){


  var participantsApp = DocManager.module('ParticipantsApp');
  
	List.Controller = {
		list: function(idAction){
			console.log('listar participantes de ',idAction);


			var fetchingAction = DocManager.request("action:entity", idAction);

			fetchingAction.done(function(action){
				if(!action){
					DocManager.mainRegion.show(new List.ActionNotFound());
					return;
				}
				
				participantsApp.Model.selectedAction = action;
				
				
				if(!List.Session) List.Session = {};
				List.Session.layout = new List.Layout();
								
				var participants = action.participants;
				
				var table = new List.Participants({
				  collection: participants
				})
		    	      
		    List.Session.layout.on("show", function(){
			    var ActionsShow = DocManager.module('ActionsApp.Show');
			     
			    var headerAction =  new DocManager.ActionsApp.Report.Branding({model:action});// ActionsShow.Branding({model:action});
			    List.Session.layout.navbarRegion.show(headerAction);
			    List.Session.layout.tableRegion.show(table);
		    });
		    DocManager.mainRegion.show(List.Session.layout);
		    listeners(List.Session.layout);

			});
		}
	};
	
	
	var listeners = function(view){
	  view.on('participant:new',function(){
	    DocManager.trigger('participant:new',participantsApp.Model.selectedAction);
	  })
	  
	  view.on('tableRegion:childView:participant:edit',function(participant){
	    DocManager.trigger('participant:edit',participantsApp.Model.selectedAction,participant);
	  });
	}
	
	
});
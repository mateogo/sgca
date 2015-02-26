DocManager.module('LocationsApp.List',function(List, DocManager, Backbone, Marionette, $, _){

  var locationsApp = DocManager.module('LocationsApp');
  
	List.Controller = {
		list: function(idAction){
			var fetchingAction = DocManager.request("action:entity", idAction);

			fetchingAction.done(function(action){
				if(!action){
					DocManager.mainRegion.show(new List.ActionNotFound());
					return;
				}
				
				locationsApp.Model.selectedAction = action;
				
				if(!List.Session) List.Session = {};
				List.Session.layout = new List.Layout();
								
				var locations = action.locations;
				
				var table = List.GridCreator(locations);
				var filter = List.FilterCreator(locations);
		    	      
		    List.Session.layout.on("show", function(){
			    var ActionsShow = DocManager.module('ActionsApp.Show');
			     
			    var headerAction =  new DocManager.ActionsApp.Report.Branding({model:action});// ActionsShow.Branding({model:action});
			    List.Session.layout.navbarRegion.show(headerAction);
			    List.Session.layout.tableRegion.show(table);
			    List.Session.layout.filterRegion.show(filter);
		    });
		    DocManager.mainRegion.show(List.Session.layout);
		    listeners(List.Session.layout);
			});
		}
	};
	
	var listeners = function(view){
    view.on('location:new',function(){
      DocManager.trigger('location:new',locationsApp.Model.selectedAction);
    });
  };
	
});
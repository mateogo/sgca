DocManager.module('LocationsApp.List',function(List, DocManager, Backbone, Marionette, $, _){

  var locationsApp = DocManager.module('LocationsApp');
  
	List.Controller = {
		list: function(){
			var AllLocations = new DocManager.Entities.LocationCollection();
			AllLocations.fetch({success: function(){
				if(!List.Session) List.Session = {};
				List.Session.layout = new List.Layout();
				
				var table = List.GridCreator(AllLocations);
				var filter = List.FilterCreator(AllLocations);
		    	      
				List.Session.layout.on("show", function(){
					List.Session.layout.tableRegion.show(table);
					List.Session.layout.filterRegion.show(filter);
				});
				DocManager.mainRegion.show(List.Session.layout);
				listeners(List.Session.layout);
			}});
		}
	};
	
	var listeners = function(view){
    view.on('location:new',function(){
      DocManager.trigger('location:new');
    });
  };
	
});
DocManager.module("HomeApp.Show", function(Show, DocManager, Backbone, Marionette, $, _){
	
	Show.Controller = {
		
		showHome: function(){
			
      var homeLayout = new Show.HomeLayoutView();
			var home = DocManager.request("home:entity");
			
			var feature = DocManager.request("features:entity");
			var itemFeature = new DocManager.Entities.FeatureCollection(feature.get('items'));
			
			var homeView = new Show.HomeIntroView({
				model: home
			});	
						
			var featureHeading = new Show.HomeFeatureView({
				model: feature
			});
			
			var featureItems = new Show.HomeFeatureItems({
				collection: itemFeature
			});
					
			homeLayout.on("show", function(){
				homeLayout.mainRegion.show(homeView);
				homeLayout.featureRegion.show(featureHeading);
				homeLayout.itemsRegion.show(featureItems);
			});		
			DocManager.mainRegion.show(homeLayout);
		}
	}
});

DocManager.module("HomeApp.Show", function(Show, DocManager, Backbone, Marionette, $, _){
	
	Show.Controller = {
		
		showHome: function(){
			console.log('showHome');
			
      var homeLayout = new Show.HomeLayoutView();
			
			var home = DocManager.request("home:entity");
			var homeView = new Show.HomeIntroView({
				model: home
			});
			
			var features = DocManager.request("features:entity");
			var featureView = new Show.HomeFeatureView({
				model: features
			});
			
			var gallery = DocManager.request("gallery:entity");
			var galleryView = new Show.HomeGalleryView({
				model: gallery
			});
			
			homeLayout.on("show", function(){
				
				homeLayout.mainRegion.show(homeView);
				homeLayout.featureRegion.show(featureView);
				homeLayout.galleryRegion.show(galleryView);
			});		
			DocManager.mainRegion.show(homeLayout);
		}
	}
});

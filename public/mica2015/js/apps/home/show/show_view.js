DocManager.module("HomeApp.Show", function(Show, DocManager, Backbone, Marionette, $, _){
	
	Show.HomeLayoutView = Marionette.LayoutView.extend({
		
		getTemplate: function(){ 
			return utils.templates.HomeShowLayoutView;
		},
		
		regions: {
			mainRegion: '#main-region',
		  featureRegion: '#feature-block-region',
		  galleryRegion: '#gallery-grid-region',
		}
	});
	
	Show.HomeIntroView = Marionette.ItemView.extend({
		getTemplate: function(){
			return utils.templates.HomeIntroView;
		},
	});
	
	Show.HomeFeatureView = Marionette.ItemView.extend({
		getTemplate: function(){
			return utils.templates.HomeFeatureBlockView;
		},
	});
	
	Show.HomeGalleryView = Marionette.ItemView.extend({
		getTemplate: function(){
			return utils.templates.HomeGalleryGridView;
		},
	});
});

DocManager.module("HomeApp.Show", function(Show, DocManager, Backbone, Marionette, $, _){
	
	Show.HomeLayoutView = Marionette.LayoutView.extend({
		getTemplate: function(){ 
			return utils.templates.HomeShowLayoutView;
		},
		regions: {
			mainRegion: '#main-region',
		  featureRegion: '#feature-block-region',
		  itemsRegion: '#feature-items-region',
		  galleryRegion: '#gallery-grid-region',
		}
	});
	
	Show.HomeIntroView = Marionette.ItemView.extend({
		getTemplate: function(){
			return utils.templates.HomeShowIntroView;
		},
	}); 	
	
	Show.FeaturesItemsLayout = Marionette.LayoutView.extend({

		getTemplate: function(){
			return utils.templates.HomeShowFeatureItemDetail;
    },
  }); 	
	
	Show.HomeFeatureView = Marionette.CompositeView.extend({
		getTemplate: function(){
			return utils.templates.HomeShowFeatureItemComposite;
		},
		childView: Show.HomeFeatureItemDetail,
  });
	
	Show.HomeFeatureItems = Marionette.CollectionView.extend({
		childView: Show.FeaturesItemsLayout,	
	});
	
	Show.HomeFeatureItemDetail = Marionette.ItemView.extend({
    getTemplate: function(){
			return utils.templates.HomeShowFeatureItemDetail;
    },
  });
	Show.GalleryItemsLayout = Marionette.LayoutView.extend({
//va a buscar la clase del item porque el ultimo debe ser tipo 'gallery-grid last'
		className: function(){
			return this.model.get('imgclass')
		},

		getTemplate: function(){
			return utils.templates.HomeShowGalleryItemsView;
    },
  });
	
	Show.HomeGalleryCollection = Marionette.CollectionView.extend({
		className: 'gallery-wrapper',
		childView: Show.GalleryItemsLayout, 		
		
		onRender: function() {
			// initialize Masonry
			var $container = $('.gallery-wrapper').masonry();
			console.log($container);
			// layout Masonry again after all images have loaded
			$container.imagesLoaded( function() {
				$container.masonry();
			});
		},
		
	});
	
});

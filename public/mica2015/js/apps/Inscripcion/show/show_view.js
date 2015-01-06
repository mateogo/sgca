DocManager.module("InscripcionApp.Show", function(Show, DocManager, Backbone, Marionette, $, _){
	Show.MissingDocument = Marionette.ItemView.extend({
		template: _.template('<div class="alert alert-error">This contact does not exist</div>'),
	});
	
	Show.Layout = Marionette.LayoutView.extend({
		className: 'row row-offcanvas row-offcanvas-left',

		getTemplate: function(){
		  return utils.templates.DocumShowLayoutView;
		},

		regions: {
		  navbarRegion:      '#navbar-region',
		  headerRegion:     '#heading-region',
		  mainRegion:        '#main-region',
		  negocioRegion:    '#negocio-region',
		  photosRegion:     '#photos-region',
		  footerRegion:      '#footer-region',
		}
  	});
	
	Show.Register = Marionette.ItemView.extend({
	   getTemplate: function(){
		  return utils.templates.InscripcionShow;
		},

		events: {
		  "click a.js-edit": "editClicked"
		},

		editClicked: function(e){
		  e.preventDefault();
		  this.trigger("budget:edit", this.model);
		}
  	});
	
	Show.Negocio = Marionette.ItemView.extend({
	   getTemplate: function(){
		  return utils.templates.NegocioShow;
		},
  	});
	
	Show.Photos = Marionette.ItemView.extend({
	   getTemplate: function(){
		  return utils.templates.PhotosShow;
		},
  	});

});

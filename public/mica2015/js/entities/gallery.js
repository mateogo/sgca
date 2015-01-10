DocManager.module("Entities", function(Entities, DocManager, Backbone, Marionette, $, _){
	Entities.Gallery = Backbone.Model.extend({
		urlRoot: "/rondas",
		whoami: 'homeGallery:backboneModel ',
		
		initialize: function () {
			
		},
		
		defaults: {
			items: []
		},
	});
	
	var API = {
		getEntities: function(){
			var accions = new Entities.Gallery();
			return accions;
		},
	}
	
	DocManager.reqres.setHandler("gallery:entity", function(){
    return API.getEntities();
  });
});
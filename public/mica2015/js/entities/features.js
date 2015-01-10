DocManager.module("Entities", function(Entities, DocManager, Backbone, Marionette, $, _){
	Entities.Features = Backbone.Model.extend({
		urlRoot: "/home",
		whoami: 'homeFeatures:backboneModel ',
		
		initialize: function () {
			
		},
		
		defaults: {
			titulo: "Rondas de negocio",
			description: "Productores y artistas tendrán la posibilidad, durante cuatro días, de encontrarse con las principales empresas de Industrias Culturales de todo el mundo y abrir nuevas oportunidades de negocios",
			items: [] //falta laburar botones
		},
	});
	
	var API = {
		getEntities: function(){
			var accions = new Entities.Features();
			return accions;
		},
	}
	
	DocManager.reqres.setHandler("features:entity", function(){
    return API.getEntities();
  });
});
DocManager.module("Entities", function(Entities, DocManager, Backbone, Marionette, $, _){
	Entities.Home = Backbone.Model.extend({
		urlRoot: "/rondas",
		whoami: 'homeRondas:backboneModel ',
		
		initialize: function () {
			
		},
		
		defaults: {
			volanta: "rondas de negocio",
			titulo: "MICA 2015",
			slug: "MERCADO DE INDUSTRIAS CULTURALES ARGENTINAS",
			items: [] //falta laburar botones
		},		
	});
	
	var API = {
		getEntities: function(){
			var accions = new Entities.Home();
			return accions;
		},
	}
	
	DocManager.reqres.setHandler("home:entity", function(){
    return API.getEntities();
  });
});
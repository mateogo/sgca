DocManager.module("Entities", function(Entities, DocManager, Backbone, Marionette, $, _){
	Entities.Home = Backbone.Model.extend({
		urlRoot: "/rondas",
		whoami: 'homeRondas:backboneModel ',
		
		initialize: function () {
			
		},
		
		defaults: {
			volanta: "SALON NACIONAL DE LAS ARTES VISUALES",
			titulo: "SALON NACIONAL 2016",
			slug: "PINTURA, ESCULTURA, CERÁMICA, FOTOGRAFÍA",
			items: [{
				buttontext:'FORMULARIO INSCRIPCION',
				buttonroute:'salonrequest:add',
			}]
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
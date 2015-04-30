DocManager.module("Entities", function(Entities, DocManager, Backbone, Marionette, $, _){
	Entities.Home = Backbone.Model.extend({
		urlRoot: "/rondas",
		whoami: 'homeRondas:backboneModel ',
		
		initialize: function () {
			
		},
		
		defaults: {
			volanta: "FONDO ARGENTINO DE DESARROLLO CULTURAL",
			titulo: "FONDOS 2015",
			slug: "MOVILIDAD, SUSTENTABILIDAD, INFRAESTRUCTURA e INNOVACIÓN",
			items: [{
				buttontext:'FORMULARIO MOVILIDAD',
				buttonroute:'fondorequest:add',
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
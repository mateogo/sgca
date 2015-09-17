DocManager.module("Entities", function(Entities, DocManager, Backbone, Marionette, $, _){
	Entities.Features = Backbone.Model.extend({
		urlRoot: "/rondas",
		whoami: 'homeFeatures:backboneModel ',
		
		initialize: function () {

		},
		
		defaults: {
			titulo: "Salon Nacional de las Artes Visuales",
			description: "Concurso para todas las artes visuales, con alcance nacional",
			items: [{
				icon: "class='icons mica-teatro'",
				size: "class='fa fa-4x'",
				tag: "class='fa fa-tags fa-inverse'",
				head: "Movilidad",
				text: "Subsidios para movilidad, de forma de loren ipsum something usefull here, plis"},

							{
				icon: "class='icons mica-audiovisual'",
				size: "class='fa fa-4x'",
				tag: "class='fa fa-film fa-inverse'",
				head: "Sustentabilidad",
				text: "Subsidios para sustentabilidad, de forma de loren ipsum something usefull here, plis"},
							{

				icon: "class='icons mica-diseno'",
				size: "class='fa fa-4x'",
				tag: "class='fa fa-tags fa-inverse'",
				head: "Infraestructura",
				text: "Subsidios para infraestructura, de forma de loren ipsum something usefull here, plis"},
							{

				icon: "class='icons mica-editorial'",
				size: "class='fa fa-4x'",
				tag: "class='fa fa-book fa-inverse'",
				head: "Innovación",
				text: "Subsidios para innovación, de forma de loren ipsum something usefull here, plis"},


		]},
	});
	
	Entities.FeatureCollection = Backbone.Collection.extend({
    whoami: 'Entities.FeaturesCollection:features.js ',
		
		model: Entities.Features
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
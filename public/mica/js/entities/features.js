DocManager.module("Entities", function(Entities, DocManager, Backbone, Marionette, $, _){
	Entities.Features = Backbone.Model.extend({
		urlRoot: "/rondas",
		whoami: 'homeFeatures:backboneModel ',
		
		initialize: function () {

		},
		
		defaults: {
			titulo: "Mercado de Industrias Culturales Argentinas",
			description: "Bienvenido a la plataforma MICA donde podrás estar en contacto con productores culturales de todo el país.",
			items: [{
				icon: "class='icons'",
				size: "class='fa'",
				tag: "class='fa fa-briefcase'",
				head: "RONDAS DE NEGOCIOS",
				button: "Ingresar",
				buttonurl: "#inscripcion/nueva",
				text: "<ul><li>Edite su perfil como participante en las Rondas de Negocio</li><li>Agregue o edite los proyectos que presentará en las Rondas de Negocio</li></ul>"},
							{
				icon: "class='icons'",
				size: "class='fa'",
				tag: "class='fa fa fa-eye'",
				head: "SHOWCASE",
				button: "Ingresar",
				buttonurl: "#showcase/nueva",
				text: "<ul><li>Si está inscripto a las Rondas de Negocios e indicó que su actividad principal es Música o Artes escénicas, podrá inscribirse a los Showcases</li></ul>"},
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
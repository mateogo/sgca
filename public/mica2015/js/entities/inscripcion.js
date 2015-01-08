DocManager.module("Entities", function(Entities, DocManager, Backbone, Marionette, $, _){

    Entities.Inscripcion = Backbone.Model.extend({
        urlRoot: "/inscripciones",
        whoami: 'inscripciones:backboneModel ',
        idAttribute: "_id",

       initialize: function () {
        },
		
	   createNewDocument: function(cb){
		   var self = this;
		   var docum = new Entities.Inscripcion(self.attributes);

		   console.log('CREATENEW DOCUMENT!!!!!!!!!!!')

		   docum.initBeforeCreate(function(docum){
			 console.log("initBeforeCreate");
			 console.log(docum);
			 docum.save(null, {
			   success: function(model){
				 cb(null,model);
			   }
			 });
		   });

       },

        defaults: {
            _id: null,
			empresa: "",
			razonsoc: "",
			descripcion: "",
			pais: "",
			provincia: 'enproceso',
			localidad: "",
			cuit: "",
			domicilio: "",
			codpostal: "",
			localidad: "",
			email: "",
			web: "",
			localidad: "",
			fundacion: "",
			localidad: "",
			cantemple: "",
			facturacion: "",
        },
		initBeforeCreate: function(cb){
			var self = this;

			dao.gestionUser.getUser(DocManager, function (user){
			self.set({useralta: user.id, userultmod: user.id});
			var person;
			var related = user.get('es_usuario_de');
				
				if(related){
					person = related[0];
					if(person){
						self.set({persona: person.code,personaid: person.id })
					}
				} 
				if(cb) cb(self);
      		});
    }, //
    });
  	
DocManager.reqres.setHandler("inscripcion:entity", function(){
   return null;
});

});
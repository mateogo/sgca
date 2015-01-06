DocManager.module("Entities", function(Entities, DocManager, Backbone, Marionette, $, _){

    Entities.Inscripcion = Backbone.Model.extend({
        urlRoot: "/inscripciones",
        whoami: 'inscripciones:backboneModel ',
        idAttribute: "_id",

       initialize: function () {
        },

        defaults: {
            _id: null,
        }
    });
  	
DocManager.reqres.setHandler("inscripcion:entity", function(){
   return null;
});

});
DocManager.module("Entities", function(Entities, DocManager, Backbone, Marionette, $, _){
  
  //https://github.com/thedersen/backbone.validation
  
  Entities.Autor = Backbone.Model.extend({
    whoami: 'Autor:autor.js',
    urlRoot: "/autor",
    idAttribute: "_id",
    
    defaults:{
      lastname: ''
    },
    
    validation: {
      name: {required: false},
      lastname: {required:false},
      address: {required:false},
      alive: {required:false},
      birthday: {required:false},
      bornplace: {require:false},
      deathdate: {require:false},
      locateddate: {require:false}, //fecha de radicacion
      studyplace: {require:false},
      exhibit: {require:false},
      awards: {require:false},
      bestobras: {require:false}
    }
  });
  
  
  Entities.AutorCollection = Backbone.Collection.extend({
    model: Entities.Obra,
    url: "/autor"
  })
    
});
DocManager.module("Entities", function(Entities, DocManager, Backbone, Marionette, $, _){

  //https://github.com/thedersen/backbone.validation

  Entities.Autor = Backbone.Model.extend({
    whoami: 'Autor:autor.js',
    urlRoot: "/autor",
    idAttribute: "_id",

    defaults:{
      lastname: '',
      background: ''
    },

    validation: {
      name: {required: false},
      lastname: {required:false},
      address: {required:false},
      alive: {required:false},
      birthday: {required:false},
      bornplace: {required:false},
      deathdate: {required:false},
      background: {required:false} // Antecedentes Artisticos
    }
  });


  Entities.AutorCollection = Backbone.Collection.extend({
    model: Entities.Obra,
    url: "/autor",

    addAutor: function(autor){
      //TODO: verficar que el autor ya no este incluido;
      this.push(autor);
    }
  });

});

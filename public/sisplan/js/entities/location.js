DocManager.module("Entities", function(Entities, DocManager, Backbone, Marionette, $, _) {

    var App = DocManager.module('App');

    Entities.Location = Backbone.Model.extend({
        urlRoot: "/sisplan/locaciones",
        whoami: 'Location:location.js',
        idAttribute: "_id",

        initialize: function () {
        },

        defaults: {
            _id: null
        },

        schema: {
            name: {validators: ['required'], type: 'Text',title:'Nombre'},
            nickName: {validators: ['required'], type: 'Text',title:'Alias'},
            displayName : {validators: ['required'], type: 'Text',title:'Nombre visible'},
            direccion: {validators: [], type: 'Text',title:'Dirección'},
            provincia: {validators: [], type: 'Text',title:'Provincia'},
            departamento: {validators: [], type: 'Text',title:'Departamento'},
            localidad: {validators: [], type: 'Text',title:'Localidad'},
            notas: 'TextArea'
        }
    });


});
DocManager.module("Entities", function(Entities, DocManager, Backbone, Marionette, $, _) {

    var App = DocManager.module('App');

    Entities.Area = Backbone.Model.extend({
        urlRoot: "/sisplan/areas",
        whoami: 'Area:area.js',
        idAttribute: "_id",

        initialize: function () {
        },

        defaults: {
            _id: null,
            nombre: ''
        },

        schema: {
            nombre: {validators: ['required'], type: 'Text',title:'Nombre'},
        },

        toString: function(){
            return this.get('nombre');
        }
    });

    Entities.AreaCollection = Backbone.Collection.extend({

        model: Entities.Area,

        initialize: function (model, options) {
        },

        url: "/sisplan/areas"

    });




});
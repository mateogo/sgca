DocManager.module("Entities", function(Entities, DocManager, Backbone, Marionette, $, _){

    Entities.ArtActivity = Backbone.Model.extend({
        urlRoot: "/artactividades",
        whoami: 'artactivity:backboneModel ',
        idAttribute: "_id",


        defaults: {
        }
    });

    Entities.ArtActivityCollection = Backbone.Collection.extend({

        model: Entities.ArtActivity,
        
        initialize: function (model, options) {
        },

        url: "/artactividades"
    });

});
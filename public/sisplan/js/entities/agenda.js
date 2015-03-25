DocManager.module("Entities", function(Entities, DocManager, Backbone, Marionette, $, _){
    
    Entities.Agenda = Backbone.Model.extend({

    });
    
    Entities.AgendaFilter = Backbone.Model.extend({
      schema: {
        desde: {validators: ['required'], type: 'DatePicker',title:'Desde'},
        hasta: {validators: ['required'], type: 'DatePicker',title:'Hasta'},
        area: {validators: [], type: 'Text',title:'Área'}
      }
    });
    
    
    Entities.AgendaCollection = Backbone.Collection.extend({
      model: Entities.Agenda,
      url: '/agenda'
    });
});
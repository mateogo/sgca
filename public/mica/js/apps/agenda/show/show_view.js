DocManager.module("AgendaApp.Show", function(Show, DocManager, Backbone, Marionette, $, _){

  var Entities =  DocManager.module('Entities');


  Show.ActivityView = Marionette.ItemView.extend({
    className: 'wrapper',
    getTemplate: function(){
      return utils.templates.AgendaActivityShow;
    },
    events:{
      'click .js-returnsearch': function(){
        DocManager.trigger('agenda:lastfilter');
      }
    }
  });

  Show.EventView = Marionette.ItemView.extend({
    className: 'wrapper',
    getTemplate: function(){
      return utils.templates.AgendaEventShow;
    },
    events:{
      'click .js-returnsearch': function(){
        DocManager.trigger('agenda:lastfilter');
      }
    }
  });


});

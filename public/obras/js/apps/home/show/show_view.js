DocManager.module("HomeApp.Show", function(Show, DocManager, Backbone, Marionette, $, _){
  
  Show.HomeView = Marionette.ItemView.extend({
    getTemplate: function(){
      return utils.templates.HomeView
    },
    
    events: {
      'click .js-newobra': function(){
        DocManager.trigger("obras:new");
      },
      'click .js-newsol': function(){
        DocManager.trigger("solicitud:new");
      }
    }
  })
  
});
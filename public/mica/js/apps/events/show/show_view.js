DocManager.module("EventsApp.Show", function(Show, DocManager, Backbone, Marionette, $, _){
  
  var Entities =  DocManager.module('Entities');
  
  
  Show.ResumeView = Marionette.ItemView.extend({
    getTemplate: function(){
      return utils.templates.EventResumeView;
    }
  });
});
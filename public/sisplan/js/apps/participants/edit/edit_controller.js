DocManager.module("ParticipantsApp.Edit", function(Edit, DocManager, Backbone, Marionette, $, _){
  
  Edit.Controller = {};
  
  Edit.Controller.edit = function(action,participant){
    Edit.modaledit(action,participant);
  }
  
});
DocManager.module('ParticipantsApp.Show',function(Show, DocManager, Backbone, Marionette, $, _){
  
  Show.Controller = {
      initParticipants: function(action){
        return new Show.ParticipantView({action:action});
      }
  };
  
  
});
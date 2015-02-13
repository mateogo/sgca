DocManager.module('ParticipantsApp.Show',function(Show, DocManager, Backbone, Marionette, $, _){
  
  Show.Controller = {
      /**
       * @param {Entities.Action} action - accion a mostrar
       * @param {Object} opts - opciones  {disabledEdit: Boolean, collapsable: Boolean}
       */
      initParticipants: function(action,opts){
        var params = { action: action };
        params = _.extend(params,opts);
        return new Show.ParticipantView(params);
      }
  };
  
  
});
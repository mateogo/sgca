/**
 * Asignación de sala y mesa para los Suscriptores
 */
DocManager.module('BackendApp.Places',function(Places, DocManager, Backbone, Marionette, $, _){

  Places.Controller = {
    settingView: function(suscription){
        var id = suscription.get('profileid');

        var p = DocManager.request('micarqst:entity',id);
        p.done(function(model){
          settingPopupController.show(model);

        });
    }
  };



  var settingPopupController = {
    show: function(model){
      this.popup = Places.showSettingView(model);
    }
  };

});

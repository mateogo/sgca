/**
 * Asignación de sala y mesa para los Suscriptores
 */
DocManager.module('BackendApp.Places',function(Places, DocManager, Backbone, Marionette, $, _){

  Places.Controller = {
    settingView: function(suscription){
        var id = suscription.get('profileid');

        var p = DocManager.request('micarqst:entity',id);

        p.done(function(model){
          var place = model.get('place') || {sala: 'no_definido', mesa:0};
          console.log('Place Controller: model[%s] place:[%s] mesa:[%s]', model.get('cnumber'), place.sala, place.mesa);

          if(place.sala === 'no_definido'){
            place.sala = '402';
            place.mesa = 3
            model.set('place', place);

          }

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

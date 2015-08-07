DocManager.module('Entities', function(Entities, DocManager, Backbone, Marionette, $, _){
  Entities.MicaAgenda = Backbone.Model.extend({
    whoami: 'MicaAgenda: micaagenda.js ',
    urlRoot: '/micaagenda',

    idAttribute: '_id',

    defaults: {
      comprador: null,
      vendedor: null,
      num_reunion: '',
      estado: '',

      fealta: null,
      feultmod: null,
      usermod: null
    }
  });

  var API = {
    assign: function(comprador,vendedor){
      var data = {
        comprador: comprador,
        vendedor: vendedor
      };

      var p = $.ajax({
          type: 'post',
          url: '/micaagenda/assign',
          data: data,
          dataType: 'json'
      });

      return p;
    }
  };


  DocManager.reqres.setHandler('micaagenda:assign', function(micaInteraction){

    var comprador,vendedor;

    if(micaInteraction.get('emisor_rol') === 'comprador'){
      comprador = micaInteraction.get('emisor_inscriptionid');
      vendedor = micaInteraction.get('receptor_inscriptionid');
    }else{
      comprador = micaInteraction.get('emisor_inscriptionid');
      vendedor = micaInteraction.get('receptor_inscriptionid');
    }

    return API.assign(comprador,vendedor);
  });
});

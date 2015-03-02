/**
 * Agrega a un input la busqueda de Geocode, sugiere una lista de lugares para una dirección
 * 
 * estructura json de respuesta
 * https://developers.google.com/maps/documentation/geocoding/?hl=es#JSON
 * 
 * 
 * Parametros Obligatorios
 *    {input} el - element input
 * 
 * 
 * Eventos
 *    item:selected - al seleccionar un geoplace
 * 
 * 
 * Ejemplo:
 * 
 *   var autoComplete = new AutoCompletePersonField({el:$('#direccion'));
 * 
 *   autoComplete.on('item:selected',function(geoplace){
 *      console.log(geoplace.formatted_address);
 *      console.log(geoplace.geometry.location.lat,geoplace.geometry.location.lng);
 *   });
 * 
 */
DocManager.module("App", function(App, DocManager, Backbone, Marionette, $, _){
  
  App.View = {};
  
  App.View.AutoCompleteGeocodeField = Marionette.ItemView.extend({
        initialize: function(opts){
          var self = this;
          
          this.$el.autocomplete({
            source: function(request,response){
              
              DocManager.request('app:geocode',request.term).done(function(data){
                response(data.results);
              });
              
            },
            select: function(event,ui){
              self.trigger('item:selected',ui.item);
            }
          }).autocomplete( "instance" )._renderItem = function( ul, item ) {
            var $li = $('<li></li>');
            var itemUI = $('<span></span>',{text:item.formatted_address,'class':'text-primary'});
            $li.append(itemUI);
            ul.append($li);
            return $li;
          };
        },
        events: {
            'keydown': 'onKeyDown'
        },
        onKeyDown: function(e){
            if(e.keyCode === 27){
                e.stopPropagation();
            }
        }
    });
  
  /**
   * Extrae la provincia, departamento y localidad de un geoplace de googlemap
   * @param {Object} geoplace - resultado servicio geocode google map
   * @return {provincia:String,departamento:String,localidad:String}
   */
  App.parseGeoplace = function(geoplace){
        function getComponent(geoplace,type){
          var comp = null;
          for (var i = 0; i < geoplace.address_components.length && comp === null; i++) {
            var item = geoplace.address_components[i];
            for (var j = 0; j < item.types.length && comp === null; j++) {
              var itemType = item.types[j];
              if(itemType == type) comp = item;
            }
          }
          return comp;
        }
    
    var ret = {provincia:'',departamento:'',localidad:''};
    if(geoplace){
      var locality = getComponent(geoplace, 'locality');
      var level1 = getComponent(geoplace, 'administrative_area_level_1');
      var level2 = getComponent(geoplace, 'administrative_area_level_2');
      
      if(level1){
        if(level1.short_name === 'CABA'){
          ret.provincia = 'Buenos Aires';
          ret.departamento = level1.long_name;
          level2 = null;
        }else{
          ret.provincia = level1.long_name;  
        }
      }
      if(level2) ret.departamento = level2.long_name;
      if(locality) ret.localidad = locality.long_name;
    }
    return ret;
  };
});
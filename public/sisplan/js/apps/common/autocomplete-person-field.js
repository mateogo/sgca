/**
 * Agrega a un input la busqueda de persons a modo de sugerencia
 * Desplegando una lista de coincidencias
 * 
 * 
 * Parametros Obligatorios
 *    {Array de String} filterField - campos principales para buscar ej ['name','displayName']
 *    {input} el - element input
 * 
 * Parametros opcionales
 *    {String} tipoPersona - filtro por el campo tipopersona, por defecto 'persona'
 * 
 * Eventos
 *    person:selected - al seleccionar una person
 * 
 * 
 * Ejemplo:
 * 
 *   var autoComplete = new AutoCompletePersonField({el:$('#nombre'),filterField:['name','displayName']});
 * 
 *   autoComplete.on('person:selected',function(person){
 *     console.log('persona selccionada',person);
 *   });
 * 
 */

DocManager.module("PersonsApp", function(PersonsApp, DocManager, Backbone, Marionette, $, _){
  
  PersonsApp.View = {};
  
  PersonsApp.View.AutoCompletePersonField = Marionette.ItemView.extend({
        initialize: function(opts){
          var self = this;
          
          if(!opts || !opts.tipoPersona){
            opts.tipoPersona = 'persona';
          }
          
          this.$el.autocomplete({
            source: function(request,response){
              
              // preparando parametros de consulta
              var params = {'tipopersona':opts.tipoPersona};
              var ors = [];
              if(opts.filterField){
                if(_.isArray(opts.filterField)){
                  _.each(opts.filterField,function(item){
                    var tmp = {};
                    tmp[item] = request.term;
                    ors.push(tmp);
                  });
                }else if(typeof(opts.filterField) === 'string'){
                  var tmp = {};
                  tmp[opts.filterField] = request.term;
                  ors.push(tmp);
                }
              }
              if(ors.length > 0){
                params.$or = ors;
              }
              
              // generando consulta
              var p = DocManager.request('person:filteredLike:entities',params);
              
              p.done(function(data){
                response(data);
              });
            },
            select: function(event,ui){
              var personSelected = ui.item;
              self.trigger('person:selected',personSelected);
              console.log('selecciono person',personSelected);
            }
          }).autocomplete( "instance" )._renderItem = function( ul, item ) {
            var $li = $('<li></li>');
            var displayName = $('<span></span>',{text:item.displayName,'class':'text-primary'});
            var nickName = $('<span></span>',{text:item.nickName,'class':'text-muted',style:'padding-left:5px'});
            $li.append(displayName).append(nickName);
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
});
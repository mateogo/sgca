/**
 * Agrega a un input la busqueda de obras a modo de sugerencia
 * Desplegando una lista de coincidencias
 * 
 * 
 * Parametros Obligatorios
 *    {Array de String} filterField - campos principales para buscar ej ['cnumber','slug']
 *    {input} el - element input
 * 
 * 
 * Eventos
 *    obra:selected - al seleccionar una Obra
 * 
 * 
 * Ejemplo:
 * 
 *   var autoComplete = new AutoCompleteObrasField({el:$('#inputKey'),filterField:['cnumber','name']});
 * 
 *   autoComplete.on('obra:selected',function(obra){
 *     console.log('obra selccionada',obra);
 *   });
 * 
 */

DocManager.module("ObrasApp.List", function(List, DocManager, Backbone, Marionette, $, _){
  
  var Entities = DocManager.module('Entities');
  
  List.AutoCompleteObrasField = Marionette.ItemView.extend({
        initialize: function(opts){
          var self = this;
          
          this.$el.autocomplete({
            source: function(request,response){
              
              // preparando parametros de consulta
              var params = {};
              var ors = [];
              if(opts.filterField){
                if(_.isArray(opts.filterField)){
                  _.each(opts.filterField,function(item){
                    var tmp = {};
                    tmp[item] =  request.term;
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
              var p = DocManager.request('obra:filteredLike',params);
              
              p.done(function(data){
                response(data);
              });
            },
            select: function(event,ui){
              var selected = ui.item;
              selected = new Entities.Obra(selected);
              self.trigger('obra:selected',selected);
              setTimeout(function(){
                self.$el.val('');  
              },10)
            }
          }).autocomplete( "instance" )._renderItem = function( ul, item ) {
            var $li = $('<li></li>');
            var displayName = $('<div></div>',{text:item.cnumber,'class':'text-primary'});
            var nickName = $('<span></span>',{text:item.slug,'class':'text-muted'});
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
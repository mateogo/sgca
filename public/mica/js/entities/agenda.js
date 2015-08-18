DocManager.module("Entities", function(Entities, DocManager, Backbone, Marionette, $, _){
    
    Entities.Agenda = Backbone.Model.extend({
      urlRoot: "/agenda",
      whoami: 'Entities.Agenda:agenda.js ',
      idAttribute: "_id",
    });
    
    Entities.AgendaFilter = Backbone.Model.extend({
      
      initialize: function(){
        this.set('desde',moment().subtract(1,'days').format());
        this.set('hasta',moment().subtract(1,'days').add(1,'months').format());
      },
      
      setCriterion: function(obj){
        if(!obj) return;
        
        for(var key in obj){
          if(key in this.schema){
            this.set(key,obj[key]);
          }
        }
      },
      
      schema: {
        desde: {validators: ['required'], type: 'DatePicker',title:'Desde'},
        hasta: {validators: ['required'], type: 'DatePicker',title:'Hasta'},
        area: {validators: [], type: 'Select',title:'Área',options:utils.actionAreasOptionList},
        estado_alta: {validators: [], type: 'Select',title:'Estado',options: _.union('',utils.estadoaltaOptionList) },
        modo: {validators: [], type: 'Select',title:'Modo',options: [{val:'resumen',label:'Resumido'},{val:'detalle',label:'Detallado'}] },
        rubro: {type:'Select',title:'Rubro',options:utils.tematicasOptionList},
        subrubro: {type:'Select',title:'Sub Rubro',options:[]},
        type_content: {type:'Select',title: 'Tipo de audiencia',options:utils.etarioOptionList},
      },
      
      toJSON: function(){
        var obj = Backbone.Model.prototype.toJSON.apply(this);
        // borra los attributos vacios
        for(var key in obj){
          if(!obj[key] || obj[key] == 'no_definido' || obj[key] == 'nodefinido'){
            delete obj[key];
          }else if(obj[key] instanceof Date){
            obj[key] = moment(obj[key]).format();
          }
        }
        return obj;
      }
    },{
      MODE_RESUME: 'resumen',
      MODE_DETAIL: 'detalle'
    });
    
    
    Entities.AgendaCollection = Backbone.Collection.extend({
      model: Entities.Agenda,
      url: '/agenda',
      comparator: 'fdesde'
    });
});
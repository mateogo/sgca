DocManager.module("Entities", function(Entities, DocManager, Backbone, Marionette, $, _){
    
    Entities.Event = Backbone.Model.extend({
        urlRoot: "/eventos",
        whoami: 'event:backboneModel ',
        idAttribute: "_id",
        
        initialize: function(opts){
          Backbone.Model.prototype.initialize.apply(this,arguments);
          
          if(opts.artactivity && this.isNew()){
            var activity = opts.artactivity;  
            this.set('fdesde',activity.fdesde);
            this.set('fhasta',activity.fhasta);
            this.set('leyendafecha',activity.leyendafecha);
          }
        },

        defaults: {
          artactivity_id: null,
          cnumber: null,
          fealta: null,
          feultmod: null,
          
          headline: '', // titulo
          subhead: '', // bajada
          subhead_pro: '', // bajada destacada
          volanta: '',
          
          estado_alta: null,
          nivel_ejecucion: null,
          nivel_importancia: null,
          obs: '',
          
          area: '',
          locacion: '',
          espacio: '',
          
          ftype: '', // tipo de fecha (puntual, fecha-hasta,repeticion)
          fdesde: null, //fecha y hora
          fhasta: null, //fecha y hora
          duration: 0,
          leyendafecha: '',
          
          content: '',
          artists: '', // descripción de los artistas que participan
          
          assets_id: [] //array de referencias a assets
        },
        
        schema: {
          headline:  { validators: ['required'], title: 'Título'},
          subhead:  { validators: ['required'], title: 'Bajada'},
          subhead_pro:  { validators: ['required'], title: 'Bajada destacada'},
          volanta:  { validators: ['required'], title: 'Volanta'},
          estado_alta: {type:'Select',title:'Estado alta',options:utils.estadoaltaOptionList},
          nivel_ejecucion: {type:'Select',title:'Nivel ejecución',options:utils.actionEjecucionOptionList},
          nivel_importancia: {type:'Select',title:'Importancia',options:utils.actionPrioridadOptionList},
          obs: {type:'TextArea',title:'Observaciones'},
          area: {type:'Select',title:'Area',options:utils.actionAreasOptionList},
          location: {type:'Text',title:'Locación'},
          espacio: {type:'Text',title:'Espacio'},
          
          content: {type:'RichText',title:'Contenido'},
          artists: {type:'TextArea',title:'Artistas'},
          
          ftype: {type:'Select',title:'Tipo fecha',options:['Puntual','Fecha desde-hasta','Repetición']},
          fdesde: {type:'DatePicker',title:'Fecha desde'},
          fhasta: {type:'DatePicker',title:'Fecha hasta'},
          duration: {type:'Text',validators:[],title:'Duración'},
          hinicio: {type:'TimePicker',title:'Hora Inicio'},
          hfin: {type:'TimePicker',title:'Hora Fin'},
          leyendafecha: {type:'Text',title:'Leyenda Fecha'}
        },
        
        loadArtActivity: function(){
          var self = this;
          var def = $.Deferred();
          if(this.get('artactivity')){
            def.resolve(this.get('artactivity'));
          }else{
            var p = Entities.ArtActivity.findById(this.get('artactivity_id'));
            p.done(function(activity){
              self.set('artactivity',activity);
              def.resolve(activity);
            }).fail(def.reject);
          }
          
          def.done(function(activity){
            if(self.isNew()){
              self.set('fdesde',activity.get('fdesde'));
              self.set('fhasta',activity.get('fhasta'));
              self.set('leyendafecha',activity.get('leyendafecha'));
            }
          });
          return def.promise(); 
        }
    },{
      //static methods
      findById: function(id){
        if(!this.cache) this.cache = {};
        
        var def = $.Deferred();
        
        if(id in this.cache){
          def.resolve(this.cache[id]);
        }else{
          var self = this;
          var model = new Entities.Event({_id:id});
          model.fetch().then(function(r){
              if(r){
                self.cache[id] = model;
                def.resolve(model);
              }else{
                def.reject('not found');
              }
          },def.reject);
        }
        
        return def.promise();
      }
    });
    
    Entities.EventCollection = Backbone.Collection.extend({

      model: Entities.Event,

      url: "/eventos"
  });
 
});
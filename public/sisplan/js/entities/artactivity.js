DocManager.module("Entities", function(Entities, DocManager, Backbone, Marionette, $, _){
    
    Entities.ArtActivity = Backbone.Model.extend({
        urlRoot: "/artactividades",
        whoami: 'artactivity:backboneModel ',
        idAttribute: "_id",

        defaults: {
          cnumber: null,
          type_event: '',
          type_content: '',
          area: '',
          slug: '',
          description: '',
          fevent: '', //debe ser mayor a 40 dias de la fecha de carga
          fdesde: null,
          fhasta: null,
          leyendafecha: '',
          fecomp: '',
          lugar: '',
          airelibre: false,
          provevento: '',
          locevento: '',
          cevento: '',
          
          estado_alta: '',
          nivel_ejecucion: '',
          nivel_importancia: '',
          
          
          fealta: null,
          feultmod: null,
          
          rubro: '',
          subrubro: '',
          genero: '',
          formato: ''
        },
        
        schema: {
          type_event: {type:'Select',options:['Ciclo','Muestra'],title:'Tipo'},
          type_content: {type:'Select',options:utils.etarioOptionList,title: 'Tipo de audiencia'},
          slug:  { validators: ['required'], title: 'Denominación'},
          description:  {type:'TextArea',  title: 'Descripción'},
          fdesde: {type:'Date',title:'Fecha desde'},
          fhasta:  {type:'Date',title:'Fecha hasta'},
          leyendafecha:  {type:'Text',title:'Leyenda-Fecha'},
          lugar: 'Text',
          airelibre: {type:'Checkbox',title:'Aire Libre'},
          provevento: {type:'Select',title:'Provincia',options:utils.provinciasOptionList.Argentina},
          locevento: {type:'Text',title:'Localidad'},
          cevento: {type:'Text',title:'Código Postal'},
          area: {type:'Select',title:'Area',options:utils.actionAreasOptionList},
          estado_alta: {type:'Select',title:'Estado alta',options:utils.estadoaltaOptionList},
          nivel_ejecucion: {type:'Select',title:'Nivel ejecución',options:utils.actionEjecucionOptionList},
          nivel_importancia: {type:'Select',title:'Importancia',options:utils.actionPrioridadOptionList},
          responsable: {type:'Text',title:'Responsable Asignado'},
          res_mail: {type:'Text',title:'Email responsable'},
          res_tel: {type:'Text',title:'Teléfono responsable'},
          resolucion: {type:'Text',title:'Observaciones'},
          rubro: {type:'Select',title:'Rubro',options:utils.tematicasOptionList},
          subrubro: {type:'Select',title:'Sub Rubro',options:[]},
          genero: {type:'Text',title:'Genero'},
          formato: {type:'Text',title:'Formato'}
        }
    },{
      //ArtActivity static methods
      findById: function(id){
        if(!this.cache) this.cache = {};
        
        var def = $.Deferred();
        
        if(id in this.cache){
          def.resolve(this.cache[id]);
        }else{
          var self = this;
          var model = new Entities.ArtActivity({_id:id});
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

    Entities.ArtActivityCollection = Backbone.Collection.extend({

        model: Entities.ArtActivity,
        
        initialize: function (model, options) {
        },

        url: "/artactividades"
    });
    
    Entities.ArtActivityFilterFacet =  Backbone.Model.extend({
      schema: {
        area: {type:'Select',title:'Area',options:utils.actionAreasOptionList},
        type_event: {type:'Select',options:['','Ciclo','Muestra'],title:'Tipo'},
        type_content: {type:'Select',options:utils.etarioOptionList,title: 'Tipo de audiencia'},
        //fdesde: {type:'Date',title:'Fecha desde'},
        //fhasta:  {type:'Date',title:'Fecha hasta'},
        //airelibre: {type:'Checkbox',title:'Aire Libre'},
        provevento: {type:'Select',title:'Provincia',options:utils.provinciasOptionList.Argentina},
        //nivel_ejecucion: {type:'Select',title:'Estado de avance',options:utils.estadoaltaOptionList},
        //estado_alta: {type:'Select',title:'Estado de aprobación',options:utils.estadoaltaOptionList},
        //nivel_critico: {type:'Select',title:'Nivel de criticidad',options:utils.nivelimportanciaOptionList},
        rubro: {type:'Select',title:'Rubro',options:utils.tematicasOptionList},
        //subrubro: {type:'Select',title:'Sub Rubro',options:[]}
      },
      
      toJSON: function(){
        var ret = {};
        _.each(this.attributes,function(value,key){
            if(value && value !== 'no_definido' && value !== 'nodefinido'){
              ret[key] = value;
            }
        });
        return ret;
      }
    });

});
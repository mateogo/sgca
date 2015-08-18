DocManager.module("Entities", function(Entities, DocManager, Backbone, Marionette, $, _){
    Entities.ArtActivity = Backbone.Model.extend({
        urlRoot: "/artactividades",
        whoami: 'artactivity:backboneModel ',
        idAttribute: "_id",

        initialize: function(opts){
          _.bindAll(this, 'updateAction');

          if(opts.action){
            var slug   = this.get('slug')   || opts.action.slug;
            var fdesde = this.get('fdesde') || opts.action.feaccion;
            var fhasta = this.get('fhasta') || opts.action.feaccion;
            this.set('slug',   slug);
            this.set('fdesde', fdesde);
            this.set('fhasta', fhasta);
          }

          //TODO: locacion desahabilitado
          //this.schema.locacion.options.fetch();

          /* XXX schema se evalúa antes de cargar los datos desde la base, por lo que solo tiene los defaults.
           * Podría usar la forma de function, pero, en otros lados del sistema se sobreescribe así como así partes del mismo
           * y eso rompe todo.
           * Entonces al momento de instanciar una entidad, que pasa antes de ser usado por BBForms, lo reemplazo por el nuevo valor.
           */
          this.schema.area = {type:'Select',title:'Área',options:utils.actionAreasOptionList};
        },

        updateAction: function() {
          var self = this;
          var dfd = $.Deferred();

          var action = new Entities.Action({_id: self.get('action_id') });
          action.fetch({
            success: function(newaction) {
              var slug = newaction.get('slug');
              var action = self.get('action');

              if (action.slug != slug) {
                action.slug = slug;
                self.set('action', action);
                self.save();
              }
            }
          }).then(function() {
            dfd.resolve();
          });

          return dfd.promise();
        },

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
          locacion: '',
          espacios: [],
          airelibre: false,
          provevento: '',
          locevento: '',
          cevento: '',

          estado_alta: '',
          nivel_ejecucion: '',
          nivel_importancia: '',
          resolucion: '',


          fealta: null,
          feultmod: null,

          responsable: '',
          res_mail: '',
          res_tel: '',
          rubro: '',
          subrubro: '',
          genero: '',
          formato: '',
          tags: ''
        },

        schema: {
          type_event: {type:'Select',options:['Ciclo','Muestra'],title:'Tipo'},
          type_content: {type:'Select',options:utils.etarioOptionList,title: 'Tipo de audiencia'},
          slug:  { validators: ['required'], title: 'Denominación'},
          description:  {type:'TextArea',  title: 'Descripción'},
          fdesde: {type:'DatePicker',title:'Fecha desde'},
          fhasta:  {type:'DatePicker',title:'Fecha hasta'},
          leyendafecha:  {type:'Text',title:'Leyenda-Fecha'},
          airelibre: {type:'Checkbox',title:'Aire Libre'},
          locacion: {type:'Select',title:'Locación',options: new DocManager.Entities.LocationCollection()},
          espacios: {type:'Select2', title:'Espacios', options:[],config: { multiple: 'true'}},
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
          formato: {type:'Select',options:['Muestra', 'Espectáculos', 'Visita Guiada'],title:'Formato'},
          tags: {type:'Select2',title:'Palabras clave',options:[], tagger:true ,config: { tags: 'true', multiple:'true'}}

        },

        toString: function(){
          return this.get('cnumber') + ' - ' + this.get('slug');
        },

        getFieldLabel: function(field){
          if(!(field in this.schema)) return '';

          if(this.schema[field].type === 'Select'){
            var value = this.get(field);
            if(value === 'no_definido' || value === "nodefinido") return '';

            var options = this.schema[field].options;

            // XXX
            if (field == 'espacio') {
              var locaciones = this.schema["locacion"].options;
              var locacion = locaciones.get( this.get('locacion') );
              var espacio = (locacion && locacion.spaces.get(value)) || '';
              return espacio.toString();
            }

            if (options instanceof Backbone.Collection) {
              var selected = options.get(value);
              return selected ? selected.toString() : '';
            } else {
              var selected = _.findWhere(options,{val:value});
              return (selected)? selected.label : value;
            }
          }else{
            return this.get(field);
          }
        },
        getField: function(field){
            return this.get(field);
        },

        setLocationName: function(){
            var location = new Entities.Location({_id: this.get("locacion")});
            var defer = $.Deferred();
            var self = this;
            //TODO: de desahabilito el location
            defer.resolve([]);
            return defer.promise();
            location.fetch({
                success: function(data){

                    self.set("locationName",data.toString());
                    var spaceNames = "";
                    var spaces = self.get("espacios");
                    if(spaces) {
                        for (var i = 0; i < spaces.length; i++) {
                            spaceNames = spaceNames.concat(data.spaces.where({id: spaces[i]}).toString(), ", ");
                        }
                        spaceNames = spaceNames.substr(0, spaceNames.length - 2);
                        self.set("spaceName", spaceNames);
                    }
                    else{
                        self.set("spaceName", "");
                    }
                    self.set("provincia",data.get("provincia"));
                    self.set("localidad",data.get("localidad"));
                    self.set("codigoPostal",data.get("codigoPostal"));

                    defer.resolve(self);
                },
                error: function(data){
                    defer.resolve(undefined);
                }
            });
            return defer.promise();
        },


        load: function(){
          return $.when(this.loadAssets(), this.updateAction());
        },
        loadAssets: function(){
          var def = $.Deferred();
          if(this.assets){
            def.resolve(this.assets);
          }else{
            var col = new Entities.AssetCollection();
            var p = col.fetch({data:{'es_asset_de.id':this.id}});
            this.assets = col;
            p.done(def.resolve).fail(def.reject);
          }
          return def;
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
        url: "/artactividades"
    });

    Entities.ArtActivityFilterFacet =  Backbone.Model.extend({
      initialize: function(opts){
        /* XXX schema se evalúa antes de cargar los datos desde la base, por lo que solo tiene los defaults.
         * Podría usar la forma de function, pero, en otros lados del sistema se sobreescribe así como así partes del mismo
         * y eso rompe todo.
         * Entonces al momento de instanciar una entidad, que pasa antes de ser usado por BBForms, lo reemplazo por el nuevo valor.
         */
        this.schema.area = {type:'Select',title:'Área',options:utils.actionAreasOptionList};
      },

      schema: {
        area: {type:'Select',title:'Area',options:utils.actionAreasOptionList},
        action: {type:'Text',title:'Acción'},
        type_event: {type:'Select',options:['','Ciclo','Muestra'],title:'Tipo'},
        type_content: {type:'Select',options:utils.etarioOptionList,title: 'Tipo de audiencia'},
        provevento: {type:'Select',title:'Provincia',options:utils.provinciasOptionList.Argentina},
        nivel_ejecucion: {type:'Select',title:'Estado de avance',options:_.union([''],utils.actionEjecucionOptionList)},
        estado_alta: {type:'Select',title:'Estado de aprobación',options:_.union([''],utils.estadoaltaOptionList)},
        nivel_importancia: {type:'Select',title:'Nivel de criticidad',options:_.union([''],utils.nivelimportanciaOptionList)},
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

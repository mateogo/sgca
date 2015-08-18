DocManager.module("Entities", function(Entities, DocManager, Backbone, Marionette, $, _) {

    var App = DocManager.module('App');

    Entities.Location = Backbone.Model.extend({
        urlRoot: "/sisplan/locaciones",
        whoami: 'Location:location.js',
        idAttribute: "_id",

        initialize: function () {
        },

        defaults: {
            _id: null,
            coordinate: [],
            spaces: []
        },

        schema: {
            name: {validators: ['required'], type: 'Text',title:'Nombre'},
            nickName: {validators: ['required'], type: 'Text',title:'Alias'},
            displayName : {validators: ['required'], type: 'Text',title:'Nombre visible'},
            direccion: {validators: [], type: 'Text',title:'Dirección'},
            provincia: {validators: [], type: 'Text',title:'Provincia'},
            departamento: {validators: [], type: 'Text',title:'Departamento'},
            localidad: {validators: [], type: 'Text',title:'Localidad'},
            codigoPostal: {validators: [], type: 'Text',title:'Código Postal'},
            notas: 'TextArea'
        },
        parse: function(data){

            if(!this.spaces){
                this.spaces = new Backbone.Collection(data.spaces);
            }

            this._initSubCollection(data, 'spaces', Entities.Space);
            return data;
        },

        _initSubCollection: function(data,collectionKey,Entity){
            var collection = data[collectionKey];
            if(collection){
                for ( var i = 0; i < collection.length; i++) {
                    var raw = collection[i];
                    if(!(raw instanceof Entity)){
                        if(!raw.id){
                            raw.id = (i+1);
                        }
                        raw.location = this;
                        collection[i] = new Entity(raw);
                    }
                }
                this[collectionKey].reset(collection);

                //delete data[collectionKey];
            }
        },

        useGeoplace: function(place){
            this.set('direccion',place.formatted_address);
            if(place.geometry && place.geometry.location){
                var pointer = place.geometry.location;
                var coord = [pointer.lat,pointer.lng];
                this.set('coordinate',coord);
            }

            var obj = App.parseGeoplace(place);
            this.set(obj);
        },

        createNewSpace: function(){
            return new Entities.Space({location:this});
        },

        toString: function(){
            return this.get('name')+': '+this.get('direccion');
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
                var model = new Entities.Location({_id:id});
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

    Entities.LocationCollection = Backbone.Collection.extend({

        model: Entities.Location,

        initialize: function (model, options) {
        },

        url: "/sisplan/locaciones"

    });

    Entities.PaginatedLocationCollection = Backbone.PageableCollection.extend({

        model: Entities.Location,

        initialize: function (model, options) {
        },
        state: {
            firstPage: 0,
            pageSize: 10
        },

        url: "/sisplan/locaciones"

    });

    Entities.Space = Backbone.Model.extend({
        whoami: 'Space:location.js ',
        urlRoot: '/sisplan/locaciones/:idLocacion/espacios',
        url: function(){
            return this.urlRoot.replace(':idLocacion',this.location.id);
        },

        constructor: function(params){
            if(params.location){
                this.location = params.location;
                delete params.location;
            }

            Backbone.Model.apply(this,arguments);
        },

        toString: function(){
            return this.get('nombre');
        },

        parse: function(data) {
            if (data.area) {
                data.area = new Entities.Area({_id: data.area});
                data.area.fetch();

            }
            return data;
        },

        setAreaName: function(){
            var area = new Entities.Area({_id: this.get("area")});
            var defer = $.Deferred();
            var self = this;
            area.fetch({
                success: function(data){

                    self.set("areaName",data.get("nombre"));
                    defer.resolve(self);
                },
                error: function(data){
                    defer.resolve(undefined);
                }
            });
            return defer.promise();
        },

        defaults: {
            nombre:'',
            capacidad:'',
            superficie:'',
            reservas:[],
            notas: '',
            productorDeSala: '',
            responsableTecnico: '',
            piso:''
        },

        schema: {
            nombre: {validators: ['required'], type: 'Text',title:'Nombre'},
            capacidad: {validators: ['number'], type: 'Number',title:'Capacidad (personas)'},
            superficie: {validators: ['number'], type: 'Number',title:'Superficie (m2)'},
            piso: {type: 'Text',title:'Piso'},
            area: {type:'Select',title:'Tipo de area',options: new DocManager.Entities.AreaCollection()},
            productorDeSala: {type: 'Text',title:'Productor de sala'},
            responsableTecnico: {type: 'Text',title:'Responsable técnico'},
            notas: 'TextArea'
        }


    });
    var API = {
        getEntity: function(entityId){
            var location = new Entities.Location({_id: entityId});
            var defer = $.Deferred();
            if(entityId){
                location.fetch({
                    success: function(data){
                        defer.resolve(data);
                    },
                    error: function(data){
                        defer.resolve(undefined);
                    }
                });
            }else{
                defer.resolve(location);
            }
            return defer.promise();
        }
    };

    DocManager.reqres.setHandler("location:entity", function(id){
        return API.getEntity(id);
    });

});
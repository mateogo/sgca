DocManager.module("Entities", function(Entities, DocManager, Backbone, Marionette, $, _){

    Entities.Recurso = Backbone.Model.extend({
        urlRoot: "/sisplan/recursos/recursos",
        idAttribute: "_id",
        whoami: 'sisplan:Entities.Recurso',

        initialize: function (model, options) {
            this.options = options || {};
        },

        defaults: {
            cnumber: null,
            parent_id: null,
            childs: null,
            variantes: null,
            nombre: '',
            descripcion_corta: '',
            descripcion: '',
            es_consumible: false,
            codigo_onc: '',
            objeto_gasto: '',
            importes: [],
        },

        schema: function() {
          return {
            //childs: null,
            //variantes: null,
            nombre: 'Text',
            descripcion_corta: 'Text',
            descripcion: 'TextArea',
            es_consumible: 'Checkbox',
            codigo_onc: 'Text',
            objeto_gasto: 'Text',
            //importes: [],
          };
        }
    });

    Entities.RecursoCollection = Backbone.Collection.extend({
        url: "/sisplan/recursos/recursos",
        whoami: 'sisplan:Entities.RecursoCollection',

        model: Entities.Recurso,

        initialize: function (model, options) {
            this.options = options || {};
        },

      });

    Entities.RecursoTipo = Backbone.Model.extend({
        urlRoot: "/sisplan/recursos/tipos",
        idAttribute: "_id",
        whoami: 'sisplan:Entities.RecursoTipo',

        initialize: function (model, options) {
            this.options = options || {};
        },

        defaults: {
            cnumber: null,
            nombre: '',
            descripcion: '',
        },

        schema: {
          cnumber: {type: 'Text', editorAttrs:{disabled:'true'} },
          nombre: 'Text',
          descripcion: 'TextArea',
        },

        toString: function() {
          return 'Tipo de recurso: ' + this.get('cnumber') + ' ' + this.get('nombre');
        },
    });

    Entities.RecursoTipoCollection = Backbone.Collection.extend({
        url: "/sisplan/recursos/tipos",
        whoami: 'sisplan:Entities.RecursoTipoCollection',

        model: Entities.RecursoTipo,

        initialize: function (model, options) {
            this.options = options || {};
        },

        columns: [
          {
            name: 'cnumber',
            label: 'Código',
            editable: false,
            cell: 'string',
          },
          {
            name: 'nombre',
            label: 'Nombre',
            editable: false,
            cell: 'string',
          },
        ],
    });

    Entities.RecursoFamilia = Backbone.Model.extend({
        urlRoot: "/sisplan/recursos/familias",
        idAttribute: "_id",
        whoami: 'sisplan:Entities.RecursoFamilia',

        initialize: function (model, options) {
            this.options = options || {};
        },

        defaults: {
            cnumber: null,
            parent_id: null,
            childs: null,
            nombre: '',
            descripcion: '',
        },

        schema: {
          cnumber: {type: 'Text', editorAttrs:{disabled:'true'} },
          nombre: 'Text',
          descripcion: 'TextArea',
        },

        toString: function() {
          return 'Familia: ' + this.get('cnumber') + ' ' + this.get('nombre');
        },
    });

    Entities.RecursoFamiliaCollection = Backbone.Collection.extend({
        url: "/sisplan/recursos/familias",
        idAttribute: "_id",
        whoami: 'sisplan:Entities.RecursoFamiliaCollection',

        model: Entities.RecursoFamilia,

        initialize: function (model, options) {
            this.options = options || {};
        },

        columns: [
          {
            name: 'cnumber',
            label: 'Código',
            editable: false,
            cell: 'string',
          },
          {
            name: 'nombre',
            label: 'Nombre',
            editable: false,
            cell: 'string',
          },
        ],
    });

    /**
     *
     * Devuelve un promise que resuelve a
     * [ {_id:'id tipo 1', cnumber: 'cnumber tipo1', nombre: 'nombre tipo1', descripcion: 'descripcion tipo 1'}, {tipo 2 .. N} ]
     *
     */
    DocManager.reqres.setHandler('recursos:get:tipos', function() {
      var dfd = $.Deferred();
      var collection = new Entities.RecursoTipoCollection();

      collection.fetch({
        success: function(collection) {
          dfd.resolve(collection.map(function(tipo) {
              return tipo.attributes;
            }
          ));
        }
      });

      return dfd.promise();
    });
});

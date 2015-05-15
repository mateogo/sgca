DocManager.module("Entities", function(Entities, DocManager, Backbone, Marionette, $, _){

    Entities.Recurso = Backbone.Model.extend({
        url: "/sisplan/recursos/recursos",
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
    });

    Entities.RecursoCollection = Backbone.Collection.extend({
        urlRoot: "/sisplan/recursos/recursos",
        whoami: 'sisplan:Entities.RecursoCollection',

        initialize: function (model, options) {
            this.options = options || {};
        },
    });

    Entities.RecursoTipo = Backbone.Model.extend({
        url: "/sisplan/recursos/tipos",
        idAttribute: "_id",
        whoami: 'sisplan:Entities.RecursoTipo',

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
    });

    Entities.RecursoTipoCollection = Backbone.Collection.extend({
        urlRoot: "/sisplan/recursos/tipos",
        whoami: 'sisplan:Entities.RecursoTipoCollection',

        initialize: function (model, options) {
            this.options = options || {};
        },
    });

    Entities.RecursoFamilia = Backbone.Model.extend({
        url: "/sisplan/recursos/familias",
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
    });

    Entities.RecursoFamiliaCollection = Backbone.Collection.extend({
        urlRoot: "/sisplan/recursos/familias",
        idAttribute: "_id",
        whoami: 'sisplan:Entities.RecursoFamiliaCollection',

        initialize: function (model, options) {
            this.options = options || {};
        },
    });

});

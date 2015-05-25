DocManager.module("Entities", function(Entities, DocManager, Backbone, Marionette, $, _){

  var defaultsCollection;

  // { k_n:v_n ... } -> "k_0 = v_0, k_1 = v_1 ..."
  var valueToString = function(value) {
    var res = [];
    _.each(value, function(v, k) {
      res.push(k + ' = ' + v);
    });
    return res.join(', ');
  };

  var schemaExtend = function(new_attrs) {
    return function(schema, model) {
      return _.extend(schema, new_attrs);
    }
  }

  var subSchemaExtend = function(new_attrs) {
    return function(schema, model) {
      _.extend(schema.values.subSchema, new_attrs);
      return schema;
    }
  }

  var subSchemaExtendText = function(new_attrs) {
    // nuestro Underscore no tiene (aun) mapObject
    _.each(new_attrs, function(value, key) {
      new_attrs[key] = 'Text';
    });
    return subSchemaExtend(new_attrs);
  }

  // tag: function(schema, model) -> schema
  var schemaOverrides = {
    budgetTemplateList:           schemaExtend({ values: { title: 'Valores', type: 'List', itemType: 'Text' } }),

    activityTemplateList:         schemaExtend({ values: { title: 'Valores', type: 'List', itemType: 'Text' } }),

    urgenciaList:                 schemaExtend({ values: { title: 'Valores', type: 'List', itemType: 'Text' } }),

    localList:                    subSchemaExtendText({val:'ccnk-sala1.1',label:'Sala 1.2',piso:'1',area:'Noble',capacidad:'30',locacion:'CCK'}),

    nivelEjecucionStramiteOpLst:  subSchemaExtendText({classattr:'info'}),

    tipoBudgetMovimList:          subSchemaExtendText({cgasto:'000.000', presuinciso: '000',  template:''}),

    actionEjecucionOptionList:    subSchemaExtendText({classattr:'info'}),

    budgetOriginList:             subSchemaExtendText({classattr:'info'}),

    budgetTramitaPorList:         subSchemaExtendText({classattr:'info'}),

    budgetEjecucionOptionList:    subSchemaExtendText({classattr:'info'}),

    actionNodosOptionList:        subSchemaExtendText({nodo:''}),

    actionAreasOptionList:        subSchemaExtendText({nodo:'no_definido' ,presuprog:'000'}),

    documexecutionOptionList:     subSchemaExtendText({classattr:'info'}),

    itemaprobOptionList:          subSchemaExtendText({classattr:'info'}),

    itemaprobreqOptionList:       subSchemaExtendText({classattr:'info'}),

    paexecutionOptionList:        subSchemaExtendText({pending: 'no_definido', result:'ok'}),

    productionsListTableHeader:   subSchemaExtend({id:'Number' , tt:'Text', flag:'Number', tclass:'Text', tmpl: 'Text'}),
    userListTableHeader:          subSchemaExtend({id:'Number' , tt:'Text', flag:'Number', tclass:'Text', tmpl: 'Text'}),
    personListTableHeader:        subSchemaExtend({id:'Number' , tt:'Text', flag:'Number', tclass:'Text', tmpl: 'Text'}),
    productListTableHeader:       subSchemaExtend({id:'Number' , tt:'Text', flag:'Number', tclass:'Text', tmpl: 'Text'}),
    documListTableHeader:         subSchemaExtend({id:'Number' , tt:'Text', flag:'Number', tclass:'Text', tmpl: 'Text'}),
    actionListTableHeader:        subSchemaExtend({id:'Number' , tt:'Text', flag:'Number', tclass:'Text', tmpl: 'Text'}),
    budgetListTableHeader:        subSchemaExtend({id:'Number' , tt:'Text', flag:'Number', tclass:'Text', tmpl: 'Text'}),
  };


  Entities.KeyValueItem = Backbone.Model.extend({

    idAttribute: "tag",
    urlRoot: "/api/kvstore-by-tag",

    defaults: {
        _id: null,
        tag: '',
        // lista de {val:'xxx', label:'xxx', ...}
        // ver schemaOverrides mas arriba.
        values: [],
    },

    initialize: function () {
      this.on('sync', this.onSync);

      this.on('destroy', function() {
        delete window.utils[ this.get('tag') ];
      });
    },

    onSync: function () {
      var tag = this.get('tag');
      var values = this.get('values');

      window.utils[tag] = values;

      DocManager.trigger('keyvalues:change:'+tag, values, this);
      DocManager.trigger('keyvalues:change', this);
    },

    schema: function () {
        // llamado desde BBForms o por fuera, cambia contexto.
        var model = this.model || this;
        var defaultSchema = {
          tag: { title: 'Nombre colección', validators:['required'] },
          values:    { title: 'Valores', type: 'List', itemType: 'Object', itemToString: valueToString, subSchema: {label:'Text', val: 'Text'}  },
        };

        // no es un modelo instanciado.
        if (!model.get) {
          return defaultSchema;
        }

        var override = schemaOverrides[model.get('tag')];
        if (override) {
          return override(defaultSchema, model);
        } else {
          return defaultSchema;
        }
    },

    validate: function(attrs, options) {
        var errors = {};
        if (! attrs.tag) {
          errors.tag = "no puede quedar en blanco";
        }
        if( ! _.isEmpty(errors)){
          return errors;
        }
    },

    toString: function() {
      return 'KeyValueItem: ' + this.get('tag') + ' , id: ' + this.id
    },
  });


  Entities.KeyValueCollection = Backbone.Collection.extend({

    model: Entities.KeyValueItem,
    url: "/api/kvstore",
    comparator: "tag",

    columns: [
      {
        name: 'tag',
        label: 'Nombre Colección',
        editable: false,
        cell: 'string',
      },
    ],
  });

  defaultsCollection = new Entities.KeyValueCollection();

  var buildDefaultsCollection = function() {
    var toAdd = [];
    _.each(window.utils_defaults, function(value, key) {
      if (!_.isArray(value)) {
        return;
      }
      var m = new Entities.KeyValueItem({
        tag: key,
        values: value,
      });
      toAdd.push(m);
    });
    defaultsCollection.add(toAdd);
  }

  buildDefaultsCollection();

  var API = {
    loadFromServer: function() {
      var defer = $.Deferred();
      defaultsCollection.fetch({
        success: function(collection, response, options){
          collection.each(function(model) {
            model.onSync();
          });

          defer.resolve(collection);
        },
        error: function(data){
          defer.resolve(undefined);
        },
        remove: false,
      });
      return defer.promise();
    },

    getEntityByTag: function(tag){
      return defaultsCollection.get(tag);
    },
  };

  DocManager.reqres.setHandler("keyvalues:loadFromServer", function(){
    return API.loadFromServer();
  });

  DocManager.reqres.setHandler("keyvalues:getCollection", function(){
    return defaultsCollection;
  });

  DocManager.reqres.setHandler("keyvalues:get", function(tag){
    return API.getEntityByTag(tag);
  });

});


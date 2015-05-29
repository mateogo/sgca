DocManager.module("AbmApp.List", function(List, DocManager, Backbone, Marionette, $, _){
  List.Layout = Marionette.LayoutView.extend({
    className: 'row row-offcanvas row-offcanvas-left',

    getTemplate: function(){
      return utils.templates.AbmListLayoutView;
    },

    regions: {
      navbarRegion:  '#navbar-region',
      mainRegion:    '#main-region',
      tableRegion:   '#table-region',
    },

    triggers: {
      'click button.js-newitem': 'abm:new',
    },

    initialize: function(options) {
      var options = this.options = options || {};
      _.defaults(options, {
        listTitle: '',
        canAdd: false,
        canEdit: false,
        canRemove: false,
      });
    },

    serializeData: function() {
      return this.options;
    },
  });

  var actionsCell = Backgrid.Cell.extend({
    className: "actions-abm-cell",
    initialize: function(options) {
      this.options = options;
      this.column = options.column;
      if (!(this.column instanceof Backgrid.Column)) {
        this.column = new Backgrid.Column(this.column);
      }
    },
    render: function(){
      if(!this.rendered){
        var options = this.options.column.get('options') || {};

        var btnEdit = $('<button class="btn-link js-edit" title="editar"><span class="glyphicon glyphicon-edit"></span></button>');
        var btnRemove = $('<button class="btn-link js-trash" title="borrar"><span class="glyphicon glyphicon-remove"></span></button>');
        if (options.canEdit)
          this.$el.append(btnEdit);
        if (options.canRemove)
          this.$el.append(btnRemove);
        this.rendered = true;
      }
      return this;
    },
    // aca seria mas lindo usar triggers pero aun asi Backgrid captura antes los eventos.
    events: {
      'click button.js-edit': 'onEdit',
      'click button.js-trash': 'onRemove',
    },
    onEdit: function(e) {
      e.stopPropagation();e.preventDefault();
      this.model.trigger('abm:edit', this.model);
    },
    onRemove: function(e) {
      e.stopPropagation();e.preventDefault();
      this.model.trigger('abm:remove', this.model);
    },
  });

  function __build_columns(options) {
    var columns = [];
    var actions = [];
    var model = options.collection.model || options.model;

    if (options.canEdit || options.canRemove) {
      actions = [{
        name: 'Acciones',
        label: 'Acciones',
        editable: false,
        options: options,
        cell: actionsCell
      }];
    }

    if (options.columns) {
      return options.columns.concat(actions);
    }
    if (options.collection.columns) {
      return options.collection.columns.concat(actions);
    }

    if (!model) {
      return columns;
    }

    // No tengo definicion de columnas. Trato de generarlas a partir del schema o los defaults del model.
    // Prioridad para schema: options.schema , model.schema (propio de la instancia pasada) , model.prototype.schema (propio de la definicion de modelo)
    var schema;
    if (model.prototype && model.prototype.schema) {
      schema = model.prototype.schema;
    }

    if (model.schema) {
      schema = model.schema;
    }
    schema = options.schema || schema;

    if (typeof(schema) == 'function') {
      schema = schema(model);
    }

    // XXX FIXME: completar con otros campos mas?
    if (schema) {
      _.each(schema, function(options, field) {
        var label='';
        var cell='string';
        var fieldType;
        var formatter = undefined;

        if (typeof(options) == 'string') {
          label = field;
          fieldType = field;
        } else {
          fieldType = options.type;
          label = options.title || field;
          if (options.itemToString) {
            formatter = {
              fromRaw: function(value) {
                var res = [];
                _.each(value, function(item) {
                  res.push(options.itemToString(item));
                });
                return res.join(' ');
              },
              toRaw: function(data) { return data; }
            }
          }
        }

        switch (fieldType) {
          case 'Text':
            cell='string';
            break;

          case 'Date':
          case 'DateTime':
            cell='date';
            break;

          case 'Checkbox':
            cell='boolean';
            break;

          default:
            cell='string';
        }


        columns.push({
          name: field,
          label: label,
          cell: cell,
          editable: false,
          formatter: formatter,
        });

      });

    } else {
      _.each(model.prototype.defaults, function(value, key) {
        if (key == '_id') { return; }
        columns.push({
          name: key,
          label: key,
          cell: 'string',
          editable: false,
        });
      });
    }

    return columns.concat(actions);
  }

  List.BuildGridView = function(options) {
    var collection = options.collection;
    var columns = __build_columns(options);

    return new Backgrid.Grid({
      className: 'table table-condensed table-bordered table-hover',
      collection: collection,
      columns: columns,
    });
  };

});

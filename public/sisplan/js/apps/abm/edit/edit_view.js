DocManager.module("AbmApp.Edit", function(Edit, DocManager, Backbone, Marionette, $, _){

  Edit.BuildForm = function(options) {
    var schema = __build_schema(options);

    var form = new Backbone.Form({
      model: options.model,
      schema: schema,
    });

    return form;
  }

  function __build_schema(options) {
    var schema = {};

    if (options.schema) {
      return options.schema;
    }

    if (options.model.schema) {
      return options.model.schema;
    }

    // No tengo schema. Lo genero a partir de los defaults del model.
    _.each(options.model.defaults, function(value, key) {
        if (key == '_id') { return; }

        switch(typeof(value)) {
          case 'boolean':
            schema[key] = 'Checkbox';
            break;

          case 'number':
            schema[key] = 'Number';
            break;

          // XXX FIXME: aca se acaba la inteligencia. aun no hacemos magia.
          default:
            schema[key] = 'Text';
        }
    });

    return schema;
  }

});

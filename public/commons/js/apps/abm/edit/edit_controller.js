DocManager.module('AbmApp.Edit',function(Edit,DocManager,Backbonone,Marionette,$, _){

  Edit.Controller = Marionette.Object.extend({

    initialize: function (options) {
      var self = this;
      var options = this.options = _.extend({}, options);

      if (typeof(options.model) == 'function') {
        options.model = new options.model();
      }
      var isNew = options.model.isNew();

      var form = this.form = Edit.BuildForm(options);

      var modal = new Backbone.BootstrapModal({
        content: form,
        title: options.title,
        okText: isNew ? 'Crear' : 'Actualizar',
        cancelText: 'Cancelar',
        okCloses: false,
        animate: true,
      });

      options.model.once('sync', function() {
        if(isNew) {
          self.trigger('created', options.model);
          if (options.collection && (typeof(options.collection) == 'object')) {
            options.collection.add(options.model);
          }
        }
        self.trigger('saved', options.model);
      });

      modal.on('ok', function() {
        var errors = form.commit();
        if (!errors) {
          options.model.save();
          modal.close();
          self.destroy();
        }
      });

      modal.on('cancel', function() {
        self.trigger('closed', options.model);
        self.destroy();
      });

      modal.open();

      self.on('destroy', modal.destroy);
    },

  });

});

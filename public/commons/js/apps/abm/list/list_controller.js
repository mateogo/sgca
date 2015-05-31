DocManager.module('AbmApp.List',function(List,DocManager,Backbonone,Marionette,$, _){

  List.Controller = Marionette.Object.extend({

    initialize: function (options) {
      var self = this;
      var options = this.options = _.defaults(options, {
        listTitle: '',
        title: '',
        canAdd: true,
        canEdit: true,
        canRemove: true,
      });

      if (typeof(options.collection) == 'function') {
        options.collection = new options.collection();
        options.collection.fetch();
      }

      if (!this.options.model) {
          this.options.model = this.options.collection.model;
      }

      var layout = this.layout = new List.Layout(options);
      var grid = this.grid = List.BuildGridView(options);

      layout.on('show', function() {
        layout.tableRegion.show(grid);
      });

      layout.on('abm:new', this.newItem);
      layout.listenTo(options.collection, 'abm:edit', this.editItem);
      layout.listenTo(options.collection, 'abm:remove', this.removeItem);

      if (options.region) {
        options.region.show(layout);
      } else {
        DocManager.mainRegion.show(layout);
      }
    },

    newItem: function () {
      var ok = {};
      var cb = this.options.beforeNew;
      if (cb && typeof(cb) == 'function') {
        ok = cb(this.options);
      }

      if (ok == false) {
        return;
      }

      var options = _.defaults(ok, this.options);

      DocManager.request('abm:new', options);
    },

    removeItem: function (model) {
      DocManager.request('abm:remove', {
        model: model,
      });
    },

    editItem: function (model) {
      var ok = true;
      var cb = this.options.beforeEdit;
      if (cb && typeof(cb) == 'function') {
        ok = cb(model, this.options);
      }

      if (ok) {
        DocManager.request('abm:edit', {
          model: model,
        });
      }
    }
  });

});

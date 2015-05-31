DocManager.module('RecursosApp.Familias.List',function(List,DocManager,Backbonone,Marionette,$, _){

  List.Controller = Marionette.Object.extend({

    initialize: function (options) {
      var self = this;
      var options = options || {};
      var options = this.options = _.defaults(options, {
        listTitle: '',
        title: '',
        canAdd: true,
        canEdit: true,
        canRemove: true,
        modal: false,
      });

      _.bindAll(self, 'onSelectFamilia', 'onNuevaFamilia', 'cargarSubFamilias', 'navegar');

      this.familia = undefined;

      var familias = this.familias = new DocManager.Entities.RecursoFamiliaCollection();
      familias.fetch();

      var ruta = this.ruta = new Backbone.Collection();

      var root = new Backbone.Model({
        _id: null,
        parent_id: null,
        nombre: 'Todas las familias',
      });

      ruta.add(root);

      self.navBar = new List.NavBar({collection: self.ruta});

      var layout = this.layout = new List.Layout(options);
      layout.on('show shown', function() {
        DocManager.request('abm:list', {
          listTitle: 'Familias',
          collection: familias,
          region: layout.familiasListRegion,
          beforeEdit: self.onSelectFamilia,
          beforeNew: self.onNuevaFamilia,
        });

        self.layout.navbarRegion.show(self.navBar);
      });


      self.navBar.on('nav:nav', function(opts) {
        var familia = opts.model;
        self.navegar(familia);
      });

      if (options.modal) {
        var modal = self.modal = new Backbone.BootstrapModal({
          content: layout,
          title: 'Elegir Familia',
          cancelText: 'Cancelar',
          okText: 'Elegir',
          animate: true
        });

        modal.once('ok', function () {
          self.trigger('modal:select', self.familia);
        });

        modal.once('cancel', function () {
          self.trigger('modal:cancel');
        });

        modal.once('hidden', function () {
          self.layout.destroy();
          self.destroy();
        });

        modal.open();

      } else {
        DocManager.mainRegion.show(layout);
      }
    },

    navegar: function(familia) {
      var ruta = this.ruta;

      // Es el 'root' ficticio
      if (!familia.has('_id')) {
        this.layout.mainRegion.reset();
        ruta.reset([ruta.models[0]]);
        this.familia = undefined;
      } else {
        this.familia = familia;

        ruta.add(familia);

        var idx = ruta.indexOf(familia);
        ruta.remove( ruta.slice(idx+1) );

        var view = new List.FamiliaDetalleView({ model: familia });

        view.listenTo(view, 'edit', function(opts) {
          DocManager.request('abm:edit', {
            model: opts.model,
            title: 'Editar Familia',
          });
        });

        this.layout.mainRegion.show(view);
      }

      this.cargarSubFamilias(familia);

      this.trigger('navegar', familia);
    },

    cargarSubFamilias: function(familia) {
      var query = {};
      if (familia && familia.has('_id')) {
        query.parent_id = familia.get('_id');
      }

      this.familias.reset();
      this.familias.fetch({
        data: query,
      });
    },

    onSelectFamilia: function(familia, options) {
      this.navegar(familia);
      return false;
    },

    onNuevaFamilia: function(options) {
      if (!this.familia) {
        return options;
      }

      var model = new DocManager.Entities.RecursoFamilia();

      model.set('parent_id', this.familia.get('_id'));

      return {
        model: model,
        collection: this.familias,
        title: 'Agregar sub-Familia',
      };
    },

  });

});

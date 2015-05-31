DocManager.module("RecursosApp.Familias.List", function(List, DocManager, Backbone, Marionette, $, _){
  List.Layout = Marionette.LayoutView.extend({
    className: 'row row-offcanvas row-offcanvas-left',

    getTemplate: function(){
      return utils.templates.RecursosFamiliasListLayout;
    },

    regions: {
      navbarRegion:  '#familias-navbar-region',
      mainRegion:    '#familias-main-region',
      headerRegion:    '#familias-header-region',
      familiasListRegion:   '#familias-list-region',
    },

    triggers: {
      'click button.js-newitem': 'familia:new',
    },

    initialize: function(options) {
      var options = this.options = options || {};
      _.defaults(options, {
        familia: false,
      });
    },

    serializeData: function() {
      return this.options;
    },
  });

  List.FamiliaDetalleView = Marionette.ItemView.extend({
    triggers: {
      'click .js-edit': 'edit',
    },

    getTemplate: function(){
      return utils.templates.RecursosFamiliasDetalle;
    },

    initialize: function() {
      this.listenTo(this.model, 'change', this.render);
    },
  });

  List.NavBarItem = Marionette.ItemView.extend({
    tagName: 'li',

    triggers: {
      'click .js-nav-familia': 'nav',
    },

    getTemplate: function(){
      return utils.templates.RecursosFamiliasNavBarItem;
    },

    initialize: function() {
      this.listenTo(this.model, 'change', this.render);
    },

    templateHelpers: function() {
      return {
        active: this.options.active,
      }
    },
  });

  List.NavBar = Marionette.CollectionView.extend({
    tagName: 'ol',
    className: 'breadcrumb',
    childView: List.NavBarItem,
    childViewEventPrefix: 'nav',

    triggers: {
    },

    getTemplate: function(){
      return utils.templates.RecursosFamiliasHeader;
    },
  });

});

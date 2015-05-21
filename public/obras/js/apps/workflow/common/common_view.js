DocManager.module("WorkflowApp.Common", function(Common, DocManager, Backbone, Marionette, $, _){

  Common.InternalLayout = Marionette.LayoutView.extend({
    getTemplate: function(){
      return utils.templates.InternalLayoutView;
    },
    regions: {
      menuRegion: '#menu-region',
      mainRegion: '#main-region'
    }
  });


  var MenuItem = Marionette.ItemView.extend({
    tagName: 'a',
    className: 'list-group-item',
    template: _.template('<%=title%>'),

    events: {
      'click': 'onClick'
    },

    onClick: function(e){
      e.stopPropagation();
      DocManager.trigger('query:run',this.model);
    }
  });

  Common.MenuView = Marionette.CollectionView.extend({
    tagName: 'div',
    className: 'list-group',
    childView: MenuItem,
    onRender: function(){
      console.log('menu items',this.collection);
    },

    // getTemplate: function(){
    //   return utils.templates.MenuView;
    // },
    events: {
    }
  });

});

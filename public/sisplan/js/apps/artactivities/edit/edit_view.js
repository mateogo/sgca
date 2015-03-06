DocManager.module("ArtActivitiesApp.Edit", function(Edit, DocManager, Backbone, Marionette, $, _){
  
  
  Edit.Layout = Marionette.LayoutView.extend({
    getTemplate: function(){
      return utils.templates.ArtActivityEditLayoutView;
    },
    regions: {
      headerInfo: '#headerinfo-region',
      navbarRegion: '#navbar-region',
      mainRegion: '#main-region'
    }
  });
  
  
  Edit.HeaderInfo = Marionette.ItemView.extend({
    
  });
  
  Edit.NavbarView = Marionette.ItemView.extend({
    
  });
  
  Edit.BasicEditor = Marionette.ItemView.extend({
    tagName: 'div',
    render: function(){
      this.$el.html('editor basico');
    }
  });
  
  
  
});
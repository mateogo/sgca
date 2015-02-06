DocManager.module("ParticipantsApp.List", function(List, DocManager, Backbone, Marionette, $, _){

  List.Layout = Marionette.LayoutView.extend({
    className: 'row row-offcanvas row-offcanvas-left',

    getTemplate: function(){
      return utils.templates.ParticipantListLayoutView;
    },
    
    regions: {
      navbarRegion:  '#navbar-region',
      sidebarRegion: '#sidebar-region',
      linksRegion:   '#panel-region',
      mainRegion:    '#main-region'
    }
  });

  List.ActionNotFound = Marionette.ItemView.extend({
    getTemplate: function(){
      return utils.templates.ActionNotFound;
    }
  })

  List.ParticipantsList = Marionette.CollectionView.extend({
    
  })
  
});
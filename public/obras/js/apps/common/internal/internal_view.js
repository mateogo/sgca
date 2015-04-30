DocManager.module("ObrasApp.Common", function(Common, DocManager, Backbone, Marionette, $, _){
  
  Common.InternalLayout = Marionette.LayoutView.extend({
    getTemplate: function(){
      return utils.templates.InternalLayoutView
    },
    regions: {
      menuRegion: '#menu-region',
      mainRegion: '#main-region'
    }
  });
  
  Common.MenuView = Marionette.ItemView.extend({
    getTemplate: function(){
      return utils.templates.MenuView
    },
    events: {
      'click .js-obras': function(){
        DocManager.trigger("obras:list");
      },
      'click .js-obrasnew': function(){
        DocManager.trigger("obras:new");
      },
      'click .js-solicitudnew': function(){
        DocManager.trigger("licencia:new");
      },
      'click .js-licencias': function(){
        DocManager.trigger("licencia:list");
      }
    }
  });
  
});
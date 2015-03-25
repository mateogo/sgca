DocManager.module("AgendaApp.List", function(List, DocManager, Backbone, Marionette, $, _){
  
  var Entities =  DocManager.module('Entities');
  
  List.Layout = Marionette.LayoutView.extend({
    className: 'row row-offcanvas row-offcanvas-left',

    getTemplate: function(){
      return utils.templates.AgendaLayoutView;
    },
    
    regions: {
      navbarRegion:  '#navbar-region',
      filterRegion:    '#filter-region',
      mainRegion:    '#main-region'
    },
    
    events: {
    }
    
    
  });
  
  var RowView = Marionette.ItemView.extend({
    tagName: 'div',
    getTemplate: function(){
      return utils.templates.AgendaItemRender;
    },
    
    templateHelpers: function(){
      return {
        formatDate: function(date){
          return moment(date).format('LL');
        }
      };
    }
    
  });

  List.Table = Marionette.CollectionView.extend({
    childView: RowView
  });
  
  
  List.FilterPopup = function(filter){
    if(!filter){
      filter = new Entities.ArtActivityFilterFacet();
    }
    var form = new Backbone.Form({model:filter});
    
    var modal = new Backbone.BootstrapModal({
      content: form,
      title: 'Filtrar Actividades Artísticas',
      okText: 'aceptar',
      cancelText: 'cancelar',
      enterTriggersOk: false,
    });
    
    modal.on('ok',function(){
        form.commit();
        DocManager.trigger('artactivities:filter',filter);
    });
    
    modal.open();
  };

});
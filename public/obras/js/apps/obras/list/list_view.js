DocManager.module("ObrasApp.List", function(List, DocManager, Backbone, Marionette, $, _){
  
  var ObrasListRow = Marionette.ItemView.extend({
    tagName: 'tr',
    getTemplate: function(){
      return utils.templates.ObrasListRow
    },
    
    events: {
      'click .js-edit': 'onClickEdit'
    },
    
    onClickEdit: function(){
      DocManager.trigger('obras:edit',this.model);
    }
  });
  
  
  List.ObrasListView =  Marionette.CompositeView.extend({
    childView: ObrasListRow,
    childViewContainer: "tbody",
    getTemplate: function(){
      console.log('template de list')
      return utils.templates.ObrasList
    },
    onRender: function(){
      console.log(this.el);
    }
  });
  
  List.ObraItem = Marionette.ItemView.extend({
    getTemplate: function(){
      return utils.templates.ObraItem
    }
  });
  
  
  var ObrasItemSelection = Marionette.ItemView.extend({
    tagName: 'div',
    getTemplate: function(){
      return utils.templates.ObrasItemSelection
    },
    
    events: {
      'click .js-edit': 'onClickEdit'
    },
    
    onClickEdit: function(){
    }
  });
  
  List.ObrasListSelector = Marionette.CollectionView.extend({
    tagName: 'div',
    childView: ObrasItemSelection
  });
  
  
  List.selector = function(callback,collection){
    
    var list = new List.ObrasListSelector({collection:collection});
    list.render();
    
    var modal = new Backbone.BootstrapModal({
      content: list,
      title: 'Seleccione las obras',
      okText: 'Listo',
      cancelText: 'cancelar',
      enterTriggersOk: false,
    });
    
    modal.on('ok',function(){
      callback([]);
    });
    
    modal.open();
  }
  
});
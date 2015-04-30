DocManager.module("SolicitudApp.List", function(List, DocManager, Backbone, Marionette, $, _){
  
  var SolicitudListRow = Marionette.ItemView.extend({
    tagName: 'tr',
    getTemplate: function(){
      return utils.templates.SolicitudListRow
    },
    
    events: {
      'click .js-edit': 'onClickEdit'
    },
    
    onClickEdit: function(){
      DocManager.trigger('licencia:edit',this.model);
    }
  });
  
  
  List.SolicitudListView =  Marionette.CompositeView.extend({
    childView: SolicitudListRow,
    childViewContainer: "tbody",
    getTemplate: function(){
      console.log('template de list')
      return utils.templates.SolicitudList
    },
    onRender: function(){
      console.log(this.el);
    }
  });
  
  
  
  
});
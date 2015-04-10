DocManager.module("SolicitudApp.Edit", function(Edit, DocManager, Backbone, Marionette, $, _){
    
  Edit.SolicitudEditorView =  Marionette.ItemView.extend({
    getTemplate: function(){
      return utils.templates.SolicitudEditor
    },
    onRender: function(){
      this.$el.find('#wizard').wizard();
    }
  });
  
});
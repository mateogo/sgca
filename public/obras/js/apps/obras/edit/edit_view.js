DocManager.module("ObrasApp.Edit", function(Edit, DocManager, Backbone, Marionette, $, _){
    
  Edit.ObrasEditorView =  Marionette.ItemView.extend({
    getTemplate: function(){
      return utils.templates.ObrasEditor
    },
    onRender: function(){
      this.$el.find('#wizard').wizard();
    }
  });
  
});
DocManager.module("DocsApp.Show", function(Show, DocManager, Backbone, Marionette, $, _){
  Show.MissingDocument = Marionette.ItemView.extend({
    template: _.template('<div class="alert alert-error">This contact does not exist</div>'),
  });

  Show.Document = Marionette.ItemView.extend({
   getTemplate: function(){
      return utils.templates.DocumShowDef;
    },
 
    events: {
      "click a.js-edit": "editClicked"
    },

    editClicked: function(e){
      e.preventDefault();
      this.trigger("document:edit", this.model);
    }
  });
});

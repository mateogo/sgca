DocManager.module("DocsApp.Show", function(Show, DocManager, Backbone, Marionette, $, _){
  Show.Controller = {

    showDocument: function(model){
      console.log('showDocument [%s]',model.id);
      
      var fetchingDocument = DocManager.request("document:entity", model.id);
      $.when(fetchingDocument).done(function(document){
        var documentView;
        if(document !== undefined){
          documentView = new Show.Document({
            model: document
          });

          documentView.on("document:edit", function(document){
            DocManager.trigger("document:edit", document.id);
          });
        }
        else{
          documentView = new Show.MissingDocument();
        }

        DocManager.mainRegion.show(documentView);
      });
    }
  }
});

DocManager.module("DocsApp.Edit", function(Edit, DocManager, Backbone, Marionette, $, _){

  Edit.Controller = {
    editDocument: function(id){
      console.log('DocsAPP.Edit.Controller.editDocument');

      var documLayout = new Edit.Layout();
      var documNavBar = initNavPanel();
      var fetchingDocument = DocManager.request("document:entity", id);
     
      $.when(fetchingDocument).done(function(document){
        console.log('fetchingDocument callback [%s]',document.get('slug'));

        var documEditView = new Edit.Document({
          model: document
        });
        registerDocumEditEvents(documEditView);

        documLayout.on("show", function(){
          documLayout.navbarRegion.show(documNavBar);
          documLayout.mainRegion.show(documEditView);
        });

        DocManager.mainRegion.show(documLayout);
            
      });
    }
  }
  var registerDocumEditEvents = function(view) {

    view.on("form:submit", function(model){
      model.update(function(err,model){
        if(err){
          view.triggerMethod("form:data:invalid", err);
        }else{
          DocManager.trigger("document:edit", model);
        }
      });

    });

  };

  var registerHeadersEvents = function(hview){
      hview.on("itemview:document:new", function(childView){
        console.log('initNavPanel BUBLING');
        var self = this,
            facet = new DocManager.Entities.DocumCoreFacet(),
            form = new Backbone.Form({
                model: facet,
            });

        form.on('change', function(form, contenidoEditor) {
            console.log('form: on:change');
            var errors = form.commit();
        });
            
        var modal = new Backbone.BootstrapModal({
            content: form,
            title: 'Alta rápida comprobantes',
            okText: 'aceptar',
            cancelText: 'cancelar',
            animate: false
        });

        modal.open(function(){
            var errors = form.commit();
            console.log('close: [%s]',facet.get('slug'));
            facet.createNewDocument(function(err, model){
              DocManager.trigger("documents:list");
            });
        });
      });
  };

  var initNavPanel = function(){
      var links = DocManager.request("docum:nav:entities");
      console.log('initNavPanel BEGINS  [%s]', links.length);

      var headers = new Edit.NavPanel({collection: links});
      registerHeadersEvents(headers);

      return headers;
  };

});





/*
      var loadingView = new DocManager.Common.Views.Loading({
        title: "Artificial Loading Delay",
        message: "Data loading is delayed to demonstrate using a loading view."
      });      
      DocManager.mainRegion.show(loadingView);
*/
/*
      var fetchingDocument = DocManager.request("document:entity", id);   
      $.when(fetchingDocument).done(function(document){
        var view;
        if(document !== undefined){
          view = new Edit.Document({
            model: document,
            generateTitle: true
          });

          view.on("form:submit", function(data){
            if(document.save(data)){
              DocManager.trigger("document:show", document.get("id"));
            }
            else{
              view.triggerMethod("form:data:invalid", document.validationError);
            }
          });
        }
        else{
          view = new DocManager.DocsApp.Show.MissingDocument();
        }

        DocManager.mainRegion.show(view);
      });

*/


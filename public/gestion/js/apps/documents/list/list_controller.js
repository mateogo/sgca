DocManager.module("DocsApp.List", function(List, DocManager, Backbone, Marionette, $, _){

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

      var headers = new List.NavPanel({collection: links});
      registerHeadersEvents(headers);

      return headers;
  };

  List.Controller = {
    listDocuments: function(criterion){
      console.log('DocsAPP.List.Controller.listdocuments');
      // indicación de espera:
      // var loadingView = new DocManager.Common.Views.Loading();
      // DocManager.mainRegion.show(loadingView);

      var documLayout = new List.Layout();
      var documNavBar = initNavPanel();

      DocManager.request("document:filtered:entities", criterion, function(documents){
        console.log('callback from REQUEST: [%s]',documents.length);

/*        documNavBar.once("show", function(){
          documNavBar.triggerMethod("set:filter:criterion", criterion);
        });
*/
        var documentsListView = new List.Documents({
          collection: documents
        });
        registerDocumListEvents(documentsListView);

/*        documNavBar.on("documents:filter", function(filterCriterion){
          filteredDocuments.filter(filterCriterion);
          DocManager.trigger("documents:filter", filterCriterion);
        });
*/

        documLayout.on("show", function(){
          console.log('on show');
          documLayout.navbarRegion.show(documNavBar);
          documLayout.mainRegion.show(documentsListView);
        });

        DocManager.mainRegion.show(documLayout);

      });
    }
  };


  var registerDocumListEvents = function(documentsListView) {
        
        documentsListView.on("itemview:document:show", function(childView, model){
          DocManager.trigger("document:show", model);
        });

        documentsListView.on("itemview:document:edit", function(childView, model){
          DocManager.trigger("document:edit", model);
        });

        documentsListView.on("itemview:document:delete", function(childView, model){
          model.destroy();
        });
  };

});

/*

          var view = new DocManager.DocsApp.Edit.Document({
            model: model
          });

          view.on("form:submit", function(data){
            if(model.save(data)){
              childView.render();
              view.trigger("dialog:close");
              childView.flash("success");
            }
            else{
              view.triggerMethod("form:data:invalid", model.validationError);
            }
          });

          DocManager.dialogRegion.show(view);


*/

/*
  var setActiveHeader = function(headerUrl){
      console.log('Set Active Header headerUrl [%s]',headerUrl);
      var links = DocManager.request("header:entities");
      var headerToSelect = links.find(function(header){ return header.get("url") === headerUrl; });
      headerToSelect.select();
      links.trigger("reset");
  };
*/

/*
      headers.on("itemview:document:new", function(childView){
        console.log('initNavPanel BUBLING');
        //var trigger = model.get("navigationTrigger");
        //DocManager.trigger(trigger);

          var newDocument = new DocManager.Entities.Comprobante();

          var view = new DocManager.DocsApp.New.Document({
            model: newDocument
          });

          view.on("form:submit", function(data){
            var highestId = documents.max(function(c){ return c.id; }).get("id");
            data.id = highestId + 1;
            if(newDocument.save(data)){
              documents.add(newDocument);
              view.trigger("dialog:close");
              var newDocumentView = documentsListView.children.findByModel(newDocument);
              // check whether the new document view is displayed (it could be
              // invisible due to the current filter criterion)
              if(newDocumentView){
                newDocumentView.flash("success");
              }
            }
            else{
              view.triggerMethod("form:data:invalid", newDocument.validationError);
            }
          });
          DocManager.dialogRegion.show(view);
      });
*/

/*        documNavBar.on("document:new", function(){
          var newDocument = new DocManager.Entities.Document();

          var view = new DocManager.DocsApp.New.Document({
            model: newDocument
          });

          view.on("form:submit", function(data){
            var highestId = documents.max(function(c){ return c.id; }).get("id");
            data.id = highestId + 1;
            if(newDocument.save(data)){
              documents.add(newDocument);
              view.trigger("dialog:close");
              var newDocumentView = documentsListView.children.findByModel(newDocument);
              // check whether the new document view is displayed (it could be
              // invisible due to the current filter criterion)
              if(newDocumentView){
                newDocumentView.flash("success");
              }
            }
            else{
              view.triggerMethod("form:data:invalid", newDocument.validationError);
            }
          });

          DocManager.dialogRegion.show(view);
        });
*/

/*
      headers.on("brand:clicked", function(){
        console.log('initNavPanel: brand:clicked');
        //DocManager.trigger("documents:list");
      });

      headers.on("itemview:navigate", function(childView, model){
        var trigger = model.get("navigationTrigger");
        DocManager.trigger(trigger);
      });
*/      
/*            productmodel.insertCapitulos(dao.pacapitulosfacet.getContent(),function(){
                self.beforeSave();
                console.log('formcapitulos:productdetails, ready to RELOAD CHAPTERS [%s]','productos/' + productmodel.id);
                self.renderChilds();
                //utils.approuter.navigate('productos/' + productmodel.id, {trigger: true, replace: false});
            });
*/



DocManager.module("DocsApp.List", function(List, DocManager, Backbone, Marionette, $, _){

  var registerHeadersEvents = function(hview, layout){
      hview.on("itemview:document:new", function(childView){
        DocManager.DocsApp.Edit.createInstance(this);
      });

      hview.on("itemview:documents:list", function(childView, model){
        var trigger = model.get("navigationTrigger");
        DocManager.trigger(trigger);
      });

      hview.on("documents:filtered:list", function(criteria){
        console.log('filtered list [%s]',criteria)

        DocManager.request("document:filtered:entities", criteria, function(documents){
          console.log('Filtered CALLBACK: [%s]',documents.length);
          var documentsListView = new List.Documents({
            collection: documents
          });
          registerDocumListEvents(documentsListView);
            layout.mainRegion.show(documentsListView);
          });
      });

      hview.on('document:search',function(query, cb){
        console.log('list_controller: document:search EVENT');

        DocManager.request("document:query:search",query, function(model){
          if(model){
            Edit.Session.layout.close();
            DocManager.trigger("document:edit", model);
          }
        });      

      });

  };

  var initNavPanel = function(layout){
      var links = DocManager.request("docum:nav:entities");
      //console.log('initNavPanel BEGINS  [%s]', links.length);

      var headers = new DocManager.DocsApp.Common.Views.NavPanel({collection: links});
      registerHeadersEvents(headers, layout);

      return headers;
  };

  List.Controller = {
    listDocuments: function(criterion){
      console.log('DocsAPP.List.Controller.listdocuments');
      // indicación de espera:
      // var loadingView = new DocManager.Common.Views.Loading();
      // DocManager.mainRegion.show(loadingView);

      var documLayout = new List.Layout();
      var documNavBar = initNavPanel(documLayout);
      List.Session = {};

      DocManager.request("document:filtered:entities", criterion, function(documents){
        console.log('ListDocuments BEGINS: [%s]',documents.length);
        utils.documListTableHeader[6].flag=0;
        utils.documListTableHeader[7].flag=0;
        utils.documListTableHeader[3].flag=0;
        utils.documListTableHeader[2].flag=1;


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

        List.Session.layout = documLayout;
        documLayout.on("show", function(){
          documLayout.navbarRegion.show(documNavBar);
          documLayout.mainRegion.show(documentsListView);
        });

        DocManager.mainRegion.show(documLayout);

      });
    }
  };


  var registerDocumListEvents = function(documentsListView) {
        
        documentsListView.on("itemview:document:show", function(childView, model){
          var documid = model.id || model.get('documid');
          DocManager.trigger("document:show", documid);
        });

        documentsListView.on("itemview:document:edit", function(childView, model){
          DocManager.trigger("document:edit", model);
        });

        documentsListView.on("itemview:document:delete", function(childView, model){
          model.destroy();
        });


  };


  var API = {
    searchDocuments: function(squery, cb){
      console.log('LIST CONTROLLER searchDocuments API called: query:[%s]', squery)
      if(!List.Session.query) List.Session.query = {};
      
      List.Session.query.slug = squery;

      List.queryForm(List.Session.query, function(qmodel){
        
        List.Session.query = qmodel.attributes;

        console.log('callback: [%s] [%s] [%s]',qmodel.get('fedesde'),qmodel.get('resumen'),qmodel.get('tipocomp'));
  
        DocManager.request("document:query:entities", qmodel.attributes, function(documents){
          utils.documListTableHeader[6].flag=1;
          utils.documListTableHeader[7].flag=1;
          utils.documListTableHeader[3].flag=1;
          utils.documListTableHeader[2].flag=0;

          var documentsListView = new List.Documents({
            collection: documents
          });
          console.log('mainRegion SHOW')
          registerDocumListEvents(documentsListView);
          List.Session.layout.mainRegion.show(documentsListView);
        });


      });
      //Edit.modalSearchEntities('documents', query, function(model){
      //  cb(model);
      //});
    },
    searchPersons: function(query, cb){
      Edit.modalSearchEntities('persons', query, function(model){
        cb(model);
      });
    },
    searchProducts: function(query, cb){
      Edit.modalSearchEntities('products', query, function(model){
        cb(model);
      });
    },
  };

  DocManager.reqres.setHandler("document:query:search", function(query, cb){
    API.searchDocuments(query, cb);
  });

  DocManager.reqres.setHandler("person:search", function(query, cb){
    API.searchPersons(query, cb);
  });

  DocManager.reqres.setHandler("product:search", function(query, cb){
    API.searchProducts(query, cb);
  });

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



DocManager.module("DocsApp.Edit", function(Edit, DocManager, Backbone, Marionette, $, _){

  Edit.Controller = {
    editDocument: function(id){
      console.log('DocsAPP.Edit.Controller.editDocument');

      var documLayout = new Edit.Layout();
      var documNavBar = initNavPanel();
      var fetchingDocument = DocManager.request("document:entity", id);
     
      $.when(fetchingDocument).done(function(document){
        Edit.Session = {};

        console.log('fetchingDocument callback [%s]',document.get('slug'));
    
        Edit.Session.model = document;
        registerDocumentEntity(document);

        var documEditView = new Edit.Document({
          model: document
        });
        registerDocumEditEvents(documEditView);

        var documItemsView = new DocManager.DocsApp.Common.Views.SidebarPanel({
          itemView: DocManager.DocsApp.Common.Views.SidebarItem,
          collection: Edit.Session.items 
        });
        registerDocumItemsView(documItemsView);

        //var searchItemsView = new Edit.Search();

        Edit.Session.layout = documLayout;
        documLayout.on("show", function(){
          documLayout.navbarRegion.show(documNavBar);
          documLayout.mainRegion.show(documEditView);
          documLayout.sidebarRegion.show(documItemsView);
        });

        DocManager.mainRegion.show(documLayout);
            
      });
    }
  }
  var registerDocumItemsView = function(view){
    view.on('itemview:item:edit',function(childView, model){
      console.log('Parte tecnico BEGINS:[%s] [%s]',model.get('fecomp'),model.whoami);
      var ptecnico = new Edit.PTecnico({
        model: model,
      });
      ptecnico.on('product:select',function(query,cb){
        console.log('desde el CONTROLLER');

        DocManager.request("product:search",function(model){
          cb(model);
        });      

      });
      ptecnico.on("form:submit", function(model){
        console.log('form:submit [%s]',model.whoami,model.get('slug'));
        Edit.Session.model.insertItemCollection(Edit.Session.items);
        Edit.Session.model.update(function(err,model){
          if(err){
            ptecnico.triggerMethod("form:data:invalid", err);
          }else{
            ptecnico.close();
          }
        });
      });

      Edit.Session.layout.itemEditRegion.show(ptecnico);
    });

  };

  var registerDocumentEntity = function(model) {
    Edit.Session.items = new DocManager.Entities.DocumItemsCollection (model.get('items'));
    Edit.Session.items.on('add',function(model, collection){
      Edit.Session.model.insertItemCollection(collection);
    });


  };

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
        DocManager.DocsApp.Edit.createInstance(this);
      });

      hview.on("itemview:document:item:new", function(childView){
        DocManager.DocsApp.Edit.createItem(Edit.Session.model);
      });

      hview.on("itemview:documents:list", function(childView, model){
        var trigger = model.get("navigationTrigger");
        DocManager.trigger(trigger);
      });
  };

  var initNavPanel = function(){
      var links = DocManager.request("docum:edit:entities");
      console.log('initEDIT-NavPanel BEGINS  [%s]', links.length);

      var headers = new DocManager.DocsApp.Common.Views.NavPanel({collection: links});
      //var headers = new Edit.NavPanel({collection: links});
      registerHeadersEvents(headers);

      return headers;
  };

  var API = {
    searchDocuments: function(cb){
      Edit.modalSearchEntities('documents', function(model){
        cb(model);
      });
    },
    searchPersons: function(cb){
      Edit.modalSearchEntities('persons', function(model){
        cb(model);
      });
    },
    searchProducts: function(cb){
      Edit.modalSearchEntities('products', function(model){
        cb(model);
      });
    },
  };

  DocManager.reqres.setHandler("document:search", function(cb){
    API.searchDocuments(cb);
  });

  DocManager.reqres.setHandler("person:search", function(cb){
    API.searchPersons(cb);
  });

  DocManager.reqres.setHandler("product:search", function(cb){
    API.searchProducts(cb);
  });

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


DocManager.module("DocsApp.SolEdit", function(SolEdit, DocManager, Backbone, Marionette, $, _){

  SolEdit.Controller = {
    editDocument: function(id){
      console.log('77777777777777777 SolEDIT');

      var documLayout = new SolEdit.Layout();
      var documNavBar = initNavPanel();
      var fetchingDocument = DocManager.request("document:entity", id);
     
      $.when(fetchingDocument).done(function(document){

        // Es editable?
        if(document.get('tipocomp')==='pdiario'){
          return;
        }
        // End: Es editable?


        SolEdit.Session = {};
        registerDocumentEntity(document);
    
        SolEdit.Session.model = document;
        (document);

        var documEditView = new SolEdit.Document({
          model: document
        });
        registerDocumEditEvents(documEditView);

        var documItemsView = new DocManager.DocsApp.Common.Views.SidebarPanel({
          itemView: DocManager.DocsApp.Common.Views.SidebarItem,
          collection: SolEdit.Session.items 
        });

        registerDocumItemsView(documItemsView);

        //var searchItemsView = new SolEdit.Search();

        SolEdit.Session.layout = documLayout;
        documLayout.on("show", function(){
          documLayout.navbarRegion.show(documNavBar);
          documLayout.mainRegion.show(documEditView);
          documLayout.sidebarRegion.show(documItemsView);
                      console.log('Aloooo3?')
        });

        DocManager.mainRegion.show(documLayout);
            
      });
    }
  }
  var registerDocumItemsView = function(view){
    view.on('itemview:item:edit',function(childView, itemmodel){
      console.log('ITEM EDIT BEGINS:[%s] - [%s]',itemmodel.get('tipoitem'),itemmodel.whoami);

      if(true){
        var itemlayout = new SolEdit.ItemLayout();
        var itemheader = new SolEdit.ItemHeader({
          model: itemmodel,
          itemtype: itemmodel.get('tipoitem')
        });


        itemheader.on("form:submit", function(model){
          SolEdit.Session.model.insertItemCollection(SolEdit.Session.items);
          SolEdit.Session.model.update(function(err,model){
            if(err){
              itemheader.triggerMethod("form:data:invalid", err);
            }else{
              itemheader.close();
            }
          });
        });

        // a laburar
        SolEdit.Session.sitcollection = fetchPTItemsCollection(itemmodel);

        var sitview = subItemFactoryView(itemmodel, SolEdit.Session.sitcollection);

        // caso particular cuando se trata de un Parte de Emision
        if(itemmodel.get('tipoitem')==='pemision'){
          loadProductChilds(SolEdit.Session.sitcollection, itemmodel);
        }

        // para cuando selecciona un articulo
        itemheader.on('product:select',function(query, cb){
          DocManager.request("product:search", query, function(product){

            if(itemmodel.get('tipoitem')==='pemision'){
              if(product.get('tipoproducto')==='paudiovisual'){
                addProductsToCollection(SolEdit.Session.sitcollection, itemmodel, new DocManager.Entities.ProductChildCollection(product) );
              }

              product.loadchilds(product, {'es_coleccion_de.id': product.id},function(products){
                addProductsToCollection(SolEdit.Session.sitcollection, itemmodel, products );
                cb(product);
              });
            }else{
              cb(product);
            }
          });      
        });

        // para cuando selecciona una person desde el item
        itemheader.on('person:select',function(query, cb){
          DocManager.request("person:search", query, function(model){
            cb(model);
          });      
        });

        sitview.on("sit:form:submit",function(){
          //console.log('sit:form:submit');

          var siterr = false;
          sitview.children.each(function (view){
            var err = view.model.validate(view.model.attributes);
            view.onFormDataInvalid((err||{}));
            if(err) siterr = true;
          });

          if(!siterr){
            itemmodel.insertItemCollection(SolEdit.Session.sitcollection);
            SolEdit.Session.model.insertItemCollection(SolEdit.Session.items);

            SolEdit.Session.model.update(function(err,model){
              if(err){
                itemheader.triggerMethod("form:data:invalid", err);
              }else{
                itemlayout.close();
              }
            });
          }
        });

        sitview.on("itemview:itemview:date:select",function(viewp, viewc, model,cb){
          selectDate(model,viewp,cb);
        });

        sitview.on("itemview:sit:remove:item",function(view, model){
          removeItemFromCol(model, SolEdit.Session.sitcollection);
        });

        sitview.on('itemview:product:select',function(view, query, cb){
          DocManager.request("product:search", query, function(model){
            cb(model);
          });      
        });


        // Agregar SubItem 
        itemlayout.on("sit:add:item", function(){
          addEmptyItemToCol(itemmodel, SolEdit.Session.sitcollection);
        });

        itemlayout.on("show", function(){
            itemlayout.ptheaderRegion.show(itemheader);
            itemlayout.ptlistRegion.show(sitview);
        });

        itemlayout.on("form:submit", function(){
          sitview.triggerMethod("form:submit");
        });

        SolEdit.Session.layout.itemEditRegion.show(itemlayout);

      }//tipoitem === ptecnico

    }); //view.on item:edit

  };

  var subItemFactoryView = function(itemmodel, subItemCol){

    if(itemmodel.get('tipoitem')==='pemision'){
      return ( new SolEdit.PEmisionList({
              collection: subItemCol,
              itemtype: itemmodel.get('tipoitem')
            }));
    }else {
      return ( new SolEdit.PTecnicoList({
              collection: subItemCol,
              itemtype: itemmodel.get('tipoitem')
            }));
    }
  };

  var selectDate = function(model,view, cb){
    //console.log('model SELECT DATE: [%s][%s][%s]',model.get('hourmain'),view.model.get('productid'),model.schema.chapter.options);
    if(view.model.get('productid')){
      var product = new DocManager.Entities.Product({_id: view.model.get('productid')});

      product.fetch({success: function(product) {           
        //console.log('product FETCH OK , [%s]',product.id,product.get('slug'));
        product.loadchilds(product, {'es_capitulo_de.id': product.id},function(products){
          //console.log('product loadchilds, [%s]',products.length);
          model.schema.chapter.options = buildChaptersOpstionList(products);
          loadModalForm(model,view,cb)
          //addProductsToCollection(sitcol, model, products );
        });
      }});
    }else{
      loadModalForm(model,view,cb)
    }
  };
  var buildChaptersOpstionList = function(list){
    var optionList = [];
    list.each(function(pr){
      optionList.push({
          val:pr.get('productcode'),label:pr.get('slug')    
      });
    })
    return optionList;
  };

  var loadModalForm = function(model,view,cb){

      SolEdit.pemisHourEdit(model,function(model){
        model.updateData();
        if(cb) cb(model);
      });
  }


  var loadProductChilds = function(sitcol,model){
    if(!model.get('productid'))return;
    //console.log('loadProductChilds [%s][%s]',model.get('product'),model.get('productid'));

    var product = new DocManager.Entities.Product({_id: model.get('productid')});

    product.fetch({success: function() {           
      product.loadchilds(product, {'es_coleccion_de.id': product.id},function(products){
        addProductsToCollection(sitcol, model, products );
      });
    }});
  };

  var addProductsToCollection = function (sitcol, model, products ){
    //console.log('addProductToCollectin: [%s]',products.length);
    if(products.length){
      products.each(function(pr){
        var found = sitcol.find(function(sit){
          return sit.get('productid')===pr.id;
        })
        if(!found){
          var item = new DocManager.Entities.DocumParteEMItem({product:pr.get('productcode'),pslug:pr.get('slug'),productid: pr.id});
          item.set({emisiones: item.initDatesArray()});
          sitcol.add(item);          
        }
      });
      //inspectCol(sitcol);
    }
  };
  var inspectCol = function(col){
    console.log('========= INSPECT COL =============')
    col.each(function(model){
      console.log('Collection: [%s] [%s]',model.get('pslug'),model.get('emisiones').length);

    });
  };

  var fetchPTItemsCollection = function(model){
    return model.getItems();
  };


  var removeItemFromCol = function(model, col){
    col.remove(model);
  };

  var addEmptyItemToCol = function(model, col){
    //var sitmodel = new DocManager.Entities.DocumParteTecnicoItem();
    var sitmodel = model.initNewItem();
    col.add(sitmodel);
  };

  var registerDocumentEntity = function(model) {
    SolEdit.Session.items = new DocManager.Entities.DocumItemsCollection (model.get('items'));
    SolEdit.Session.items.on('add',function(model, collection){
      SolEdit.Session.model.insertItemCollection(collection);
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

    view.on('person:select',function(query, cb){
      DocManager.request("person:search", query, function(model){
        cb(model);
      });      

    });

  };

  var fetchPrevNextDocument = function (ename, query, cb){
    var qmodel;
    if(query) qmodel = new DocManager.Entities.Comprobante({cnumber:query});
    else qmodel = SolEdit.Session.model;
    DocManager.request(ename,qmodel, function(model){
      if(model){
        SolEdit.Session.layout.close();
        DocManager.trigger("document:edit", model);
      }
    });
  };

  var registerHeadersEvents = function(hview){

      hview.on("itemview:document:new", function(childView){
        DocManager.DocsApp.SolEdit.createInstance(this);
      });

      hview.on("itemview:document:item:new", function(childView){
        DocManager.DocsApp.SolEdit.createItem(SolEdit.Session.model);
      });

      hview.on("itemview:documents:list", function(childView, model){
        var trigger = model.get("navigationTrigger");
        DocManager.trigger(trigger);
      });

      hview.on('document:search',function(query, cb){
        console.log('edit_controller: document:search EVENT');
        DocManager.request("document:search",query, function(model){
          if(model){
            SolEdit.Session.layout.close();
            DocManager.trigger("document:edit", model);
          }
        });      

      });

      hview.on('document:fetchprev', function(query, cb){
        fetchPrevNextDocument("document:fetchprev",query,cb);
      });

      hview.on('document:fetchnext', function(query, cb){
        fetchPrevNextDocument("document:fetchnext",query,cb);
      });

  };

  var initNavPanel = function(){
      var links = DocManager.request("docum:edit:entities");

      var headers = new DocManager.DocsApp.Common.Views.NavPanel({collection: links});
      //var headers = new SolEdit.NavPanel({collection: links});
      registerHeadersEvents(headers);

      return headers;
  };

  var API = {
    searchDocuments: function(query, cb){
      SolEdit.modalSearchEntities('documents', query, function(model){
        cb(model);
      });
    },
    searchPersons: function(query, cb){
      SolEdit.modalSearchEntities('persons', query, function(model){
        cb(model);
      });
    },
    searchProducts: function(query, cb){
      SolEdit.modalSearchEntities('products', query, function(model){
        cb(model);
      });
    },
  };

  DocManager.reqres.setHandler("document:search", function(query, cb){
    API.searchDocuments(query, cb);
  });

  DocManager.reqres.setHandler("person:search", function(query, cb){
    API.searchPersons(query, cb);
  });

  DocManager.reqres.setHandler("product:search", function(query, cb){
    API.searchProducts(query, cb);
  });

});

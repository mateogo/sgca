DocManager.module("DocsApp.Edit", function(Edit, DocManager, Backbone, Marionette, $, _){

  Edit.Controller = {
    editDocument: function(id){
      console.log('DocsAPP.Edit.Controller.editDocument');
      dao.gestionUser.getUser(DocManager, function (user){
        if(user){
          var fetchingDocument = DocManager.request("document:entity", id);
         
          $.when(fetchingDocument).done(function(document){

            DocManager.request('mica:fetch:document:profile', document, user, function(profiles){
              if(profiles.length){
                mainProcessStart(document, profiles.at(0), user);
              }else{
                DocManager.trigger('mica:rondas');
              }
            });                
          });
 
        }else{
          DocManager.trigger('mica:rondas');
        }
      });
    },

    addDocument: function(){
      console.log('add Document START')
      dao.gestionUser.getUser(DocManager, function (user){
        if(user){
          DocManager.request('mica:fetch:active:profile', user, 'mica2015', function(profiles){
            console.log('Fetch cb: [%s]', profiles.length)
            if(profiles.length){
              DocManager.trigger('document:edit', profiles.at(0).get('documid'));

            }else{
              console.log('DocsAPP.Edit.Controller.editDocument');
              var document = new DocManager.Entities.Comprobante();
              var profile = new DocManager.Entities.Micaprofile();
              // init
              mainProcessStart(document, profile, user);
            }
          });

        }else{
          DocManager.trigger('mica:rondas');
        }
      });
    }
  };

  var mainProcessStart = function(document, profile, user){
    Edit.Session = {};

    Edit.Session.user = user;
    Edit.Session.document = document;
    Edit.Session.profile = profile;

    DocManager.request('user:load:persons', user, 'es_usuario_de', function(person){
      if(person){
        Edit.Session.person = person;
        console.log('Bingo: usuario_de :[%s]', Edit.Session.person.get('displayName'))
      }else{
        Edit.Session.person = null;
      }
    });

    DocManager.request('user:load:persons', user, 'es_representante_de', function(person){
      if(person){
        Edit.Session.empresa = person;
      }else{
        Edit.Session.empresa = null;
      }
    });

    moduleRenderViews(document, profile, user);


  };

  // START RENDERING ======================================
  var moduleRenderViews = function(document, profile, user){
    var documLayout = new Edit.Layout();
    Edit.Session.layout = documLayout;
    Edit.Session.views = {};

    registerDocumentEntity(profile, user);

    var documEditView = new Edit.Document({
      model: Edit.Session.model
    });

    registerDocumEditEvents(documEditView);


    documLayout.on("show", function(){
      documLayout.mainRegion.show(documEditView);
    });

    DocManager.mainRegion.show(documLayout);
  };

  var saveManager = function(){
    console.log('Ready to SAVE ALL');
    savePersons(Edit.Session.user, Edit.Session.model, function(user){
      console.log('SaveManager CB from User');
      saveComprobante(Edit.Session.user, Edit.Session.model, function(document){
        console.log('SaveDocument CB');
        saveInscripcion(Edit.Session.user, document, Edit.Session.perfilinscripto, function(inscripcion){
          console.log('SaveInscripcion CB');
        });
      });
    });
  };

  var saveInscripcion = function(user, comprobante, perfil, cb){
		var col = Edit.Session.representantes;
		Edit.Session.model.updateRepresentantes(col)
    Edit.Session.model.saveInscripcion(user, comprobante, perfil, function(error, perfil){
      console.log('Docum Saved:');
      cb(perfil);
    })
  };

  var saveComprobante = function(user, model, cb){
    Edit.Session.document.saveInscripcion(user, model, function(error, document){
      console.log('Docum Saved:');
      cb(document);
    })
  };

  //@param: model //es el facet que se está editando
  var savePersons = function(user, model, cb){
    // conditions: existe un user, pero puede o no tener dado de alta la person
    // Resuelve: la inserción de la person (update o new) y la actualización de user.
    console.log('SavePersons User:[%s] Model:[%s]', user.whoami, model.whoami);
    var person_attrs = {},
        emp_attrs = {};

    person_attrs.displayName = model.get('rname');
    person_attrs.dni = model.get('rdni');
    person_attrs.fenac = model.get('rfenac');
    person_attrs.description = model.get('rcargo');


    emp_attrs.displayName = model.get('edisplayName');
    emp_attrs.nickName = model.get('edisplayName');
    emp_attrs.name = model.get('ename');
    emp_attrs.description = model.get('edescription');
    emp_attrs.cuit = model.get('ecuit');
    emp_attrs.ecp = model.get('ecp');
    emp_attrs.eweb = model.get('eweb');
    emp_attrs.fundacion = model.get('efundacion');
    emp_attrs.empleados = model.get('enumempleados');
    emp_attrs.ventaanual = model.get('eventas');
    emp_attrs.contactinfo = [
      {
        tipocontacto: 'direccion',
        subcontenido: 'principal',
        contactdata: model.get('edomicilio')+', '+model.get('elocalidad')+', '+model.get('eprov')
      },
      {
        tipocontacto: 'mail',
        subcontenido: 'trabajo',
        contactdata: model.get('email')
      }
    ];

    user.updateRelatedPredicate(person_attrs, 'es_usuario_de', function(per){
      user.updateRelatedPredicate(emp_attrs, 'es_representante_de', function(per){
        if(cb) cb(user);
      })
    });
  };





  var registerDocumentEntity = function(profile, user) {
    console.log('profile[%s]', profile.whoami)
    Edit.Session.perfilinscripto = profile;

    Edit.Session.model = profile.facetFactory(user);

    Edit.Session.representantes = Edit.Session.model.getRepresentantes();
//ojo ver
    Edit.Session.representantes.on('add',function(model, collection){
      console.log('COLECCION ADD: agregando nuevo model en la coleccion')
      Edit.Session.model.updateRepresentantes(collection);
    });    
		


  };
	
  var editReqDetail = function(view, isNew, itemDetail){
      console.log('editReqDetail: BEGIN isNew:[%s] items so far:[%s]', isNew,Edit.Session.representantes.length);
      if(isNew){
        itemDetail = new Edit.Session.model.initNewItem();

      }

      var actor = new Edit.NewRepresentante({
        model: itemDetail,
      });

      actor.on('details:form:submit', function(model, cb){
        console.log('Alta BUBLING [%s][%s]', model.get('nombreyape'), model.whoami);
        //var error = model.validate();

        if(isNew){
//          console.log('esnuevo',model);
          Edit.Session.representantes.add(model);
        }        
        console.log('AFTER UPDATING EditSessionItems:  [%s]',Edit.Session.representantes.length)

        //Edit.Session.views.sidebarItemsView.render();
        renderSOLDetails(Edit.Session.views.mainView);
        view.itemFormBtnShow();
        cb();

      });
      //console.log('render',actor.render().el)
      view.$('#nuevo-req-form').html(actor.render().el);

  };

  var registerDocumEditEvents = function(view) {
    Edit.Session.views.mainView = view;

    view.on("sitem:edit", function(model){
      editReqDetail(view, true);

    });
		
    view.on('render', function(){
      console.log('editEvents RENDER')
      renderSOLDetails(view);

    });

    // =========== grabación =============
    view.on("form:submit", function(model){
     saveManager();

    });   
		

    view.on('person:select',function(query, cb){
      DocManager.request("person:search", query, function(model){
        cb(model);
      });      

    });

    view.on('user:validate',function(view, usermail, cb){
      var msgs = '';
      fetchUserByUsername(usermail, function(user){
        msgs = getUserMessage(user);
        if(cb) cb(user, msgs);
      })

    });

  };
    


  var renderSOLDetails = function (view){
      console.log('editEvents SOL Details RENDER');
        // a laburar
      //Edit.Session.sitcollection = fetchPTItemsCollection(Edit.Session.model);
      
      var sitview = new DocManager.DocsApp.Common.Views.SidebarCompositePanel({
        collection: Edit.Session.representantes,
        model: Edit.Session.model,
        itemtype: 'insdetails',
      });
      console.log('aca vamos');
      sitview.listenTo(sitview.collection, 'add', sitview.render);
      console.log('aca vamos2');
      view.$('#soldetails-region').html(sitview.render().el);
      console.log('aca vamos3');

  };













/////*************************** old stufff **********************



  var registerDocumSidebarItemsView = function(view){
    //view.collection.bind("add", view.modelChanged, view);
    //view.listenTo(view.model, 'change', view.render);

    view.listenTo(view.collection, 'add', function(mdel,col,op){
      Edit.Session.layout.itemsInfoRegion.show(view);
    });
 
  };

  var registerDocumSidebarView = function(view){
    //Marionette.bindEntityEvents(this, this.model, this.modelEvents)
    //view.model.bind("change", view.modelChanged, view);
    //Marionette.bindEntityEvents(this, this.model, this.modelEvents);
    view.listenTo(view.model, 'change', view.render);

  };

  var registerDocumItemsView = function(view){
    view.on('item:edit',function(childView, itemmodel){
      console.log('ITEM EDIT BEGINS:[%s] - [%s]',itemmodel.get('tipoitem'),itemmodel.whoami);

        var itemheader = new Edit.ItemHeader({
          model: itemmodel,
          itemtype: itemmodel.get('tipoitem'),
          el: '#nuevo-req-form'

        });

        itemheader.on('person:select',function(query, cb){
          DocManager.request("person:search", query, function(model){
            cb(model);
          });      
        });
        itemHeader.show();


         itemheader.on("form:submit", function(model){
           Edit.Session.model.insertItemCollection(Edit.Session.representantes);
           Edit.Session.model.update(function(err,model){
             if(err){
               itemheader.triggerMethod("form:data:invalid", err);
             }else{
               itemheader.close();
             }
           });
         });

        // a laburar
        // para cuando selecciona una person desde el item

        // itemlayout.on("show", function(){
        //     itemlayout.ptheaderRegion.show(itemheader);
        //     itemlayout.ptlistRegion.show(sitview);
        // });

        // itemlayout.on("form:submit", function(){
        //   sitview.triggerMethod("form:submit");
        // });

        // Edit.Session.layout.itemEditRegion.show(itemlayout);


    }); //view.on item:edit

  };





  //MGO: 
  var registerDocumItemsViewOld = function(view){
    view.on('childview:item:edit',function(childView, itemmodel){
      console.log('ITEM EDIT BEGINS:[%s] - [%s]',itemmodel.get('tipoitem'),itemmodel.whoami);

      if(true){
        var itemlayout = new Edit.ItemLayout();
        var itemheader = new Edit.ItemHeader({
          model: itemmodel,
          itemtype: itemmodel.get('tipoitem')
        });


        itemheader.on("form:submit", function(model){
          Edit.Session.model.insertItemCollection(Edit.Session.representantes);
          Edit.Session.model.update(function(err,model){
            if(err){
              itemheader.triggerMethod("form:data:invalid", err);
            }else{
              itemheader.close();
            }
          });
        });

        // a laburar
        Edit.Session.sitcollection = fetchPTItemsCollection(itemmodel);

        var sitview = subItemFactoryView(itemmodel, Edit.Session.sitcollection);

        // caso particular cuando se trata de un Parte de Emision
        if(itemmodel.get('tipoitem')==='pemision'){
          loadProductChilds(Edit.Session.sitcollection, itemmodel);
        }

        // para cuando selecciona un articulo
        itemheader.on('product:select',function(query, cb){
          DocManager.request("product:search", query, function(product){

            if(itemmodel.get('tipoitem')==='pemision'){
              if(product.get('tipoproducto')==='paudiovisual'){
                addProductsToCollection(Edit.Session.sitcollection, itemmodel, new DocManager.Entities.ProductChildCollection(product) );
              }

              product.loadchilds(product, {'es_coleccion_de.id': product.id},function(products){
                addProductsToCollection(Edit.Session.sitcollection, itemmodel, products );
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
            itemmodel.insertItemCollection(Edit.Session.sitcollection);
            Edit.Session.model.insertItemCollection(Edit.Session.representantes);

            Edit.Session.model.update(function(err,model){
              if(err){
                itemheader.triggerMethod("form:data:invalid", err);
              }else{
                itemlayout.close();
              }
            });
          }
        });

        sitview.on("childview:childview:date:select",function(viewp, viewc, model,cb){
          selectDate(model,viewp,cb);
        });

        sitview.on("childview:sit:remove:item",function(view, model){
          removeItemFromCol(model, Edit.Session.sitcollection);
        });

        sitview.on('childview:product:select',function(view, query, cb){
          DocManager.request("product:search", query, function(model){
            cb(model);
          });      
        });


        // Agregar SubItem 
        itemlayout.on("sit:add:item", function(){
          addEmptyItemToCol(itemmodel, Edit.Session.sitcollection);
        });

        itemlayout.on("show", function(){
            itemlayout.ptheaderRegion.show(itemheader);
            itemlayout.ptlistRegion.show(sitview);
        });

        itemlayout.on("form:submit", function(){
          sitview.triggerMethod("form:submit");
        });

        Edit.Session.layout.itemEditRegion.show(itemlayout);

      }//tipoitem === ptecnico

    }); //view.on item:edit

  };


  var subItemFactoryView = function(itemmodel, subItemCol){

    if(itemmodel.get('tipoitem')==='pemision'){
      return ( new Edit.PEmisionList({
              collection: subItemCol,
              itemtype: itemmodel.get('tipoitem')
            }));
    }else if(itemmodel.get('tipoitem')==='nsolicitud'){
      return ( new DocManager.DocsApp.Common.Views.SidebarCompositePanel({
              //childView: DocManager.DocsApp.Common.Views.SidebarCompositePanel,
              collection: subItemCol,
              model: itemmodel,
              itemtype: 'nsdetails'
            }));
    } else {
      return ( new Edit.PTecnicoList({
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

      Edit.pemisHourEdit(model,function(model){
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



var enviarmail = function(model){
    var mailModel = new DocManager.Entities.SendMail({
        from: 'intranet.mcn@gmail.com',
        subject:'Solicitud de Asistencia',
    });

    mailModel.set('to',model.get('items')[0].eusuario);
    if (Edit.Session.currentUser){
        mailModel.set('cc',Edit.Session.currentUser.get('username'))
    }
    
    //todo:ver donde configurar el servidor de produccion
    model.set( 'server','https://localhost:3000');
    var sendMail = new DocManager.DocsApp.Common.Views.SendMail({
          model: model,
    });
    
    mailModel.set('html',sendMail.getData());
    //console.log(sendMail.getData());
    //console.dir(mailModel.attributes);
    mailModel.sendmail();
};
    
  var getUserMessage = function (user){
    var msgs = '';
    if(user){
      if(Edit.Session.currentUser){
        if(user.get('username') !== Edit.Session.currentUser.get('username')){
          msgs = 'Atención: está usted registrando un mail distinto del propio'
        }else {
          msgs = 'Gracias por registrar un nuevo pedido con su usuario actual'          
        }
      }

    }else{
      msgs = 'Nota: No existe aún un usuario con esta identificación. Lo invitamos a registrarse en la Intranet del MCN'
    }
    return msgs;

  };

  var fetchUserByUsername = function(usermail, cb){
    
    var promise = DocManager.request("user:by:username",usermail);
    
    $.when(promise).done(function (userCol){
      console.log('promise!!![%s]',userCol)
      var userFound = false;
      var user;
      if(userCol){
        if(userCol.length){
          user = new DocManager.Entities.User(userCol.at(0).attributes);
          console.log('userFound: [%s] [%s]', user.get('username'), user.get('displayName'));
        }
      }
      if(cb)
        cb(user);
    });

  };

  var fetchPrevNextDocument = function (ename, query, cb){
    var qmodel;
    if(query) qmodel = new DocManager.Entities.Comprobante({cnumber:query});
    else qmodel = Edit.Session.model;
    DocManager.request(ename,qmodel, function(model){
      if(model){
        Edit.Session.layout.close();
        DocManager.trigger("document:edit", model);
      }
    });
  };

  var registerHeadersEvents = function(hview){

      hview.on("childview:document:new", function(childView){
        DocManager.DocsApp.Edit.createInstance(this);
      });

      hview.on("childview:document:item:new", function(childView){
        DocManager.DocsApp.Edit.createItem(Edit.Session.model);
      });

      hview.on("childview:documents:list", function(childView, model){
        var trigger = model.get("navigationTrigger");
        DocManager.trigger(trigger);
      });

      hview.on('document:search',function(query, cb){
        console.log('edit_controller: document:search EVENT');
        DocManager.request("document:search",query, function(model){
          if(model){
            Edit.Session.layout.close();
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

  // var initNavPanel = function(){
  //     var links = DocManager.request("docum:edit:entities");

  //     var headers = new DocManager.DocsApp.Common.Views.NavPanel({collection: links});
  //     //var headers = new Edit.NavPanel({collection: links});
  //     registerHeadersEvents(headers);

  //     return headers;
  // };

  var API = {
    searchDocuments: function(query, cb){
      Edit.modalSearchEntities('documents', query, function(model){
        cb(model);
      });
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
    searchProducts: function(query, cb){
      Edit.modalSearchEntities('products', query, function(model){
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

  DocManager.reqres.setHandler("user:validate", function(usermail, cb){
    API.validateUser(usermail, cb);
  });

});

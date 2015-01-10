DocManager.module("BudgetApp.Build", function(Build, DocManager, Backbone, Marionette, $, _){


  Build.Controller = {
    buildBudget: function(id){
      console.log('BudgetApp.Build.Controller.buildBudget');

      var fetchingAction = DocManager.request("action:entity", id);
     
      $.when(fetchingAction).done(function(action){

        console.log('BudgetApp.Build BEGIN', action.get('slug'));
        Build.Session = {};
        Build.Session.views = {};

        dao.gestionUser.getUser(DocManager, function (user){
          if(user){
            console.log('Dao Get Current user: [%s]', user.get('username'));
            Build.Session.currentUser = user;

            Build.Session.views.layout = new Build.Layout();
            registerActionEntity(action);

            Build.Session.views.layout.on("show", function(){

              Build.Session.views.layout.actionRegion.show(Build.Session.views.actionView);

              //Build.Session.views.layout.sidebarMenuRegion.show(Build.Session.views.sidebarMenu);
              //Build.Session.views.layout.mainRegion.show(Build.Session.views.mainLayout);
              //Build.Session.views.layout.navbarRegion.show(actionuiNavBar);
              //Build.Session.views.layout.headerInfoRegion.show(actionuiSidebarView);
              //Build.Session.views.layout.itemsInfoRegion.show(actionuiSidebarItemsView);

            });

            DocManager.mainRegion.show(Build.Session.views.layout);

            DocManager.request('action:fetch:budget',Build.Session.action, null,function(budgetCol){
              console.log('BudgetCol REQUEST CB:[%s]',budgetCol.length);
              createBudgetPlanningView(budgetCol);
            });

        
            // ========== Main SECTION ============
            //Build.Session.views.mainLayout = new Build.MainLayout();
            //registerMainLayoutEvents(Build.Session.views.mainLayout);


            // ========== Sidebar MENU ============
            //Build.Session.views.sidebarMenu = new DocManager.BudgetApp.Common.Views.SidebarMenu({});
            //registerSidebarMenu(Build.Session.views.sidebarMenu);
      
            //initMainViews();

            Build.Session.views.layout.on("show", function(){

              Build.Session.views.layout.actionRegion.show(Build.Session.views.actionView);

              //Build.Session.views.layout.sidebarMenuRegion.show(Build.Session.views.sidebarMenu);
              //Build.Session.views.layout.mainRegion.show(Build.Session.views.mainLayout);
              //Build.Session.views.layout.navbarRegion.show(actionuiNavBar);
              //Build.Session.views.layout.headerInfoRegion.show(actionuiSidebarView);
              //Build.Session.views.layout.itemsInfoRegion.show(actionuiSidebarItemsView);
            });



          }else{
            Build.Session.currentUser = null;        
          }
        });
    


            
      });
    }
  };


  //======== MAIN CONTROLLER BUDGET PLANNING 
  var createBudgetPlanningView = function(budgets){
    // Modo ALTA: Se arma la plantilla completa.
    _.each(utils.budgetTemplateList, function(type){
      console.log('CreateBudgetPlanning: [%s] BEGIN', type);
      buildPlanningView(type, budgets);

    });

  };
  var buildPlanningView = function(type, budgets){
    if(!hasAlreadyBudgetType(type, budgets)){
      createNewPlanningView(type, budgets);
    }

  };

  var hasAlreadyBudgetType = function(type, budgets){
    var found = false;
    budgets.each(function(model){
      console.log('iterando: type:[%s] budget:[%s]', type, model.get('tgasto'))
      if(model.get('tgasto') === type){
        editPlanningView(type, model);
        found = true;
      }

    });
    return found;
  };

  var editPlanningView = function(type, model){
    var budget = new DocManager.Entities.BudgetPlanningFacet(model.attributes);
    var items = budget.get('items');
    console.log('editando!!!!!!!!!!!!!!!!!!![%s] [%s]', model.get('importe'), items.length);

    var budgetItems = budget.fetchBudgetItems(type);

    var budgetView = new Build.BudgetComposite({
      model: budget,
      collection: budgetItems
    });

    registerBudgetPanelEvents(budget, budgetView);
    Build.Session.views.layout.$('#artistica-region').append(budgetView.render().el);
  };

  var createNewPlanningView = function(type, budgets){
    console.log('createNEW PLANNING')
    var budget = new DocManager.Entities.BudgetPlanningFacet();
    budget.set({
      slug: Build.Session.action.get('slug'),
      tgasto: type,
      cgasto: utils.budgetTemplate[type][0].cgasto,
    });

    var budgetItems = budget.fetchBudgetItems(type);

    budgets.add(budget);

    var budgetView = new Build.BudgetComposite({
      model: budget,
      collection: budgetItems
    });
    registerBudgetPanelEvents(budget, budgetView);
    //Build.Session.views.layout.artisticaRegion.show(budgetView);
    Build.Session.views.layout.$('#artistica-region').append(budgetView.render().el);

  };

  var registerBudgetPanelEvents = function(model, view){
    view.on('edit:budget', function(model){
      console.log('[%s] /[%s] Register BudgetEvent BUBBLE[%s]',view.whoami,model.whoami, arguments.length);
      modalBudgetEdit(view, model, 'Cabecera del Presupuesto');

    });
    view.on('edit:budget:item', function(view, model){
      console.log('[%s] /[%s] Register BudgetEvent BUBBLE[%s]',view.whoami,model.whoami, arguments.length);
      modalBudgetEdit(view, model, 'Item del Presupuesto');

    });

  };
  var modalBudgetEdit = function(view, model, captionlabel){

      Build.modaledit(view, model, model, captionlabel, function(model){
        console.log('Estami di retorni');
        model.evaluateCosto();
        view.render();
      });


  };

  var createDefaultBudgetItems = function(type, budget){
    var deflist = utils.budgetTemplate[type];
    var ibudgets = new DocManager.Entities.BudgetItemsCollection();
    _.each(deflist, function(elem){
      if(elem.val !== 'no_definido'){
        var budgetItem = new DocManager.Entities.BudgetItemFacet(budget.attributes);
        budgetItem.set('tgasto', elem.val)
        budgetItem.set({
          tgasto:elem.val,
          importe: 0,
          punit: 0,
        })
        ibudgets.add(budgetItem);
      }
    });
    return ibudgets;
  };

  //======== ACTION ENTITY 
  var registerActionEntity = function(model) {
    Build.Session.action = model;
    buildActionView(model);
 
  };

  var buildActionView = function(action){
    var actionView = new DocManager.ActionsApp.Report.Branding({
      model: action
    });
    registerActionView(action, actionView);
  };

  var registerActionView = function(model, view){
    Build.Session.views.actionView = view;
  };




  // ======== *********** old stuff ********** =============

  //======== INIT views creation at start
  var initMainViews = function(){
    createMainHeaderView()

  };

  //======== MAIN-LAYOUT-EVENTS
  var registerMainLayoutEvents = function(layout){
    layout.on('show',function(view){
      console.log('LAYOUT SHOW');
      layout.headerRegion.show(Build.Session.views.mainheader);
    });
  };

  //======== BUDGET-VIEW
  var createBudgetView = function(budgetCol){
    Build.Session.budgetcol = budgetCol;
    Build.Session.views.budget = new Build.BudgetPanel({
      collection: Build.Session.budgetcol
    });

    registerBudgetViewEvents(Build.Session.views.budget);
    return Build.Session.views.budget;
  };

  var registerBudgetViewEvents = function(view){
    view.listenTo(view.collection, 'add', function(mdel,col,op){
      budgetViewRender();
    });
    view.on('childview:edit:budget:item', function(view, model){
      console.log('[%s] /[%s] Register BudgetEvent BUBBLE[%s]',view.whoami,model.whoami, arguments.length);
      inlineBuildBudgetItem(view, model);

    });
  };
  
  var inlineBuildBudgetItem = function (view, model){
    var renderId = view.model.id,
        opt;

    view.$el.after('<tr><td id='+renderId+' class="js-form-hook" colspan=4 ></td></tr>');
    Build.Session.views.layout.addRegion(renderId, view.$('#'+renderId));

    opt = {
      view: view.parentView,
      model: model,
      facet: model.fetchBuildFacet(),
      hook: '#'+renderId,
      captionlabel: 'Edición'
    };
    Build.inlineedit(opt,function(facet, submit){
      console.log('callback EDICION [%s] submit:[%s]', facet.get('slug'), submit);
      view.parentView.$(opt.hook).closest('tr').remove();
      if(submit){
        facet.updateModel(model);
        updateBudgetModel(model, function(model){
          view.render();
        })
      }
    });
  };


  var budgetViewRender = function(){
    console.log('BudgetRENDER in mainLayout')
    Build.Session.views.mainLayout.budgetRegion.show(Build.Session.views.budget);
  };


  //======== MAIN-HEADER-VIEW
  var createMainHeaderView = function(){
    Build.Session.views.mainheader = new Build.MainHeader({
      model: Build.Session.model
    });
    registerMainHeaderViewEvents(Build.Session.views.mainheader);
  };

  var registerMainHeaderViewEvents = function(view){
    view.on('main:header:edit',function(model){
      console.log('HEADER EDIT');

      var opt = {
        view: view,
        model: model,
        facet: model.fetchBuildFacet(),
        hook: '.js-form-hook',
        captionlabel: 'Edición'
      };
      Build.inlineedit(opt,function(facet, submit){
        if(submit){
          facet.updateModel(model);
          console.log('callback EDICION');
          updateMainEntityModel(model, function(model){
            view.render();
          })
        }
      });
    });
  };



  //======== SIDE-BAR-MENU
  var registerSidebarMenu = function(view){

    view.on('entity:new',function(view){
      console.log('NEW ENTITY BUBBLE');

      var opt = {
        view: view,
        facet: new DocManager.Entities.ActionCoreFacet(),
        caption:'Alta nueva acción'
      };
      DocManager.BudgetApp.Build.createInstance(opt, function(facet, submit){
        if(submit){
          facet.createNewAction(function(err, model){
            DocManager.trigger("budget:edit",model);
          });
        }
      });
    });

    view.on('budget:new',function(view){
      console.log('NEW BUDGET BUBBLE');
      var opt = {
        view: view,
        facet: new DocManager.Entities.BudgetCoreFacet({},{formType:'short'}),
        caption:'Alta nuevo pase de presupuesto',
      };
      DocManager.BudgetApp.Build.createInstance(opt, function(facet, submit){
        if(submit){
          facet.createNewInstance(Build.Session.model, Build.Session.currentUser, function(err, model){
            console.log('UPDATE VIEWS NOW');
            registerNewBudgetItem(model);
          });
        }

      });
    });
  };


  //======== BUDGET NEW ITEM
  var registerNewBudgetItem = function(model){
    if(Build.Session.budgetcol){
      Build.Session.budgetcol.add(model);
    }else{
      initBudgetCollection(model);
    }

  };
  var initBudgetCollection = function(model){
    var budgetCol = new DocManager.Entities.BudgetNavCollection(model);
    createBudgetView(budgetcol);
  };


  //======== ACTION ENTITY MODEL SAVE UPDATE
  var updateMainEntityModel = function(model, cb){
    model.update(Build.Session.owner, function(err,model){
      if(err){
        view.triggerMethod("form:data:invalid", err);
      }else{
        console.log('UPDATE FINISHED!')
        if(cb) cb(model);
      }
    });
  };

   //======== BUDGET ENTITY MODEL SAVE UPDATE
  var updateBudgetModel = function (model, cb){
    model.update(Build.Session.owner, function(err,model){
      if(err){
        view.triggerMethod("form:data:invalid", err);
      }else{
        console.log('UPDATE FINISHED!')
        if(cb) cb(model);
      }
    });
  };
    
var enviarmail = function(model){
    var mailModel = new DocManager.Entities.SendMail({
        from: 'intranet.mcn@gmail.com',
        subject:'Solicitud de Asistencia',
    });

    mailModel.set('to',model.get('items')[0].eusuario);
    if (Build.Session.currentUser){
        mailModel.set('cc',Build.Session.currentUser.get('username'))
    }
    
    //todo:ver donde configurar el servidor de produccion
    model.set( 'server','https://localhost:3000');
    var sendMail = new DocManager.BudgetApp.Common.Views.SendMail({
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
      if(Build.Session.currentUser){
        if(user.get('username') !== Build.Session.currentUser.get('username')){
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

  var fetchPrevNextAction = function (ename, query, cb){
    var qmodel;
    if(query) qmodel = new DocManager.Entities.Comprobante({cnumber:query});
    else qmodel = Build.Session.model;
    DocManager.request(ename,qmodel, function(model){
      if(model){
        Build.Session.views.layout.close();
        DocManager.trigger("budget:edit", model);
      }
    });
  };

  var registerHeadersEvents = function(hview){

      hview.on("childview:budget:new", function(childView){
        DocManager.BudgetApp.Build.createInstance(this);
      });

      hview.on("childview:budget:item:new", function(childView){
        DocManager.BudgetApp.Build.createItem(Build.Session.model);
      });

      hview.on("childview:budgets:list", function(childView, model){
        var trigger = model.get("navigationTrigger");
        DocManager.trigger(trigger);
      });

      hview.on('budget:search',function(query, cb){
        console.log('edit_controller: budget:search EVENT');
        DocManager.request("budget:search",query, function(model){
          if(model){
            Build.Session.views.layout.close();
            DocManager.trigger("budget:edit", model);
          }
        });      

      });

      hview.on('budget:fetchprev', function(query, cb){
        fetchPrevNextAction("budget:fetchprev",query,cb);
      });

      hview.on('budget:fetchnext', function(query, cb){
        fetchPrevNextAction("budget:fetchnext",query,cb);
      });

  };

  // var initNavPanel = function(){
  //     var links = DocManager.request("actionui:edit:entities");

  //     var headers = new DocManager.BudgetApp.Common.Views.NavPanel({collection: links});
  //     //var headers = new Build.NavPanel({collection: links});
  //     registerHeadersEvents(headers);

  //     return headers;
  // };

  var API = {
    searchActions: function(query, cb){
      Build.modalSearchEntities('actions', query, function(model){
        cb(model);
      });
    },
    searchPersons: function(query, cb){
      Build.modalSearchEntities('persons', query, function(model){
        cb(model);
      });
    },
    searchProducts: function(query, cb){
      Build.modalSearchEntities('products', query, function(model){
        cb(model);
      });
    },
    searchProducts: function(query, cb){
      Build.modalSearchEntities('products', query, function(model){
        cb(model);
      });
    },
  };

  DocManager.reqres.setHandler("budget:search", function(query, cb){
    API.searchActions(query, cb);
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

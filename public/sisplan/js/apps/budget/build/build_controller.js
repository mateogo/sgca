DocManager.module("BudgetApp.Build", function(Build, DocManager, Backbone, Marionette, $, _){


  Build.Controller = {
    buildBudget: function(id){
      console.log('BudgetApp.Build.Controller.buildBudget');

      var fetchingAction = DocManager.request("action:entity", id);
     
      $.when(fetchingAction).done(function(action){

        console.log('BudgetApp.Build BEGIN [%s]: [%s]', action.get('area'), action.get('slug'));
        Build.Session = {};
        Build.Session.views = {};
        Build.Session.typeList = utils.budgetTemplateList;

        dao.gestionUser.getUser(DocManager, function (user){
          var opt = {area: action.get('area')};
          if(user && dao.gestionUser.hasPermissionTo('edit:presupuesto', 'sisplan', opt) ){
            //&& user.hasPermissionTo('gestion:presupuesto')
            //console.log('Dao Get Current user: [%s]', user.get('username'));
            //console.log('Testing User hasAttribute  test gestion:presupuesto [%s]', dao.gestionUser.hasPermissionTo('gestion:presupuesto', 'sisplan', {area:'DNPM'}));
            //console.log('Testing User hasAttribute  test area:[%s]', dao.gestionUser.hasPermissionTo('area', 'sisplan', {area:'DNPM'}));

            Build.Session.currentUser = user;
            Build.Session.views.layout = new Build.Layout();

            Build.Session.facetCol = new DocManager.Entities.BudgetPlanningCollection();
            bindActionEntity(action, Build.Session.facetCol);

            registerActionEntity(action);

            Build.Session.views.layout.on("show", function(){
              Build.Session.views.layout.actionRegion.show(Build.Session.views.actionView);
              Build.Session.views.layout.controlRegion.show(Build.Session.views.controlpanelView);              
            });

            DocManager.mainRegion.show(Build.Session.views.layout);

            loadBudgetsFromDB();

          }else{
            console.log('Budget: vuelve a edición de ACTION')
            console.log('Dao Get Current user: [%s]', user.get('username'));
            console.log('Testing User hasAttribute  test gestion:presupuesto [%s]', dao.gestionUser.hasPermissionTo('gestion:presupuesto', 'sisplan', opt));
            console.log('Testing User hasAttribute  test area:[%s]', dao.gestionUser.hasPermissionTo('area', 'sisplan', opt));

            DocManager.trigger('action:edit', action);
          }
        });
            
      });
    }
  };


  //======== MAIN CONTROLLER BUDGET PLANNING 
  var loadBudgetsFromDB = function(){
    DocManager.request('action:fetch:budget',Build.Session.action, null,function(budgetCol){
      Build.Session.budgetCol = budgetCol;

      console.log('BudgetCol REQUEST CB:[%s]',budgetCol.length);

      buildTypeList(budgetCol);
      var budList = [];
      if(Build.Session.typeList.length){
        createBudgetPlanningView(budgetCol, budList);
      }
    });
  }; 

  var buildTypeList = function(budgetCol){
    Build.Session.typeList = [];
    budgetCol.each(function(model){
      var type = model.get('tgasto');
      Build.Session.typeList.push(type);
      // if(_.indexOf(Build.Session.typeList, type) === -1){
      // }
    });
  };

/*
  var desplegarPresupuesto = function(){
    console.log('READY FOR DEPLOYING EVERYTHING [%s]',Build.Session.typeList);

    DocManager.request('action:fetch:budget',Build.Session.action, null,function(budgetCol){
      Build.Session.budgetCol = budgetCol;
      console.log('BudgetCol REQUEST CB:[%s]',budgetCol.length);
      checkTypeList(budgetCol);
      createBudgetPlanningView(budgetCol);
    });
  }; 

*/
  var createBudgetPlanningView = function(budgets, budList){
    // Modo ALTA: Se arma la plantilla completa.
      console.log('CreateBudgetPlanning: [%s] BEGIN', budgets.length);
    _.each(Build.Session.typeList, function(type){
      buildPlanningView(type, budgets, budList);
    });

    Build.Session.facetCol.evaluateTotalCost();
    Build.Session.views.layout.summaryRegion.show(Build.Session.views.summaryView);

  };

  var buildPlanningView = function(type, budgets, budList){
    if(!hasAlreadyBudgetType(type, budgets, budList)){
      createNewPlanningView(type, budgets);
    }
  };

  var hasAlreadyBudgetType = function(type, budgets, budList){
    var found = false;

    budgets.each(function(model){
      if(_.indexOf(budList, model.id) !== -1){
        found = true;

      } else if(model.get('tgasto') === type && model.get('estado_alta')!== 'baja' ){
        editPlanningView(type, model);
        budList.push(model.id);
        found = true;
        //console.log('iterando: type:[%s]vs[%s] budget:[%s] /[%s]', type, model.get('tgasto'),model.id,  budList)
      }

    });
    return found;
  };

  var editPlanningView = function(type, model){

    var budget = new DocManager.Entities.BudgetPlanningFacet(model.attributes);

    Build.Session.facetCol.addBudget(budget);

    var budgetItems = budget.fetchBudgetItems(type);

    var budgetView = new Build.BudgetComposite({
      model: budget,
      collection: budgetItems
    });

    registerBudgetCompositeEvents(budget, budgetView);

    Build.Session.views.layout.$('#artistica-region').append(budgetView.render().el);
    budget.evaluateCosto();
  };

  var createNewPlanningView = function(type, budgets){

    var budget = new DocManager.Entities.BudgetPlanningFacet();

    Build.Session.facetCol.addBudget(budget);

    budget.set({
      slug: Build.Session.action.get('slug'),
      tgasto: type,
      cgasto: utils.budgetTemplate[type][0].cgasto,
    });

    var budgetItems = budget.fetchBudgetItems(type);

    //budgets.add(budget);

    var budgetView = new Build.BudgetComposite({
      model: budget,
      collection: budgetItems
    });
    registerBudgetCompositeEvents(budget, budgetView);
    //Build.Session.views.layout.artisticaRegion.show(budgetView);
    Build.Session.views.layout.$('#artistica-region').append(budgetView.render().el);
    budget.evaluateCosto();

  };

  var evaluateTotalCost = function(facetCol){

    //Build.Session.action.set('costo_total', facetCol.evaluateTotalCost());

  };

  var registerBudgetCompositeEvents = function(model, view){
    // view.listenTo(model, 'budget:cost:changed', function(){
    //   console.log('ListenTo cb:[%s]:[%s]  this:[%s]',view.whoami, view.cid, this.whoami)
    //   this.render();
    // });

    view.listenTo(model, 'budget:cost:changed', view.render);

    //model.on('budget:cost:changed', view.render);
    model.on('item:budget:added', view.render);

    view.on('edit:budget', function(model){
      //console.log('[%s] /[%s] Edit BudgetEvent BUBBLE[%s]',view.whoami,model.whoami, arguments.length);
      modalBudgetEdit(view, model, 'Cabecera del Presupuesto');

    });
    
    view.on('trash:budget', function(model){
      //console.log('[%s] /[%s] TrashItem BudgetEvent BUBBLE[%s]',view.whoami,model.whoami, arguments.length);
      trashFromBudgetCol(model, view);
    });

    view.on('clone:budget', function(model){
      console.log('[%s] /[%s] CloneBudget BudgetEvent BUBBLE[%s]',view.whoami,model.whoami, arguments.length);
      var clone = model.cloneMe();
      if(clone){
        clone.set('_id', null);
        editPlanningView(model.get('tgasto'), clone);
        model.trigger('budget:cost:changed');
      }
    });

    view.on('cost:changed', function(model){
      console.log('[%s]:[%s] model:[%s] Register CostChangedEVENT BUBBLE[%s]',view.whoami, view.cid, model.whoami, arguments.length);
      model.evaluateCosto();
    });

    //ITEMS EVENTS
    view.on('clone:budget:item', function(itemview, item){
      console.log('[%s] /[%s] CloneBudgetITEM BudgetEvent BUBBLE[%s]',itemview.whoami,item.whoami, arguments.length);
      var itembudget = new DocManager.Entities.BudgetItemFacet(item.attributes);

      view.model.addItemBudget(itembudget);
    });

    view.on('edit:budget:item', function(itemview, item){
      //console.log('[%s] /[%s] EditItem BudgetEvent BUBBLE[%s]',view.whoami,item.whoami, arguments.length);
      modalItemBudgetEdit(itemview, item, 'Item del Presupuesto');

    });

    view.on('trash:budget:item', function(itemview, item){
      //console.log('[%s] /[%s] TrashItem BudgetEvent BUBBLE[%s]',view.whoami,item.whoami, arguments.length);
      trashItemFromBudgetCol(item, view);
    });
  };

  var trashItemFromBudgetCol = function(item, view){
    view.model.trashItem(item);
  };

  var trashFromBudgetCol = function(budget, view){
    if(!budget.trashMe()){
      Build.Session.facetCol.removeBudget(budget);
      view.destroy();
      Build.Session.facetCol.evaluateTotalCost();
    }
  };

  var modalBudgetEdit = function(view, model, captionlabel){
      console.log('ModalEdit BEGIN: view[%s] model:[%s]:[%s]',view.whoami, model.whoami, model.get('tgasto'));
      Build.modaledit(view, model, model, captionlabel, function(model){
        model.evaluateCosto();
        view.render();
      });
  };

  var modalItemBudgetEdit = function(view, model, captionlabel){
      console.log('ModalEdit BEGIN: view[%s] model:[%s]:[%s]',view.whoami, model.whoami, model.get('tgasto'));
      Build.modaledit(view, model, model, captionlabel, function(model){
        model.evaluateCosto();
      });
  };


  //======== ACTION ENTITY 
  var bindActionEntity = function(action, facetCol) {
    action.set('costo_total', 0);
    action.set('costo_detallado', 0);

    action.listenTo(facetCol, 'action:cost:changed', function(totalcost, detailcost){
      console.log('trigger handled: action:cost:changed')
      action.set('costo_total', totalcost);
      action.set('costo_detallado', detailcost);
    })
  }

  //======== ACTION ENTITY 
  var registerActionEntity = function(action) {

    Build.Session.action = action;
    buildActionView(action);

    var summaryView = new Build.SummaryView({
      model: action
    })
    registerSummaryViewEvents(action, summaryView);

    var controlPanelView = new Build.ControlPanelView({
      model: action
    })
    registerControlPanelEvents(action, controlPanelView);
 
 
  };

  //======== ACTION PANEL
  var buildActionView = function(action){
    var actionView = new DocManager.ActionsApp.Report.Branding({
      model: action,
      tab: 'presupuesto'
    });
    registerActionView(action, actionView);
  };
  var registerActionView = function(model, view){
    Build.Session.views.actionView = view;
  };


  //======== SUMMARY PANEL
  var registerSummaryViewEvents = function(model, view){
    Build.Session.views.summaryView = view;
  };

  //======== CONTROL PANEL
  var registerControlPanelEvents = function(model, view){
    Build.Session.views.controlpanelView = view;

    view.on('load:filter:rubros',function(){
      var typeFacet = new DocManager.Entities.BudgetTypeFacet();
      console.log('Filter Rubros BUBBLE [%s]',view.whoami);

      modalBudgetTypeSelect(view, typeFacet, 'Seleccione Rubros');
    });

    view.on('show:action',function(){
      console.log('ShowAction [%s]',view.whoami);
      DocManager.trigger('action:show',Build.Session.action.id)
    });

    view.on('edit:action',function(){
      console.log('EditAction [%s]',view.whoami);
      DocManager.trigger('action:edit',Build.Session.action)
    });

    view.on('save:all',function(){
      console.log('Save ALL [%s]',view.whoami);
      Build.Session.facetCol.saveAll(Build.Session.action, Build.Session.currentUser);

      // Build BudgetPlanning again
      Build.Session.views.layout.$('#artistica-region').empty();
      
      Build.Session.facetCol = new DocManager.Entities.BudgetPlanningCollection();
      bindActionEntity(Build.Session.action, Build.Session.facetCol);

      loadBudgetsFromDB();


    });

    view.on('aprove:budget',function(cb){
      console.log('Aprove Budget Fired [%s]',view.whoami);
      budgetForAproval(Build.Session.currentUser, Build.Session.facetCol, Build.Session.action, cb);

    });

  };
  var budgetForAproval = function(user, budgetCol, action, cb){
    var isValidUser = checkValidUserForAproval(user);
    var budget = fetchGlobalBudget(budgetCol);
    console.log('BudgetForAproval BEGIN user: [%s] budget:[%s]', isValidUser, budget);
    if(isValidUser && budget){
      DocManager.request('budget:for:aproval', user, budget, action, function(result){
        console.log('Fiuuuuu WE ARE BACK [%s] ',result)
        if(cb)cb(result)

      });
    } 

  };

  var checkValidUserForAproval = function(user){
    return true;
  };

  var fetchGlobalBudget = function (budgetCol){
    var budget;
    
    budgetCol.each(function(item){
      if(item.get('tgasto')=== 'global'){
        budget = item;
        return budget;
      }
    });

    return budget;
  };



  var modalBudgetTypeSelect = function(view, model, captionlabel){
    Build.modaledit(view, model, model, captionlabel, function(model){
      Build.Session.typeList = model.get('roles');
      if(Build.Session.facetCol.length){
        addBudgetTypes(Build.Session.typeList);
      }else{
        createBudgetPlanningView(Build.Session.budgetCol);        
      }
    });
  };

  var addBudgetTypes = function(list){
    _.each(list, function(type){
      createNewPlanningView(type);
    });
    evaluateTotalCost(Build.Session.facetCol);
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
/*
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
*/
});

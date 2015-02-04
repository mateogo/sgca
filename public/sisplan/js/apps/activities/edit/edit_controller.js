DocManager.module("ActivitiesApp.Edit", function(Edit, DocManager, Backbone, Marionette, $, _){


  Edit.Controller = {
    editActivity: function(id){
      console.log('ActivitiesApp.Edit.Controller.editActivity');

      var fetchingAction = DocManager.request("action:entity", id);
     
      $.when(fetchingAction).done(function(action){

        console.log('ActivitiesApp.Edit BEGIN [%s]: [%s]', action.get('area'), action.get('slug'));
        Edit.Session = {};
        Edit.Session.views = {};
        Edit.Session.typeList = utils.budgetTemplateList;

        dao.gestionUser.getUser(DocManager, function (user){
          var opt = {area: action.get('area')};
          if(user && dao.gestionUser.hasPermissionTo('edit:actividad', 'sisplan', opt) ){
            //&& user.hasPermissionTo('gestion:actividad')
            console.log('Dao Get Current user: [%s]', user.get('username'));
            console.log('Testing User hasAttribute  test gestion:actividad [%s]', dao.gestionUser.hasPermissionTo('gestion:actividad', 'sisplan', {area:'DNPM'}));
            console.log('Testing User hasAttribute  test area:[%s]', dao.gestionUser.hasPermissionTo('area', 'sisplan', {area:'DNPM'}));

            Edit.Session.currentUser = user;
            Edit.Session.views.layout = new Edit.Layout();

            Edit.Session.facetCol = new DocManager.Entities.AdminrequestPlanningCollection();

            registerActionEntity(action, Edit.Session.facetCol);

            Edit.Session.views.layout.on("show", function(){
              Edit.Session.views.layout.actionRegion.show(Edit.Session.views.actionView);
              Edit.Session.views.layout.controlRegion.show(Edit.Session.views.controlpanelView);              
            });

            DocManager.mainRegion.show(Edit.Session.views.layout);

            loadBudgetsFromDB();

          }else{
            console.log('vuelve a edición de ACTION')
            DocManager.trigger('action:edit', action);
          }
        });
            
      });
    }
  };


  //======== MAIN CONTROLLER BUDGET PLANNING 
  var loadBudgetsFromDB = function(){
    DocManager.request('action:fetch:budget',Edit.Session.action, null,function(budgetCol){
      var costo.total = DocManager.request('action:evaluate:cost',budgetCol);

      var budgetView = new Edit.ActivityShowBudgets({
        model: new Backbone.Model({costo_total: costo.total, costo_detallado: costo.detallado}),
        collection: budgetCol
      });
      
      Edit.Session.views.layout.mainRegion.show(budgetView);

    });
  }; 

  var buildTypeList = function(budgetCol){
    Edit.Session.typeList = [];
    budgetCol.each(function(model){
      var type = model.get('tgasto');
      Edit.Session.typeList.push(type);
      // if(_.indexOf(Edit.Session.typeList, type) === -1){
      // }
    });
  };




  var loadActivitiesFormDB = function(){
    DocManager.request('action:fetch:activity',Edit.Session.action, null,function(activityCol){
      console.log('ActivityCol REQUEST CB:[%s]',activityCol.length);
      Edit.Session.activityCol = activityCol;
      buildTypeList(activityCol);
      if(Edit.Session.typeList.length){
        createActivityPlanningView(activityCol);
      }
    });
  }; 


/*
  var desplegarPresupuesto = function(){
    console.log('READY FOR DEPLOYING EVERYTHING [%s]',Edit.Session.typeList);

    DocManager.request('action:fetch:activity',Edit.Session.action, null,function(activityCol){
      Edit.Session.activityCol = activityCol;
      console.log('ActivityCol REQUEST CB:[%s]',activityCol.length);
      checkTypeList(activityCol);
      createActivityPlanningView(activityCol);
    });
  }; 

*/
  var createActivityPlanningView = function(activities){
    // Modo ALTA: Se arma la plantilla completa.
    _.each(Edit.Session.typeList, function(type){
      //console.log('CreateActivityPlanning: [%s] BEGIN', type);
      buildPlanningView(type, activities);
    });

    Edit.Session.facetCol.evaluateTotalCost();
    Edit.Session.views.layout.summaryRegion.show(Edit.Session.views.summaryView);

  };

  var buildPlanningView = function(type, activities){
    if(!hasAlreadyActivityType(type, activities)){
      createNewPlanningView(type, activities);
    }
  };

  var hasAlreadyActivityType = function(type, activities){
    var found = false;

    activities.each(function(model){
      //console.log('iterando: type:[%s] activity:[%s]', type, model.get('tgasto'))
      if(model.get('tgasto') === type){
        editPlanningView(type, model);
        found = true;
      }

    });
    return found;
  };

  var editPlanningView = function(type, model){

    var activity = new DocManager.Entities.AdminrequestPlanningFacet(model.attributes);

    Edit.Session.facetCol.addActivity(activity);

    var activityItems = activity.fetchActivityItems(type);

    var activityView = new Edit.ActivityComposite({
      model: activity,
      collection: activityItems
    });

    registerActivityCompositeEvents(activity, activityView);

    Edit.Session.views.layout.$('#artistica-region').append(activityView.render().el);
    activity.evaluateCosto();
  };

  var createNewPlanningView = function(type, activities){

    var activity = new DocManager.Entities.AdminrequestPlanningFacet();

    Edit.Session.facetCol.addActivity(activity);

    activity.set({
      slug: Edit.Session.action.get('slug'),
      tgasto: type,
      cgasto: utils.activityTemplate[type][0].cgasto,
    });

    var activityItems = activity.fetchActivityItems(type);

    //activities.add(activity);

    var activityView = new Edit.ActivityComposite({
      model: activity,
      collection: activityItems
    });
    registerActivityCompositeEvents(activity, activityView);
    //Edit.Session.views.layout.artisticaRegion.show(activityView);
    Edit.Session.views.layout.$('#artistica-region').append(activityView.render().el);
    activity.evaluateCosto();

  };

  var evaluateTotalCost = function(facetCol){

    //Edit.Session.action.set('costo_total', facetCol.evaluateTotalCost());

  };

  var registerActivityCompositeEvents = function(model, view){
    // view.listenTo(model, 'activity:cost:changed', function(){
    //   console.log('ListenTo cb:[%s]:[%s]  this:[%s]',view.whoami, view.cid, this.whoami)
    //   this.render();
    // });

    view.listenTo(model, 'activity:cost:changed', view.render);

    //model.on('activity:cost:changed', view.render);
    model.on('item:activity:added', view.render);

    view.on('edit:activity', function(model){
      //console.log('[%s] /[%s] Edit ActivityEvent BUBBLE[%s]',view.whoami,model.whoami, arguments.length);
      modalActivityEdit(view, model, 'Cabecera del Presupuesto');

    });
    
    view.on('trash:activity', function(model){
      //console.log('[%s] /[%s] TrashItem ActivityEvent BUBBLE[%s]',view.whoami,model.whoami, arguments.length);
      trashFromActivityCol(model, view);
    });

    view.on('clone:activity', function(model){
      console.log('[%s] /[%s] CloneActivity ActivityEvent BUBBLE[%s]',view.whoami,model.whoami, arguments.length);
      var clone = model.cloneMe();
      if(clone){
        clone.set('_id', null);
        editPlanningView(model.get('tgasto'), clone);
        model.trigger('activity:cost:changed');
      }
    });

    view.on('cost:changed', function(model){
      console.log('[%s]:[%s] model:[%s] Register CostChangedEVENT BUBBLE[%s]',view.whoami, view.cid, model.whoami, arguments.length);
      //evaluateTotalCost(Edit.Session.facetCol);
      model.evaluateCosto();
    });

    //ITEMS EVENTS
    view.on('clone:activity:item', function(itemview, item){
      console.log('[%s] /[%s] CloneActivityITEM ActivityEvent BUBBLE[%s]',itemview.whoami,item.whoami, arguments.length);
      var itemactivity = new DocManager.Entities.AdminrequestItemFacet(item.attributes);

      view.model.addItemActivity(itemactivity);
      evaluateTotalCost(Edit.Session.facetCol);
    });

    view.on('edit:activity:item', function(itemview, item){
      //console.log('[%s] /[%s] EditItem ActivityEvent BUBBLE[%s]',view.whoami,item.whoami, arguments.length);
      modalItemActivityEdit(itemview, item, 'Item del Presupuesto');

    });

    view.on('trash:activity:item', function(itemview, item){
      //console.log('[%s] /[%s] TrashItem ActivityEvent BUBBLE[%s]',view.whoami,item.whoami, arguments.length);
      trashItemFromActivityCol(item, view);
    });
  };

  var trashItemFromActivityCol = function(item, view){
    view.model.trashItem(item);
  };

  var trashFromActivityCol = function(activity, view){
    if(!activity.trashMe()){
      Edit.Session.facetCol.removeActivity(activity);
      view.destroy();
      Edit.Session.facetCol.evaluateTotalCost();
    }
  };

  var modalActivityEdit = function(view, model, captionlabel){
      console.log('ModalEdit BEGIN: view[%s] model:[%s]:[%s]',view.whoami, model.whoami, model.get('tgasto'));
      Edit.modaledit(view, model, model, captionlabel, function(model){
        model.evaluateCosto();
        view.render();
      });
  };

  var modalItemActivityEdit = function(view, model, captionlabel){
      console.log('ModalEdit BEGIN: view[%s] model:[%s]:[%s]',view.whoami, model.whoami, model.get('tgasto'));
      Edit.modaledit(view, model, model, captionlabel, function(model){
        model.evaluateCosto();
      });
  };


  //======== ACTION ENTITY 
  var registerActionEntity = function(action, facetCol) {
    action.set('costo_total', 0);

    action.listenTo(facetCol, 'action:cost:changed', function(cost){
      console.log('trigger handled: action:cost:changed')
      action.set('costo_total', cost);
    })

    // facetCol.on('action:cost:changed', function(cost){
    //   console.log('trigger handled: action:cost:changed')
    //   action.set('costo_total', cost);
    // });

    Edit.Session.action = action;
    buildActionView(action);

    //Edit.Session.facetCol.bind('cost:changed', evaluateTotalCost);

    var summaryView = new Edit.SummaryView({
      model: action
    })
    registerSummaryViewEvents(action, summaryView);

    var controlPanelView = new Edit.ControlPanelView({
      model: action
    })
    registerControlPanelEvents(action, controlPanelView);
 
 
  };

  //======== ACTION PANEL
  var buildActionView = function(action){
    var actionView = new DocManager.ActionsApp.Report.Branding({
      model: action
    });
    registerActionView(action, actionView);
  };
  var registerActionView = function(model, view){
    Edit.Session.views.actionView = view;
  };


  //======== SUMMARY PANEL
  var registerSummaryViewEvents = function(model, view){
    Edit.Session.views.summaryView = view;
  };

  //======== CONTROL PANEL
  var registerControlPanelEvents = function(model, view){
    Edit.Session.views.controlpanelView = view;

    view.on('load:filter:rubros',function(){
      var typeFacet = new DocManager.Entities.AdminrequestTypeFacet();
      console.log('Filter Rubros BUBBLE [%s]',view.whoami);

      modalActivityTypeSelect(view, typeFacet, 'Seleccione Rubros');
    });

    view.on('show:action',function(){
      console.log('ShowAction [%s]',view.whoami);
      DocManager.trigger('action:show',Edit.Session.action.id)
    });

    view.on('edit:action',function(){
      console.log('EditAction [%s]',view.whoami);
      DocManager.trigger('action:edit',Edit.Session.action)
    });


    view.on('save:all',function(){
      console.log('Save ALL [%s]',view.whoami);
      Edit.Session.facetCol.saveAll(Edit.Session.action, Edit.Session.currentUser);
    });
  };

  var modalActivityTypeSelect = function(view, model, captionlabel){
    Edit.modaledit(view, model, model, captionlabel, function(model){
      Edit.Session.typeList = model.get('roles');
      if(Edit.Session.facetCol.length){
        addActivityTypes(Edit.Session.typeList);
      }else{
        createActivityPlanningView(Edit.Session.activityCol);        
      }
    });
  };

  var addActivityTypes = function(list){
    _.each(list, function(type){
      createNewPlanningView(type);
    });
    evaluateTotalCost(Edit.Session.facetCol);
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
    var sendMail = new DocManager.ActivitiesApp .Common.Views.SendMail({
          model: model,
    });
    
    mailModel.set('html',sendMail.getData());
    //console.log(sendMail.getData());
    //console.dir(mailModel.attributes);
    mailModel.sendmail();
};
    


  var API = {
    searchActions: function(query, cb){
      Edit.modalSearchEntities('actions', query, function(model){
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
/*
  DocManager.reqres.setHandler("activity:search", function(query, cb){
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

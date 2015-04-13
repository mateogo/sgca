DocManager.module("AdminrequestsApp.Build", function(Build, DocManager, Backbone, Marionette, $, _){
  
  var Entities = DocManager.module('Entities');
  
  Build.Controller = {
      
      showResume: function(adminrequest){
        loadModel(adminrequest).then(function(){
          createLayoutView();
          createResumeView();
          //createControlPanelLayoutView();
          createItemHeaderView();
          createItemList();
        });
        $('body').scrollTop(0);
      },
      
      editBasic: function(adminrequest){
        loadModel(adminrequest).then(function(){
          createLayoutView();
          createBasicMedicor();
        });
        $('body').scrollTop(0);
      },
      setSectionSelected: function(str){
        var session = getSession();
        if(session.views.headerInfo){
          session.views.headerInfo.selectTab(str);
        }
      }
  };
  
  function getSession(){
    if(!Build.Session){
      Build.Session = {views:{},model:null};
    }
    return Build.Session;
  }
  
  var loadModel = function(id){

    console.log('AdminrequestsApp.Build.Controller.loadModel');
    
    var defer = $.Deferred();

    var fetchingAdminRequest = DocManager.request("admrqst:entity", id);
   
    $.when(fetchingAdminRequest).done(function(admrqst){

      console.log('AdminrequestsApp.Build BEGIN [%s]: [%s]', admrqst.get('trequest'), admrqst.get('slug'));
      getSession().model = admrqst;

      dao.gestionUser.getUser(DocManager, function (user){
        var opt = {area: admrqst.get('action_area')};
        if(user && dao.gestionUser.hasPermissionTo('edit:actividad', 'sisplan', opt) ){
          //&& user.hasPermissionTo('gestion:actividad')
          console.log('Dao Get Current user: [%s]', user.get('username'));
          console.log('Testing User hasAttribute  test gestion:actividad [%s]', dao.gestionUser.hasPermissionTo('gestion:actividad', 'sisplan', {area:'DNPM'}));
          console.log('Testing User hasAttribute  test area:[%s]', dao.gestionUser.hasPermissionTo('area', 'sisplan', {area:'DNPM'}));

          getSession().currentUser = user;


          var fetchingAction = DocManager.request("action:entity", admrqst.get('action_id'));
          $.when(fetchingAction).done(function(action){
            console.log('AdminrequestsApp.Build FetchingCurrent Action [%s]: [%s]', action.get('cnumber'), action.get('slug'));

            getSession().currentAction = action;
            defer.resolve(admrqst);

          });

        }else{
          console.log('vuelve a edición de ACTION')
          DocManager.trigger('admrqst:edit', admrqst);
        }
      });
          
    });
    return defer.promise();
  }

  var createNotFound = function(){
    DocManager.mainRegion.show(new Build.NotFoundView());
    
  };
  
  // ***** LAYOUT ****************
  var createLayoutView = function(){
    var session = getSession();
    
    session.views.layout = new Build.Layout({model:session.model});
    
    createHeaderInfoView();
    console.log('ready to Show Main Region')
    registerLayoutEvents(session.views.layout);
  };

  var registerLayoutEvents = function(layout){
    layout.on('edit:basic:data', function(){
      console.log('BasicEdit Bubbled!')
      createBasicEditor();

    });
    layout.on('edit:itemheader:data', function(){
      console.log('ItemHeaderEdit Bubbled!')
      createItemHeaderEditor();

    });
    DocManager.mainRegion.show(layout);
  };

  // ****** CABECERA con datos no-editables: la Acción y el área solicitante
  var createHeaderInfoView = function(){
    var session = getSession();
    var layout = session.views.layout; 
    session.views.headerInfo = new Build.HeaderInfo({model:session.model});
    layout.on('show',function(){
        layout.headerRegion.show(session.views.headerInfo);
    });
  };
  
  // ********** Carátula de la tramitación: Vista y edición
  var createResumeView = function(){
    var session = getSession();
    var layout = Build.Session.views.layout;
    var view = new Build.ResumeView({model:session.model});
    session.views.resume = view;
    layout.getRegion('basicdataRegion').show(view);
  };

  var createBasicEditor = function(){
    var session = getSession();
    var editor = new Build.BasicEditor({model:session.model});
    registerBasicEditorEvents(session, editor);
    session.views.layout.getRegion('basicdataRegion').show(editor);
  };

  var registerBasicEditorEvents = function(session, editor){
    editor.on('cancel:basic:editor', function(){
      console.log('CancelBasicEditor Bubbled')
      createResumeView();
    });

    editor.on('save:basic:editor', function(cb){
      console.log('SAVE BasicEditor Bubbled')
      session.model.updateBasicData(session.currentUser, function(err, model){
        if(model){
          createResumeView();
        }
        if(err){
          if(cb){
            cb(err);
          }
        }
      });
    });
  };

  // *********** Botones de navegación
  var createControlPanelLayoutView = function(){
    var session = getSession();
    var layout = Build.Session.views.layout;
    var view = new Build.ControlPanelLayoutView({model:session.model});
    session.views.controlpanel = view;
    registerControlPanelEvents(session, view);
  };
  var registerControlPanelEvents = function(session, view){
    session.views.layout.getRegion('controlRegion').show(view);

  };


  // *********** ITEM-HEADER: cabecera para controlar/ generar el detalle de la tramitación
  // ***********  Vista - edición
  var createItemHeaderView = function(){
    var session = getSession();
    var layout = Build.Session.views.layout;
    var view = new Build.ItemHeaderView({model:session.model.itemHeaderFactory()});
    session.views.itemHeader = view;
    registerItemHeaderViewEvents(session, view);
  };
  var registerItemHeaderViewEvents = function(session, view){
    session.views.layout.getRegion('itemheaderRegion').show(view);

  };

  var createItemHeaderEditor = function(){
    var session = getSession();
    var layout = Build.Session.views.layout;
    var view = new Build.ItemHeaderEditor({model:session.model.itemHeaderFactory()});
    session.views.itemHeader = view;
    registerItemHeaderEvents(session, view);
  };

  var registerItemHeaderEvents = function(session, view){
    view.on('cancel:itemheader:editor', function(){
      console.log('Cancel ItemHeaderEditor Bubbled')
      createItemHeaderView();
    });

    view.on('save:itemheader:editor', function(model, cb){
      console.log('SAVE ItemHeaderEditor Bubbled [%s]', model.get('objeto'));
      session.model.updateItemHeader(session.currentUser, model);
      createItemHeaderView();      
    });

    session.views.layout.getRegion('itemheaderRegion').show(view);
  };


  // *********** ITEM-HEADER: cabecera para controlar/ generar el detalle de la tramitación
  // ***********  Vista - edición
  var createItemList = function(){
    var session = getSession();
    var layout = Build.Session.views.layout;
    var itemlist = session.model.itemListFactory();
    
    var table = Build.itemsGridCreator(itemlist);
    var filter = Build.filterCreator(itemlist);


    var listLayout = new Build.ItemListLayout({model: itemlist});
    listLayout.getRegion('tableRegion').show(table);
    listLayout.getRegion('filterRegion').show(filter);

    session.views.itemlist = listLayout;
    registerItemHeaderViewEvents(session, listLayout);
  };
  var registerItemHeaderViewEvents = function(session, view){
    session.views.layout.getRegion('itemsRegion').show(view);

  };



});
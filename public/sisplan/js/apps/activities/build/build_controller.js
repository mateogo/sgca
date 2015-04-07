DocManager.module("AdminrequestsApp.Build", function(Build, DocManager, Backbone, Marionette, $, _){
  
  var Entities = DocManager.module('Entities');
  
  Build.Controller = {
      
      showResume: function(adminrequest){
        loadModel(adminrequest).then(function(){
          createLayoutMedicor();
          createResumeView();
        });
        $('body').scrollTop(0);
      },
      
      editBasic: function(adminrequest){
        loadModel(adminrequest).then(function(){
          createLayoutMedicor();
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
  
  function loadModel(id){

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

  
  function createLayoutMedicor(){
    var session = getSession();
    
    session.views.layout = new Build.Layout({model:session.model});
    
    createHeaderInfoView();
    
    DocManager.mainRegion.show(Build.Session.views.layout);
  }
  
  function createNotFound(){
    DocManager.mainRegion.show(new Build.NotFoundView());
    
  }
  
  function createHeaderInfoView(){
    var session = getSession();
    var layout = session.views.layout; 
    session.views.headerInfo = new Build.HeaderInfo({model:session.model});
    layout.on('show',function(){
        layout.headerInfoRegion.show(session.views.headerInfo);
    });
  }
    
  function createResumeView(){
    var session = getSession();
    var layout = Build.Session.views.layout; 
    var view = new Build.ResumeView({model:session.model});
    layout.getRegion('mainRegion').show(view);
  }
  
  function createBasicMedicor(){
    var session = getSession();
    var layout = Build.Session.views.layout; 
    console.log('Buildando adminrequest',session.model);
    var editor = new Build.BasicMedicor({model:session.model});
    layout.getRegion('mainRegion').show(editor);
  }
  
  
});
DocManager.module("ArtActivitiesApp.Edit", function(Edit, DocManager, Backbone, Marionette, $, _){
  
  var Entities = DocManager.module('Entities');
  var AppCommon = DocManager.module('App.Common');
  var Resultados = DocManager.module('Resultados');
  
  Edit.Controller = {
      
      showResume: function(artActivity){
        loadModel(artActivity).then(function(){
            var session = getSession();
            $.when(session.model.setLocationName()).then(function() {

                createLayoutEditor();
                createResumeView();
            });
        });
        $('body').scrollTop(0);
      },
      
      editBasic: function(artActivity){
        loadModel(artActivity).then(function(){
          createLayoutEditor();
          createBasicEditor();
        });
        $('body').scrollTop(0);
      },
      setSectionSelected: function(str){
        var session = getSession();
        if(session.views.headerInfo){
          session.views.headerInfo.selectTab(str);
        }
      },
      
      artActivityAssets: function(artActivity){
        loadModel(artActivity).then(function(){
          createLayoutEditor();
          createAssetsList();
        });
      },

      artActivityResults: function(artActivity){
        loadModel(artActivity).then(function(){
          createLayoutEditor();
          createResultsView();
        });
      }
  };
  
  function getSession(){
    if(!Edit.Session){
      Edit.Session = {views:{},model:null};
    }
    return Edit.Session;
  }
  
  function loadModel(param){
      var def = $.Deferred();
      
      var session = getSession();
      
      if(param instanceof Entities.ArtActivity){
          session.model = param;
          param.load().done(function(){
            def.resolve(param);  
          });
          
      }else{
          Entities.ArtActivity.findById(param).then(function(model){
            session.model = model;
            model.load().done(function(){
              def.resolve(model);  
            });
          },function(e){
            createNotFound();
            def.reject();
          });
      }
      
      return def.promise();
  }
  
  function createLayoutEditor(){
    var session = getSession();
    
    session.views.layout = new Edit.Layout({model:session.model});
    
    createHeaderInfoView();
    
    DocManager.mainRegion.show(Edit.Session.views.layout);
  }
  
  function createNotFound(){
    DocManager.mainRegion.show(new Edit.NotFoundView());
    
  }
  
  function createHeaderInfoView(){
    var session = getSession();
    var layout = session.views.layout; 
    session.views.headerInfo = new Edit.HeaderInfo({model:session.model});
    layout.on('show',function(){
        layout.headerInfoRegion.show(session.views.headerInfo);
    });
  }
    
  function createResumeView(){
    var session = getSession();
    var layout = Edit.Session.views.layout;
    var view = new Edit.ResumeView({model: session.model});
    layout.getRegion('mainRegion').show(view);


  }
  
  function createBasicEditor(){
    var session = getSession();
    var layout = Edit.Session.views.layout; 
    console.log('Editando artActivity',session.model);
    var editor = new Edit.BasicEditor({model:session.model});
    layout.getRegion('mainRegion').show(editor);
  }
  
  
  function createAssetsList(){
    var session = getSession();
    var layout = Edit.Session.views.layout; 
    var list = new AppCommon.AttachmentView({model:session.model});
    layout.getRegion('mainRegion').show(list);
    Edit.Controller.setSectionSelected('asset');
  }

  function createResultsView(){
    var session = getSession();
    var layout = Edit.Session.views.layout;
    new Resultados.Main.Controller({
      region: layout.getRegion('mainRegion'),
      parent_id: session.model.id,
      entity: 'ArtActivity',
    });
    Edit.Controller.setSectionSelected('results');
  }
});

DocManager.module("ArtActivitiesApp.Edit", function(Edit, DocManager, Backbone, Marionette, $, _){
  
  var Entities = DocManager.module('Entities');
  
  Edit.Controller = {
      
      editBasic: function(artActivity){
        loadModel(artActivity).then(function(){
          createLayoutEditor();
          createBasicEditor();
        });
        $('body').scrollTop(0);
      },
      editEvents: function(artActivity){
        
      },
      
      editResources: function(artActivity){
        
      },
      editTask: function(){
        
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
          def.resolve(param);
      }else{
          Entities.ArtActivity.findById(param).then(function(model){
            session.model = model;
            def.resolve(model);
          },function(e){
            createNotFound();
            def.reject();
          });
      }
      
      return def.promise();
  }
  
  function createLayoutEditor(){
    var session = getSession();
    
    session.views.layout = new Edit.Layout();
    
    createHeaderInfoView();
    createNavBarView();
    
    DocManager.mainRegion.show(Edit.Session.views.layout);
  }
  
  function createNotFound(){
    DocManager.mainRegion.show(new Edit.NotFoundView());
    
  }
  
  function createHeaderInfoView(){
    var session = getSession();
    var layout = session.views.layout; 
    var view = new Edit.HeaderInfo({model:session.model});
    layout.on('show',function(){
        layout.headerInfoRegion.show(view);
    });
  }
  
  function createNavBarView(){
    var layout = Edit.Session.views.layout; 
    var view = new Edit.NavbarView();
    layout.on('show',function(){
        layout.navbarRegion.show(view);
    });
  }
  
  function createBasicEditor(){
    var session = getSession();
    var layout = Edit.Session.views.layout; 
    console.log('Editando artActivity',session.model);
    var editor = new Edit.BasicEditor({model:session.model});
    layout.getRegion('mainRegion').show(editor);
  }
  
  
  
  
  
  
  
  
});
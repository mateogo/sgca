DocManager.module("ArtActivitiesApp.Edit", function(Edit, DocManager, Backbone, Marionette, $, _){
  
  Edit.Controller = {
      
      editBasic: function(artActivity){
        createLayoutEditor();
        createBasicEditor();
      },
      editEvents: function(artActivity){
        
      },
      
      editResources: function(artActivity){
        
      },
      editTask: function(){
        
      }
  };
  
  function createLayoutEditor(){
    if(!Edit.Session){
      Edit.Session = {views:{}};
    }
    
    if(!Edit.Session.views.layout){
      Edit.Session.views.layout = new Edit.Layout();  
    }
    DocManager.mainRegion.show(Edit.Session.views.layout);
  }
  
  function createBasicEditor(){
    var layout = Edit.Session.views.layout; 
    var editor = new Edit.BasicEditor();
    layout.on('show',function(){
        layout.mainRegion.show(editor);
    });
    layout.mainRegion.show(editor);
  }
  
  
  DocManager.on('artActivity:edit',function(model){
    Edit.Controller.editBasic(model);
  });
  
  
  
});
DocManager.module("DocsApp", function(DocsApp, DocManager, Backbone, Marionette, $, _){

  DocsApp.Router = Marionette.AppRouter.extend({
    appRoutes: {
      "rondas/nuevo": "addDocument",
      "rondas/:id": "showDocument",
      "rondas/:id/edit": "editDocument",
	  }
  });

  var API = {

    showDocument: function(id){
      console.log('API: show inscripcion')
      DocsApp.Show.Controller.showDocument(id);
      //DocManager.execute("set:active:header", "comprobantes");
    }, 

    addDocument: function(){
      console.log('API: add inscripcion')
      DocsApp.Edit.Controller.addDocument();
      //DocManager.execute("set:active:header", "comprobantes");  
    },

    editDocument: function(id){
  		console.log('API: edit inscripcion', id)
  		DocsApp.Edit.Controller.editDocument(id);
  		//DocManager.execute("set:active:header", "comprobantes");	
    },   
		
  };

  DocManager.on("document:show", function(id){
    DocManager.navigate("/" + id);
    API.showDocument(id);
  });

  DocManager.on("document:add", function(){
    DocManager.navigate("rondas/nuevo");
    API.addDocument();
  });
	
  DocManager.on("document:edit", function(id){
    DocManager.navigate("rondas/" + id + "/edit");
    API.editDocument(id);
  });

  DocManager.addInitializer(function(){
    new DocsApp.Router({
      controller: API
    });
  });
});

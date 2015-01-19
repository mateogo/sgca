DocManager.module("DocsApp", function(DocsApp, DocManager, Backbone, Marionette, $, _){

  DocsApp.Router = Marionette.AppRouter.extend({
    appRoutes: {
      "rondas/:id": "showDocument",
      "rondas/:id/edit": "editDocument",
	  }
  });

  var API = {

    showDocument: function(id){
      console.log('API: show document')
      DocsApp.Show.Controller.showDocument(id);
      DocManager.execute("set:active:header", "comprobantes");
    }, 

    editDocument: function(id){
			if (id == ':id')
			{
				console.log('no existe, es nuevo');
//descomentar para que siga a editar
				DocsApp.Edit.createInstance();
			}
			else{
				console.log('API: edit document', id)
				DocsApp.Edit.Controller.editDocument(id);
				DocManager.execute("set:active:header", "comprobantes");	
			}
    },   
		
  };

  DocManager.on("document:show", function(id){
    DocManager.navigate("/" + id);
    API.showDocument(id);
  });
	
  DocManager.on("document:edit", function(model){
    var documid = model.id || model.get('documid');
    DocManager.navigate("rondas/" + documid + "/edit");
    API.editDocument(documid);
  });

  DocManager.addInitializer(function(){
    new DocsApp.Router({
      controller: API
    });
  });
});

DocManager.module("InscripcionApp.Edit", function(Edit, DocManager, Backbone, Marionette, $, _){

  Edit.Controller = {
	  
	  newRegister: function(){
		   DocManager.InscripcionApp.Edit.createInstance();
	  },
	  
	  editRegister: function(id){
		  console.log('InscripcionAPP.Edit.Controller.editRegister');
		  
		  var registerLayout = new Edit.Layout();
		  
		  var fetchingDocument = DocManager.request("inscripcion:entity", id);
		  
		  if (id == null){
			  console.log('Aqui!!')
			  DocManager.InscripcionApp.Edit.createInstance();
		  }
		  else {
		  $.when(fetchingDocument).done(function(inscripcion){

		  console.log('InscripcionApp.Edit BEGIN', inscripcion.get('empresa'));

			// 
			Edit.Session = {};
			Edit.Session.views = {};
			registerDocumentEntity(document);

			//(document);

			var documEditView = new Edit.Document({
			  model: Edit.Session.model
			});
			registerDocumEditEvents(documEditView);


			Edit.Session.layout = registerLayout;
			registerLayout.on("show", function(){
			  registerLayout.mainRegion.show(documEditView);
			  registerLayout.headerInfoRegion.show(documSidebarView);
			  registerLayout.itemsInfoRegion.show(documSidebarItemsView);
			});

			DocManager.mainRegion.show(registerLayout);


		  });
		  }//Quit
	  }
  }
  
});
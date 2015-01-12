DocManager.module("InscripcionApp.Show", function(Show, DocManager, Backbone, Marionette, $, _){
  Show.Controller = {

    showRegister: function(){
      console.log('showRegister [%s]');
      var documLayout = new Show.Layout();

      var fetchingRegister = DocManager.request("inscripcion:entity");
		
      $.when(fetchingRegister).done(function(inscripcion){
  		  var registerView,
            negociosView,
            photosView;

        if(inscripcion !== undefined){
  
    		  registerView = new Show.Register({
            model: inscripcion
          });
    			
    		  negociosView = new Show.Negocio({
            model: inscripcion
          });
    		  
          photosView = new Show.Photos({
            model: inscripcion
          });
     	
          documLayout.on("show", function(){
            documLayout.mainRegion.show(registerView);
            documLayout.negocioRegion.show(negociosView);
            documLayout.photosRegion.show(photosView);
          });
        
        }else{
            registerView = new Show.MissingDocument();
        }

        DocManager.mainRegion.show(documLayout);
      });
    }

  }
});

DocManager.module("ProfileApp", function(ProfileApp, DocManager, Backbone, Marionette, $, _){

  ProfileApp.Router = Marionette.AppRouter.extend({
    appRoutes: {
      "perfil": "profileManager",
    }
  });

  var API = {
    profileManager: function(){
      console.log('API: profileManager');
      ProfileApp.Edit.Controller.profileManager();
      //DocManager.execute("set:active:header", "profile");
    }
  };

  DocManager.on("edit:user:profile", function(){
    DocManager.navigate("/perfil");
    API.profileManager();
  });

  DocManager.addInitializer(function(){
    new ProfileApp.Router({
      controller: API
    });
  });

});

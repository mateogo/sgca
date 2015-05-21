DocManager.module("WorkflowApp", function(WorkflowApp, DocManager, Backbone, Marionette, $, _){

  WorkflowApp.Router = Marionette.AppRouter.extend({
    appRoutes: {
      'workflow': 'list',
    }
  });

  var api = {
    list: function(){
      WorkflowApp.List.Controller.list();
    }
  };

  DocManager.on('obrasworkflow:list', function(){
    DocManager.navigate('workflow');
    api.list();
  });

  


  DocManager.addInitializer(function(){
		new WorkflowApp.Router({
			controller: api
    });
  });

});

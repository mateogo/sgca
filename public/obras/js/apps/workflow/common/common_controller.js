DocManager.module("WorkflowApp.Common", function(Common, DocManager, Backbone, Marionette, $, _){


  var Entities = DocManager.module('Entities');

  Common.Controller = {
      initInternalLayout: function(){

        if(!Common.Session) Common.Session = {};

        if(!Common.Session.internalView){

          var queries = new Entities.QueryCollection();
          queries.fetch();

          var layout = new Common.InternalLayout();

          layout.on('show',function(){
            layout.getRegion('menuRegion').show(new Common.MenuView({collection:queries}));
          });

          layout.on('destroy',function(){
            Common.Session.internalView = null;
          });

          Common.Session.internalView = layout;
        }


        return Common.Session.internalView;
      },
      showMain: function(view){
        var layout = Common.Controller.initInternalLayout();
        if(layout._isShown){
          layout.getRegion('mainRegion').show(view);
        }else{
          layout.on('show',function(){
            layout.getRegion('mainRegion').show(view);
          });
        }
        return layout;
      }

  };

});

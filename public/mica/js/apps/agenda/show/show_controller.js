DocManager.module("AgendaApp.Show", function(Show, DocManager, Backbone, Marionette, $, _){


  var Entities = DocManager.module('Entities');

  Show.Controller = {
    show: function(item){
      loadModel(item).done(function(model){
          if(model instanceof Entities.ArtActivity){
            Show.Controller.showActivity(model);
          }else{
            Show.Controller.showEvent(model);
          }
      });
    },

    showActivity: function(activity){
      var view = new Show.ActivityView({model:activity});
      DocManager.mainRegion.show(view);
    },

    showEvent: function(event){
      var view = new Show.EventView({model:event});

      DocManager.mainRegion.show(view);
    }
  };




  var loadModel = function(item){
    var def = $.Deferred();
    
    var p = DocManager.request('artactivity:item:load',item);
    p.done(function(model){
      def.resolve(model);
    }).fail(function(e){
      def.reject(e);
    });

    return def.promise();
  };

});

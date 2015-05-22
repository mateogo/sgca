DocManager.module('AutorApp.Show', function(Show, DocManager, Backbone, Marionette, $, _){

    Show.ShowAutorView = Marionette.ItemView.extend({
      getTemplate: function(){
        return utils.templates.ShowAutorView;
      }
    });

});

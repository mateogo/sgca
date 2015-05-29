DocManager.module('KeyvaluesApp',function(KeyvaluesApp,DocManager,Backbonone,Marionette,$, _){

  KeyvaluesApp.Router = Marionette.AppRouter.extend({
    appRoutes: {
      "keyvalues/": "list",
      "keyvalues/edit/:tag": "edit",
    }
  });


  var API = {
    list: function() {
      var collection = DocManager.request('keyvalues:getCollection');
      var model = collection.model;

      return DocManager.request('abm:list', {
        collection: collection,
        model: model,
        listTitle: 'Listado de Configuraciones en utils.js',
      });
    },

    edit: function(tag) {
      var model = DocManager.request('keyvalues:get', tag);

      return DocManager.request('abm:edit', {
        model: model,
      });
    },
  };

  DocManager.reqres.setHandler('keyvalues:list',function(options){
    return API.list(options);
  });

  DocManager.reqres.setHandler('keyvalues:edit',function(options){
    return API.edit(options);
  });

  DocManager.addInitializer(function(){
    new KeyvaluesApp.Router({
      controller: API
    });
  });

});

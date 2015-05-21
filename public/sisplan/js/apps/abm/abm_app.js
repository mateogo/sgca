DocManager.module('AbmApp',function(AbmApp,DocManager,Backbonone,Marionette,$, _){

  AbmApp.Router = Marionette.AppRouter.extend({
    appRoutes: {
      "genericabm/list/:entityName": "listFromName",
      "genericabm/edit/:entityName/:id": "editFromName",
    }
  });


  var API = {
    listFromName: function(entityName) {
      return API.list({
        collection: DocManager.module('Entities.' + entityName),
        listTitle: 'Listado de ' + entityName,
      });
    },

    editFromName: function(entityName, id) {
      var model = new (DocManager.module('Entities.' + entityName))({_id: id});

      model.fetch().then(function() {
        var title = 'Editar ' + model.toString() + ' Modelo: ' + entityName + ' id: ' + id;

        return API.edit({
          model: model,
          title: title,
        });
      });
    },

    list: function(options){
      console.log('API: Abm:List ', options);
      return new AbmApp.List.Controller(options);
    },

    edit: function(options){
      console.log('API: Abm:Edit ', options);
      return new AbmApp.Edit.Controller(options);
    },

    new: function(options){
      console.log('API: Abm:New ', options);
      return new AbmApp.Edit.Controller(options);
    },

    remove: function(options){
      var model = options.model;
      DocManager.confirm('¿Estás seguro de borrar ' + model.toString() + '?').then(function(){
          model.destroy().done(function(){
            Message.success('Borrado');
          }).fail(function(e){
            alert(e);
          });
      });
    }
  };

  DocManager.reqres.setHandler('abm:list',function(options){
    return API.list(options);
  });

  DocManager.reqres.setHandler('abm:edit',function(options){
    return API.edit(options);
  });

  DocManager.reqres.setHandler('abm:new',function(options){
    return API.edit(options);
  });

  DocManager.reqres.setHandler('abm:remove',function(options){
    return API.remove(options);
  });

  DocManager.addInitializer(function(){
    new AbmApp.Router({
      controller: API
    });
  });

});

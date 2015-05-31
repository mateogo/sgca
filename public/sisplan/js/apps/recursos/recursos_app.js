DocManager.module('RecursosApp',function(RecursosApp,DocManager,Backbonone,Marionette,$, _){

  var Entities = DocManager.module('Entities');

  RecursosApp.Router = Marionette.AppRouter.extend({
    appRoutes: {
      'recursos/recurso/:id':      'show',
      'recursos/recurso/:id/edit': 'edit',
      'recursos/nuevo':            'create',
      'recursos':                  'list',
      'recursos/tipos':            'listTipos',
      'recursos/familias':         'listFamilias',
    }
  });


  var API = {
    list: function(){
      console.log('API: list: Recursos STUB');
      return new RecursosApp.List.Controller(id);
    },

    listTipos: function(){
      console.log('API: list: RecursoTipo');
      return DocManager.request('abm:list', {
        collection: DocManager.Entities.RecursoTipoCollection,
        title: 'Tipo de Recurso',
        listTitle: 'Tipos de Recursos',
      });
    },

    listFamilias: function(options){
      return new RecursosApp.Familias.List.Controller(options);
    },

    show: function(){
      console.log('API: show: Recursos STUB');
      return new RecursosApp.List.Controller(id);
    },
    edit: function(recurso){
      console.log('API: edit: Recurso STUB');
      return new RecursosApp.Edit.Controller(recurso);
    },
    create: function(template){
      console.log('API: new: Recurso STUB');
      var recurso = new Entities.Recurso(template);
      new RecursosApp.Edit.Controller(recurso);
      return recurso;
    },
    remove: function(recurso){
      console.log('API: remove: Recurso STUB FIXME: Ver cuando hay parents/child');
      DocManager.confirm('¿Estás seguro de borrar el recurso?').then(function(){
          recurso.destroy.done(function(){
              Message.success('Borrado');
            }).fail(function(e){
              alert(e);
            });
      });
    }
  };

  DocManager.on('recursos:list',function(){
    DocManager.navigate('recursos/');
    API.list();
  });

  DocManager.on('recurso:edit',function(recurso){
    API.edit(recurso);
  });

  DocManager.on('recurso:new',function(template){
    API.create(template);
  });

  DocManager.on('recurso:remove',function(recurso){
    API.remove(recurso);
  });

  DocManager.reqres.setHandler('recursos:familia:select', function(options) {
    return API.listFamilias({ modal: true });
  });

  DocManager.addInitializer(function(){
    new RecursosApp.Router({
      controller: API
    });
  });
});

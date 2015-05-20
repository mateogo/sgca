DocManager.module('RecursosApp.Tipos',function(RecursosApp,DocManager,Backbonone,Marionette,$, _){

  var Entities = DocManager.module('Entities');

  RecursosApp.Router = Marionette.AppRouter.extend({
    appRoutes: {
      'tipos/tipos/:id':      'show',
      'tipos/tipos/:id/edit': 'edit',
      'tipos/tipos/nuevo':    'create',
      'tipos/tipos':          'list',
    }
  });


  var API = {
    list: function(){
      console.log('API: list: Tipo de Recursos STUB');
      return new RecursosApp.Tipos.List.Controller(id);
    },
    show: function(tipo){
      console.log('API: show: Tipo de Recurso STUB');
      return new RecursosApp.Tipos.Show.Controller(tipo);
    },
    edit: function(tipo){
      console.log('API: edit: Tipo de Recurso STUB');
      return new RecursosApp.Tipos.Edit.Controller(tipo);
    },
    create: function(template){
      console.log('API: new: Tipo de Recurso STUB');
      var tipo = new Entities.RecursoTipo(template);
      new RecursosApp.Tipos.Edit.Controller(tipo);
      return tipo;
    },
    remove: function(tipo){
      console.log('API: remove: RecursoTipo STUB');
      DocManager.confirm('¿Estás seguro de borrar el tipo de tipo?').then(function(){
          tipo.destroy.done(function(){
              Message.success('Borrado');
            }).fail(function(e){
              alert(e);
            });
      });
    }
  };

  DocManager.on('recursos:tipos:list',function(){
    DocManager.navigate('tipos/');
    API.list();
  });

  DocManager.on('recursos:tipo:edit',function(recurso){
    API.edit(tipo);
  });

  DocManager.on('recursos:tipo:new',function(template){
    return API.create(template);
  });

  DocManager.on('recursos:tipo:remove',function(recurso){
    API.remove(tipo);
  });


  // Devuelve un nuevo RecursoTipo, cb() es llamado cuando se persiste en el backend.
  DocManager.reqres.setHandler('recursos:tipo:new', function(cb) {
    var tipo = API.create();
    tipo.listenToOnce('sync', cb);
    return tipo;
  });

  DocManager.addInitializer(function(){
    new RecursosApp.Router({
      controller: API
    });
  });
});

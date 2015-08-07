DocManager.module('BackendApp.AgendaMica',function(AgendaMica, DocManager, Backbone, Marionette, $, _){

  var backendApp = DocManager.module('BackendApp');
  var backendCommons = DocManager.module('BackendApp.Common.Views');
  var backendEntities = DocManager.module('Entities');

  var getSession = function(){
    if(!AgendaMica.Session){
      AgendaMica.Session = {views:{},model:null};
    }
    return AgendaMica.Session;
  };

  AgendaMica.Controller = {
    listAll: function(){
      loadCurrentUser().then( function(user){
        if(!getSession().mainLayout){
          buildLayout();
        }
      });
    }
  };

  var loadCurrentUser = function(){

    var defer = $.Deferred();

    dao.gestionUser.getUser(DocManager, function (user){
      getSession().currentUser = user;

      if(user && dao.gestionUser.hasPermissionTo('mica:manager', 'mica', {} ) ){
      //if(true){

        defer.resolve(user);


      }else{
        Message.warning('Debe iniciar sesión');
        window.open('/ingresar/#mica', '_self');
      }


    });

    return defer.promise();
  };


  //********** LAYOUT
	var buildLayout = function(){
    var session = getSession();

    session.views.layout = new backendCommons.Layout({model:new Backbone.Model({title: 'Agenda General - 2015'}) });
    //session.views.sidebarpanel = new backendCommons.SideBarPanel({model:session.model});
    session.views.mainlayout = new backendCommons.MainLayout({model:session.model});

    registerSidebarEvents(session, session.views.layout,session.views.mainlayout);
    registerMainLayoutEvents(session, session.views.layout, session.views.mainlayout);
    registerLayoutEvents(session, session.views.layout, session.views.mainlayout);

    session.filter = new backendEntities.MicaInteractionFilterFacet();

  };
  var registerSidebarEvents = function(session, layout, mainLayout){

  };

  var registerMainLayoutEvents = function(session, layout, mainlayout){
  	mainlayout.on('grid:model:edit', function(model){
  		var view = createView(session, mainlayout, model)

  	});

  	mainlayout.on('grid:model:remove', function(model){
      if(model.get('estado_alta')=== 'activo'){
        Message.confirm('<h3>¿Confirma la baja?</h3>',
            [{label:'Cancelar', class:'btn-success'},{label:'Aceptar', class:'btn-danger'} ], function(response){
          if(response === 'Aceptar'){
            DocManager.request("micaranking:partial:update",[model.id],{'estado_alta': 'baja'});
            getSession().collection.remove(model);
          }
        });
      }else{
        Message.confirm('<h3>¿Confirma la reactivación de la inscripción?</h3>',
            [{label:'Cancelar', class:'btn-success'},{label:'Aceptar', class:'btn-danger'} ], function(response){
          if(response === 'Aceptar'){
            DocManager.request("micaranking:partial:update",[model.id],{'estado_alta': 'activo'});
            getSession().collection.remove(model);
          }
        });

      }

  	});

    mainlayout.on('model:change:state', function(model, state){
      model.set('nivel_ejecucion', state);

      DocManager.request("micaranking:partial:update",[model.id],{'nivel_ejecucion': state});

    });

  };

  var registerLayoutEvents = function(session, layout, mainlayout){
    layout.on('show', function(){
    	layout.getRegion('mainRegion').show(mainlayout);
    });

    DocManager.mainRegion.show(layout);
  };


});

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

          initCrudManager(user,{});
        }
      });
    },
    listBySuscriptor: function(idSuscription,rol){
      var collection = new backendEntities.MicaAgendaOneCollection();
      collection.setSuscription(idSuscription,rol);

      var list = new AgendaMica.AgendaList({collection:collection,rol:rol});
      DocManager.mainRegion.show(list);
    }
  };

  var loadCurrentUser = function(){
    var defer = $.Deferred();
    dao.gestionUser.getUser(DocManager, function (user){
      getSession().currentUser = user;

      if(user && dao.gestionUser.hasPermissionTo('mica:manager', 'mica', {} ) ){
        defer.resolve(user);
      }else{
        Message.warning('Debe iniciar sesión');
        window.open('/ingresar/#mica', '_self');
      }
    });

    return defer.promise();
  };


  var initCrudManager = function(user, criterion){

    var collection =  new backendEntities.MicaAgendaCollection();
    collection.getFirstPage();
    getSession().collection = collection;


			getSession().crudManager = new backendCommons.CrudManager(
				  {
				    gridcols:[
				      {name: 'comprador',label:'Comprador', cell:AgendaMica.SuscriptorCell, editable:false},
				      {name: 'vendedor',label:'Vendedor', cell:AgendaMica.SuscriptorCell, editable:false},
				      {name: 'num_reunion', label:'# Reunión', cell:'string', editable:false},
				      {name: 'estado', label:'Estado', cell:AgendaMica.EstadoReunionCell, editable:false},
				      {name: 'feultmod', label:'Modificado', cell:'string', editable:false},
				      {label:'Acciones', cell: 'string', editable:false, sortable:false},
				    ],
				    filtercols:['num_reunion','feultmod'],
				    editEventName: 'micaagenda:edit',
				  },
				  {
				    test: 'TestOK',
				    parentLayoutView: getSession().views.mainlayout,

				    layoutTpl: utils.templates.MicarequestsLayout,
				    // formTpl: utils.templates.MicaInscriptionFormLayout,

            collection: getSession().collection,

				    editModel: backendEntities.MicaAgenda,
				    modelToEdit: null,
				    EditorView: AgendaMica.ReunionEdit,
				    editorOpts: {},

            filterEventName: 'micaagenda:backend:filter:rows',
            filterModel: backendEntities.MicaAgendaFilterFacet,
            filterTitle: 'Criterios de búsqueda',
            filterInstance: getSession().filter,

				  }
				);
     	getSession().views.mainlayout.listRegion.show(getSession().crudManager.getLayout());
		// });

	};


  var initAgendaForOne = function(idSuscription,rol){
    var collection = new backendEntities.MicaAgendaOneCollection();
    collection.setSuscription(idSuscription,rol);

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

    session.filter = new backendEntities.MicaAgendaFilterFacet();

  };

  var registerSidebarEvents = function(session, layout, mainLayout){
  };

  var registerMainLayoutEvents = function(session, layout, mainlayout){
  };

  var registerLayoutEvents = function(session, layout, mainlayout){
    layout.on('show', function(){
    	layout.getRegion('mainRegion').show(mainlayout);
      setTimeout(function(){
        mainlayout.$el.find('.js-excel').hide();
      });
    });

    DocManager.mainRegion.show(layout);
  };

  var API = {
    doFilter: function(){
      var session = getSession();
      var filter = session.filter;
      var collection = session.collection;

      collection.setQuery(filter);
    },
    popupAgenda: function(suscriptor){

    }
  };


  DocManager.on('micaagenda:backend:filter:rows',function(){
    API.doFilter();
  });


  DocManager.on('micaagenda:agendaone:showpopup',function(suscriptor){
    API.popupAgenda(suscriptor);
  });

});

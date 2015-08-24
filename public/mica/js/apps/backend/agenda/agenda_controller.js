DocManager.module('BackendApp.AgendaMica',function(AgendaMica, DocManager, Backbone, Marionette, $, _){

  var Entities = DocManager.module('Entities');
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
      var list = this._listBySuscription(idSuscription,rol);

      var layout = new AgendaMica.AgendaPage();
      layout.on('show',function(){
        layout.bodyRegion.show(list);
      });
      DocManager.mainRegion.show(layout);
    },

    listPopup: function(idSuscription,rol,url){
      var session = getSession();
      var list = this._listBySuscription(idSuscription,rol);

      var oncePopup = false;
      var popup;
      if(oncePopup){
        if(!session.popup){
          session.popup = DocManager.openPopup(list);
          session.popup.once('destroy',function(){
            session.popup = null;
          });
        }else{
          session.popup.bodyRegion.show(list);
        }
        popup = session.popup;
      }else{
        popup = DocManager.openPopup(list);
      }

      popup.setTitle('Agenda').setNavigationUrl(url);
    },

    listRight: function(idSuscription,rol){
      var collection = DocManager.request('micaagenda:searchAgenda',idSuscription,rol);

      var list = new AgendaMica.AgendaList({collection:collection,rol:rol});

      DocManager.openRightPanel(list);
    },

    showStatistics: function(){
      var collection = DocManager.request('micaagenda:statistics');

      var view = new AgendaMica.EstadisticView({collection:collection});
      DocManager.mainRegion.show(view);
    },
    _listBySuscription: function(idSuscription,rol){
      var collection = DocManager.request('micaagenda:searchAgenda',idSuscription,rol);

      var list = new AgendaMica.AgendaList({collection:collection,rol:rol});
      return list;
    },

    /**
     * pide un cnumber como <rol> para asignar a una reunion
     * @paran {MicaAgenda} reunion
     * @param {String} rol - 'comprador' o 'vendedor'
     */
    asignarByCNumber: function(reunion,rol){
      AgendaMica.requestCnumberUI(reunion,rol,function(cnumber){
        if(!cnumber) return;
        var params = {
          cnumber: cnumber,
          rol: rol
        };
        var p = DocManager.request('micaagenda:reunion:runaction',reunion,'asignarcnumber',params);

        p.fail(function(result){
          var error = result.responseJSON;
          if(error && error.code && error.code === 'meeting_unavailable'){
            AgendaMica.showMettingUnavailable(rol,new Entities.MicaAgenda(error.reunion));

          }else if(error && error.code && error.code === 'have_already'){
            AgendaMica.showHaveAlready(error.userMessage);

          }else if(error && error.userMessage){
            Message.error(error.userMessage);

          }else{
            Message.error('No se pudo asignar la reunión');
            console.error(result);
          }
        });
      });
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
				      {name: 'comprador', label:'Sector del Comprador', cell: AgendaMica.ActividadCell, editable:false},
				      {name: 'vendedor', label:'Sector del Vendedor', cell: AgendaMica.ActividadCell, editable:false},
				      {name: 'estado', label:'Estado', cell:AgendaMica.EstadoReunionCell, editable:false},
				      {name: 'feultmod', label:'Modificado', cell:'string', editable:false},
				      {label:'Acciones', cell: AgendaMica.ActionsCells, editable:false, sortable:false},
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
        var $btnExcel =  mainlayout.$el.find('.js-excel').hide();
        var $toolbar = $btnExcel.parent();
        var $btnStats = $('<button></button>',{class:'btn btn-default btn-sm btn-success',html:'<i class="glyphicon glyphicon-signal"></i> Estadisticas'});
        $btnStats.insertAfter($btnExcel);
        $btnStats.on('click',function(){
          $btnStats.unbind('click');
          API.showStatistics();
        });
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
    showStatistics: function(){
      DocManager.trigger('micaagenda:statistic');
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

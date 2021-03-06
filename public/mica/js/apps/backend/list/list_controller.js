DocManager.module('BackendApp.List',function(List, DocManager, Backbone, Marionette, $, _){
  var backendApp = DocManager.module('BackendApp');
  var backendCommons = DocManager.module('BackendApp.Common.Views');
  var backendEntities = DocManager.module('Entities');

  var getSession = function(){
    if(!List.Session){
      List.Session = {views:{},model:null};
    }
    return List.Session;
  }

	List.Controller = {
		listInscriptions: function(criterion){

			loadCurrentUser().then( function(user){
				if(!getSession().mainLayout){
					buildLayout();
				}
        // OjO solo para debug===================
        // console.log('Ready to check Users [%s]', user.get('username'));
        // if(user.get('username') === 'mgomezortega@gmail.com'){
        //   checkUsers();
        // }
        // // OjO ==================================

        initCrudManager(user, criterion, 'reset');

			});

		}

	};
  var checkUsers = function(){
    //DocManager.request('mica:check:users:data');
    //DocManager.request('user:repair:modules');

  };

  var loadCurrentUser = function(){

    var defer = $.Deferred();

		dao.gestionUser.getUser(DocManager, function (user){
      getSession().currentUser = user;

			if(user && dao.gestionUser.hasPermissionTo('mica:manager', 'mica', {} ) ){

	      defer.resolve(user);


			}else{
			  Message.warning('Debe iniciar sesión');
			  window.open('/mica/#bienvenido', '_self');
			}


   	});

   	return defer.promise();
  };


  var fetchCollection = function(user, criterion, step){
    var defer = $.Deferred(),
        action,
        query = {
          evento: 'mica',
          estado_alta: 'activo',
        };


    if(criterion){
      _.extend(query, criterion);
    }

    if(step === 'next'){
      action = 'getNextPage';
      getSession().collection.setQuery(query);
      getSession().collection.getNextPage().done(function (data){
        //console.log('===action: [%s]=== NextPage ==== Stop:[%s] col:[%s]  items:[%s]', action, step, getSession().collection.whoami, getSession().collection.length);
        defer.resolve(data);
      })

    }else if(step === 'previous'){
      action = 'getPreviousPage';
      getSession().collection.setQuery(query);
      getSession().collection.getPreviousPage().done(function (data){
        //console.log('===action: [%s]=== previousPage==== Stop:[%s] col:[%s]  items:[%s]', action, step, getSession().collection.whoami, getSession().collection.length);
        defer.resolve(data);
      })


    }else{
      action = 'getFirstPage';

      getSession().collection =  new DocManager.Entities.MicaRegistrationPaginatedCol();

      getSession().collection.setQuery(query);
      getSession().collection.getFirstPage().done(function(data){
        //console.log('===action: [%s]==== FirstPage ======= Stop:[%s] col:[%s]  items:[%s]', action, step, getSession().collection.whoami, getSession().collection.length);
        defer.resolve(data);
      });
    }



    // var fetchingEntities = DocManager.request('micarqst:query:entities', query, step );
  //   $.when(fetchingEntities).done(function(entities){
  //         defer.resolve(entities);
  //  });

    return defer.promise();
  };


  var fieldLabelCell = Backgrid.Cell.extend({
    render:function(){
      var value = this.model.getFieldLabel(this.column.get('name'));
      this.$el.html(value);
      return this;
    }
  });


  Backgrid.SolicitanteCell = Backgrid.Cell.extend({
      className: "string-cell",
      render: function(){
      	this.$el.html(this.model.get('solicitante').edisplayName);
        return this;
      },
  });
  Backgrid.VactivityCell = Backgrid.StringCell.extend({
      className: "string-cell",
      initialize: function(opt){
      	//console.log('initialize Cell[%s] [%s]', arguments.length, this.model.whoami, this.model.get('vendedor').vactividades)
      	this.model.set('bg_vendedor', this.model.get('vendedor').rolePlaying.vendedor ? this.model.get('vendedor').vactividades + "-" + this.model.get('vendedor').vporfolios.length : '');

      },
      render: function(){
      	//console.log('render Cell[%s] [%s]', arguments.length, this.model.whoami, this.model.get('vendedor').vactividades)
      	// var actividad = this.model.get('vendedor').rolePlaying.vendedor ? this.model.get('vendedor').vactividades + "-" + this.model.get('vendedor').vporfolios.length : ''
      	// this.model.set('bg_vendedor', actividad);
      	this.$el.html(this.model.get('bg_vendedor'));
        return this;
      },
  });
  Backgrid.CactivityCell = Backgrid.Cell.extend({
      className: "string-cell",
      render: function(){
      	var actividad = this.model.get('comprador').rolePlaying.comprador ? this.model.get('comprador').cactividades + "-" + this.model.get('comprador').cporfolios.length : ''
      	this.$el.html(actividad);
      	this.model.set('bg_comprador', actividad);
        return this;
      },
  });

  var drpDwnBtn = function(){
              return $('\
                  <div class="btn-group" role="group">\
                    <button type="button" class="btn btn-sm btn-default dropdown-toggle" data-toggle="dropdown" aria-expanded="false">\
                      <i class="fa fa-cog"></i>\
                    </button>\
                    <ul class="dropdown-menu pull-right" role="menu">\
                      <li><a href="#" class="js-trigger js-trigger-compradoraceptado"  role="button">Comprador Aceptado</a></li>\
                      <li><a href="#" class="js-trigger js-trigger-compradorrechazado" role="button">Comprador Rechazado</a></li>\
                      <li><a href="#" class="js-trigger js-trigger-observado" role="button">Observado</a></li>\
                      <li><a href="#" class="js-trigger js-trigger-absent" role="button">Ausente Rondas</a></li>\
                      <li><a href="#" class="js-trigger js-trigger-present" role="button">Presente Rondas</a></li>\
                      <li><a href="#" class="js-trigger js-trigger-activo" role="button">Inscripción Normal</a></li>\
                      <li><a href="#" class="js-trigger js-trigger-tardio" role="button">Inscripción Tardía</a></li>\
                    </ul>\
                </div>');
  };

  var EditViewCell = Backgrid.Cell.extend({
      render: function(){
          if(!this.rendered){
             var btnEdit = $('<button class="btn-link js-edit btn btn-sm btn-info" title="editar - ver"><span class="glyphicon glyphicon-edit"></span></button>');
             var btnRemove = $('<button class="btn-link js-trash btn btn-sm btn-danger" title="borrar"><span class="glyphicon glyphicon-remove"></span></button>');
             this.$el.append(btnEdit).append(btnRemove).append(drpDwnBtn());
             this.rendered = true;
          }
         return this;
      },

      events: {
          'click button.js-edit': 'editClicked',
          'click button.js-trash': 'trashClicked',
          'click .js-trigger-compradorrechazado': 'buyerRegected',
          'click .js-trigger-compradoraceptado': 'buyerAccepted',
          'click .js-trigger-observado': 'buyerObserved',
          'click .js-trigger-absent': 'buyerAbsent',
          'click .js-trigger-present': 'buyerPresent',
          'click .js-trigger-tardio': 'buyerTardio',
          'click .js-trigger-activo': 'buyerActivo',
      },
      updateRecord: function(e, nuevo_estado){
        var self = this;
        e.stopPropagation();e.preventDefault();

        self.$('.dropdown-toggle').dropdown('toggle');
        getSession().views.mainlayout.trigger('model:change:state',this.model, nuevo_estado, function(error){
        });
     },

      buyerAccepted: function(e){
        this.updateRecord(e, 'comprador_aceptado');
      },
      buyerRegected: function(e){
        this.updateRecord(e, 'comprador_rechazado');
      },
      buyerObserved: function(e){
        this.updateRecord(e, 'observado');
      },
      buyerAbsent: function(e){
        this.updateRecord(e, 'ausente');
      },
      buyerPresent: function(e){
        this.updateRecord(e, 'presente');
      },
      buyerTardio: function(e){
        this.updateRecord(e, 'tardio');
      },
      buyerActivo: function(e){
        this.updateRecord(e, 'activo');
      },


      editClicked: function(e){
          e.stopPropagation();e.preventDefault();
          getSession().views.mainlayout.trigger('grid:model:edit',this.model);
      },

      trashClicked: function(e){
          e.stopPropagation();e.preventDefault();
          getSession().views.mainlayout.trigger('grid:model:remove',this.model);
      }
    });


	var initCrudManager = function(user, criterion, step){

		$.when(fetchCollection(user, criterion, step)).done(function(entities){

			getSession().crudManager = new backendCommons.CrudManager(
				  {
				    gridcols:[
				      {name: 'cnumber', label:'Nro Inscr', cell:'string', editable:false},
				      {name: 'bg_vendedor',label:'Vendedor', cell:'vactivity', editable:false},
				      {name: 'bg_comprador',label:'Comprador', cell:'cactivity', editable:false},
				      {name: 'solicitante.edisplayName', label:'Solicitante', cell:fieldLabelCell, editable:false},
				      {name: 'solicitante.eprov', label:'Prov', cell:fieldLabelCell, editable:false},
				      {name: 'nivel_ejecucion', label:'Ejecución', cell:fieldLabelCell, editable:false},
				      {label:'Acciones', cell: EditViewCell, editable:false, sortable:false},
				    ],
				    filtercols:['cnumber', 'bg_vendedor', 'bg_comprador',  'nivel_ejecucion'],
				    editEventName: 'micarequest:edit',

				  },
				  {
				    test: 'TestOK',
				    parentLayoutView: getSession().views.mainlayout,

				    layoutTpl: utils.templates.MicarequestsLayout,
				    formTpl: utils.templates.MicaInscriptionFormLayout,

            collection: getSession().collection,

				    editModel: backendEntities.MicaRegistration,
				    modelToEdit: null,
				    EditorView: DocManager.MicaRequestApp.Edit.MicaWizardLayout,
				    editorOpts: {},

            filterEventName: 'mica:backend:filter:rows',
            filterModel: backendEntities.MicaFilterFacet,
            filterTitle: 'Criterios de búsqueda',
            filterInstance: getSession().filter,

				  }
				);
     	getSession().views.mainlayout.listRegion.show(getSession().crudManager.getLayout());
		});

	};


	//********** LAYOUT
	var buildLayout = function(){
    var session = getSession();

    session.views.layout = new backendCommons.Layout({model:new Backbone.Model({title: 'Rondas de Negocios - MICA 2015'}) });
    //session.views.sidebarpanel = new backendCommons.SideBarPanel({model:session.model});
    session.views.mainlayout = new backendCommons.MainLayout({model:session.model});

    registerSidebarEvents(session, session.views.layout,session.views.mainlayout);
    registerMainLayoutEvents(session, session.views.layout, session.views.mainlayout);
    registerLayoutEvents(session, session.views.layout, session.views.mainlayout);

    session.filter = new backendEntities.MicaFilterFacet();

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
            DocManager.request("micarqst:partial:update",[model.id],{'estado_alta': 'baja'});
            getSession().collection.remove(model);
          }
        });
      }else{
        Message.confirm('<h3>¿Confirma la reactivación de la inscripción?</h3>',
            [{label:'Cancelar', class:'btn-success'},{label:'Aceptar', class:'btn-danger'} ], function(response){
          if(response === 'Aceptar'){
            DocManager.request("micarqst:partial:update",[model.id],{'estado_alta': 'activo'});
            getSession().collection.remove(model);
          }
        });

      }

  	});

    mainlayout.on('model:change:state', function(model, state){
      if(state === 'ausente' || state === 'presente'){
        model.set('estado_rondas', state);
        DocManager.request("micarqst:partial:update",[model.id],{'estado_rondas': state});

      }else if(state === 'activo' || state === 'tardio'){
        model.set('estado_rondas', state);
        DocManager.request("micarqst:partial:update",[model.id],{'estado_rondas': state});        

      }else{
        model.set('nivel_ejecucion', state);
        DocManager.request("micarqst:partial:update",[model.id],{'nivel_ejecucion': state});        
      }
    });

  };

  var registerLayoutEvents = function(session, layout, mainlayout){
    layout.on('show', function(){
    	layout.getRegion('mainRegion').show(mainlayout);
    });

    DocManager.mainRegion.show(layout);
  };
  //***************** Vista de un Modelo ***************
  var createView = function(session, mainlayout, model){
  	var editorLayout = new backendCommons.ModelEditorLayout({
  		model: model
  	})
  	registerEditorLayoutEvents(session, mainlayout, editorLayout, model)

  };

  var registerEditorLayoutEvents = function(session, mainlayout, editorlayout, model){
  	var modelView = new List.MicaRequestView({
  		model: model
  	})


  	mainlayout.hideList();

    editorlayout.on('accept:buyer', function(){
      model.set('nivel_ejecucion', 'comprador_aceptado');
      DocManager.request("micarqst:partial:update",[model.id],{'nivel_ejecucion': 'comprador_aceptado'});
      mainlayout.showList();
      editorlayout.destroy();

    });


  	editorlayout.on('close:view', function(){
	  	mainlayout.showList();
	  	editorlayout.destroy();

  	});


  	editorlayout.on('show', function(){
    	editorlayout.getRegion('showRegion').show(modelView);

  	})
  	mainlayout.getRegion('editRegion').show(editorlayout);

  };

  var downloadCollection = function(user, criterion, exportCol){
    var defer = $.Deferred(),
        action,
        exportCol,
        query = {
          evento: 'mica',
          estado_alta: 'activo',
        };


    if(criterion){
      _.extend(query, criterion);
    }

    action = 'getFirstPage';

    exportCol.setQuery(query);

    exportCol.getFirstPage().done(function(data){
      //console.log('===action: [%s]==== FirstPage ======= Stop:[%s] col:[%s]  items:[%s]', action, step, getSession().collection.whoami, getSession().collection.length);
      defer.resolve(data);
    });

    return defer.promise();
  };


  var API = {

    fetchFilteredCollection: function(filter, step){
      initCrudManager(getSession().currentUser, filter.attributes, step)

    },

    buildExcelExport: function(){

      var excelCol = new DocManager.Entities.MicaExportCollection();

      $.when(downloadCollection(getSession().currentUser, getSession().filter.attributes, excelCol)).done(function(entities){
        excelCol.exportRecords();
      });


      // var excelCol = new DocManager.Entities.MicaExportCollection();
      // excelCol.fetch({
      //   success: function(data){
      //       excelCol.exportRecords();
      //   }
      // })
    },
  };

  DocManager.on("mica:backend:filter:rows", function(filter, step){
    API.fetchFilteredCollection(filter, step);
  });

  DocManager.on('mica:suscriptions:export:excel', function(){
    API.buildExcelExport();
  });


});

DocManager.module('FondoBackendApp.List',function(List, DocManager, Backbone, Marionette, $, _){
  var backendApp = DocManager.module('FondoBackendApp');
  var backendCommons = DocManager.module('FondoBackendApp.Common.Views');
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
        // if(user.get('username') === 'mgomezortega@gmail.com'){
        //   checkUsers();          
        // }
        // // OjO ==================================

        initCrudManager(user, criterion, 'reset');
			});
		},

    viewInscription: function(cnumber){
  
      loadCurrentUser().then( function(user){
        if(!getSession().mainLayout){
          buildLayout();
        }
        // OjO solo para debug===================
        // if(user.get('username') === 'mgomezortega@gmail.com'){
        //   checkUsers();          
        // }
        // // OjO ==================================
        getSession().filter.set({cnumber: cnumber});

        initCrudManager(user, getSession().filter.attributes, 'reset');
      });
    },

	}; 
  var checkUsers = function(){

    //DocManager.request('fondo:check:users:data');

  };
	
  var loadCurrentUser = function(){

    var defer = $.Deferred();

		dao.gestionUser.getUser(DocManager, function (user){
      getSession().currentUser = user;

      if(user && dao.gestionUser.hasPermissionTo('fondo:manager', 'fondo', {} ) ){

	      defer.resolve(user);


			}else{
			  Message.warning('Debe iniciar sesión');
			  window.open('/ingresar/#fondo', '_self');
			}

 
   	});

   	return defer.promise();
  };

  var downloadCollection = function(user, criterion, exportCol){
    var defer = $.Deferred(),
        action,
        exportCol,
        query = {
          evento: 'fondo',
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


  var fetchCollection = function(user, criterion, step){
    var defer = $.Deferred(),
        action,
        query = {
          evento: 'fondo',
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

      getSession().collection =  new DocManager.Entities.FondoRegistrationPaginatedCol();

      getSession().collection.setQuery(query);
      getSession().collection.getFirstPage().done(function(data){
        //console.log('===action: [%s]==== FirstPage ======= Stop:[%s] col:[%s]  items:[%s]', action, step, getSession().collection.whoami, getSession().collection.length);
        defer.resolve(data);
      });
    }



    // var fetchingEntities = DocManager.request('fondorqst:query:entities', query, step );
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

  var drpDwnBtn = function(){
              return $('\
                  <div class="btn-group" role="group">\
                    <button type="button" class="btn btn-xs btn-default dropdown-toggle" title="modificar calificación" data-toggle="dropdown" aria-expanded="false">\
                      <i class="fa fa-cog"></i>\
                    </button>\
                    <ul class="dropdown-menu pull-right" role="menu">\
                      <li><a href="#" class="js-trigger js-trigger-inscripcion-aceptado"  role="button">Aceptado</a></li>\
                      <li><a href="#" class="js-trigger js-trigger-inscripcion-rechazado" role="button">Rechazado</a></li>\
                      <li><a href="#" class="js-trigger js-trigger-inscripcion-observado" role="button">Observado</a></li>\
                    </ul>\
                </div>');
  };

  var EditViewCell = Backgrid.Cell.extend({
      render: function(){
          if(!this.rendered){
             var btnEdit = $('<button class="btn btn-xs btn-info js-edit" title="editar - VER"><span class="glyphicon glyphicon-edit"></span></button>');
             var btnAsset = $('<button class="btn btn-xs btn-danger js-edit-asset" title="reparar archivos"><span class="glyphicon glyphicon-pencil"></span></button>');
             var btnRemove = $('<button class="btn btn-xs btn-danger js-trash" title="borrar"><span class="glyphicon glyphicon-remove"></span></button>');
             this.$el.append(btnEdit).append(btnAsset).append(btnRemove).append(drpDwnBtn());
             this.rendered = true;
          }
        this.$el.css('width','115px');
        return this;
      },
      
      events: {
          'click button.js-edit': 'editClicked',
          'click button.js-edit-asset': 'editAssetClicked',
          'click button.js-trash': 'trashClicked',
          'click .js-trigger-inscripcion-aceptado': 'formAccepted',
          'click .js-trigger-inscripcion-observado': 'formObserved',
          'click .js-trigger-inscripcion-rechazado': 'formRegected',
      },
      updateRecord: function(e, nuevo_estado){
        var self = this;
        e.stopPropagation();e.preventDefault();
 
        self.$('.dropdown-toggle').dropdown('toggle');
        getSession().views.mainlayout.trigger('model:change:state',this.model, nuevo_estado, function(error){
        });
     },

      formAccepted: function(e){
        this.updateRecord(e, 'aceptado');
      },
      formObserved: function(e){
        this.updateRecord(e, 'observado');
      },
      formRegected: function(e){
        this.updateRecord(e, 'rechazado');
      },

      editClicked: function(e){
          e.stopPropagation();e.preventDefault();
          getSession().views.mainlayout.trigger('grid:model:edit',this.model);
      },
        
      editAssetClicked: function(e){
          e.stopPropagation();e.preventDefault();
          getSession().views.mainlayout.trigger('grid:model:asset:edit',this.model);
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
	            {name: 'requerimiento.tsolicitud', label:'Solicitud', cell:fieldLabelCell, editable:false},
              {name: 'requerimiento.eventname', label:'Evento', cell:fieldLabelCell, editable:false},
              {name: 'movilidad.description', label:'Viaje', cell:fieldLabelCell, editable:false},

				      {name: 'movilidad.qpax', label:'Pax', cell:fieldLabelCell, editable:false},
              {name: 'responsable.eprov', label:'Prov', cell:fieldLabelCell, editable:false},
				      {label:'Acciones', cell: EditViewCell, editable:false, sortable:false},
				    ],
				    filtercols:['cnumber', 'responsable.eprov', 'movilidad.description'],
				    editEventName: 'fondorequest:edit',

				  },
				  {
				    test: 'TestOK',
				    parentLayoutView: getSession().views.mainlayout,

				    layoutTpl: utils.templates.FondorequestsLayout,
				    formTpl: utils.templates.FondoInscriptionFormLayout,
				    
            collection: getSession().collection,

				    editModel: backendEntities.FondoRegistration,
				    modelToEdit: null,
				    EditorView: DocManager.FondoRequestApp.Edit.FondoWizardLayout,
				    editorOpts: {},

            filterEventName: 'fondo:backend:filter:rows',
            filterModel: backendEntities.FondoFilterFacet,
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
    
    session.views.layout = new backendCommons.Layout({model:session.model});
    //session.views.sidebarpanel = new backendCommons.SideBarPanel({model:session.model});
    session.views.mainlayout = new backendCommons.MainLayout({model:session.model});
    
    registerSidebarEvents(session, session.views.layout,session.views.mainlayout);
    registerMainLayoutEvents(session, session.views.layout, session.views.mainlayout);
    registerLayoutEvents(session, session.views.layout, session.views.mainlayout);

    session.filter = new backendEntities.FondoFilterFacet();

  };
  var registerSidebarEvents = function(session, layout, mainLayout){

  };

  var registerMainLayoutEvents = function(session, layout, mainlayout){
  	mainlayout.on('grid:model:edit', function(model){
  		var view = createView(session, mainlayout, model)

  	});

    mainlayout.on('grid:model:asset:edit', function(model){
      console.log('Edit Asset');
      var view = createRepairAssetView(session, mainlayout, model)

    });


  	mainlayout.on('grid:model:remove', function(model){
      if(model.get('estado_alta')=== 'activo'){
        Message.confirm('<h3>¿Confirma la baja?</h3>',
            [{label:'Cancelar', class:'btn-success'},{label:'Aceptar', class:'btn-danger'} ], function(response){
          if(response === 'Aceptar'){
            DocManager.request("fondorqst:partial:update",[model.id],{'estado_alta': 'baja'});
            getSession().collection.remove(model);
          }
        });
      }else{
        Message.confirm('<h3>¿Confirma la reactivación de la inscripción?</h3>',
            [{label:'Cancelar', class:'btn-success'},{label:'Aceptar', class:'btn-danger'} ], function(response){
          if(response === 'Aceptar'){
            DocManager.request("fondorqst:partial:update",[model.id],{'estado_alta': 'activo'});
            getSession().collection.remove(model);
          }
        });

      }

  	});

    mainlayout.on('model:change:state', function(model, state){
      model.set('nivel_ejecucion', state);

      DocManager.request("fondorqst:partial:update",[model.id],{'nivel_ejecucion': state});

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

    var assets = DocManager.request('fondorqst:fetch:assets', model);
    assets.done(function(assetList){
      var editorLayout = new backendCommons.ModelEditorLayout({
        model: model,
      })
      registerEditorLayoutEvents(session, mainlayout, editorLayout, model, assetList)

    });

  };

  //***************** Vista de un Modelo ***************
  var createRepairAssetView = function(session, mainlayout, model){
    console.log('CreateRepairAssetView BEGIN')

    var assets = DocManager.request('fondorqst:fetch:orphan:assets', model);
    assets.done(function(assetList){
      var editorLayout = new backendCommons.ModelEditorLayout({
        model: model,
      })
      registerAssetEditorLayoutEvents(session, mainlayout, editorLayout, model, assetList)

    });



  };

  var registerAssetEditorLayoutEvents = function(session, mainlayout, editorlayout, model, assetList){
    var modelView = new List.FondoRepairAssetView({
      model: model,
      adjuntos: assetList
    })
    

    mainlayout.hideList();

    // editorlayout.on('accept:buyer', function(){
    //   model.set('nivel_ejecucion', 'aceptado');
    //   DocManager.request("fondorqst:partial:update",[model.id],{'nivel_ejecucion': 'aceptado'});
    //   mainlayout.showList();
    //   editorlayout.destroy();

    // });


    editorlayout.on('close:view', function(){
      mainlayout.showList();
      editorlayout.destroy();

    });


    editorlayout.on('show', function(){
      editorlayout.getRegion('showRegion').show(modelView);
 
    })
    mainlayout.getRegion('editRegion').show(editorlayout);

  };

  var registerEditorLayoutEvents = function(session, mainlayout, editorlayout, model, assetList){
  	var modelView = new List.FondoRequestView({
  		model: model,
      adjuntos: assetList
  	})
  	

  	mainlayout.hideList();

    // editorlayout.on('accept:buyer', function(){
    //   model.set('nivel_ejecucion', 'aceptado');
    //   DocManager.request("fondorqst:partial:update",[model.id],{'nivel_ejecucion': 'aceptado'});
    //   mainlayout.showList();
    //   editorlayout.destroy();

    // });


  	editorlayout.on('close:view', function(){
	  	mainlayout.showList();
	  	editorlayout.destroy();

  	});


  	editorlayout.on('show', function(){
    	editorlayout.getRegion('showRegion').show(modelView);
 
  	})
  	mainlayout.getRegion('editRegion').show(editorlayout);

  };
  var API = {

    fetchFilteredCollection: function(filter, step){
      initCrudManager(getSession().currentUser, filter.attributes, step)

    },

    buildExcelExport: function(){
      var excelCol = new DocManager.Entities.FondoExportCollection();

      $.when(downloadCollection(getSession().currentUser, getSession().filter.attributes, excelCol)).done(function(entities){
        excelCol.exportRecords();
      });

    },

  };

  DocManager.on("fondo:backend:filter:rows", function(filter, step){
    API.fetchFilteredCollection(filter, step);
  });

  DocManager.on('fondo:suscriptions:export:excel', function(){
    API.buildExcelExport();
  });


});

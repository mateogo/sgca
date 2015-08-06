DocManager.module('BackendApp.RankingMica',function(RankingMica, DocManager, Backbone, Marionette, $, _){
  var backendApp = DocManager.module('BackendApp');
  var backendCommons = DocManager.module('BackendApp.Common.Views');
  var backendEntities = DocManager.module('Entities');

  var getSession = function(){
    if(!RankingMica.Session){
      RankingMica.Session = {views:{},model:null};
    }
    return RankingMica.Session;
  }
  
	RankingMica.Controller = {
		listRanking: function(criterion){
	
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

  var downloadCollection = function(user, criterion, exportCol){
    var defer = $.Deferred(),
        action,
        exportCol,
        query = {
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

      getSession().collection =  new DocManager.Entities.MicaRankingPaginatedCol();

      getSession().collection.setQuery(query);
      getSession().collection.getFirstPage().done(function(data){
        //console.log('===action: [%s]==== FirstPage ======= Stop:[%s] col:[%s]  items:[%s]', action, step, getSession().collection.whoami, getSession().collection.length);
        defer.resolve(data);
      });
    }

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
                    <button type="button" class="btn btn-xs btn-default dropdown-toggle" title="modificar calificación" data-toggle="dropdown" aria-expanded="false">\
                      <i class="fa fa-cog"></i>\
                    </button>\
                    <ul class="dropdown-menu pull-right" role="menu">\
                      <li><a href="#" class="js-trigger js-trigger-inscripcion-aceptado"  role="button">Aceptado</a></li>\
                      <li><a href="#" class="js-trigger js-trigger-inscripcion-rechazado" role="button">Rechazado</a></li>\
                      <li><a href="#" class="js-trigger js-trigger-inscripcion-observado" role="button">Observado</a></li>\
                    </ul>\
                </div>');  };

  var EditViewCell = Backgrid.Cell.extend({
      render: function(){
          if(!this.rendered){
             var btnEdit = $('<button class="btn btn-xs btn-info js-edit"  title="editar - ver"><span class="glyphicon glyphicon-edit"></span></button>');
             var btnRemove = $('<button class="btn btn-xs btn-danger js-trash" title="borrar"><span class="glyphicon glyphicon-remove"></span></button>');
             this.$el.append(btnEdit).append(btnRemove).append(drpDwnBtn());
             this.rendered = true;
          }
        this.$el.css('width','95px');
        return this;
      },
      
      events: {
          'click button.js-edit': 'editClicked',
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
              {name: 'ename', label:'Responsable', cell:'string', editable:false},
              {name: 'eprov', label:'Prov', cell:'string', editable:false},
              {name: 'iscomprador', label:'C?', cell:'string', editable:false},
              {name: 'isvendedor', label:'V?', cell:'string', editable:false},
              {name: 'receptor_requests', label:'Recibidas', cell:'number', editable:false},
              {name: 'emisor_requests', label:'Solicitadas', cell:'number', editable:false},
				      {label:'Acciones', cell: EditViewCell, editable:false, sortable:false},
				    ],
				    filtercols:['cnumber', 'ename',  'nivel_ejecucion'],
				    editEventName: 'micaranking:edit',

				  },
				  {
				    test: 'TestOK',
            baseLayoutTitle: 'Ranking interacciones - MICA 2015',
				    parentLayoutView: getSession().views.mainlayout,

				    layoutTpl: utils.templates.MicaRankingListLayout,
				    formTpl: utils.templates.MicaRankingFormLayout,
				    
            collection: getSession().collection,

				    editModel: backendEntities.MicaRanking,
				    modelToEdit: null,
				    EditorView: null,
				    editorOpts: {},

            filterEventName: 'micaranking:backend:filter:rows',
            filterModel: backendEntities.MicaInteractionFilterFacet,
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
    
    session.views.layout = new backendCommons.Layout({model:new Backbone.Model({title: 'Ranking interacciones - 2015'}) });
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
  //***************** Vista de un Modelo ***************
  var createView = function(session, mainlayout, model){
  	var editorLayout = new backendCommons.ModelEditorLayout({
      template: utils.templates.MicaRankingItemLayout,
  		model: model,
  	})
  	registerEditorLayoutEvents(session, mainlayout, editorLayout, model)

  };
//TODO
  var registerEditorLayoutEvents = function(session, mainlayout, editorlayout, model){
  	var interactionView = new RankingMica.MicaRankingItemView({
  		model: model
  	});
    registerInteractionView(session, mainlayout,editorlayout, model, interactionView);
  	

  	mainlayout.hideList();

    editorlayout.on('accept:micaranking', function(){
      model.set('nivel_ejecucion', 'aceptado');
      DocManager.request("micaranking:partial:update",[model.id],{'nivel_ejecucion': 'aceptado'});
      mainlayout.showList();
      editorlayout.destroy();

    });


  	editorlayout.on('close:view', function(){
	  	mainlayout.showList();
	  	editorlayout.destroy();

  	});


  	editorlayout.on('show', function(){
    	editorlayout.getRegion('showRegion').show(interactionView);
 
  	})
  	mainlayout.getRegion('editRegion').show(editorlayout);

  };


  var buildProfileView = function(mainlayout, profile){

    var profileView = new DocManager.BackendApp.List.MicaRequestView({
      model: profile
    });
    var profileLayout = new RankingMica.MicaProfileViewLayout({
      model: profile
    });

    profileLayout.on('show', function(){
      profileLayout.getRegion('viewRegion').show(profileView);
    });

    profileLayout.on('close:view', function(){
      mainlayout.showEdit();
      profileLayout.destroy();

    });


    mainlayout.hideEdit();
    mainlayout.getRegion('viewRegion').show(profileLayout);


  };

  var registerInteractionView = function(session, mainlayout,editorlayout, model, view){
    view.on('profile:view', function(interaction, profileId){
      console.log('BUBLED at Ranking Controller!')
      var fetchingMicaRequest = DocManager.request("micarqst:entity", profileId);
       
      $.when(fetchingMicaRequest).done(function(micarqst){
       
        buildProfileView(mainlayout, micarqst);
 
      });
    });

  };



  var API = {

    fetchFilteredCollection: function(filter, step){
      initCrudManager(getSession().currentUser, filter.attributes, step)

    },

    buildExcelExport: function(){
      var excelCol = new DocManager.Entities.MicaInteractionExportCollection();

      $.when(downloadCollection(getSession().currentUser, getSession().filter.attributes, excelCol)).done(function(entities){
        excelCol.exportRecords();
      });

    },
  };

  DocManager.on("micaranking:backend:filter:rows", function(filter, step){
    API.fetchFilteredCollection(filter, step);
  });

  DocManager.on('micaranking:suscriptions:export:excel', function(){
    API.buildExcelExport();
  });


});

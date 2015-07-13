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
			console.log('list INSCRIPTIONS BEGIN [%s]', criterion);
	
			loadCurrentUser().then( function(user){
				console.log('currentUser LOADED [%s]',user.get('username'));
				if(!getSession().mainLayout){
					buildLayout();
				}
				if(!getSession().crudManager){
					initCrudManager(user, criterion)

				}
			});

		}

	}; 
	
  var loadCurrentUser = function(){

    var defer = $.Deferred();

		dao.gestionUser.getUser(DocManager, function (user){
      getSession().currentUser = user;

			if(user && dao.gestionUser.hasPermissionTo('mica:manager', 'mica', {} ) ){
				console.log('dao validate user OK: [%s]', user.get('username'));
	      defer.resolve(user);


			}else{
			  console.log('No validó el Usuario');
			  Message.warning('Debe iniciar sesión');
			  window.open('/ingresar/#mica', '_self');
			}

 
   	});

   	return defer.promise();
  };

	var fetchCollection = function(user, criterion){
		var defer = $.Deferred(),
				query = {
					evento: 'mica',
					rubro: 'general',
          //rolePlaying: 'comprador',
    //      'vendedor.vactividades': 'editorial',
          //'vendedor.rolePlaying.vendedor': 'true',
				};
    if(criterion){
      //console.log('fetchCollection Criterion [%s]', criterion)
      query = _.extend(query, criterion);
    }
 
		var fetchingEntities = DocManager.request('micarqst:query:entities', query );
    $.when(fetchingEntities).done(function(entities){
          defer.resolve(entities);
 		});

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
                    </ul>\
                </div>');
  };

  var EditViewCell = Backgrid.Cell.extend({
      render: function(){
          if(!this.rendered){
             var btnEdit = $('<button class="btn-link js-edit" title="editar - ver"><span class="glyphicon glyphicon-edit"></span></button>');
             var btnRemove = $('<button class="btn-link js-trash" title="borrar"><span class="glyphicon glyphicon-remove"></span></button>');
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

/*
      changeState: function(e){
        var self = this;

        e.stopPropagation();e.preventDefault();
        console.log('Change State')
        Message.confirm('Seleccione el nuevo ESTADO', 
          [
            {label:'Comprador Aceptado', class:'btn-success'},
            {label:'Comprador Rechazado', class:'btn-danger'}, 
            {label:'Ficha Incompleta', class:'btn-default'}, 
            {label:'Ficha Observada', class:'btn-default'}
          ], 
          function(response){
          if(response === 'Comprador Aceptado'){
            console.log('Comprador Aceptado');
            self.trigger('mica:state:changed');

          }else if (response === 'Comprador Rechazado'){
            console.log('Change Rechazado')
          }else if (response === 'Ficha Incompleta'){
            console.log('Ficha incompleta')
          }else if (response === 'Ficha Observada'){
            console.log('Ficha observada')
          }

        });


      },
*/        
      editClicked: function(e){
          e.stopPropagation();e.preventDefault();
          getSession().views.mainlayout.trigger('grid:model:edit',this.model);
      },
        
      trashClicked: function(e){
          e.stopPropagation();e.preventDefault();
          getSession().views.mainlayout.trigger('grid:model:remove',this.model);
      }
    });
  

	var initCrudManager = function(user, criterion){

		$.when(fetchCollection(user, criterion)).done(function(entities){
			console.log('initCrudManager. when: col[%s] [%s] [%s]',entities.length, entities.whoami, entities.state.firstPage)
			
			getSession().collection = entities;

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
				    filtercols:['cnumber', 'bg_vendedor', 'bg_comprador', 'solicitante.edisplayName','solicitante.eprov', 'nivel_ejecucion'],
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
    
    session.views.layout = new backendCommons.Layout({model:session.model});
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
  		console.log('Vamos a Remover!!!!')

  	});
    mainlayout.on('model:change:state', function(model, state){
      console.log('cambio de estado: [%s] [%s]', model.get('cnumber'), state);
      model.set('nivel_ejecucion', state);
      DocManager.request("micarqst:partial:update",[model.id],{'nivel_ejecucion': state});

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
      console.log('acceptBuyer BUBBLED' )
      model.set('nivel_ejecucion', 'comprador_aceptado');
      DocManager.request("micarqst:partial:update",[model.id],{'nivel_ejecucion': 'comprador_aceptado'});
      mainlayout.showList();
      editorlayout.destroy();

    });


  	editorlayout.on('close:view', function(){
  		console.log('close:view BUBBLED')
	  	mainlayout.showList();
	  	editorlayout.destroy();

  	});


  	editorlayout.on('show', function(){
    	editorlayout.getRegion('showRegion').show(modelView);
 
  	})
  	mainlayout.getRegion('editRegion').show(editorlayout);

  };
  var API = {

    fetchFilteredCollection: function(filter){
      console.log('fetchFilteredCollection BEGIN');
      console.dir(filter.attributes)
      initCrudManager(getSession().currentUser, filter.attributes)

    },

    buildExcelExport: function(){
      var excelCol = new DocManager.Entities.MicaExportCollection();
      excelCol.fetch({
        success: function(data){
            excelCol.exportRecords();
        }
      })      
    },
  };

  DocManager.on("mica:backend:filter:rows", function(filter){
    API.fetchFilteredCollection(filter);
  });
  DocManager.on('mica:suscriptions:export:excel', function(){
    API.buildExcelExport();
  });


});

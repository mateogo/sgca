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
			console.log('list INSCRIPTIONS BEGIN ');
	
			loadCurrentUser().then( function(user){
				console.log('currentUser LOADED [%s]',user.get('username'));
				if(!getSession().mainLayout){
					buildLayout();
				}
				if(!getSession().crudManager){
					initCrudManager(user)

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
			  //window.open('/ingresar/#mica', '_self');
			}

 
   	});

   	return defer.promise();
  };

	var fetchCollection = function(user){
		var defer = $.Deferred(),
				query = {
					evento: 'mica',
					rubro: 'general',
				};

		var fetchingEntities = DocManager.request('micarqst:query:entities', query );
    $.when(fetchingEntities).done(function(entities){
          defer.resolve(entities);
 		});

 		return defer.promise();
	};



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

  var EditViewCell = Backgrid.Cell.extend({
      render: function(){
          if(!this.rendered){
             var btnEdit = $('<button class="btn-link js-edit" title="editar - ver"><span class="glyphicon glyphicon-edit"></span></button>');
             var btnRemove = $('<button class="btn-link js-trash" title="borrar"><span class="glyphicon glyphicon-remove"></span></button>');
             this.$el.append(btnEdit).append(btnRemove);
             this.rendered = true;
          }
         return this;
      },
      events: {
          'click button.js-edit': 'editClicked',
          'click button.js-trash': 'trashClicked',
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
  

	var initCrudManager = function(user){

		$.when(fetchCollection(user)).done(function(entities){
			console.log('initCrudManager. when: col[%s]',entities.length)
			
			getSession().collection = entities;

			getSession().crudManager = new backendCommons.CrudManager(
				  {
				    gridcols:[
				      {name:'cnumber', label:'Nro Inscr', cell:'string', editable:false},
				      {name: 'bg_vendedor',label:'Vendedor', cell:'vactivity', editable:false},
				      {name: 'bg_comprador',label:'Comprador', cell:'cactivity', editable:false},
				      {name: 'solicitante', label:'Solicitante', cell:'solicitante', editable:false},
				      {name:'estado_alta', label:'Estado', cell:'string', editable:false},
				      {name:'nivel_ejecucion', label:'Ejecución', cell:'string', editable:false},
				      {label: 'Acciones', cell: EditViewCell, editable:false, sortable:false},
				    ],
				    filtercols:['cnumber', 'bg_vendedor', 'bg_comprador', 'solicitante','estado_alta', 'nivel_ejecucion'],
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
				  }
				);
     	getSession().views.mainlayout.listRegion.show(getSession().crudManager.getLayout());
		});

	};


	//********** LAYOUT
	var buildLayout = function(){
    var session = getSession();
    
    session.views.layout = new backendCommons.Layout({model:session.model});
    session.views.sidebarpanel = new backendCommons.SideBarPanel({model:session.model});
    session.views.mainlayout = new backendCommons.MainLayout({model:session.model});
    
    registerSidebarEvents(session, session.views.layout,session.views.mainlayout, session.views.sidebarpanel);
    registerMainLayoutEvents(session, session.views.layout, session.views.mainlayout,session.views.sidebarpanel);
    registerLayoutEvents(session, session.views.layout, session.views.mainlayout, session.views.sidebarpanel);
  };
  var registerSidebarEvents = function(session, layout, mainlayout, sidebar){

  };

  var registerMainLayoutEvents = function(session, layout, mainlayout, sidebar){
  	mainlayout.on('grid:model:edit', function(model){
  		var view = createView(session, mainlayout, model)

  	});
  	mainlayout.on('grid:model:remove', function(model){
  		console.log('Vamos a Remover!!!!')

  	});

  };
  
  var registerLayoutEvents = function(session, layout, mainlayout, sidebar){
    layout.on('show', function(){
    	layout.getRegion('sidebarRegion').show(sidebar);
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
		

});

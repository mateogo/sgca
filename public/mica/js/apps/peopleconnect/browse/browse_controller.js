DocManager.module('RondasApp.Browse',function(Browse, DocManager, Backbone, Marionette, $, _){
  var backendApp = DocManager.module('RondasApp');
  var backendCommons = DocManager.module('RondasApp.Common.Views');
  var backendEntities = DocManager.module('Entities');

  var getSession = function(){
    if(!Browse.Session){
      Browse.Session = {views:{},model:null};
    }
    return Browse.Session;
  }
  
	Browse.Controller = {
		browseProfiles: function(criterion){
			console.log('list INSCRIPTIONS BEGIN [%s]', criterion);
	
			loadCurrentUser().then( function(user){
				console.log('currentUser LOADED [%s]',user.get('username'));
				if(!getSession().mainLayout){
					buildLayout();
				}
				if(!getSession().crudManager){
					initCrudManager(user, criterion,'reset');

				}
			});

		}

	}; 
	
  var loadCurrentUser = function(){

    var defer = $.Deferred();

		dao.gestionUser.getUser(DocManager, function (user){
      getSession().currentUser = user;

      if(user && dao.gestionUser.hasPermissionTo('mica:user', 'mica', {} ) ){

        //Verificación: el usuario YA TIENE una inscripción en MICA
        fetchingMicaRequest = DocManager.request("micarqst:fetchby:user", user, "mica");
        $.when(fetchingMicaRequest).done(function(micarqst){
          //console.log('FETCHING MicaRequest [%s] [%s]', micarqst.whoami, micarqst.id);
          if((micarqst && micarqst.id ) || dao.gestionUser.hasPermissionTo('mica:manager', 'mica', {} ) ){
            // YA TIENE una inscripción
            setInscriptionData(micarqst);
            defer.resolve(user);
          }else{
            console.log('No encuentro Inscripción');
            Message.warning('Debe estar inscripto en MICA 2015 para acceder a esta aplicación');
            window.open('/ingresar/#mica', '_self');

          }
        });


			}else{
			  console.log('No validó el Usuario');
			  Message.warning('Debe iniciar sesión y estar inscripto en MICA 2015');
			  window.open('/ingresar/#mica', '_self');
			}

 
   	});

   	return defer.promise();
  };

	// var fetchCollection_nueva = function(user, criterion, step){
	// 	var defer = $.Deferred(),
 //        action,
	// 			query = {
	// 				evento: 'mica',
	// 			};


 //    if(!getSession().collection){
 //      getSession().collection =  new DocManager.Entities.MicaRegistrationPaginatedCol();
 //    }

 //    if(criterion){
 //      query = _.extend(query, criterion);
 //    }

 //    getSession().collection.queryParams = _.extend(query, getSession().collection.state);


 //    if(step === 'next'){
 //      action = 'getNextPage'
 //      getSession().collection.getPage(2);

 //    }else if(step === 'previous'){
 //      action = 'getPreviousPage'

 //    }else{
 //      action = 'getFirstPage'
 //      getSession().collection[action]().done(function(data){
 //          defer.resolve(data);
 //      });
 //     }
 //    console.log('===[%s]======== fetchCollection ========= [%s] [%s]  [%s]', action, step, getSession().collection.whoami, getSession().collection.length);



	// 	// var fetchingEntities = DocManager.request('micarqst:query:entities', query, step );
 //  //   $.when(fetchingEntities).done(function(entities){
 //  //         defer.resolve(entities);
 // 	// 	});

 // 		return defer.promise();
	// };
  var setInscriptionData = function(micarqst){
    console.log('Inscripción encontrada: [%s]', micarqst.get('cnumber'));
    getSession().micarqst = micarqst;

  };

  var fetchCollection = function(user, criterion, step){
    var defer = $.Deferred(),
        action,
        query = {
          estado_alta: 'activo',
          evento: 'mica',
        };


    if(!getSession().collection){
      getSession().collection =  new DocManager.Entities.MicaRegistrationPaginatedCol();
    }

    if(criterion){
      _.extend(query, criterion);
    }
    getSession().collection.setQuery(query);

    if(step === 'next'){
      action = 'getNextPage'
      //getSession().collection.getPage(2);
      getSession().collection.getNextPage().done(function (data){
        //console.log('===action: [%s]=== NextPage ==== Stop:[%s] col:[%s]  items:[%s]', action, step, getSession().collection.whoami, getSession().collection.length);
        defer.resolve(data);
      })

    }else if(step === 'previous'){
      action = 'getPreviousPage'
      getSession().collection.getPreviousPage().done(function (data){
        //console.log('===action: [%s]=== previousPage==== Stop:[%s] col:[%s]  items:[%s]', action, step, getSession().collection.whoami, getSession().collection.length);
        defer.resolve(data);
      })


    }else{
      action = 'getFirstPage'
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
				    filtercols:['cnumber', 'bg_vendedor', 'bg_comprador', 'solicitante.edisplayName','solicitante.eprov', 'nivel_ejecucion'],
				    editEventName: 'micarequest:edit',

				  },
				  {
				    test: 'TestOK',
				    parentLayoutView: getSession().views.mainlayout,

				    layoutTpl: utils.templates.BrowseProfilesLayout,
				    formTpl: utils.templates.MicaInscriptionFormLayout,
				    
            collection: getSession().collection,
            collectionView: Browse.ProfileCollection, 

				    editModel: backendEntities.MicaRegistration,
				    modelToEdit: null,
				    EditorView: DocManager.MicaRequestApp.Edit.MicaWizardLayout,
				    editorOpts: {},

            filterEventName: 'mica:rondas:filter:rows',
            filterModel: backendEntities.MicaFilterFacet,
            filterTitle: 'Criterios de búsqueda',
            filterInstance: getSession().filter,
            filterEditor: Browse.BrowseProfilesFilterEditor,

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
      console.log('MainLayout View Profile BUBLLED!!!!')
  		var view = createView(session, mainlayout, model)

  	});
    mainlayout.on('toggle:profile:favorite', function(model){
      console.log('MainLayout View Profile BUBLLED!!!!')

      toggleFavoritos(session, mainlayout, model)

    });

    mainlayout.on('add:meeting:rondas', function(model){
      console.log('MainLayout View Meeting BUBLLED!!!!')
      var editor = openMeetingEditor(session, mainlayout, model)

    });

    mainlayout.on('answer:meeting:rondas', function(model){
      console.log('MainLayout View ANSWER Meeting BUBLLED!!!!')
      var editor = openAnswerEditor(session, mainlayout, model)

    });

    // TODO add:profile:to:favorite
    // mainlayout.on('model:change:state', function(model, state){
    //   //console.log('cambio de estado: [%s] [%s]', model.get('cnumber'), state);
    //   model.set('nivel_ejecucion', state);
    //   DocManager.request("micarqst:partial:update",[model.id],{'nivel_ejecucion': state});

    // });

  };
  
  var registerLayoutEvents = function(session, layout, mainlayout){
    layout.on('show', function(){
    	layout.getRegion('mainRegion').show(mainlayout);
    });

    DocManager.mainRegion.show(layout);
  };

  //=============================
  // Model Detailed View
  //=============================
  var createView = function(session, mainlayout, model){
  	var editorLayout = new backendCommons.ModelEditorLayout({
  		model: model
  	})
  	registerEditorLayoutEvents(session, mainlayout, editorLayout, model)

  };
  var registerEditorLayoutEvents = function(session, mainlayout, editorlayout, model){
  	var modelView = new Browse.BrowseProfileView({
  		model: model
  	})
  	
  	mainlayout.hideList();
    // TODO
    // editorlayout.on('accept:buyer', function(){
    //   model.set('nivel_ejecucion', 'comprador_aceptado');
    //   DocManager.request("micarqst:partial:update",[model.id],{'nivel_ejecucion': 'comprador_aceptado'});
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



  //=============================
  // Solicitud de Entrevista
  //=============================
  var openMeetingEditor = function(session, mainlayout, otherprofile){
    var facetEditor = new DocManager.Entities.MicaInteractionFactoryFacet();
    openMeetingForm(session, mainlayout, otherprofile, facetEditor);

  };

  var openMeetingForm = function(session, mainlayout, otherprofile, facetEditor){
    console.log('Meeting FORM: [%s] [%s]', otherprofile.whoami, otherprofile.get('cnumber'));
    var form = new Backbone.Form({
      model: facetEditor,
    });
    
    var modal = new Backbone.BootstrapModal({
      content: form,
      title: 'Mensaje' ,
      okText: 'aceptar',
      cancelText: 'cancelar',
      enterTriggersOk: false,
    });

    modal.on('ok',function(){
        form.commit();
        console.log('FORM COMMIT: ready to insert');
        //----------------------------------------------------: facet       user asking for meeting    user's mica profile  other's profile
        toggleReunion(getSession().currentUser.id, otherprofile, 'reusolicitada');
        DocManager.request('micainteractions:new:interaction', form.model, getSession().currentUser, getSession().micarqst,    otherprofile);
        toggleReunion(otherprofile.get('user').userid, getSession().micarqst, 'reurecibida');
    });

    modal.open();    
  };

  //=============================
  // Answer Entrevista
  //=============================
  var openAnswerEditor = function(session, mainlayout, otherprofile){
    var userid = getSession().currentUser.id,
        myprofile = getSession().micarqst,
        mode = 'receptor',
        fetchRecords,
        facetEditor;
    console.log('OpenAnswerEditor: fetchRecors FIRED')
 
    fetchRecords = DocManager.request("micainteraction:queryby:otherprofile", userid, myprofile, otherprofile, mode);
    $.when(fetchRecords).done(function(entities){
      console.log('entities found: [%s]', entities.length);
      if(!entities.length) {
        Message.warning('No hay solicitudes pendientes para este perfil');
      }else{
        facetEditor = new DocManager.Entities.MicaInteractionAnswerFacet();
        openAnswerForm(session, mainlayout, otherprofile, facetEditor, entities.at(0))
      }

    });  

  };

  var openAnswerForm = function(session, mainlayout, otherprofile, facetEditor, interactionRecord){
    console.log('Meeting FORM: [%s] [%s]', otherprofile.whoami, otherprofile.get('cnumber'));
    var form = new Backbone.Form({
      model: facetEditor,
    });
    
    var modal = new Backbone.BootstrapModal({
      content: form,
      title: 'Mensaje' ,
      okText: 'aceptar',
      cancelText: 'cancelar',
      enterTriggersOk: false,
    });

    modal.on('ok',function(){
        form.commit();
        console.log('FORM COMMIT: ready to insert');
        //----------------------------------------------------: facet       user asking for meeting    user's mica profile  other's profile
        responseReunion(getSession().currentUser.id, otherprofile, 'reusolicitada');
        DocManager.request('micainteractions:answer:interaction', form.model, getSession().currentUser, getSession().micarqst,    otherprofile, interactionRecord);
        responseReunion(otherprofile.get('user').userid, getSession().micarqst, 'reurecibida');
    });

    modal.open();    
  };


  //=============================================================
  // TOGGLE toggle Toggle Favoritos FAVORITOS favoritos
  //=============================================================
  var toggleFavoritos = function(session, mainlayout, model){
    var token = {};
    var mydata = model.get(getSession().currentUser.id) || {};
    if(mydata.favorito){
      if(mydata.favorito == true || maydata.favorito == 'true'){
        mydata.favorito = false;
      }else{
        mydata.favorito = true;
      }
    }else{
     mydata.favorito = true;
    }
    token[getSession().currentUser.id] = mydata;
    DocManager.request("micarqst:partial:update",[model.id], token);

  };
  //=============================================================
  // TOGGLE toggle Toggle Reunion REUNION reunion
  //=============================================================
  var toggleReunion = function(userid, micaprofile, modoreunion){
    var token = {};
    var mydata = micaprofile.get(userid) || {};
    if(mydata[modoreunion]){
      if(mydata[modoreunion] == 1 || maydata[modoreunion] === '1'){
        mydata[modoreunion] = 0;
      }else{
        mydata[modoreunion] = 1;
      }
    }else{
     mydata[modoreunion] = 1;
    }
    token[userid] = mydata;
    DocManager.request("micarqst:partial:update",[micaprofile.id], token);

  };

  //=============================================================
  // RESPONSE OK Reunion REUNION reunion
  //=============================================================
  var responseReunion = function(userid, micaprofile, modoreunion){
    var token = {};
    var mydata = micaprofile.get(userid) || {};
    mydata[modoreunion] = 2;
    token[userid] = mydata;
    DocManager.request("micarqst:partial:update",[micaprofile.id], token);

  };



  var API = {

    fetchFilteredCollection: function(filter, step){
      //console.log('fetchFilteredCollection BEGIN [%s]', step);
      //filter.set('favorito', true);
      filter.set('userid', getSession().currentUser.id);

      initCrudManager(getSession().currentUser, filter.attributes, step)

    }
  };

  DocManager.on("mica:rondas:filter:rows", function(filter, step){
    API.fetchFilteredCollection(filter, step);
  });


});

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

			loadCurrentUser().then( function(user){
        getSession().filter = new backendEntities.MicaFilterFacet(criterion);
        getSession().filter.set('userid', getSession().currentUser.id);
      
        criterion = getSession().filter.attributes;

				if(!getSession().mainLayout){
					buildLayout();
				}

				initCrudManager(user, criterion,'reset');

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

          if((micarqst && micarqst.id ) || dao.gestionUser.hasPermissionTo('mica:manager', 'mica', {} ) ){
            setInscriptionData(micarqst);
            defer.resolve(user);
          }else{
            Message.warning('Debe estar inscripto en MICA 2015 para acceder a esta aplicación');
            window.open('/mica/#bienvenido', '_self');

          }
        });


			}else{
			  Message.warning('Debe iniciar sesión y estar inscripto en MICA 2015');
			  window.open('/mica/#bienvenido', '_self');
			}

 
   	});

   	return defer.promise();
  };

  var setInscriptionData = function(micarqst){
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
      getSession().collection.getNextPage().done(function (data){
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

  
  Backgrid.VactivityCell = Backgrid.StringCell.extend({
      className: "string-cell",
      initialize: function(opt){
      	this.model.set('bg_vendedor', this.model.get('vendedor').rolePlaying.vendedor ? this.model.get('vendedor').vactividades + "-" + this.model.get('vendedor').vporfolios.length : '');

      },
      render: function(){
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
    session.views.layout = new backendCommons.Layout({model:new Backbone.Model({title: 'Rondas de Negocios - MICA 2015'}) });
    //session.views.sidebarpanel = new backendCommons.SideBarPanel({model:session.model});
    session.views.mainlayout = new backendCommons.MainLayout({model:session.model});
    
    registerSidebarEvents(session, session.views.layout,session.views.mainlayout);
    registerMainLayoutEvents(session, session.views.layout, session.views.mainlayout);
    registerLayoutEvents(session, session.views.layout, session.views.mainlayout);

  };
  var registerSidebarEvents = function(session, layout, mainLayout){

  };

  var registerMainLayoutEvents = function(session, layout, mainlayout){

  	mainlayout.on('grid:model:edit', function(model){
  		var view = createView(session, mainlayout, model)

  	});

    mainlayout.on('toggle:profile:favorite', function(model){
      toggleFavoritos(session, mainlayout, model)

    });

    mainlayout.on('add:meeting:rondas', function(model, view){
      var editor = openMeetingEditor(session, view, model)

    });

    mainlayout.on('answer:meeting:rondas', function(model, view){
      var editor = openAnswerEditor(session, view, model)

    });

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
  var openMeetingEditor = function(session, itemview, otherprofile){
    var userid = getSession().currentUser.id,
        myprofile = getSession().micarqst,
        mode = 'emisor',
        fetchRecords,
        facetEditor;


    fetchRecords = DocManager.request("micainteraction:queryby:otherprofile", userid, myprofile, otherprofile, mode);
    $.when(fetchRecords).done(function(entities){
      if(!entities.length) {
        facetEditor = new DocManager.Entities.MicaInteractionFactoryFacet();
        openMeetingForm(session, itemview, otherprofile, facetEditor, new DocManager.Entities.MicaInteraction());
      }else{
        facetEditor = new DocManager.Entities.MicaInteractionFactoryFacet( {slug: entities.at(0).get('emisor_slug'), nivel_interes: entities.at(0).get('emisor_nivel_interes'), rol:  entities.at(0).get('emisor_rol'), description: entities.at(0).get('description') } );
        openMeetingForm(session, itemview, otherprofile, facetEditor, entities.at( 0 ))
      }

    });  


  };

  var openMeetingForm = function(session, itemview, otherprofile, facetEditor, interactionRecord){
    var form = new Backbone.Form({
      model: facetEditor,
      template: _.template(utils.templates.AskEditor(interactionRecord.attributes)),
    });
    
    var modal = new Backbone.BootstrapModal({
      content: form,
      title: 'Solicitud de reunión' ,
      okText: 'aceptar',
      cancelText: 'cancelar',
      enterTriggersOk: false,
    });

    modal.on('ok',function(){
        var errors = form.commit({validate: true});

        if(!errors){
          //----------------------------------------------------: facet       user asking for meeting    user's mica profile  other's profile
          addNewReunion(getSession().currentUser.id, getSession().micarqst, otherprofile);
          DocManager.request('micainteractions:new:interaction', form.model, getSession().currentUser, getSession().micarqst,    otherprofile, interactionRecord);
            itemview.$(".js-interact-reunion").html('¡Reunión Solicitada!');
            itemview.$(".js-interact-reunion").addClass('solicitada');
        }else{
          Message.warning('Se produjo un error en la actualización de sus datos. Inténtelo nuevamente');
        }
    });
    
    modal.open();    
  };

  //=============================
  // Answer Entrevista
  //=============================
  var openAnswerEditor = function(session, itemview, otherprofile){
    var userid = getSession().currentUser.id,
        myprofile = getSession().micarqst,
        mode = 'receptor',
        fetchRecords,
        facetEditor;
 
    fetchRecords = DocManager.request("micainteraction:queryby:otherprofile", userid, myprofile, otherprofile, mode);
    $.when(fetchRecords).done(function(entities){
      if(!entities.length) {
        Message.warning('No hay solicitudes pendientes para este perfil');
      }else{
        facetEditor = new DocManager.Entities.MicaInteractionAnswerFacet({slug: entities.at(0).get('receptor_slug'), nivel_interes: entities.at(0).get('receptor_nivel_interes')});
        openAnswerForm(session, itemview, otherprofile, facetEditor, entities.at(0))
      }

    });  

  };

  var openAnswerForm = function(session, itemview, otherprofile, facetEditor, interactionRecord){

    var form = new Backbone.Form({
      model: facetEditor,
      template: _.template(utils.templates.AnswerEditor(interactionRecord.attributes)),
    });
    
    var modal = new Backbone.BootstrapModal({
      content: form,
      title: 'Pedido de reunión recibida' ,
      okText: 'aceptar',
      cancelText: 'cancelar',
      enterTriggersOk: false,
    });

    modal.on('ok',function(){
        var errors = form.commit({validate: true});
        if(!errors){
          //----------------------------------------------------: facet       user asking for meeting    user's mica profile  other's profile
          responseReunion(getSession().currentUser.id, getSession().micarqst, otherprofile);
          DocManager.request('micainteractions:answer:interaction', form.model, getSession().currentUser, getSession().micarqst,    otherprofile, interactionRecord);
          itemview.$(".js-interact-reunion").html('¡Pedido de reunión contestada!');
          itemview.$(".js-interact-reunion").addClass('recibida');
          itemview.$(".js-interact-reunion").addClass('active');
        }else{
          Message.warning('Se produjo un error en la actualización de sus datos. Inténtelo nuevamente');
        }
    });

    modal.open();    
  };


  //=============================================================
  // TOGGLE toggle Toggle Favoritos FAVORITOS favoritos
  //=============================================================
  var toggleFavoritos = function(session, mainlayout, model){
    model.toggleFavoritos(session.currentUser.id);
  };

  //=============================================================
  // TOGGLE toggle Toggle Reunion REUNION reunion
  //=============================================================
  addNewReunion = function(userid, micaprofile, otherprofile){
    // EMISOR: userid @ micaprofile
    // RECEPTOR: otheruserid @ otherprofile

    // A) Marcamos el profile del receptor con los datos del emisor
    //    Este registro lo debe hallar el emisor cuándo busca sus reuniones solicitadas (en las que fue 'emisor')
    editMeetingToken(userid, otherprofile, 'emisor', 1);

    // B) Marcamos el profile del emisor con los datos del receptor
    //    Este registro lo debe hallar el receptor cuándo busca las reuniones recibida (en las que fue 'receptor')
    editMeetingToken(otherprofile.get('user').userid , micaprofile, 'receptor', 1);


  }

  var editMeetingToken = function(userid, profile, modosolicitud, solvalue){
    profile.editMeetingToken(userid, modosolicitud, solvalue);
  };

  //=============================================================
  // RESPONSE OK Reunion REUNION reunion
  //=============================================================
  responseReunion = function(userid, micaprofile, otherprofile){
    // RECEPTOR: userid @ micaprofile
    // EMISOR: otheruserid @ otherprofile

    // A) Editamos la marca del RECEPTOR, que ahora contesta el peido.
    editMeetingToken(userid, otherprofile, 'receptor', 2);

    // B) Editamos el profile del EMISOR para que sepa que YA fue visto y calificado por el RECEPTOR
    editMeetingToken(otherprofile.get('user').userid , micaprofile, 'emisor', 2);
  }


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

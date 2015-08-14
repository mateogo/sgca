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

  var fetchLinkedCol = function(user, criterion, step){
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
      getSession().linkedcol.setQuery(query);
      getSession().linkedcol.getNextPage().done(function (data){
        //console.log('===action: [%s]=== NextPage ==== Stop:[%s] col:[%s]  items:[%s]', action, step, getSession().linkedcol.whoami, getSession().linkedcol.length);
        defer.resolve(data);
      })

    }else if(step === 'previous'){
      action = 'getPreviousPage';
      getSession().linkedcol.setQuery(query);
      getSession().linkedcol.getPreviousPage().done(function (data){
        //console.log('===action: [%s]=== previousPage==== Stop:[%s] col:[%s]  items:[%s]', action, step, getSession().linkedcol.whoami, getSession().linkedcol.length);
        defer.resolve(data);
      })


    }else{
      action = 'getFirstPage';

      getSession().linkedcol =  new DocManager.Entities.MicaRankingNonPaginatedCol();

      getSession().linkedcol.setQuery(query);
      getSession().linkedcol.getFirstPage().done(function(data){
        //console.log('===action: [%s]==== FirstPage ======= Stop:[%s] col:[%s]  items:[%s]', action, step, getSession().linkedcol.whoami, getSession().linkedcol.length);
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


  //*****************************
  // Backgrid Cell
  //*****************************
  var EditViewCellDeprecated = Backgrid.Cell.extend({
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

  var ActividadViewCell = Backgrid.Cell.extend({
      className: "string-cell",
      render: function(){
        var label =[];
        if(this.model.get('iscomprador')) label.push('C:' + this.model.get('cactividades') + '(' + this.model.buildCSubSectorList() + ')');
        if(this.model.get('isvendedor'))  label.push('V:' + this.model.get('vactividades') + '(' + this.model.buildVSubSectorList() + ')');

      	this.$el.html( label.join('<br>'));
        return this;
      },
  });
  var interactionTpl = _.template("<span title='<%= title %>'><%= data %></span>");

  var interactionTitleTpl = _.template("Rol:<%= rol %> Emisor: <%= emisor %>(<%= nie %>) / Receptor: <%= receptor %>(<%= nir %>)");
  var cnumberTpl = _.template('<a href="#" class="js-profile-view" role="button"><span title="ver perfil"><%= cnumber %></span></a>');
  var emisorTpl = _.template('<a href="#" class="js-emisorlist-view" role="button"><span title="ver lista de reuniones "><%= emisor %></span></a>');

  var ReceptorViewCell = Backgrid.Cell.extend({
      className: "string-cell",
      render: function(){
        var label =[];
        var data = this.model.get('as_receptor_nie') +' / '+ this.model.get('as_receptor_nir');
        if(data === '0 / 0') data = '';
        var title = interactionTitleTpl({rol: this.model.get('as_receptor_rol'), emisor: this.model.get('as_receptor_slug'), receptor:  this.model.get('as_receptor_answer'), nie:  this.model.get('as_receptor_nie'), nir:  this.model.get('as_receptor_nir')});
        this.$el.html(interactionTpl({title: title, data: data }));
        return this;
      },
  });

  var EmisorViewCell = Backgrid.Cell.extend({
      className: "string-cell",
      render: function(){
        var label =[];
        var data = this.model.get('as_emisor_nie') +' / '+ this.model.get('as_emisor_nir');
        if(data === '0 / 0') data = '';
        //var title = this.model.get('as_emisor_rol') +': '+this.model.get('as_emisor_slug') +' / '+ this.model.get('as_emisor_answer');
        var title = interactionTitleTpl({rol: this.model.get('as_emisor_rol'), emisor: this.model.get('as_emisor_slug'), receptor:  this.model.get('as_emisor_answer'), nie:  this.model.get('as_emisor_nie'), nir:  this.model.get('as_emisor_nir')});
        this.$el.html(interactionTpl({title: title, data: data }));
        return this;
      },
  });
  var CnumberViewCell = Backgrid.Cell.extend({
      className: "string-cell js-profile-view",

      events: {
          'click .js-profile-view': 'profileView',
      },

      profileView: function(e){
        var self = this;
        e.stopPropagation();e.preventDefault();

        console.log('ProfileView at CnumberCell');
        var fetchingMicaRequest = DocManager.request("micarqst:entity", this.model.get('profileid'));

        $.when(fetchingMicaRequest).done(function(micarqst){

          buildProfileView(getSession().views.mainlayout, micarqst);

        });
      },

      render: function(){
        this.$el.html(cnumberTpl({cnumber: this.model.get('cnumber')}) );
        return this;
      },
  });

  var EmisorListViewCell = Backgrid.Cell.extend({
      className: "string-cell",

      events: {
          'click .js-emisorlist-view': 'emisorList',
      },

      emisorList: function(e){
        var self = this;
        e.stopPropagation();e.preventDefault();

        $.when(DocManager.request("micainteractions:query:emisorlist", self.model)).done(function(list){
          //console.log('emisorlist: length[%s]', list.length);

          var emisorList = new RankingMica.MicaRankingEmisorCollectionView({collection: list});
          emisorList.render();
          //console.log('EmisorList:[%s]', $(emisorList.el).html())

          DocManager.confirm($(emisorList.el).html(), {okText: 'Volver', cancelText: '.'}).done(function(){
            emisorList.destroy();
          });

        });
      },

      render: function(){
        if(this.model.get('emisor_requests')){
          this.$el.html(emisorTpl({emisor: this.model.get('emisor_requests')}) );
        }else{
          this.$el.html("0");
        }
        return this;
      },
  });

  var ReceptorListViewCell = Backgrid.Cell.extend({
      className: "string-cell",

      events: {
          'click .js-emisorlist-view': 'emisorList',
      },

      emisorList: function(e){
        var self = this;
        e.stopPropagation();e.preventDefault();

        $.when(DocManager.request("micainteractions:query:receptorlist", self.model)).done(function(list){
          console.log('emisorlist: length[%s]', list.length);

          var emisorList = new RankingMica.MicaRankingEmisorCollectionView({collection: list});
          emisorList.render();
          console.log('EmisorList:[%s]', $(emisorList.el).html())

          DocManager.confirm($(emisorList.el).html(), {okText: 'Volver', cancelText: '.'}).done(function(){
            emisorList.destroy();
          });

        });
      },

      render: function(){
        if(this.model.get('receptor_requests')){
          this.$el.html(emisorTpl({emisor: this.model.get('receptor_requests')}) );
        }else{
          this.$el.html("0");
        }
        return this;
      },
  });

  var PaisProvCell = Backgrid.Cell.extend({
      className: "string-cell",

      render: function(){
        var data = this.model.get('prov') +'/ '+ this.model.get('pais');
        //var title = interactionTitleTpl({rol: this.model.get('as_emisor_rol'), emisor: this.model.get('as_emisor_slug'), receptor:  this.model.get('as_emisor_answer')});
        this.$el.html(data);
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

  var drpDwnTpl = _.template( '\
        <div class="btn-group acciones" role="group" aria-label="...">\
          <button type="button" class="btn btn-sm btn-success js-agendar <%= hasMeetingClassAttr %> "><%= hasMeeting %></button>\
          <div class="btn-group" role="group">\
            <button type="button" class="btn btn-default btn-sm  dropdown-toggle" data-toggle="dropdown" aria-expanded="false">\
              <span class="caret"></span>\
            </button>\
            <ul class="dropdown-menu pull-right" role="menu">\
              <li><a href="#" class="js-desagendar" >Eliminar reunión</a></li>\
              <li><a href="#" class="js-agenda-view" >Ver agenda candidato</a></li>\
            </ul>\
          </div>\
        </div>');

  var AgendarViewCell = Backgrid.Cell.extend({
      initialize: function(opt){
        this.model.bind("change", this.render, this);
        var promis = this.model.fetchMeetingNumber(getSession().comprador.get('profileid'), this.model.get('profileid'));
      },

      render: function(){
        var meeting_estado  = this.model.get('meeting_estado');
        var meeting_number = this.model.get('meeting_number');

        if(meeting_estado === 'error'){
          this.$el.html(drpDwnTpl({hasMeeting: 'Error', hasMeetingClassAttr: 'js-meeting-error'}));
          return this;
        }

        if(meeting_number === -1){
          // SIN ASIGNAR
          this.$el.html(drpDwnTpl({hasMeeting: 'Agendar', hasMeetingClassAttr: 'js-meeting-no-asignada'}));

        }else if(meeting_number === 0){
          // NO HAY DISPONIBILIDAD
          this.$el.html(drpDwnTpl({hasMeeting: 'Sin dispobilidad', hasMeetingClassAttr: 'js-meeting-unavailable'}));

        }else{
          // ASIGNADA
          this.$el.html(drpDwnTpl({hasMeeting: 'Reu# '+this.model.get('meeting_number'), hasMeetingClassAttr: 'js-meeting-asignada'}));
        }

        this.$el.css('width','150px');
        return this;
      },

      events: {
        'click': 'agendar',
      },

      agendar: function(){
        var self = this,
            query;
        //console.log('agendar!!!', self.model.whoami,getSession().comprador.get('cnumber'), self.model.get('cnumber') );

        if(self.model.get('meeting_number') && self.model.get('meeting_number') !== -1){
          Message.warning('Reunión previamente asignada: #' + self.model.get('meeting_number'));
          return;
        }
        if(getSession().comprador.meetingRol() === 'comprador'){
          query = {
            compradorid:  getSession().comprador.get('profileid'),
            vendedorid: self.model.get('profileid'),
          };
        }else{
          query = {
            vendedorid:  getSession().comprador.get('profileid'),
            compradorid: self.model.get('profileid'),
          };
        }

        var p = DocManager.request('micaagenda:assign', query);
        p.done(function(response){
          var num = response.num_reunion;
          var estado = response.estado;

          if(estado === 'unavailable'){
            Message.warning('No hay lugares disponibles');
          }else{
            Message.success('Asignado a #'+num);
          }
          self.model.set('meeting_number', num);
          self.model.set('meeting_estado', estado);
          //self.render();

        }).fail(function(){
          Message.error('No se pudo asignar');
          self.model.set('meeting_number', 0);
          self.model.set('meeting_estado', 'error');
          self.render();
        });

      },
    });



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
      editClicked: function(e){
          e.stopPropagation();e.preventDefault();
          getSession().views.mainlayout.trigger('grid:model:edit',this.model);
      },

      trashClicked: function(e){
          e.stopPropagation();e.preventDefault();
          getSession().views.mainlayout.trigger('grid:model:remove',this.model);
      }
    });
  //*****************************
  // END: Backgrid Cell
  //*****************************


	var initCrudManager = function(user, criterion, step){

		$.when(fetchCollection(user, criterion, step)).done(function(entities){

			getSession().crudManager = new backendCommons.CrudManager(
				  {
				    gridcols:[
				      {name: 'cnumber', label:'Nro Inscr', cell:'string', editable:false},
              {name: 'cactividad', label:'Sector', cell: ActividadViewCell, editable:false},
              {name: 'ename', label:'Responsable', cell:'string', editable:false},
              {name: 'eprov', label:'Prov', cell:'string', editable:false},
              {name: 'receptor_requests', label:'Recibidas', cell:'number', editable:false},
              {name: 'emisor_requests', label:'Solicitadas', cell:'number', editable:false},
				      {label:'Acciones', cell: EditViewCell, editable:false, sortable:false},
				    ],
				    filtercols:['cnumber', 'ename',  'nivel_ejecucion', 'cactividad', 'eprov'],
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
  	var editorLayout = new RankingMica.MicaRankingLayoutView({
  		model: model,
  	});
    // TODO OjO: el model tiene que tener el rol de 'Comprador'
  	registerEditorLayoutEvents(session, mainlayout, editorLayout, model)

  };

//TODO
  var registerEditorLayoutEvents = function(session, mainlayout, editorlayout, model){
    //build Presentation Collection
    //console.log('[%s] registerEditorLayout: [%s]', model.whoami, model.get('cnumber'))
    buildPresentationCol(model).then(function(presentationCol){

      getSession().presentationCol = presentationCol;
      getSession().comprador = model;
      console.log('CrudManager to BEGIN:[%s]', presentationCol.length);

      getSession().workingView = new backendCommons.CrudManager(
            {
              gridcols:[
                {name: 'cnumber', label:'Nro Inscr', cell: CnumberViewCell, editable:false},
                {name: 'displayName', label:'Emprendimiento', cell:'string', editable:false},
                {name: 'receptor', label:'Receptor', cell: EmisorViewCell, editable:false},
                {name: 'emisor',   label:'Emisor',   cell: ReceptorViewCell, editable:false},

                {name: 'cactividad', label:'Sector', cell: ActividadViewCell, editable:false},
                {name: 'pais', label:'Prov/Pais', cell: PaisProvCell, editable:false},
                {name: 'porfolios', label:'Pfs', cell:'string', editable:false},
                {name: 'emisor_requests', label:'Emi', cell:EmisorListViewCell, editable:false},
                {name: 'receptor_requests', label:'Rec', cell:ReceptorListViewCell, editable:false},

                {label:'Acciones', cell: AgendarViewCell, editable:false, sortable:false},
              ],
              filtercols:['cnumber', 'displayName', 'pais'],
              editEventName: 'micarequest:edit',

            },
            {
              test: 'TestOK',
              //Data
              collection: getSession().presentationCol,
              editModel: backendEntities.MicaInteractionSummary,
              modelToEdit: null,

              //Filtro
              filterEventName: 'mica:backend:filter:rows',
              filterModel: backendEntities.MicaFilterFacet,
              filterTitle: 'Criterios de búsqueda',
              filterInstance: getSession().filter,


              // Parent Layout
              //parentLayoutView: editorlayout,

              // Layout donde insertar el grid
              layoutTpl: utils.templates.MicaRankingItemView,


              // form de edición para cuando selecciona un item
              formTpl: utils.templates.MicaInscriptionFormLayout,

              // Vista edición para cuando selecciona un item
              EditorView: DocManager.MicaRequestApp.Edit.MicaWizardLayout,
              editorOpts: {},

            }
          );


      mainlayout.hideList();

     //  editorlayout.on('accept:micaranking', function(){
     //    model.set('nivel_ejecucion', 'aceptado');
     //    DocManager.request("micaranking:partial:update",[model.id],{'nivel_ejecucion': 'aceptado'});
     //    mainlayout.showList();
     //    editorlayout.destroy();

     //  });

      registerInteractionView(session, mainlayout, editorlayout, model);


      editorlayout.on('close:view', function(){
        mainlayout.showList();
        editorlayout.destroy();
      });


      editorlayout.on('show', function(){
        editorlayout.getRegion('showRegion').show(getSession().workingView.getLayout());
      });

      mainlayout.getRegion('editRegion').show(editorlayout);


    });

  };

  var registerEditorLayoutEventsAnterior = function(session, mainlayout, editorlayout, model){
    var interactionView = new RankingMica.MicaRankingLayoutView({
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

  var registerInteractionView = function(session, mainlayout,editorlayout, model){

  };

  var emisorListContains = function(list, itemid){
    return _.find(list, function(item){
      if(itemid === item.emisor_inscriptionid) return true;
      else return false;
    })
  };
  var receptorListContains = function(list, itemid){
    return _.find(list, function(item){
      if(itemid === item.receptor_inscriptionid) return true;
      else return false;
    })
  };
  var getLinkedProfilesIds = function(emisor, receptor){
    var linkedList = [];
    _.each(emisor, function(item){
      linkedList.push(item.emisor_inscriptionid);
    });
    _.each(receptor, function(item){
      linkedList.push(item.receptor_inscriptionid);
    });
    return linkedList;
  }

  var buildPresentationCol = function(model){
    var token;
    var defer = $.Deferred();
    var presentationCol = new DocManager.Entities.MicaInteractionSummaryCol();
    var emisorList = model.get('emisorlist');
    var receptorList = model.get('receptorlist');
    var linkedProfiles = getLinkedProfilesIds(emisorList, receptorList);

    console.log('buildPresentationCol BEGIN:[%S] e:[%s]  r:[%s] col:[%s]', model.whoami, emisorList.length, receptorList.length, getSession().collection.length);
    //console.log('linked profiles: [%s]', linkedProfiles.length)


    $.when(fetchLinkedCol(getSession().currentUser, {linkedlist: linkedProfiles}, 'getFirstPage')).done(function(targetList){
      console.log('targetList', targetList.length, getSession().linkedcol.length);

      getSession().linkedcol.each(function(profile){
        token = new DocManager.Entities.MicaInteractionSummary({
          //cierto profile
          profileid: profile.get('profileid'),
          cnumber: profile.get('cnumber'),
          displayName: profile.get('ename'),
          pais: profile.get('epais'),
          prov: profile.get('eprov'),

          isvendedor: profile.get('isvendedor'),
          vactividades: profile.get('vactividades'),
          vsubact: profile.get('vsubact'),

          iscomprador: profile.get('iscomprador'),
          cactividades: profile.get('cactividades'),
          csubact: profile.get('csubact'),

          porfolios: profile.get('cporfolios'),
          emisor_requests: profile.get('emisor_requests'),
          receptor_requests: profile.get('receptor_requests'),
          peso: profile.get('peso'),
          meeting_number: -1,
          meeting_estado: 'no_asignada',

        });
        buildSummaryData(profile.get('profileid'), token, emisorList, receptorList);
        presentationCol.add(token);

      });
      console.log('resolve presentationCol [%s]', presentationCol.length);
      defer.resolve(presentationCol);

    });

    // var targetList = getSession().collection.filter(function(item, index){
    //   var itemid = item.get('profileid');
    //   //console.log('[%s]filter: [%s] [%s] [%s]', item.whoami, itemid, emisorListContains(emisorList, itemid),receptorListContains(receptorList, itemid))
    //   return (emisorListContains(emisorList, itemid) || receptorListContains(receptorList, itemid));
    // });

    //console.log('PASO-1: filtro lista: [%s]', targetList.length);
    return defer;

  };

  var buildSummaryData = function(profileid, token, elist, rlist){
    _.each(elist, function(item){
      if(item.emisor_inscriptionid === profileid){
        token.set({
          as_emisor : token.get('as_emisor'),
          as_emisor_nie:  item.emisor_nivel_interes || '' ,
          as_emisor_nir:  item.receptor_nivel_interes || '',
          as_emisor_slug: item.emisor_slug,
          as_emisor_answer: item.receptor_slug,
          as_emisor_rol: item.emisor_rol,
          // meeting_id: item.meeting_id,
          // meeting_number: item.meeting_number,
          // meeting_estado: item.meeting_estado,
        });

      }
    })
    _.each(rlist, function(item){
      if(item.receptor_inscriptionid === profileid){
        token.set({
          as_receptor : token.get('as_receptor'),
          as_receptor_nie:  item.emisor_nivel_interes,
          as_receptor_nir:  item.receptor_nivel_interes,
          as_receptor_slug: item.emisor_slug,
          as_receptor_answer: item.receptor_slug,
          as_receptor_rol: item.receptor_rol,
          // meeting_id: item.meeting_id,
          // meeting_number: item.meeting_number,
          // meeting_estado: item.meeting_estado,
        });

      }
    })

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

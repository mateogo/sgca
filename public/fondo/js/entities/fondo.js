DocManager.module("Entities", function(Entities, DocManager, Backbone, Marionette, $, _){
    
  Entities.FondoRegistration = Backbone.Model.extend({
    urlRoot: "/fondosuscriptions",
    whoami: 'FondoRegistracion:fondo.js ',
    idAttribute: "_id",
    
    initialize: function(opts){

    },

    getFieldLabel: function(field){
      var value;
      if(!field) return '';
      if(field.indexOf('.')!=-1){
        //console.log('Objeto: [%s] propiedad:[%s]', field.substring(0, field.indexOf('.')), field.substring(field.indexOf('.')+1) )
        value =  this.get(field.substring(0, field.indexOf('.')))[field.substring(field.indexOf('.')+1)];
        return _getSelectValue(this, field, value);
      }
      return _getFieldFormatedValue(this, field);

    },

    getFieldFormatedValue: function(field){
      return _getFieldFormatedValue(this, field);
    },

    validate: function(attrs, options) {
      var errors = {}

      if (_.has(attrs,'edisplayName') && (!attrs.edisplayName )) {
        errors.edisplayName = "No puede ser nulo";
      }

      if( ! _.isEmpty(errors)){
        return errors;
      }
    },
    
    initDataForEdit: function(){
      this.facetFactory();

    },

    update: function(user, pasajeros, tramos, cb){
      var self = this;
      _updateFacetStepOne(user, self);
      _updateFacetStepTwo(user, self);
      _updateFacetStepThree(user, pasajeros, tramos, self);
      _updateFacetStepFour(user, self);

      initModelForUpdate(user, self);

      // ********** SAVE TO SERVER ***********
      if(!self.save(null,{
        success: function(model){

          cb(null,model);

         }
        })) {
        cb(self.validationError,null);
      }


    },


    defaults: {
       _id: null,
      tregistro:'movilidad',
      evento:'fondo',
      rubro:'general',
      legal: '',

      cnumber:'',
      fealta: '',
      fecomp: '',
      slug: '',
      description: '',
      estado_alta:'activo',
      edicionevento: '2015',
      nivel_ejecucion: 'enproceso',

      user:{
        usermail: '',
        userid: '',
        personid: '',
      },

      requerimiento:{
        tsolicitud: 'no_definido',
        eventname: '',
        eventurl: '',
        eventtype: '',
        motivacion: '',
        eavatar: '',

      },

      responsable:{
        etipojuridico: 'pfisica',
        edisplayName: '',
        ename: '',
        epais: 'AR',
        eprov: '',
        otraprov: '',
        elocalidad: '',
        ecuit: '',
        edomicilio: '',
        ecp: '',
        email: '',
        eweb: '',
        efechapj: '',

        actividadppal: '',
        disciplinas: {
          musica: false,
          letras: false,
          artesvisuales: false,
          artesescenicas: false,
          disenio: false,
          audiovisuales: false,
          videojuegos: false,
          culturadigital: false,
          gestioncultural: false,
          patrimonio: false,
        },

        fondo2014: 'no',
        fondoanteriores:{
          movilidad:'',
          sostenibilidad:'',
          infraestructura:'',
          innovacion:'',

        },

        mica2014: 'no',
        micaanteriores: {
          mica: false,
          premica: false,
          micsur: false,
          micaproduce: false,

        },

        rmail: '',
        rname: '',
        rcargo: '',
        rdocnum: '',
        rfenac: '',

        rtel: '',
        rcel: '',
        rmail2: '',

      },
      

      movilidad: {
        tmovilidad: 'no_definido',
        qpax: 0,
        qpaxmin: 0,
        description: '',


        tramos:[],
        pasajeros:[],

      },
      adjuntos:{
        //cartaministra,docidentidad, especifico, invitacion, constanciacuit, resenia, resolucionotorgam, designacionautoridades, balanceentidad, estatutoentidad
        especifico: false,
        cartaministra: false,
        invitacion: false,
        docidentidad: false,
        constanciacuit: false,
        resenia: false,
      }      
    },

    facetFactory: function (){
      var self = this;
      self.stepOne = _facetFactoryStepOne(self);
      self.stepTwo = _facetFactoryStepTwo(self);
      self.stepThree = _facetFactoryStepThree(self);
      self.stepFour = _facetFactoryStepFour(self);

    },

  });
    
  Entities.FondoRegistrationCol = Backbone.Collection.extend({
    model: Entities.FondoRegistration,
    url: "/fondosuscriptions"
  });

  Entities.FondoRegistrationFindByQueryCol = Backbone.Collection.extend({
    whoami: 'FondoRegistrationFindByQueryCol: fondo.js',
    model: Entities.FondoRegistration,
    url: "/navegar/fondosuscriptions",

  });

  Entities.FondoRegistrationPaginatedCol = Backbone.PageableCollection.extend({
    whoami: 'FondoRegistrationPaginatedCol: fondo.js',
    model: Entities.FondoRegistration,
    url: "/query/fondosuscriptions",
    //url: "/navegar/fondosuscriptions",

    // getNextPage: function(step){
    //   var actualPage = this.state.currentPage || 1;
    //   var pageLength = this.state.pageSize || 15;
    //   if(step === 'reset'){
    //     actualPage = 0;
    //   }else if (step === 'next'){
    //     actualPage = actualPage + pageLength;
    //   }else if (step === 'previous'){
    //     actualPage = actualPage - pageLength;
    //     if(actualPage <0 ) actualPage = 0;
    //   }
    //   this.state.firstPage = actualPage;
    //   return actualPage;
    // },

    state:{
      firstPage: 1,
      pageSize: 25, 
    },
    queryParams:{
      currentPage: 'page',
      pageSize: 'per_page',
      totalRecords: 'total_entries',
    },


    setQuery: function(query){
      this.query = query;
      _.extend(this.queryParams, query);

    },

    parseState: function (resp, queryParams, state, options) {
      //console.log('========== PARSE STATE ========== [%s]', arguments.length);
      //console.dir(state);
      //console.log('PARSE STATE Response: [%s]',resp[0].total_entries);
      //this.state = resp[0];
      return {totalRecords: resp[0].total_entries};
    },

    parseRecords: function (resp, options ) {
      return resp[1];
    }

   // // You can remap the query parameters from `state` keys from
  
  });




  Entities.FondoRegistrationFetchOneCol = Backbone.Collection.extend({
    whoami: 'FondoRegistrationFetchOneCol: fondo.js',
    model: Entities.FondoRegistration,
    url: "/fondosuscriptions/fetch",

  });


  //*************************************************************
  //            FILTER filter FACET
  //*************************************************************
  Entities.FondoFilterFacet = Backbone.Model.extend({
    whoami: 'Entities.FondoFilterFacet:fondo.js',
    initialize: function(opts){

    },

    schema: {
        tsolicitud:      {type: 'Select',  title: 'Tipo de Solicitud', options: tdata.tsolicitudOL },
        cnumber:         {type: 'Text',    title: 'Número Inscripción' },
        textsearch:      {type: 'Text',    title: 'Búsqueda por texto' },
        provincia:       {type: 'Select',  title: 'Provincia',  options: tdata.provinciasOL },
        nivel_ejecucion: {type: 'Select',  title: 'Aprobación',  options: tdata.nivel_ejecucionOL },
        estado_alta:     {type: 'Select',  title: 'Estado',  options: tdata.estado_altaOL },
    },


    defaults: {
      tsolicitud: '',
      provincia: 'no_definido',
      cnumber: '',
      textsearch: '',
      evento: 'fondo',
      rubro: 'general',
      nivel_ejecucion: 'no_definido',
      estado_alta: 'activo',
      userid: '',
    },
  });



  //*************************************************************
  //            Helper Functions FOR UPDATE
  //*************************************************************
  var initModelForUpdate = function(user, model){
    if(!model.id){
      initNewModel(user, model);
    }
  };

  var userGetPersonId = function(user){
    var personid ='',
        person = user.get('es_usuario_de');
    if(person){
      if(person.length > 0){
        personid = person[0].id;
      }
    }
    return personid;
  };

  var initNewModel = function(user, model){
    var self = this,
    fealta = new Date(),
    fecomp = utils.dateToStr(fealta),
    personid = userGetPersonId(user),
    rubro = model.get('requerimiento').tsolicitud,
    tsol = rubro.indexOf('_') > 0 ? rubro.substring(0, rubro.indexOf('_')) : rubro;

    var initialdata = {
      tregistro: tsol,
      evento:'fondo',
      edicionevento:'2015',
      rubro: rubro,
      cnumber:'',
      fealta: fealta.getTime(),
      fecomp: fecomp,
      slug: 'Inscripción Fondo: ' + model.get('requerimiento').eventname,
      description: 'Formulario de aplicación al Fondo Argentino de Cultura - Edición 2015',
      estado_alta:'activo',
      nivel_ejecucion: 'enproceso',
      user:{
        usermail: user.mail,
        userid: user.id,
        personid: personid,
      },

    };
    model.set(initialdata);
  };


  //*************************************************************
  //            FACET ONE GRUPO - BANDA - COMPAÑIA
  //*************************************************************

  Entities.FondoStepOneFacet = Backbone.Model.extend({
    urlRoot: "/fondosuscriptions",
    whoami: 'FondoStepOneFacet:fondo.js ',
    idAttribute: "_id",
    
    initialize: function(opts){

    },

    getFieldFormatedValue: function(field){
      return _getFieldFormatedValue(this, field);

    },

    validateStep: function(step){
      var self = this,
          valid = true,
          errors = {};

      var check = [['tsolicitud'],['eventtype'],['eventname'],['motivacion']];
      //if(step>2 || step<1) return null;

      _.each(check, function(fld){
          var attr = {};
          attr[fld] = self.get(fld);
          var err = self.validate(attr);
          _.extend(errors, err)
          if(err) valid = false;
      });
      if(!valid){
         return errors;
      }else{
         return null;
      }
    },

    validate: function(attrs, options) {
      var errors = {}
      //console.dir(attrs)

      if (_.has(attrs,'tsolicitud') && (attrs.tsolicitud === 'no_definido' )) {
        errors.tsolicitud = "Seleccione una opción";
      }

      if (_.has(attrs,'eventtype') && (attrs.eventtype === 'no_definido' )) {
        errors.eventtype = "Seleccione una opción";
      }

      if (_.has(attrs,'eventname') && (!attrs.eventname )) {
        errors.eventname = "No puede ser nulo";
      }
      if (_.has(attrs,'motivacion') && (!attrs.motivacion )) {
        errors.motivacion = "No puede ser nulo";
      }

      if( ! _.isEmpty(errors)){
        return errors;
      }
    },


    defaults: {
    },

  });


  //*************************************************************
  //            FACET TWO REPRESENTANTE E INTEGRANTES
  //*************************************************************

  Entities.FondoStepTwoFacet = Backbone.Model.extend({
    urlRoot: "/fondosuscriptions",
    whoami: 'FondoStepTwoFacet:fondo.js ',
    idAttribute: "_id",
    
    initialize: function(opts){

    },

    getFieldFormatedValue: function(field){
      return _getFieldFormatedValue(this, field);

    },

    validateStep: function(step){
      var self = this,
          valid = true,
          errors = {};

      var check = [['ename'], ['edisplayName'], ['epais'], ['email'], ['rodocum'], ['rtel'], ['rcel'], ['actividadppal'], ['fondo2014'], ['mica2014']];
      //if(step>2 || step<1) return null;

      _.each(check, function(fld){
          var attr = {};
          attr[fld] = self.get(fld);
          var err = self.validate(attr);
          _.extend(errors, err)
          if(err) valid = false;
      });
      if(!valid){
         return errors;
      }else{
         return null;
      }

    },

    validate: function(attrs, options) {
      var errors = {}

      if (_.has(attrs,'ename') && (!attrs.ename )) {
        errors.ename = "No puede ser nulo";
      }

      if (_.has(attrs,'edisplayName') && (!attrs.edisplayName )) {
        errors.edisplayName = "No puede ser nulo";
      }

      if (_.has(attrs,'epais') && (!attrs.epais )) {
        errors.epais = "No puede ser nulo";
      }

      if (_.has(attrs,'email') && (!attrs.email )) {
        errors.email = "No puede ser nulo";
      }


      if (_.has(attrs,'rname') && (!attrs.rname )) {
        errors.rname = "No puede ser nulo";
      }
      if (_.has(attrs,'rdocnum') && (!attrs.rdocnum )) {
        errors.rdocnum = "No puede ser nulo";
      }
      if (_.has(attrs,'rcel') && (!attrs.rcel )) {
        errors.rcel = "No puede ser nulo";
      }
      if (_.has(attrs,'rtel') && (!attrs.rtel )) {
        errors.rtel = "No puede ser nulo";
      }
      if (_.has(attrs,'rmail2') && (!attrs.rmail2 )) {
        errors.rmail2 = "No puede ser nulo";
      }

      if( ! _.isEmpty(errors)){
        return errors;
      }

    },


    defaults: {
    },

  });



  //*************************************************************
  //            FACET THREE ITINERARIO
  //*************************************************************

  Entities.FondoStepThreeFacet = Backbone.Model.extend({
    urlRoot: "/fondosuscriptions",
    whoami: 'FondoStepThreeFacet:fondo.js ',
    idAttribute: "_id",
    
    initialize: function(opts){

    },

    getFieldFormatedValue: function(field){
      return _getFieldFormatedValue(this, field);

    },

    validateStep: function(step){
      var self = this,
          valid = true,
          errors = {};

      var check = [];
      //if(step>2 || step<1) return null;

      _.each(check, function(fld){
          var attr = {};
          attr[fld] = self.get(fld);
          var err = self.validate(attr);
          _.extend(errors, err)
          if(err) valid = false;
      });
      if(!valid){
         return errors;
      }else{
         return null;
      }

    },

    validate: function(attrs, options) {
      var errors = {}


      if( ! _.isEmpty(errors)){
        return errors;
      }

    },


    defaults: {
    },

  });


  //*************************************************************
  //            FACET FOUR (ARCHIVOS ADJUNTOS)
  //*************************************************************

  Entities.FondoStepFourFacet = Backbone.Model.extend({
    urlRoot: "/fondosuscriptions",
    whoami: 'FondoStepFourFacet:fondo.js ',
    idAttribute: "_id",
    
    initialize: function(opts){

    },

    getFieldFormatedValue: function(field){
      return _getFieldFormatedValue(this, field);

    },

    validateStep: function(step){
      var self = this,
          valid = true,
          errors = {};

      var check = [];
      //if(step>2 || step<1) return null;

      _.each(check, function(fld){
          var attr = {};
          attr[fld] = self.get(fld);
          var err = self.validate(attr);
          _.extend(errors, err)
          if(err) valid = false;
      });
      if(!valid){
         return errors;
      }else{
         return null;
      }

    },

    validate: function(attrs, options) {
      var errors = {}

      if( ! _.isEmpty(errors)){
        return errors;
      }
    },


    defaults: {
    },

  });


  //*************************************************************
  //            ASSET TOKEN
  //*************************************************************
  Entities.AssetToken = Backbone.Model.extend({
    whoami: 'AssetToken: fondo.js ',

    defaults: {
      _id: null,
      id: '',
      cnumber: '',
      predicate: '',
      slug: '',
    },
  }); 
  
  //*************************************************************
  //            PASAJEROS
  //*************************************************************
  Entities.Pasajero = Backbone.Model.extend({
    whoami: 'Pasajero: fondo.js ',

    schema: {
        pnombre:   {type: 'Text',  title: 'Nombre'},
        papellido: {type: 'Text',  title: 'Apellido'},
        pfenac:    {type: 'Text',  title: 'Fecha Nacimiento',  editorAttrs:{placeholder:'dd/mm/aaaa'}},
        pdni:      {type: 'Text',  title: 'DNI',                editorAttrs:{placeholder:'número de documento'}},
    },
 
    validate: function(attrs, options) {
      var errors = {}
      if (_.has(attrs,'pnombre') && (!attrs.pnombre )) {
        errors.rname = "No puede ser nulo";
      }     

      if( ! _.isEmpty(errors)){
        return errors;
      }
    },

    defaults: {
      pnombre: '',
      papellido: '',
      pafenac: '',
      pdni: '',
    },
  }); 
  
  Entities.PasajerosCol = Backbone.Collection.extend({
    whoami: 'Entities.PasajerosCol:fondo.js ',
    model: Entities.Pasajero,
    comparator: "pnombre",
  });


  //*************************************************************
  //  MOVILIDAD - TRAMOS: Cada tramo del itinerario programado
  //*************************************************************
  Entities.Tramo = Backbone.Model.extend({
    // Tramos

    whoami: 'Tramo:fondo.js ',
    
    schema: {
      ttramo:     {type: 'Select',   title: 'Tramo (Ida o Vuelta)',   editorAttrs:{placeholder:'Ida/ Ida-Vta'},options: utils.itinerarioTipoTramoOpLst },
      fesalida:   {type: 'Text',     title: 'Fecha de Salida',  editorAttrs:{placeholder:'dd/mm/aaaa'}},
      fevuelta:   {type: 'Text',     title: 'Fecha de Regreso', editorAttrs:{placeholder:'de/mm/aaaa'}},
      origen:     {type: 'Text',     title: 'Origen (lugar/ puerto/ aeropuerto de partida)',  editorAttrs:{placeholder:'Lugar/ puerto/ aeropuerto de salida'}},
      destino:    {type: 'Text',     title: 'Destino (lugar/ puerto/ aeropuerto de llegada)', editorAttrs:{placeholder:'Lugar/ puerto/ aeropuerto de llegada'}},
      eventname:  {type: 'Text',     title: 'Evento/ Actividad a desarrollar en destino',  editorAttrs:{placeholder:'Denominación evento/ show en destino'}},
      eventurl:   {type: 'Text',     title: 'Enlace (URL) evento', editorAttrs:{placeholder:'http://www.dominio.com.ar'}},
    },

 
    validate: function(attrs, options) {
      var errors = {};

      if( ! _.isEmpty(errors)){
        return errors;
      }
    },

    defaults: {
      ttramo: 'no_definido',

      fesalida: '',
      fevuelta: '',
      
      origen: '',
      destino: '',
      
      eventname: '',
      eventurl: '',
    },
  }); 
  Entities.TramosCol = Backbone.Collection.extend({
    whoami: 'TramosCol: fondo.js',
    model: Entities.Tramo,
    comparator: "fesal",
  });


  //*************************************************************
  //            Helper Functions
  //*************************************************************
  var _getFieldFormatedValue = function(model, field){


    return _getSelectValue(model, field, model.get(field));
  };

  var _getSelectValue = function(model, field, value){
    var selected;
    if(!model.schema || !(field in model.schema) || model.schema[field].type !== 'Select' ) return value || '';

    if(value === 'no_definido' || value === "nodefinido") return '';

    selected = _.findWhere(model.schema[field].options, {val: value});
    return (selected)? selected.label : value;


  };



  var _getFieldLabel = function(model, field){
      var value;
      if(!field) return '';
      if(model[field]){
        return _getSelectValue(model, field, model[field]());

      }else if(field.indexOf('.') != -1){
        value =  model.get(field.substring(0, field.indexOf('.')))[field.substring(field.indexOf('.')+1)];
        return _getSelectValue(model, field, value);

      }else{
        return _getSelectValue(model, field, model.get(field));

      }
  };


  var _facetFactoryStepOne = function(model){
    var data = _.extend({}, model.get('requerimiento'));
    return new Entities.FondoStepOneFacet(data);
  };
  var _updateFacetStepOne = function(user, model){
    var requerimiento = model.stepOne.attributes;
    model.set ('tregistro', requerimiento.tsolicitud);
    model.set('requerimiento', requerimiento);
  };


  var _facetFactoryStepTwo = function(model){
    var data = _.extend({}, model.get('responsable'));
    return new Entities.FondoStepTwoFacet(data);
  };
  var _updateFacetStepTwo = function(user, model){
    var responsable = model.stepTwo.attributes;
    model.set('responsable', responsable);
  };


  var _facetFactoryStepThree = function(model){
    //var data = _.extend({}, model.get('rolePlaying'), model.get('musica'));
    model.tramos = model.get('movilidad').tramos;
    model.pasajeros = model.get('movilidad').pasajeros;
    return new Entities.FondoStepThreeFacet(model.get('movilidad'));
  };
  var _updateFacetStepThree = function(user, pasajeros, tramos, model){
    //var rolePlaying = model.get('rolePlaying');
    var data = model.stepThree.attributes;
    data.tramos = tramos.toJSON();
    data.pasajeros = pasajeros.toJSON();
    model.set('movilidad', data);
  };

  var _facetFactoryStepFour = function(model){
    var data = _.extend({},model.get('adjuntos'), {_id: model.id, cnumber: model.get('cnumber')} );
    return new Entities.FondoStepFourFacet(data);
  };

  var _updateFacetStepFour = function(user, model){
    var adjuntos;
    adjuntos = model.stepFour.attributes;
    model.set('adjuntos', adjuntos);
  };




  //*************************************************************
  //            query factory
  //*************************************************************
  var queryFactory = function (entities){
    var fd = DocManager.Entities.FilteredCollection({
        collection: entities,

        filterFunction: function(query){
          return function(node){
            var test = true;
            //if((query.taccion.trim().indexOf(node.get('taccion'))) === -1 ) test = false;
            //console.log('filterfunction:TEST: [%s] [%s] [%s] [%s]',test, query.taccion,node.get("taccion"),node.get("cnumber"));
            if(query.evento) {
              if(query.evento.trim() !== node.get('evento')) test = false;
            }


            if(test) return node;
          }
        }
    });
    return fd;
  };

  var queryCollection = function(query, step){
      var entities = new Entities.FondoRegistrationPaginatedCol();
      var defer = $.Deferred();

      entities.setQuery(query);
      entities.fetch({
        success: function(data){
          defer.resolve(data);
        },
        error: function(data){
            defer.resolve(undefined);
        }
      });

      return defer.promise();

  };



  //*************************************************************
  //            entity API
  //*************************************************************
  var API = {

    getEntity: function(entityId){
      var request = new Entities.FondoRegistration({_id: entityId});
      var defer = $.Deferred();
      if(entityId){
        request.fetch({
          success: function(data){
            defer.resolve(data);
          },
          error: function(data){
            defer.resolve(undefined);
          }
       });
      }else{
        defer.resolve(request);
      }
      return defer.promise();
    },

    fetchEntityByUser: function(user, evento){
      var entities = new Entities.FondoRegistrationFetchOneCol();
      var query = {},
          defer = $.Deferred();

      query.evento = evento;
      query["user.userid"] = user.id;

      entities.fetch({
        data: query,
        type: 'post',
        success: function(data){
          if(data.length){
            defer.resolve(data.at(0));
          }else{
            defer.resolve(new Entities.FondoRegistration());
          }
        },
        error: function(data){
            defer.resolve(new Entities.FondoRegistration());          
        }
      });
      return defer.promise();

    },

    newEntityFactory: function(){
      var request = new Entities.FondoRegistration();
      var defer = $.Deferred();
      defer.resolve(request);
      return defer.promise();
    },

    getFilteredByQueryCol: function(query, step){

      var fetchingEntities = queryCollection(query, step),
          defer = $.Deferred();

      $.when(fetchingEntities).done(function(entities){

        var filteredEntities = queryFactory(entities);

        if(query){
          filteredEntities.filter(query);
        }

        defer.resolve(filteredEntities);

      });
      return defer.promise();
    },


  };

  //*************************************************************
  //            entity HANDLERS
  //*************************************************************
  DocManager.reqres.setHandler("fondorqst:entity", function(id){
    return API.getEntity(id);
  });

  DocManager.reqres.setHandler("fondorqst:factory:new", function(user, evento){
    if(user){
      return API.fetchEntityByUser(user, evento);
    }else{
      return API.newEntityFactory();
    }
  });


  DocManager.reqres.setHandler("fondorqst:query:entities", function(query, step){
    return API.getFilteredByQueryCol(query, step);
  });

});


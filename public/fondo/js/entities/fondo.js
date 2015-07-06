DocManager.module("Entities", function(Entities, DocManager, Backbone, Marionette, $, _){
    
  Entities.FondoRegistration = Backbone.Model.extend({
    urlRoot: "/fondosuscriptions",
    whoami: 'FondoRegistracion:fondo.js ',
    idAttribute: "_id",
    
    initialize: function(opts){

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

    update: function(user, integrantes, mreferencias, areferencias, cb){
      var self = this;
      _updateFacetStepOne(user, self);
      _updateFacetStepTwo(user, integrantes, self);
      _updateFacetStepThree(user, mreferencias, self);
      _updateFacetStepFour(user, areferencias, self);

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
      tregistro:'musica',
      evento:'fondo',
      rubro:'general',
      legal: '',

      cnumber:'',
      documid: '',
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
        edescription: '',
        eavatar: '',

      },

/* borrar
      requerimiento:{
        tsolicitud: 'no_definido',

        edisplayName: '',

        edescription: '',
        eavatar: '',

      },

*/
      responsable:{
        etipojuridico: 'not_defined',
        edisplayName: '',
        ename: '',
        epais: '',
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

        ridiomas: '',
        representantes: [],
      },
      
      isComprador: '',
      isVendedor: '',
      movilidad: {
        tmovilidad: 'no_definido',
        qpax: 0,
        qpaxmin: 0,
        qtramos: 0,
        description: '',


        tramos:[],
        pasajeros:[],

      },
      adjuntos:{
        //cartaministra,docidentidad, especifico, invitacion, constanciacuit, resenia, resolucionotorgam, designacionautoridades, balanceentidad, estatutoentidad
        //
        cartaministra: '',
        docidentidad: '',
        especifico: '',
        invitacion: '',
        constanciacuit: '',
        resenia: '',
        resolucionotorgam: '',
        designacionautoridades: '',
        balanceentidad: '',
        estatutoentidad: '',

      }


      
    },

    facetFactory: function (){
      var self = this;
      self.stepOne = _facetFactoryStepOne(self);
      self.stepTwo = _facetFactoryStepTwo(self);
      self.stepThree = _facetFactoryStepThree(self);
      self.stepFour = _facetFactoryStepFour(self);
      // self.stepFive = _facetFactoryStepFive(self);

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

  Entities.FondoRegistrationFetchOneCol = Backbone.Collection.extend({
    whoami: 'FondoRegistrationFetchOneCol: fondo.js',
    model: Entities.FondoRegistration,
    url: "/fondosuscriptions/fetch",

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
    personid = userGetPersonId(user);

    var initialdata = {
      tregistro:model.get('requerimiento').tsolicitud,
      evento:'fondo',
      edicionevento:'2015',
      rubro:'general',
      cnumber:'',
      documid: '',
      fealta: fealta.getTime(),
      fecomp: fecomp,
      slug: 'Inscripción Fondo: ' + model.get('requerimiento').edisplayName,
      description: 'Formulario de solicitud Fondo Argentino 2015',
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
  //            FACET FOUR (TRAMOS, PASAJEROS, EVENTOS)
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
      if(this.get('rolePlaying').aescenica){
        if (_.has(attrs,'aescenario') && (!attrs.aescenario )) {
          errors.aescenario = "No puede ser nulo";
        }
        
        if (_.has(attrs,'propuestaartistica') && (!attrs.propuestaartistica )) {
          errors.propuestaartistica = "No puede ser nulo";
        }

        if (_.has(attrs,'generoteatral')){
          if(!_.contains(attrs.generoteatral, true)){
            errors.generoteatral = "Debe seleccionar al menos un tipo de práctica";
          }
        }


      }

      if( ! _.isEmpty(errors)){
        return errors;
      }

    },


    defaults: {
    },

  });


  //*************************************************************
  //            FACET FIVE (UPLOADING)
  //*************************************************************

  Entities.FondoStepFiveFacet = Backbone.Model.extend({
    urlRoot: "/fondosuscriptions",
    whoami: 'FondoStepFiveFacet:fondo.js ',
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


    },

    validate: function(attrs, options) {

    },


    defaults: {
    },

  });

  //*************************************************************
  //            INTEGRANTES
  //*************************************************************
  Entities.Integrante = Backbone.Model.extend({
    whoami: 'Integrante: fondo.js ',

    schema: {
        aname:    {type: 'Text',  title: 'Nombre y apellido'},
        acargo:   {type: 'Text',  title: 'Rol/ función'},
        afenac:   {type: 'Text',  title: 'Fecha Nacimiento', editorAttrs:{placeholder:'dd/mm/aaaa'}},
        adni:     {type: 'Text',  title: 'DNI / Pasaporte', editorAttrs:{placeholder:'número de documento'}},
    },
 
    validate: function(attrs, options) {
      var errors = {}
      if (_.has(attrs,'aname') && (!attrs.rname )) {
        errors.rname = "No puede ser nulo";
      }     

      if( ! _.isEmpty(errors)){
        return errors;
      }
    },

    defaults: {
      aname: '',
      acargo: '',
      afenac: '',
      adni: '',
    },
  }); 
  
  Entities.IntegranteCol = Backbone.Collection.extend({
    whoami: 'Entities.IntegranteCol:fondo.js ',
    model: Entities.Integrante,
    comparator: "aname",
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
        pmail:     {type: 'Text',  title: 'Correo electrónico', editorAttrs:{placeholder:'correo de contacto'}},
        pcelular:  {type: 'Text',  title: 'Telefono',           editorAttrs:{placeholder:'celular de contacto'}},
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
      pmail: '',
      pcelular: '',
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
      ttramo:     {type: 'Select',   title: 'Tramo',   editorAttrs:{placeholder:'Ida/ Ida-Vta'},options: utils.itinerarioTipoTramoOpLst },
      fesalida:   {type: 'Text',     title: 'Salida',  editorAttrs:{placeholder:'dd/mm/aaaa'}},
      fevuelta:   {type: 'Text',     title: 'Regreso', editorAttrs:{placeholder:'de/mm/aaaa'}},
      origen:     {type: 'Text',     title: 'Origen',  editorAttrs:{placeholder:'Lugar/ puerto/ aeropuerto de salida'}},
      destino:    {type: 'Text',     title: 'Destino', editorAttrs:{placeholder:'Lugar/ puerto/ aeropuerto de llegada'}},
      eventname:  {type: 'Text',     title: 'Evento',  editorAttrs:{placeholder:'Denominación evento/ show en destino'}},
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
  //            REFERENCIAS - ENLACES
  //*************************************************************
  Entities.Referencia = Backbone.Model.extend({
    // links externos, a modo de referencias, asociados al porfolio

    whoami: 'Referencia: fondo.js ',
    
    schema: {
      tlink:     {type: 'Select',   title: 'Tipo de enlace externo',   editorAttrs:{placeholder:'Tipo de referencia externa'},options: utils.referenceLinkOpLst },
      slug:      {type: 'Text',     title: 'Descripción',      editorAttrs:{placeholder:'Descripción/ comentario del enlace propuesto'}},
      targeturl: {type: 'Text',     title: 'Enlace (URL en el formato indicado)',      editorAttrs:{placeholder:'http://www.dominio.com.pais'}, dataType:'url', validators:['required', 'url']},
    },

 
    validate: function(attrs, options) {
      var errors = {};

      if( ! _.isEmpty(errors)){
        return errors;
      }
    },

    defaults: {
      tlink: 'no_definido',
      targeturl: '',
      slug: '',
    },

  }); 
  
  Entities.ReferenciaCol = Backbone.Collection.extend({
    whoami: 'ReferenciaCol: fondo.js',
    model: Entities.Referencia,
    comparator: "tlink",
  });



  //*************************************************************
  //            Helper Functions
  //*************************************************************
  var _getFieldFormatedValue = function(model, field){
    
    if(!model.schema){
      return model.get(field);
    }

    if(!(field in model.schema)) return model.get(field) || '';
    
    if(model.schema[field].type === 'Select'){
      var value = model.get(field);
      if(value === 'no_definido' || value === "nodefinido") return '';
      
      var options = model.schema[field].options;
      var selected = _.findWhere(options,{val:value});
      return (selected)? selected.label : value;

    }else{

      return model.get(field);

    }
  };

  var _facetFactoryStepOne = function(model){
    var data = _.extend({}, model.get('requerimiento'));
    return new Entities.FondoStepOneFacet(data);
  };

  var _updateFacetStepOne = function(user, model){
    var requerimiento = model.get('requerimiento');

    requerimiento = model.stepOne.attributes;

    model.set ('tregistro', requerimiento.tsolicitud);
    
    model.set('requerimiento', requerimiento);
  };

  var _facetFactoryStepTwo = function(model){
    var data = _.extend({}, model.get('responsable'));
    model.integrantes = model.get('responsable').integrantes;
    return new Entities.FondoStepTwoFacet(data);
  };
  
  var _updateFacetStepTwo = function(user, integrantes, model){
    var responsable = model.get('responsable');
    responsable = model.stepTwo.attributes;
    responsable.integrantes = integrantes.toJSON();
    model.set('responsable', responsable);
  };

  var _facetFactoryStepThree = function(model){
    //var data = _.extend({}, model.get('rolePlaying'), model.get('musica'));
    model.tramos = model.get('movilidad').tramos;
    model.pasajeros = model.get('movilidad').pasajeros;
    return new Entities.FondoStepThreeFacet(model.get('movilidad'));
  };
  var _updateFacetStepThree = function(user, tramos, model){
    //var rolePlaying = model.get('rolePlaying');
    var data;
    data = model.stepThree.attributes;
    data.tramos = tramos.toJSON();
    model.set('movilidad', data);
  };

  var _facetFactoryStepFour = function(model){
    //var data = _.extend({}, model.get('rolePlaying'), model.get('aescenica'));
    return new Entities.FondoStepFourFacet(model.get('adjuntos'));
  };

  var _updateFacetStepFour = function(user, areferencias, model){
    //var rolePlaying = model.get('rolePlaying');
    var adjuntos;
    adjuntos = model.stepFour.attributes;
    model.set('adjuntos', adjuntos);
  };

  var _facetFactoryStepFive = function(model){
    var data = _.extend({}, model.get('pasajero'), model.get('evento'), model.get('tramo'), model.get('viaje'));
    return new Entities.FondoStepFiveFacet(data);
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

  var queryCollection = function(query){
      var entities = new Entities.FondoRegistrationFindByQueryCol();
      var defer = $.Deferred();

      entities.fetch({
        data: query,
        type: 'post',
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

    getFilteredByQueryCol: function(query){

      var fetchingEntities = queryCollection(query),
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

  DocManager.reqres.setHandler("fondorqst:query:entities", function(query){
    return API.getFilteredByQueryCol(query);
  });

});


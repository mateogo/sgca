DocManager.module("Entities", function(Entities, DocManager, Backbone, Marionette, $, _){
    
  Entities.ShowcaseRegistration = Backbone.Model.extend({
    urlRoot: "/micashowcase",
    whoami: 'ShowcaseRegistration:micashowcase.js ',
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
      evento:'mica_showcase',
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

      solicitante:{
        tsolicitud: 'no_definido',

        edisplayName: '',

        edescription: '',
        eavatar: '',

      },

      responsable:{
        rmail: '',
        rname: '',

        rdocnum: '',

        rtel: '',
        rcel: '',
        rmail2: '',

        integrantes: [],
      },
      
      isComprador: '',
      isVendedor: '',

      musica: {
        rolePlaying:{
          musica: false
        },

        generomusical: {
          folklore: false,
          tango: false,
          tropical: false,
          rock: false,
          reggae: false,
          electronica: false,
          jazz: false,
          contemporanea: false,
          fusion: false,
          otros: false,

        },
        sello: '',
        discografia: '',
        festivales: '',
        giras: '',
        escenario: '',

        mreferencias: [],
      },


      aescenica: {
        rolePlaying:{
          aescenica: false
        },

        generoteatral: {
          teatro: false,
          teatrodanza: false,
          titeres: false,
          circo: false,
          performance: false,
          comediamusical: false,
          otros: false,
        },

        propuestaartistica: '',
        experiencia: '',
        aescenario: '',

        areferencias: [],
      },


      
    },

    facetFactory: function (){
      var self = this;
      self.stepOne = _facetFactoryStepOne(self);
      self.stepTwo = _facetFactoryStepTwo(self);
      self.stepThree = _facetFactoryStepThree(self);
      self.stepFour = _facetFactoryStepFour(self);
      self.stepFive = _facetFactoryStepFive(self);

    },

  });
    
  Entities.ShowcaseRegistrationCol = Backbone.Collection.extend({
    model: Entities.ShowcaseRegistration,
    url: "/micashowcase"
  });

  Entities.ShowcaseRegistrationFindByQueryCol = Backbone.Collection.extend({
    whoami: 'ShowcaseRegistrationFindByQueryCol: micashowcase.js',
    model: Entities.ShowcaseRegistration,
    url: "/navegar/micashowcase",

  });

  Entities.ShowcaseRegistrationFetchOneCol = Backbone.Collection.extend({
    whoami: 'ShowcaseRegistrationFetchOneCol: micashowcase.js',
    model: Entities.ShowcaseRegistration,
    url: "/micashowcase/fetch",

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
      tregistro:model.get('solicitante').tsolicitud,
      evento:'mica_showcase',
      edicionevento:'2015',
      rubro:'general',
      cnumber:'',
      documid: '',
      fealta: fealta.getTime(),
      fecomp: fecomp,
      slug: 'Inscripción Showcase: ' + model.get('solicitante').edisplayName,
      description: 'Formulario de solicitud de participación en el SHOWCASE - MICA 2015',
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

  Entities.ShowcaseStepOneFacet = Backbone.Model.extend({
    urlRoot: "/micashowcase",
    whoami: 'ShowcaseStepOneFacet:micashowcase.js ',
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

      var check = [['tsolicitud'],['edisplayName'],['edescription']];
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
      if (_.has(attrs,'edisplayName') && (!attrs.edisplayName )) {
        errors.edisplayName = "No puede ser nulo";
      }
      if (_.has(attrs,'edescription') && (!attrs.edescription )) {
        errors.edescription = "No puede ser nulo";
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

  Entities.ShowcaseStepTwoFacet = Backbone.Model.extend({
    urlRoot: "/micashowcase",
    whoami: 'ShowcaseStepTwoFacet:micashowcase.js ',
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

      var check = [['rname'],['rdocnum'], ['rtel'], ['rcel'], ['rmail2']];
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
  //            FACET THREE CASO MUSICA
  //*************************************************************

  Entities.ShowcaseStepThreeFacet = Backbone.Model.extend({
    urlRoot: "/micashowcase",
    whoami: 'ShowcaseStepThreeFacet:micashowcase.js ',
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

      var check = [['discografia'],['giras'], ['generomusical']];
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

      if(this.get('rolePlaying').musica){

        if (_.has(attrs,'discografia') && (!attrs.discografia )) {
          errors.discografia = "No puede ser nulo";
        }
        
        if (_.has(attrs,'giras') && (!attrs.giras )) {
          errors.giras = "No puede ser nulo";
        }

        if (_.has(attrs,'generomusical')){
          if(!_.contains(attrs.generomusical, true)){
            errors.generomusical = "Debe seleccionar al menos un género musical";
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
  //            FACET FOUR (TRAMOS, PASAJEROS, EVENTOS)
  //*************************************************************

  Entities.ShowcaseStepFourFacet = Backbone.Model.extend({
    urlRoot: "/micashowcase",
    whoami: 'ShowcaseStepFourFacet:micashowcase.js ',
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

      var check = [['aescenario'],['propuestaartistica'], ['generoteatral']];
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

  Entities.ShowcaseStepFiveFacet = Backbone.Model.extend({
    urlRoot: "/micashowcase",
    whoami: 'ShowcaseStepFiveFacet:micashowcase.js ',
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
    whoami: 'Integrante: micashowcase.js ',

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
    whoami: 'Entities.IntegranteCol:micashowcase.js ',
    model: Entities.Integrante,
    comparator: "aname",
  });



  //*************************************************************
  //            REFERENCIAS - ENLACES
  //*************************************************************
  Entities.Referencia = Backbone.Model.extend({
    // links externos, a modo de referencias, asociados al porfolio

    whoami: 'Referencia: micashowcase.js ',
    
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


    // defaults: {
    //   tlink: 'web',
    //   targeturl: 'http://www.algo.com',
    //   slug: 'Mil gracias',
    // },


  }); 
  
  Entities.ReferenciaCol = Backbone.Collection.extend({
    whoami: 'ReferenciaCol: micashowcase.js',
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
    var data = _.extend({}, model.get('solicitante'));
    return new Entities.ShowcaseStepOneFacet(data);
  };

  var _updateFacetStepOne = function(user, model){
    var solicitante = model.get('solicitante');

    solicitante = model.stepOne.attributes;

    model.set ('tregistro', solicitante.tsolicitud);
    
    if(solicitante.tsolicitud === 'musica' ){
      model.stepThree.set('rolePlaying',{musica: true});
      model.stepFour.set( 'rolePlaying',{aescenica: false});
    }else{
      model.stepThree.set('rolePlaying',{musica: false});
      model.stepFour.set( 'rolePlaying',{aescenica: true});
    }

    model.set('solicitante', solicitante);
  };

  var _facetFactoryStepTwo = function(model){
    var data = _.extend({}, model.get('responsable'));
    model.integrantes = model.get('responsable').integrantes;
    return new Entities.ShowcaseStepTwoFacet(data);
  };
  
  var _updateFacetStepTwo = function(user, integrantes, model){
    var responsable = model.get('responsable');
    responsable = model.stepTwo.attributes;
    responsable.integrantes = integrantes.toJSON();
    model.set('responsable', responsable);
  };

  var _facetFactoryStepThree = function(model){
    //var data = _.extend({}, model.get('rolePlaying'), model.get('musica'));
    model.mreferencias = model.get('musica').mreferencias;
    return new Entities.ShowcaseStepThreeFacet(model.get('musica'));
  };
  var _updateFacetStepThree = function(user, mreferencias, model){
    //var rolePlaying = model.get('rolePlaying');
    var musica;
    musica = model.stepThree.attributes;
    musica.mreferencias = mreferencias.toJSON();
    model.set('musica', musica);
  };

  var _facetFactoryStepFour = function(model){
    //var data = _.extend({}, model.get('rolePlaying'), model.get('aescenica'));
    model.areferencias = model.get('aescenica').areferencias;
    return new Entities.ShowcaseStepFourFacet(model.get('aescenica'));
  };

  var _updateFacetStepFour = function(user, areferencias, model){
    //var rolePlaying = model.get('rolePlaying');
    var aescenica;
    aescenica = model.stepFour.attributes;
    aescenica.areferencias = areferencias.toJSON();
    model.set('aescenica', aescenica);
  };

  var _facetFactoryStepFive = function(model){
    var data = _.extend({}, model.get('pasajero'), model.get('evento'), model.get('tramo'), model.get('viaje'));
    return new Entities.ShowcaseStepFiveFacet(data);
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
      var entities = new Entities.ShowcaseRegistrationFindByQueryCol();
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
      var request = new Entities.ShowcaseRegistration({_id: entityId});
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
      var entities = new Entities.ShowcaseRegistrationFetchOneCol();
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
            defer.resolve(new Entities.ShowcaseRegistration());
          }
        },
        error: function(data){
            defer.resolve(new Entities.ShowcaseRegistration());          
        }
      });
      return defer.promise();

    },

    newEntityFactory: function(){
      var request = new Entities.ShowcaseRegistration();
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
  DocManager.reqres.setHandler("showcase:entity", function(id){
    return API.getEntity(id);
  });

  DocManager.reqres.setHandler("showcase:factory:new", function(user, evento){
    if(user){
      return API.fetchEntityByUser(user, evento);
    }else{
      return API.newEntityFactory();
    }
  });

  DocManager.reqres.setHandler("showcase:query:entities", function(query){
    return API.getFilteredByQueryCol(query);
  });

});


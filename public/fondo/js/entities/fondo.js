DocManager.module("Entities", function(Entities, DocManager, Backbone, Marionette, $, _){
    
  Entities.FondoRegistration = Backbone.Model.extend({
    urlRoot: "/fondosuscriptions",
    whoami: 'FondoRegistracion:fondo.js ',
    idAttribute: "_id",
    
    initialize: function(opts){
      this.facetFactory();

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


    defaults: {
       _id: null,
      tregistro:'solicitud',
      evento:'fondo',
      rubro:'movilidad',
      legal: '',

      //inscripcion
      cnumber:'',
      documid: '',
      fealta: '',
      slug: '',
      description: '',

      //user 
      user:{
        usermail: '',
        userid: '',
        personid: '',
      },

      // Empresa o persona solicitante
      solicitante:{
        pfisica: true, // false
        pjuridica: false, // true
        etipojuridico: 'pfisica', //  [pfisica, funcacion, asociacion, cooperativa, sa, srl]
        edisplayName: '',
        ename: 'Mateo',
        ecuit: '201453',
        email: '',
        eactividad: '',
        // solo para personas juridicas
        efechapj: '',
      },

      // Responsable empresa o titular
      responsable:{
        rname: '',
        rapellido: '',
        rcargo: '',

        //
        rname: '',
        rsurname: '',
        rgenero: '',

        rdoctipo: '',
        rdocnum: '',
        rnac: '',
        rfenac: '',

        rtel: '',
        rcel: '',

        rcalle: '',
        rcallenro: '',
        rcp: '',
        rpais: '',
        rprov: '',
        rprovotra: '',
        rlocalidad: '',
        rcode: '',

        rweb: '',
        raudiovideo: '',
      },
      
      modalidad:{
        modomov:'argentina',
        submodomov: '',
        disciplina: {
          disc_musica: false,
          disc_letras: false,
          disc_artesvisuales: false,
          disc_artesescenicas: false,
          disc_diseno: false,
          disc_audiovisuales: false,
          disc_videojuegos: false,
          disc_culturadigital: false,
          disc_gestioncultural: false,
          disc_patrimonio: false,
        },
        actppal: '',
      },

      participaciones:{
        en_paec: 'no',
        en_paec_detalle: '',
        en_mica: 'no',
        en_mica_detalle: {
          mica: false,
          premica: false,
          micsur: false,
          micaproduce: false,
        },
        en_fondo: 'no',
        en_fondo_detalle: {
          movilidad: false,
          sostenibilidad: false,
          infraestructura: false,
          innovacion: false,
        },

      },
      tramo: {
        fesalida: '',
        fregreso: '',
        origen: '',
        destino: '',
        observacio: '',
      },
      tramos: [],

      viaje: {
        npaxmax: 1,
        npaxmin: 1,
      },

      pasajero: {
        paxnombre: '',
        paxfenac: '',
        paxdocum: '',
        paxrol: '',
      },
      pasajeros:[],

      evento: {
        eventoname:'',
        eventoweb: '',
        eventoloc: '',
        eventoprov: '',
        eventopaix: '',
      },
      eventos: [],


      
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
    
  Entities.FondoRegistrationCol = Backbone.Collection.extend({
    model: Entities.FondoRegistration,
    url: "/fondosuscriptions"
  });


  //*************************************************************
  //            FACET ONE (USER/ RESPONSABLE / EMPRESA)
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

      var check = [['edisplayName']];
      //if(step>2 || step<1) return null;

      _.each(check, function(fld){
          var attr = {};
          attr[fld] = self.get(fld);
          var err = self.validate(attr);
          console.log('validating: [%s] [%s]',fld, err)
          console.dir(err)
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

      if (_.has(attrs,'edisplayName') && (!attrs.edisplayName )) {
        errors.edisplayName = "No puede ser nulo";
      }


      if( ! _.isEmpty(errors)){
        return errors;
      }
    },


    defaults: {
    },

  });


  //*************************************************************
  //            FACET TWO (Participaciones anteriores)
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


    },

    validate: function(attrs, options) {

    },


    defaults: {
    },

  });



  //*************************************************************
  //            FACET THREE (MODALIDAD: VIAJE LOCAL o AL EXTERIOR)
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


    },

    validate: function(attrs, options) {

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


    },

    validate: function(attrs, options) {

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
  //            Helper Functions
  //*************************************************************
  _getFieldFormatedValue = function(model, field){
    
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

  _facetFactoryStepOne = function(model){
    var data = _.extend({}, model.get('solicitante'), model.get('user'), model.get('responsable'));
    return new Entities.FondoStepOneFacet(data);
  };

  _facetFactoryStepTwo = function(model){
    var data = _.extend({}, model.get('participaciones'));
    return new Entities.FondoStepTwoFacet(data);
  };

  _facetFactoryStepThree = function(model){
    var data = _.extend({}, model.get('modalidad'));
    return new Entities.FondoStepThreeFacet(data);
  };

  _facetFactoryStepFour = function(model){
    var data = _.extend({}, model.get('pasajero'), model.get('evento'), model.get('tramo'), model.get('viaje'));
    return new Entities.FondoStepFourFacet(data);
  };

  _facetFactoryStepFive = function(model){
    var data = _.extend({}, model.get('pasajero'), model.get('evento'), model.get('tramo'), model.get('viaje'));
    return new Entities.FondoStepFiveFacet(data);
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

    newEntityFactory: function(){
      var request = new Entities.FondoRegistration();
      var defer = $.Deferred();
      defer.resolve(request);
      return defer.promise();
    },

  };

  //*************************************************************
  //            entity HANDLERS
  //*************************************************************
  DocManager.reqres.setHandler("fondorqst:entity", function(id){
    return API.getEntity(id);
  });

  DocManager.reqres.setHandler("fondorqst:factory:new", function(){
    return API.newEntityFactory();
  });

 
});
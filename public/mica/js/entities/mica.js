DocManager.module("Entities", function(Entities, DocManager, Backbone, Marionette, $, _){
    
  Entities.MicaRegistration = Backbone.Model.extend({
    urlRoot: "/micasuscriptions",
    whoami: 'MicaRegistration:mica.js ',
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

    update: function(user, representantes, cb){
      var self = this;
      initModelForUpdate(user, self);
      _updateFacetStepOne(user, self);
      _updateFacetStepTwo(user, representantes, self);
      _updateFacetStepThree(user, self);
      _updateFacetStepFour(user, self);

      // ********** SAVE TO SERVER ***********
      if(!self.save(null,{
        success: function(model){
          console.log('callback SUCCESS')

          cb(null,model);

         }
        })) {
        cb(self.validationError,null);
      }


    },


    defaults: {
       _id: null,
      tregistro:'inscripcion',
      evento:'mica',
      rubro:'general',
      legal: '',

      //inscripcion
      cnumber:'',
      documid: '',
      fealta: '',
      fecomp: '',
      slug: '',
      description: '',
      estado_alta:'activo',
      edicionevento: '2015',
      nivel_ejecucion: 'enproceso',

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

        edisplayName: 'LA UNO DISPLAY NAME',
        ename: 'LA UNO S.A.',
        emotivation: 'Motivación alguna',
        edescription: 'Descripción algo',
        epais: 'AR',
        eprov: 'CABA',  
        elocalidad: '',
        ecuit: '',
        edomicilio: '',
        ecp: '',
        email: '',
        eweb: '',
        efundacion: '',
        enumempleados: '',
        eventas: '',


        // solo para personas juridicas
        eactividad: '',
        efechapj: '',
      },

      // Responsable empresa o titular
      responsable:{
        rmail: '',
        rname: 'Mateo Gomez',
        rapellido: 'Ortega',
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

        ridiomas: '',
        rweb: '',
        raudiovideo: '',
        representantes: [],
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
      en_mica: 'no',
      en_mica_detalle: {
          movilidad: false,
          sostenibilidad: false,
          infraestructura: false,
          innovacion: false,
        },
      },

      isComprador: '',
      isVendedor: '',

      vendedor: {
        rolePlaying:{
          vendedor: false
        },

        vactividades: {
          aescenicas: false,
          audivisual: false,
          disenio: false,
          editorial: false,
          musica: false,
          videojuegos: false,
        },

        sub_aescenicas: {
          teatro: false,
          mimo: false,
          otro: false,
        },
        sub_audiovisual: {
          cine: false,
          publicidad: false,
          otro: false,
        },
        sub_editorial: {
          ficcion: false,
          ensayo: false,
          cuento: false,
          poesia: false,
          otros: false,
        },
        sub_musica: {
          tango: false,
          folklore: false,
          otros: false,
        },
        sub_disenio: {
          grafico: false,
          indumentaria: false,
          otros: false,
        },
        sub_videojuegos: {
          escritorio: false,
          moviles: false,
          otros: false,
        },
        vexperienciaintl: 1,
        vcomentario: '',
        vproducto: {
          denominacion:'',
          urlaudio: '',
          urlvideo: '',
          urlimg: '',
          urlweb: '',
          urlotro: '',
        },
        vproductos: [],
      },

      comprador: {
        rolePlaying:{
          comprador: false
        },

        cactividades: {
          aescenicas: false,
          audivisual: false,
          disenio: false,
          editorial: false,
          musica: false,
          videojuegos: false,
        },

        sub_aescenicas: {
          teatro: false,
          mimo: false,
          otro: false,
        },
        sub_audiovisual: {
          cine: false,
          publicidad: false,
          otro: false,
        },
        sub_editorial: {
          ficcion: false,
          ensayo: false,
          cuento: false,
          poesia: false,
          otros: false,
        },
        sub_musica: {
          tango: false,
          folklore: false,
          otros: false,
        },
        sub_disenio: {
          grafico: false,
          indumentaria: false,
          otros: false,
        },
        sub_videojuegos: {
          escritorio: false,
          moviles: false,
          otros: false,
        },
        cexperienciaintl: 1,
        ccomentario: '',
        cporfolio: {
          denominacion:'',
          urlaudio: '',
          urlvideo: '',
          urlimg: '',
          urlweb: '',
          urlotro: '',
        },
        cporfolios: [],
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
    
  Entities.MicaRegistrationCol = Backbone.Collection.extend({
    model: Entities.MicaRegistration,
    url: "/micasuscriptions"
  });

  Entities.MicaRegistrationFindByQueryCol = Backbone.Collection.extend({
    whoami: 'MicaRegistrationSearchCol: perfilmica.js',
    model: Entities.MicaRegistration,
    url: "/navegar/micasuscriptions",

  });

  Entities.MicaRegistrationFetchOneCol = Backbone.Collection.extend({
    whoami: 'MicaRegistrationSearchCol: perfilmica.js',
    model: Entities.MicaRegistration,
    url: "/micasuscriptions/fetch",

  });



  //*************************************************************
  //            Helper Functions FOR UPDATE
  //*************************************************************
  initModelForUpdate = function(user, model){
    if(!model.id){
      initNewModel(user, model);
    }
  };

  userGetPersonId = function(user){
    var personid ='',
        person = user.get('es_usuario_de');
    if(person){
      if(person.length > 0){
        personid = person[0].id;
      }
    }
    return personid;
  };

  initNewModel = function(user, model){
    var self = this,
    fealta = new Date(),
    fecomp = utils.dateToStr(fealta),
    personid = userGetPersonId(user);



    var initialdata = {
      tregistro:'inscripcion',
      evento:'mica',
      edicionevento:'2015',
      rubro:'general',
      legal: 'pendiente',
      cnumber:'',
      documid: '',
      fealta: fealta.getTime(),
      fecomp: fecomp,
      slug: 'Inscripcion MICA 2015' + model.get('edisplayName'),
      description: '',
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
  //            FACET ONE (EMPRESA)
  //*************************************************************

  Entities.MicaStepOneFacet = Backbone.Model.extend({
    urlRoot: "/micasuscriptions",
    whoami: 'MicaStepOneFacet:mica.js ',
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

  Entities.MicaStepTwoFacet = Backbone.Model.extend({
    urlRoot: "/micasuscriptions",
    whoami: 'MicaStepTwoFacet:mica.js ',
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

  Entities.MicaStepThreeFacet = Backbone.Model.extend({
    urlRoot: "/micasuscriptions",
    whoami: 'MicaStepThreeFacet:mica.js ',
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

  Entities.MicaStepFourFacet = Backbone.Model.extend({
    urlRoot: "/micasuscriptions",
    whoami: 'MicaStepFourFacet:mica.js ',
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

  Entities.MicaStepFiveFacet = Backbone.Model.extend({
    urlRoot: "/micasuscriptions",
    whoami: 'MicaStepFiveFacet:mica.js ',
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
  //            REPRESENTANTES
  //*************************************************************
  Entities.Representante = Backbone.Model.extend({
    whoami: 'Representante: mica.js ',

    schema: {
        aname:    {type: 'Text',  title: 'Nombre'},
        acargo:   {type: 'Text',  title: 'Cargo'},
        amail:    {type: 'Text',  title: 'E-mail'},
        acel:     {type: 'Text',  title: 'Tel celular'},
        atel:     {type: 'Text',  title: 'Tel línea'},
        aidiomas: {type: 'Text',  title: 'Conocimiento de idiomas'},
        afenac:   {type: 'Text',  title: 'Fecha Nacimiento'},
        adni:     {type: 'Text',  title: 'DNI o Pasaporte'},
    },
 
    validate: function(attrs, options) {
      var errors = {}
      //console.log(attrs)
      if (_.has(attrs,'rname') && (!attrs.rname )) {
        errors.rname = "No puede ser nulo";
      }     

      if( ! _.isEmpty(errors)){
        return errors;
      }
    },

    defaults: {
      aname: '',
      acargo: '',
      amail: '',
      acel: '',
      atel: '',
      aidiomas: '',
      afenac: '',
      adni: '',
    },
  }); 
  
  Entities.RepresentanteCol = Backbone.Collection.extend({
    whoami: 'Entities.RepresentanteCol:mica.js ',
    model: Entities.Representante,
    comparator: "aname",
  });

  //*************************************************************
  //            PORFOLIO
  //*************************************************************
  Entities.Porfolio = Backbone.Model.extend({
    whoami: 'Porfolio: MICA.js ',
    
    schema: {
        denominacion: {type: 'TextArea',  title: 'Describa su producto, proyecto o servicio'},
        referencias:  {type: 'TextArea',  title: 'Indique referencias externas (enlaces a sitio web, notas periodísticas, audios, videos, u otros)'},
    },

 
    validate: function(attrs, options) {
      var errors = {}
      //console.log(attrs)
      if (_.has(attrs,'rname') && (!attrs.rname )) {
        errors.rname = "No puede ser nulo";
      }     

      if( ! _.isEmpty(errors)){
        return errors;
      }
    },

    defaults: {
      denominacion: 'Ingrese nuevo antecedente: proyecto/ producto/ servicio',
      referencias: '',
      porfolios:[],
    },
  }); 
  
  Entities.PorfolioCol = Backbone.Collection.extend({
    whoami: 'PorfolioCol: mica.js',
    model: Entities.Porfolio,
    comparator: "rname",
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
    var data = _.extend({}, model.get('solicitante'));
    console.log('solicitante: [%s]', data.edisplayName)
    return new Entities.MicaStepOneFacet(data);
  };
  _updateFacetStepOne = function(user, model){
    var solicitante = model.get('solicitante');
    solicitante = model.stepOne.attributes;
    model.set('solicitante', solicitante);
  };

  _facetFactoryStepTwo = function(model){
    var data = _.extend({}, model.get('responsable'));
    model.representantes = model.get('responsable').representantes;
    return new Entities.MicaStepTwoFacet(data);
  };
  _updateFacetStepTwo = function(user, representantes, model){
    console.log('Representantes: [%s] [%s]', representantes.whoami, representantes.length)
    var responsable = model.get('responsable');
    responsable = model.stepTwo.attributes;
    responsable.representantes = representantes.toJSON();
    model.set('responsable', responsable);
  };

  _facetFactoryStepThree = function(model){
    //var data = _.extend({}, model.get('rolePlaying'), model.get('vendedor'));
    return new Entities.MicaStepThreeFacet(model.get('vendedor'));
  };
  _updateFacetStepThree = function(user, model){
    //var rolePlaying = model.get('rolePlaying');
    var vendedor = model.get('vendedor');
    vendedor = model.stepThree.attributes;
    model.set('vendedor', vendedor);
  };

  _facetFactoryStepFour = function(model){
    var data = _.extend({}, model.get('rolePlaying'), model.get('comprador'));
    return new Entities.MicaStepFourFacet(data);
  };
  _updateFacetStepFour = function(user, model){
    //var rolePlaying = model.get('rolePlaying');
    var comprador = model.get('comprador');
    comprador = model.stepFour.attributes;
    model.set('comprador', comprador);
  };

  _facetFactoryStepFive = function(model){
    var data = _.extend({}, model.get('pasajero'), model.get('evento'), model.get('tramo'), model.get('viaje'));
    return new Entities.MicaStepFiveFacet(data);
  };

  _facetFactoryPorfolio = function(model){
    var data = _.extend({}, model.get('porfolios'), model.get('porfolio'));
    return new Entities.Porfolio(data);
  };





  //*************************************************************
  //            entity API
  //*************************************************************
  var API = {

    getEntity: function(entityId){
      var request = new Entities.MicaRegistration({_id: entityId});
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

    fetchMicaByUser: function(user, evento){
      console.log('fetchMicaByUser BEGIN')
      var entities = new Entities.MicaRegistrationFetchOneCol();
      var query = {},
          defer = $.Deferred();

      query.evento = evento;
      query["user.userid"] = user.id;

      entities.fetch({
        data: query,
        type: 'post',
        success: function(data){
          console.log('BINGOOOOOO: [%s]', data.length);
          if(data.length){
            console.log('data?????[%s] [%s]', data.whoami, data.at(0).get('slug'))
            defer.resolve(data.at(0));
          }else{
            defer.resolve(new Entities.MicaRegistration());
          }
        },
        error: function(data){
            defer.resolve(new Entities.MicaRegistration());          
        }
      });
      return defer.promise();

    },

    newEntityFactory: function(){
      var request = new Entities.MicaRegistration();
      var defer = $.Deferred();
      defer.resolve(request);
      return defer.promise();
    },

  };

  //*************************************************************
  //            entity HANDLERS
  //*************************************************************
  DocManager.reqres.setHandler("micarqst:entity", function(id){
    return API.getEntity(id);
  });

  DocManager.reqres.setHandler("micarqst:factory:new", function(user, evento){
    if(user){
      return API.fetchMicaByUser(user, evento);
    }else{
      return API.newEntityFactory();
    }
  });

 
});
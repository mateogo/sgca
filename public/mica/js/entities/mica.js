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

    update: function(user, representantes, vporfolios, cporfolios, cb){
      var self = this;
      initModelForUpdate(user, self);
      _updateFacetStepOne(user, self);
      _updateFacetStepTwo(user, representantes, self);
      _updateFacetStepThree(user, vporfolios, self);
      _updateFacetStepFour(user, cporfolios, self);

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

        edisplayName: '',
        ename: '',
        emotivation: '',
        edescription: '',
        epais: 'AR',
        eprov: '',
        elocalidad: '',
        ecuit: '',
        edomicilio: '',
        ecp: '',
        email: '',
        eweb: '',
        efundacion: '',
        enumempleados: '',
        eventas: '',
        eavatar: '',


        // solo para personas juridicas
        eactividad: '',
        efechapj: '',
      },

      // Responsable empresa o titular
      responsable:{
        rmail: '',
        rname: '',
        rcargo: '',

        //
        rdocnum: '',
        rfenac: '',

        rtel: '',
        rcel: '',


        ridiomas: '',
        representantes: [],
      },
      
      isComprador: '',
      isVendedor: '',

      vendedor: {
        rolePlaying:{
          vendedor: false
        },

        vactividades: '',

/*
        vactividades: {
          aescenicas: false,
          audiovisual: false,
          disenio: false,
          editorial: false,
          musica: false,
          videojuegos: false,
        },

*/      
        sub_aescenicas: {
          diseniador: false,
          direccion: false,
          dramaturgia: false,
          coreografia: false,
          programadorfestivales: false,
          programadorsalas: false,
          camaras: false,
          proveedores: false,
        },
        sub_audiovisual: {
          pservicios: false,
          pcontenidos: false,
          servicios: false,
          vjs: false,
          profesional: false,
          programador: false,
          distribuidor: false,
          exhibtelevision: false,
          exhibcine: false,
          exhibmultiplataforma: false,
          camaras: false,
          editores: false,
        },
        sub_editorial: {
          editor: false,
          libreria: false,
          distribuidora: false,
          ilustrador: false,
          revistacultural: false,
          elecronico: false,
        },
        sub_musica: {
          representante: false,
          produccion: false,
          festival: false,
          salas: false,
          sello: false,
          servicios: false,
          camaras: false,
        },
        sub_disenio: {
          grafico: false,
          indumentaria: false,
          industrial: false,
          joyeria: false,
          multimedia: false,
        },
        sub_videojuegos: {
          programacion: false,
          arte: false,
          disenio: false,
          guion: false,
          produccion: false,
          musica: false,
          testeo: false,
          comunicacion: false,
          comunidades: false,
        },

        vexperienciaintl: 1,
        vdescriptores: [],
        vcomentario: '',
        vporfolio: {
          denominacion:'',
          referencias: [],
        },
        vporfolios: [],
      },


      comprador: {
        rolePlaying:{
          comprador: false
        },

        cactividades: '',

        sub_aescenicas: {
          diseniador: false,
          direccion: false,
          dramaturgia: false,
          coreografia: false,
          programadorfestivales: false,
          programadorsalas: false,
          camaras: false,
          proveedores: false,
        },
        sub_audiovisual: {
          pservicios: false,
          pcontenidos: false,
          servicios: false,
          vjs: false,
          profesional: false,
          programador: false,
          distribuidor: false,
          exhibtelevision: false,
          exhibcine: false,
          exhibmultiplataforma: false,
          camaras: false,
          editores: false,
        },
        sub_editorial: {
          editor: false,
          libreria: false,
          distribuidora: false,
          ilustrador: false,
          revistacultural: false,
          elecronico: false,
        },
        sub_musica: {
          representante: false,
          produccion: false,
          festival: false,
          salas: false,
          sello: false,
          servicios: false,
          camaras: false,
        },
        sub_disenio: {
          grafico: false,
          indumentaria: false,
          industrial: false,
          joyeria: false,
          multimedia: false,
        },
        sub_videojuegos: {
          programacion: false,
          arte: false,
          disenio: false,
          guion: false,
          produccion: false,
          musica: false,
          testeo: false,
          comunicacion: false,
          comunidades: false,
        },
        cexperienciaintl: 1,
        ccomentario: '',
        cporfolio: {
          denominacion:'',
          referencias: [],
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
    whoami: 'MicaRegistrationFindByQueryCol: mica.js',
    model: Entities.MicaRegistration,
    url: "/navegar/micasuscriptions",

  });

  Entities.MicaRegistrationFetchOneCol = Backbone.Collection.extend({
    whoami: 'MicaRegistrationFetchOneCol: mica.js',
    model: Entities.MicaRegistration,
    url: "/micasuscriptions/fetch",

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
      tregistro:'inscripcion',
      evento:'mica',
      edicionevento:'2015',
      rubro:'general',
      cnumber:'',
      documid: '',
      fealta: fealta.getTime(),
      fecomp: fecomp,
      slug: 'Inscripcion MICA 2015' + model.get('solicitante').edisplayName,
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

      var check = [['edisplayName'],['edescription'],['emotivation'],['eprov'],['eventas']];
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

      if (_.has(attrs,'edisplayName') && (!attrs.edisplayName )) {
        errors.edisplayName = "No puede ser nulo";
      }
      if (_.has(attrs,'edescription') && (!attrs.edescription )) {
        errors.edescription = "No puede ser nulo";
      }
      if (_.has(attrs,'emotivation') && (!attrs.emotivation )) {
        errors.emotivation = "No puede ser nulo";
      }
      if (_.has(attrs,'eprov')) {

      }

      if (_.has(attrs,'eprov') && (!attrs.eprov )) {
        errors.eprov = "No puede ser nulo";
      }
      if (_.has(attrs,'eventas') && (!attrs.eventas )) {
        errors.eventas = "No puede ser nulo";
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

      var check = [['rname'],['rdocnum']];
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

      if( ! _.isEmpty(errors)){
        return errors;
      }

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

      var check = [['vactividades'],['vcomentario']];
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

      if(this.get('rolePlaying').vendedor){

        if (_.has(attrs,'vactividades') && (!attrs.vactividades )) {
          errors.vactividades = "No puede ser nulo";
        }
        
        if (_.has(attrs,'vcomentario') && (!attrs.vcomentario )) {
          errors.vcomentario = "No puede ser nulo";
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

      var check = [['cactividades'],['ccomentario']];
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
      if(this.get('rolePlaying').comprador){
        if (_.has(attrs,'cactividades') && (!attrs.cactividades )) {
          errors.cactividades = "No puede ser nulo";
        }
        
        if (_.has(attrs,'ccomentario') && (!attrs.ccomentario )) {
          errors.ccomentario = "No puede ser nulo";
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
        aname:    {type: 'Text',  title: 'Nombre y apellido'},
        acargo:   {type: 'Text',  title: 'Cargo / Función'},
        amail:    {type: 'Text',  title: 'Email'},
        acel:     {type: 'Text',  title: 'Teléfono móvil', editorAttrs:{placeholder:'+54 (área) número'}},
        atel:     {type: 'Text',  title: 'Teléfono',  editorAttrs:{placeholder:'+54 (área) número'}},
        aidiomas: {type: 'Text',  title: 'Conocimiento de idiomas'},
        afenac:   {type: 'Text',  title: 'Fecha Nacimiento', editorAttrs:{placeholder:'dd/mm/aaaa'}},
        adni:     {type: 'Text',  title: 'DNI / Pasaporte', editorAttrs:{placeholder:'número de documento'}},
    },
 
    validate: function(attrs, options) {
      var errors = {}
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
        slug: {type: 'Text',  title: 'Denominación del producto o servicio', editorAttrs:{placeholder:'Título o denominación para este elemento del porfolio'}},
        denominacion: {type: 'TextArea',  title: 'Describa su producto, proyecto o servicio', editorAttrs:{placeholder:'Síntesis ejecutiva del producto/servicio a destacar'}},
        //referencias:  {type: 'TextArea',  title: 'Indique referencias externas (enlaces a sitio web, notas periodísticas, audios, videos, u otros)'},
    },

 
    validate: function(attrs, options) {
      var errors = {}
      if (_.has(attrs,'rname') && (!attrs.rname )) {
        errors.rname = "No puede ser nulo";
      }     

      if( ! _.isEmpty(errors)){
        return errors;
      }
    },

    defaults: {
      slug: '',
      denominacion: '',
      referencias: [],
    },
  }); 
  
  Entities.PorfolioCol = Backbone.Collection.extend({
    whoami: 'PorfolioCol: mica.js',
    model: Entities.Porfolio,
    comparator: "rname",
  });


  //*************************************************************
  //            PORFOLIO LINKS
  //*************************************************************
  Entities.PorfolioReference = Backbone.Model.extend({
    // links externos, a modo de referencias, asociados al porfolio

    whoami: 'PorfolioReference: MICA.js ',
    
    schema: {
      tlink:     {type: 'Select',   title: 'Tipo de enlace externo',   editorAttrs:{placeholder:'Tipo de referencia externa'},options: utils.linkTypeOpLst },
      slug:      {type: 'Text',     title: 'Descripción',      editorAttrs:{placeholder:'Descripción/ comentario del enlace propuesto'}},
      targeturl: {type: 'Text',     title: 'Enlace (URL)',      editorAttrs:{placeholder:'http://www.dominio.com.pais'}, dataType:'url', validators:['required', 'url']},
    },

 
    validate: function(attrs, options) {
      var errors = {}

      if (_.has(attrs,'slug') && (!attrs.slug )) {
        errors.rname = "No puede ser nulo";
      }     

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
  
  Entities.PorfolioReferenceCol = Backbone.Collection.extend({
    whoami: 'PorfolioReferenceCol: mica.js',
    model: Entities.PorfolioReference,
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
    return new Entities.MicaStepOneFacet(data);
  };
  var _updateFacetStepOne = function(user, model){
    var solicitante = model.get('solicitante');
    solicitante = model.stepOne.attributes;
    model.set('solicitante', solicitante);
  };

  var _facetFactoryStepTwo = function(model){
    var data = _.extend({}, model.get('responsable'));
    model.representantes = model.get('responsable').representantes;
    return new Entities.MicaStepTwoFacet(data);
  };
  var _updateFacetStepTwo = function(user, representantes, model){
    var responsable = model.get('responsable');
    responsable = model.stepTwo.attributes;
    responsable.representantes = representantes.toJSON();
    model.set('responsable', responsable);
  };

  var _facetFactoryStepThree = function(model){
    //var data = _.extend({}, model.get('rolePlaying'), model.get('vendedor'));
    model.vporfolios = model.get('vendedor').vporfolios;
    return new Entities.MicaStepThreeFacet(model.get('vendedor'));
  };
  var _updateFacetStepThree = function(user, porfolios, model){
    //var rolePlaying = model.get('rolePlaying');
    var vendedor;
    vendedor = model.stepThree.attributes;
    vendedor.vporfolios = porfolios.toJSON();
    model.set('vendedor', vendedor);
  };

  var _facetFactoryStepFour = function(model){
    //var data = _.extend({}, model.get('rolePlaying'), model.get('comprador'));
    model.cporfolios = model.get('comprador').cporfolios;
    return new Entities.MicaStepFourFacet(model.get('comprador'));
  };
  var _updateFacetStepFour = function(user, porfolios, model){
    //var rolePlaying = model.get('rolePlaying');
    var comprador;
    comprador = model.stepFour.attributes;
    comprador.cporfolios = porfolios.toJSON();
    model.set('comprador', comprador);
  };

  var _facetFactoryStepFive = function(model){
    var data = _.extend({}, model.get('pasajero'), model.get('evento'), model.get('tramo'), model.get('viaje'));
    return new Entities.MicaStepFiveFacet(data);
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
      var entities = new Entities.MicaRegistrationFindByQueryCol();
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
      var entities = new Entities.MicaRegistrationFetchOneCol();
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

  DocManager.reqres.setHandler("micarqst:query:entities", function(query){
    return API.getFilteredByQueryCol(query);
  });

});


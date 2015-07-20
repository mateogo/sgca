DocManager.module("Entities", function(Entities, DocManager, Backbone, Marionette, $, _){
    
  Entities.MicaRegistration = Backbone.Model.extend({
    urlRoot: "/micasuscriptions",
    whoami: 'MicaRegistration:mica.js ',
    idAttribute: "_id",
    
    initialize: function(opts){

    },
    
    getAvatar: function(){
      var avatar = this.get('solicitante').eavatar;
      if(avatar && avatar.urlpath){
        return avatar.urlpath;
      }else{
        return 'mica/images/back-dotted.png';
      }
    },

    schema: {
      nivel_ejecucion: {type: 'Select',   title: 'Nivel de ejecucion',options: tdata.nivel_ejecucionOL },
      'solicitante.eprov': {type: 'Select',   title: 'Provincias',options: tdata.provinciasOL },
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
    changeNivelDeEjecucion: function(state){
      this.set('nivel_ejecucion', state);

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

    isVendedor: function(){
      return this.get('vendedor').rolePlaying.vendedor;
    },

    isComprador: function(){
      return this.get('comprador').rolePlaying.comprador;
    },
    isFavorito: function(userid){
      return (userid && this.get(userid) && this.get(userid).favorito && this.get(userid).favorito === true);
    },

    hasReunionSolicitada: function(userid){
      return (userid && this.get(userid) && this.get(userid).emisor && this.get(userid).emisor > 0);
    },
    hasReunionRecibida: function(userid){
      return (userid && this.get(userid) && this.get(userid).receptor && this.get(userid).receptor > 0);
    },
    hasResponse: function(userid){
      return ((userid && this.get(userid)) && ( (this.get(userid).receptor && this.get(userid).receptor > 1) || (this.get(userid).emisor && this.get(userid).emisor > 1) ) );
    },

    isReunionPermited: function(otherprofile){
      // La regla es que tengan perfiles cruzados entre self y other profile 
      var self = this;
      if(self.id === otherprofile.id)
        return false;

      if(self.isVendedor() && otherprofile.isComprador() || self.isComprador() && otherprofile.isVendedor()){
        return true;
      }else{
        return false;
      }
    },
    editMeetingToken: function(userid, modosolicitud, newvalue){
      //modosolicitud: ['emisor' || 'receptor']
      // newvalue: [0: sin reunion; 1: reunion solicitada; 2: reunion apreciada]
      //
      var self = this,
          token = {},
          tokendata;

      if(!userid || !self.id) return;
      
      tokendata = self.get(userid) || {};
      tokendata[modosolicitud] = newvalue;

      token[userid] = tokendata;
      DocManager.request("micarqst:partial:update",[self.id], token);
    },

    toggleFavoritos: function(userid){
      var self = this,
          token = {},
          tokendata;

      if(!userid || !self.id) return;
      
      tokendata = self.get(userid) || {};


      if(tokendata.favorito){
 
        if(tokendata.favorito == true || tokendata.favorito == 'true')
          tokendata.favorito = false;
        else
          tokendata.favorito = true;
 
      }else{
       tokendata.favorito = true;
      }

      token[userid] = tokendata;

      DocManager.request("micarqst:partial:update",[self.id], token);
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

  Entities.MicaRegistrationPaginatedCol = Backbone.PageableCollection.extend({
    whoami: 'MicaRegistrationPaginatedCol: mica.js',
    model: Entities.MicaRegistration,
    url: "/query/micasuscriptions",
    //url: "/navegar/micasuscriptions",

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


  Entities.MicaRegistrationFetchOneCol = Backbone.Collection.extend({
    whoami: 'MicaRegistrationFetchOneCol: mica.js',
    model: Entities.MicaRegistration,
    url: "/micasuscriptions/fetch",

  });


  Entities.MicaRegistrationUpdate = Backbone.Model.extend({
    whoami: 'Entities.MicaRegistrationUpdate:mica.js ',

    urlRoot: "/actualizar/micasuscriptions",

  });


  //*************************************************************
  //            FILTER filter FACET
  //*************************************************************
  Entities.MicaFilterFacet = Backbone.Model.extend({
    whoami: 'Entities.MicaFilterFacet:mica.js',
    initialize: function(opts){
      //console.log('initialize Mica FILTER [%s]', this.get('subsector'))
      this.schema.subsector.options = tdata.subSectorOL[this.get('sector')];


    },

    schema: {
        rolePlaying:   {type: 'Select',  title: 'Rol', options: tdata.rolesOL },
        cnumber:       {type: 'Text',    title: 'Número Inscripción' },
        textsearch:    {type: 'Text',    title: 'Búsqueda por texto' },
        provincia:     {type: 'Select',  title: 'Provincia',  options: tdata.provinciasOL },
        sector:        {type: 'Select',  title: 'Sector',  options: tdata.sectorOL },
        subsector:     {type: 'Select',  title: 'SubSector',  options: tdata.subSectorOL.aescenicas },
        nivel_ejecucion: {type: 'Select',  title: 'Aprobación',  options: tdata.nivel_ejecucionOL },
        estado_alta:   {type: 'Select',  title: 'Estado',  options: tdata.estado_altaOL },
    },


    defaults: {
      rolePlaying: 'no_definido',
      provincia: 'no_definido',
      cnumber: '',
      textsearch: '',
      sector: 'no_definido',
      subsector: 'no_definido',
      evento: 'mica',
      rubro: 'general',
      nivel_ejecucion: 'no_definido',
      estado_alta: 'activo',
      favorito: false,
      emisor: 0,
      receptor: 0,
      userid: '',

    },
  });



  //*************************************************************
  //            Exporta a excel EXCEL Excel
  //*************************************************************
  Entities.MicaExportCollection = Backbone.Collection.extend({
    whoami: 'Entities.MicaExportCollection:mica.js ',
    url: "/micasuscriptions",
    model: Entities.MicaRegistration,
    sortfield: 'cnumber',
    sortorder: -1,

    comparator: function(left, right) {
      var order = this.sortorder;
      var l = left.get(this.sortfield);
      var r = right.get(this.sortfield);

      if (l === void 0) return -1 * order;
      if (r === void 0) return 1 * order;

      return l < r ? (1*order) : l > r ? (-1*order) : 0;
    },

    exportRecords: function(){
      var self = this;
      if(!self.length) return;

      //console.log('collection export [%s]',self.length);


      exportFactory.processRequest(exportFactory.fetchCollection(self));
      //

    },
  });

  var exportFactory = {
    exportHeadings: [
        {val:'cnumber',                         label:'NroIns',           itemType: 'Text'},
        {val:'isComprador',                     label:'EsComprador',      itemType: 'Text'},
        {val:'comprador.cactividades',          label:'ActPpalComprador', itemType: 'Text'},
        {val:'isVendedor',                      label:'EsVendedor',       itemType: 'Text'},
        {val:'vendedor.vactividades',           label:'ActPpalVendedor',  itemType: 'Text'},
        {val:'fecomp',                          label:'FechaAlta',        itemType: 'Text'},
        {val:'responsable.rname',               label:'NombreResponsable',itemType: 'Text'},
        {val:'responsable.rmail',               label:'Correo',           itemType: 'Text'},
        {val:'responsable.rcel',                label:'Celular',          itemType: 'Text'},
        {val:'solicitante.edisplayName',        label:'Solicitante',      itemType: 'Text'},
        {val:'solicitante.eprov',               label:'Provincia',        itemType: 'Text'},
    ],

    fetchCollection: function(collection){
      var self = this,
          colItems = [],
          registro,
          data;

      collection.each(function(model){
        registro = [];

        _.each(self.exportHeadings, function(token){

            data = _getFieldLabel(model, token.val);

            if(token.itemType === 'Number'){
              data = parseInt(data);
              if(data == NaN){
                data = 0;
              }


            }else{

              if(typeof data == undefined || data == null || data == ""){
                data = 'sin_dato';
              }

            }

            registro.push(data);
          });
        colItems.push(registro);
      });
      return colItems;
    },

    fetchLabels: function(){
      return this.exportHeadings;
    },

    processRequest: function(col){
      var self = this;
      var query = {
          name: 'Items del Presupuesto',
          heading: self.fetchLabels(),
          data: JSON.stringify(col)
      };

      $.ajax({
        type: "POST",
        url: "/excelbuilder",
        dataType: "json",
        data: query,
        success: function(data){
            window.open(data.file)

        }
      });
    }
  };








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

  var queryCollection = function(query, step){
      var entities = new Entities.MicaRegistrationPaginatedCol();
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

    partialUpdate: function(models, data){
      var query = {},
          nodes,
          update;

      if(_.isArray(models)){
        nodes = models;
      }else if(_.isObject(models)){
        nodes = [models.id];
      }else{
        nodes = [models];
      }

      query.nodes = nodes;
      query.newdata = data;  
      var update = new Entities.MicaRegistrationUpdate(query);
      update.save({
        success: function() {
        }
      });
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
  DocManager.reqres.setHandler("micarqst:entity", function(id){
    return API.getEntity(id);
  });

  DocManager.reqres.setHandler("micarqst:fetchby:user", function(user, evento){
    return API.fetchMicaByUser(user, evento);
  });

  DocManager.reqres.setHandler("micarqst:factory:new", function(user, evento){
    if(user){
      return API.fetchMicaByUser(user, evento);
    }else{
      return API.newEntityFactory();
    }
  });

  DocManager.reqres.setHandler("micarqst:partial:update", function(models, keys){
    return API.partialUpdate(models, keys);
  });

  DocManager.reqres.setHandler("micarqst:query:entities", function(query, step){
    return API.getFilteredByQueryCol(query, step);
  });

});

DocManager.module("Entities", function(Entities, DocManager, Backbone, Marionette, $, _){
    
  Entities.ShowcaseRegistration = Backbone.Model.extend({
    urlRoot: "/micashowcase",
    whoami: 'ShowcaseRegistration:micashowcase.js ',
    idAttribute: "_id",
    
    initialize: function(opts){

    },

    schema: {
      nivel_ejecucion: {type: 'Select',   title: 'Nivel de ejecucion',options: tdata.nivel_ejecucion_showcaseOL },
      'solicitante.eprov': {type: 'Select',   title: 'Provincias',options: tdata.provinciasOL },
      'solicitante.tsolicitud': {type: 'Select',   title: 'Tipo Solicitud',options: tdata.showcaseTSolicitudOL },
    },
    isMusica: function(){
      return this.get('musica').rolePlaying.musica;
    },
    isAEscenicas: function(){
      return this.get('aescenica').rolePlaying.aescenica;
    },

    getFieldLabel: function(field){
      var value;
      if(!field) return '';

      if(this[field]) return this[field]();

      if(field.indexOf('.')!=-1){
        //console.log('Objeto: [%s] propiedad:[%s]', field.substring(0, field.indexOf('.')), field.substring(field.indexOf('.')+1) )
        value =  this.get(field.substring(0, field.indexOf('.')))[field.substring(field.indexOf('.')+1)];
        return _getSelectValue(this, field, value);
      }
      return _getFieldFormatedValue(this, field);

    },

    getGeneros: function(){
      var self = this;

      if(self.get('aescenica').rolePlaying.aescenica){
        return _filterData(self.get('aescenica').generoteatral, tdata.showcaseAEscenicasOL);
      }else{
        return _filterData(self.get('musica').generomusical, tdata.showcaseMusicaOL);
      }
    },

    getMusicReferences: function(){
      if(!this.get('musica').mreferencias || !this.get('musica').mreferencias.length ){
        return [];
      }else{
        return this.get('musica').mreferencias;
      }
    },

    getAEscenicReferences: function(){
      if(!this.get('aescenica').areferencias || !this.get('aescenica').areferencias.length ){
        return [];
      }else{
        return this.get('aescenica').areferencias;
      }
    },


    getFieldFormatedValue: function(field){
      return _getFieldFormatedValue(this, field);
    },

    integrantesList: function(){
      return _getIntegrantesData(this.getIntegrantes());

    },

    getIntegrantes: function(){
      if(!this.get('responsable').integrantes || !this.get('responsable').integrantes.length ){
        return [];
      }else{
        return this.get('responsable').integrantes;
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

  Entities.ShowcaseRegistrationPaginatedCol = Backbone.PageableCollection.extend({
    whoami: 'ShowcaseRegistrationPaginatedCol: mica.js',
    model: Entities.ShowcaseRegistration,
    url: "/query/micashowcase",

    state:{
      firstPage: 1,
      pageSize: 15, 
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

      return {totalRecords: resp[0].total_entries};

    },

    parseRecords: function (resp, options ) {

      return resp[1];

    }
  
  });

  Entities.ShowcaseRegistrationFetchOneCol = Backbone.Collection.extend({
    whoami: 'ShowcaseRegistrationFetchOneCol: micashowcase.js',
    model: Entities.ShowcaseRegistration,
    url: "/micashowcase/fetch",

  });

  Entities.ShowcaseRegistrationUpdate = Backbone.Model.extend({
    whoami: 'Entities.ShowcaseRegistrationUpdate:mica.js ',

    urlRoot: "/actualizar/micashowcase",

  });


  //*************************************************************
  //            FILTER filter FACET
  //*************************************************************
  Entities.ShowcaseFilterFacet = Backbone.Model.extend({
    whoami: 'Entities.ShowcaseFilterFacet:micashowcase.js',
    initialize: function(opts){

      this.schema.subgenero.options = tdata.subgeneroOL[this.get('tsolicitud')];

    },

    schema: {
        tsolicitud:    {type: 'Select',  title: 'Tipo Solicitud',  options: tdata.showcaseTSolicitudOL },
        subgenero:     {type: 'Select',  title: 'Tipo Solicitud',  options: tdata.subgeneroOL['no_definido'] },
        cnumber:       {type: 'Text',    title: 'Número Inscripción' },
        textsearch:    {type: 'Text',    title: 'Búsqueda por texto' },
        nivel_ejecucion: {type: 'Select',  title: 'Aprobación',  options: tdata.nivel_ejecucion_showcaseOL },
        estado_alta:   {type: 'Select',  title: 'Estado',  options: tdata.estado_altaOL },
    },


    defaults: {
      tsolicitud: 'no_definido',
      subgenero: 'no_definido',
      cnumber: '',
      textsearch: '',
      evento: 'mica_showcase',
      rubro: 'general',
      nivel_ejecucion: 'no_definido',
      estado_alta: 'activo',
    },
  });



  //*************************************************************
  //            Exporta a excel EXCEL Excel
  //*************************************************************

  Entities.ShowcaseExportCollection = Backbone.PageableCollection.extend({
    whoami: 'Entities.ShowcaseExportCollection:micashowcase.js ',
    model: Entities.ShowcaseRegistration,
    url: "/fetch/micashowcase",
    sortfield: 'cnumber',
    sortorder: -1,

    state:{
      firstPage: 1,
      pageSize: 15, 
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

      return {totalRecords: resp.length};

    },

    parseRecords: function (resp, options ) {

      return resp;

    },

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
        {val:'solicitante.tsolicitud',          label:'Tipo Solicitud',   itemType: 'Text'},
        {val:'solicitante.edisplayName',        label:'Solicitante',      itemType: 'Text'},
        {val:'responsable.rmail',               label:'Correo',           itemType: 'Text'},
        {val:'responsable.rname',               label:'Nombre Responsable',itemType:'Text'},
        {val:'responsable.rcel',                label:'Celular',          itemType: 'Text'},
        {val:'solicitante.edescription',        label:'Biografía',        itemType: 'Text'},
        //{val:'integrantesList',                 label:'Integrantes',      itemType: 'Text'},
        {val:'musica.sello',                    label:'M:Sello',          itemType: 'Text'},
        {val:'musica.discografia',              label:'M:Discografia',    itemType: 'Text'},
        {val:'musica.festivales',               label:'M:Festivales',     itemType: 'Text'},
        {val:'musica.giras',                    label:'M:Giras',          itemType: 'Text'},
        {val:'musica.escenario',                label:'M:Técnica',        itemType: 'Text'},
        {val:'musica.generomusical.folklore',      label:'M:Folklore',    itemType: 'Boolean'},
        {val:'musica.generomusical.tango',         label:'M:Tango',       itemType: 'Boolean'},
        {val:'musica.generomusical.tropical',      label:'M:Tropical',    itemType: 'Boolean'},
        {val:'musica.generomusical.rock',          label:'M:Rock',        itemType: 'Boolean'},
        {val:'musica.generomusical.reggae',        label:'M:Reggae',      itemType: 'Boolean'},
        {val:'musica.generomusical.electronica',   label:'M:Electronica', itemType: 'Boolean'},
        {val:'musica.generomusical.jazz',          label:'M:Jazz',        itemType: 'Boolean'},
        {val:'musica.generomusical.contemporanea', label:'M:Contemporanea', itemType: 'Boolean'},
        {val:'musica.generomusical.fusion',        label:'M:Fusion',      itemType: 'Boolean'},
        {val:'musica.generomusical.otros',         label:'M:Otros',       itemType: 'Boolean'},
        {val:'aescenica.propuestaartistica',           label:'AES:Artística',  itemType: 'Text'},
        {val:'aescenica.experiencia',                  label:'AES:Experiencia',itemType: 'Text'},
        {val:'aescenica.aescenario',                   label:'AES:Técnica',    itemType: 'Text'},
        {val:'aescenica.generoteatral.teatro',         label:'AES:Teatro',     itemType: 'Boolean'},
        {val:'aescenica.generoteatral.teatrodanza',    label:'AES:Danza',      itemType: 'Boolean'},
        {val:'aescenica.generoteatral.titeres',        label:'AES:Títeres',    itemType: 'Boolean'},
        {val:'aescenica.generoteatral.circo',          label:'AES:Circo',      itemType: 'Boolean'},
        {val:'aescenica.generoteatral.performance',    label:'AES:Performance',itemType: 'Boolean'},
        {val:'aescenica.generoteatral.comediamusical', label:'AES:ComediaMus', itemType: 'Boolean'},
        {val:'aescenica.generoteatral.otros',          label:'AES:Otros',      itemType: 'Boolean'},
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

            }else if(token.itemType === 'Boolean'){
              if(data){
                data = 1;
              }else{
                data = 0;
              }
            }else if(token.itemType === 'Text'){
              if(typeof data == undefined || data == null || data == ""){
                data = 'sin_dato';
              }
              if(data.length>50){
                data = data.substr(0,50);

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

      var formData = new FormData();

      formData.append('name', 'Inscriptos Showcase 2015');
      formData.append('heading',JSON.stringify(self.fetchLabels()));
      formData.append('data',JSON.stringify(col));

      var xhr = new XMLHttpRequest();

      xhr.open('POST', '/excelbuilder');

      xhr.onload = function() {
          var srvresponse = JSON.parse(xhr.responseText);
          window.open(srvresponse.file)

      };

      xhr.upload.onprogress = function(event) {
          // if (event.lengthComputable) {
          //     var complete = (event.loaded / event.total * 100 | 0);
          //     $(progressbar).css({'width':complete+'%'});
          // }
      };

      xhr.send(formData);    

    },

    processRequestAnt: function(col){
      var self = this;
      var query = {
          name: 'Inscriptos Showcase 2015',
          heading: self.fetchLabels(),
          data: JSON.stringify(col)
      };

      $.ajax({
        url: "/excelbuilder",
        type: "POST",
        dataType: "json",
        //contentType:  'multipart/form-data',
        data: query,
        success: function(data){
          console.dir(data);
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


    return _getSelectValue(model, field, model.get(field));
  };

  var _getSelectValue = function(model, field, value){
    var selected;
    if(!model.schema || !(field in model.schema) || model.schema[field].type !== 'Select' ) return value || '';

    if(value === 'no_definido' || value === "nodefinido") return '';

    selected = _.findWhere(model.schema[field].options, {val: value});
    return (selected)? selected.label : value;


  };
  var _filterData = function(anObj, labels){
    var data = [],
        stringdata;
    data = _.map(anObj, function(value, index){
      return value ? tdata.fetchLabel(labels, index) : value;
    });
    data = _.filter(data, function(item){
      return item;
    });
    return data.join('; ');
  };

  var _stringData = function(anObj){
    var data = [];
    _.reduce(anObj, function(data, value, index){
      if(value) data.push(index);
      return data;

    }, data);
    return data.join('; ');

  };

  var _getIntegrantesData = function(list){
    var data = [];

    _.reduce(list, function(data, item, index){
      data.push(item.aname + " (" + item.acargo + ")");
      return data;

    }, data);

    return data.join('; ');
  };

  var _getFieldLabel = function(model, field){
      var value,
          tokens;
      if(!field) return '';
      if(model[field]){
        return _getSelectValue(model, field, model[field]());

      }else if(field.indexOf('.') != -1){
        tokens = field.split('.');
        
        if(tokens.length === 2 ){
          
          value =  model.get(tokens[0])[tokens[1]];
 
        }else if(tokens.length === 3){
          value =  model.get(tokens[0])[tokens[1]][tokens[2]];

        }
        return _getSelectValue(model, field, value);

      }else{
        return _getSelectValue(model, field, model.get(field));

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
  var queryCollection = function(query, step){
      var entities = new Entities.ShowcaseRegistrationPaginatedCol();
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

  var loadCollection = function(){
      var entities = new Entities.ShowcaseRegistrationCol();
      var defer = $.Deferred();

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
      var update = new Entities.ShowcaseRegistrationUpdate(query);
      update.save({
        success: function() {
        }
      });
    },

    checkUsersData: function(){
      var userpromise,
          repairkeys,
          roles = [],
          modulos = [],
          testindex = 0,
          woutuser = 0;

      $.when(loadCollection()).done(function(profiles){
        profiles.each(function(profile){
          testindex = testindex + 1;
          if(profile.get('user').userid){

            if(testindex > 14500) return;
            if(false) {

              userpromise = DocManager.request("user:entity",profile.get('user').userid);

              $.when(userpromise).done(function(user){
                if((user.get('roles').indexOf('usuario') === -1 && user.get('roles').indexOf('admin') === -1) || user.get('modulos').indexOf('mica') === -1 ){
                  //|| user.get('home')!== 'mica:rondas' || user.get('grupo') !== 'adherente'

                  console.log('user: [%s] [%s] role:[%s] mod:[%s] [%s] grp:[%s] [%s]',
                    user.get('displayName'),user.get('username'), 
                    user.get('roles'), user.get('modulos'), user.get('estado_alta'), 
                    user.get('grupo'), user.get('home'));
                  roles = user.get('roles')|| [];
                  modulos = user.get('modulos')|| [];

                  if(roles.indexOf('usuario') === -1) roles.push('usuario');
                  if(modulos.indexOf('mica') === -1) modulos.push('mica');

                  repairkeys = {
                    modulos: modulos,
                    roles: roles
                  }
                  if(!user.get('home')) repairkeys.home = 'mica:rondas';
                  if(!user.get('grupo')) repairkeys.grupo = 'adherente';
                  if(user.get('estado_alta') === 'pendaprobacion') repairkeys.estado_alta = 'activo';

                  user.partialUpdate(repairkeys);
                }
              });

            }

          }else{
            if(profile.get('estado_alta') === 'activo'){
              woutuser = woutuser +1;
              DocManager.request("showcase:partial:update", [profile.id],  {estado_alta: 'sinuser'});
              //console.log('======== mica suscription sin user: [%s] [%s]   [%s]', profile.get('cnumber'), profile.get('responsable').rname, profile.get('responsable').rmail);
            }
          }

        });
        console.log('======= total recorods:[%s]   (al 22-07: total 2744/130 ) w/outuser: [%s]', testindex, woutuser);

      })

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
  DocManager.reqres.setHandler("showcase:entity", function(id){
    return API.getEntity(id);
  });

  DocManager.reqres.setHandler("showcase:fetchby:user", function(user, evento){
    return API.fetchEntityByUser(user, evento);
  });

  DocManager.reqres.setHandler("showcase:factory:new", function(user, evento){
    if(user){
      return API.fetchEntityByUser(user, evento);
    }else{
      return API.newEntityFactory();
    }
  });

  DocManager.reqres.setHandler("showcase:partial:update", function(models, keys){
    return API.partialUpdate(models, keys);
  });

  DocManager.reqres.setHandler("showcase:check:users:data", function(){
    return API.checkUsersData();
  });

  DocManager.reqres.setHandler("showcase:query:entities", function(query, step){
    return API.getFilteredByQueryCol(query, step);
  });

});


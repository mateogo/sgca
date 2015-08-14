DocManager.module("Entities", function(Entities, DocManager, Backbone, Marionette, $, _){

  Entities.MicaInteraction = Backbone.Model.extend({
    urlRoot: "/micainteractions",
    whoami: 'MicaInteraction:micarondas.js ',
    idAttribute: "_id",

    initialize: function(opts){

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

    },

    changeNivelDeEjecucion: function(state){

    },

    initBeforeSave: function(){

    },
    update: function(cb){
      var self = this;
      self.initBeforeSave();
      self.save(null, {
          success: function (model) {
              if(cb) cb(model);
          },
          error: function () {
              if(cb) cb(false);
          }
      });
    },


    // isVendedor: function(){
    //   return this.get('vendedor').rolePlaying.vendedor;
    // },

    // isComprador: function(){
    //   return (this.get('comprador').rolePlaying.comprador && this.get('nivel_ejecucion') === 'comprador_aceptado';
    // },


    defaults: {
       _id: null,
      tregistro:'',
      evento:'mica',
      rubro:'rondas',

      //inscripcion
      cnumber:'',
      fealta: '',
      fecomp: '',
      slug: '',
      description: '',
      estado_alta:'activo',
      nivel_ejecucion: 'iniciado',

      /*** ===== CALIFICACIÓN MICA =======
      *  sujeto que solicita interacción con otro.
      *
      */
      iteracion: 0,
      fechaiteracion:'',
      estado_asignacion:'no_asignado', // rechazado, seleccionado, asignado, observado
      ronda_fecha: '',
      ronda_lugar: '',

      /*** ===== CALIFICACIÓN MICA =======
      *  estado de reunion
      *
      */
      meeting_id: '',
      meeting_estado: 'no_asignada', // ver models/micaagenda.js:MicaAgenda.STATUS_*
      meeting_number: -1, //-1: , 0: significa que se intengo agenda pero sin disponibilidad, 1-n: numero de reunion


      /*** ===== SOLICITANTE  EMISOR =======
      *  sujeto que solicita interacción con otro.
      *
      */
      emisor_rol: '',
      emisor_userid: '',
      emisor_inscriptionid: '',
      emisor_rname: '',
      emisor_rmail: '',
      emisor_displayName: '',
      emisor_actividad: '',
      emisor_slug: '',
      emisor_nivel_interes: '',
      emisor_hasread: 0,
      emisor_hasmessage: 0,


      /*** ===== SOLICITADO  RECEPTOR =======
      *  sujeto que recibe pedido de  interacción del solicitante.
      *
      */
      receptor_rol: '',
      receptor_userid: '',
      receptor_inscriptionid: '',
      receptor_rname: '',
      receptor_rmail: '',
      receptor_displayName: '',
      receptor_actividad: '',
      receptor_slug: '',
      receptor_answerdate: '',
      receptor_nivel_interes: '',
      receptor_hasread: 0,
      receptor_hasmessage: 0,
      receptor_hasanswer: 0,


      mensajes:[]
      /**
      * {fe; sender; receiver; slug; estado}
      *
      */




    },

    facetFactory: function (){
      var self = this;
      //self.stepOne = _facetFactoryStepOne(self);

    },

  });

  Entities.MicaInteractionCol = Backbone.Collection.extend({
    model: Entities.MicaInteraction,
    url: "/micainteractions"
  });

  Entities.MicaInteractionFindByQueryCol = Backbone.Collection.extend({
    whoami: 'MicaInteractionFindByQueryCol: micarondas.js',
    model: Entities.MicaInteraction,
    url: "/navegar/micainteractions",

    sortfield: 'peso',
    sortorder: 1,

    comparator: function(left, right) {
      var order = this.sortorder;
      var l = left.get('receptor_nivel_interes') * 2 + left.get('emisor_nivel_interes');
      var r = right.get('receptor_nivel_interes') * 2 + right.get('emisor_nivel_interes');

      if (l === void 0) return -1 * order;
      if (r === void 0) return 1 * order;

      return l < r ? (1*order) : l > r ? (-1*order) : 0;
    },




  });

  Entities.MicaInteractionPaginatedCol = Backbone.PageableCollection.extend({
    whoami: 'MicaInteractionPaginatedCol: micarondas.js',
    model: Entities.MicaInteraction,
    url: "/query/micainteractions",

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
      return {totalRecords: resp[0].total_entries};
    },

    parseRecords: function (resp, options ) {
      return resp[1];
    }

  });


  Entities.MicaInteractionFetchOneCol = Backbone.Collection.extend({
    whoami: 'MicaInteractionFetchOneCol: micarondas.js',
    model: Entities.MicaInteraction,
    url: "/micainteractions/fetch",

  });


  Entities.MicaInteractionUpdate = Backbone.Model.extend({
    whoami: 'Entities.MicaInteractionUpdate:micarondas.js ',

    urlRoot: "/actualizar/micainteractions",

  });

  var initAnswerInteraction = function(model, facet, user, myprofile, otherprofile){
    // model: nuevo entrada en la colección de interacciones
    // facet: FactoryFacet, modelo helper para el formulario de alta
    // myprofile: suscripción de mica, en cabeza de la cual queda establecido el pedido
    // user: ususario responsable
    // otherprofile: el perfil de la contraparte
    var fealta = new Date(),
        fecomp = utils.dateToStr(fealta),
        userid = user.id;

    model.set({
      emisor_hasread: 0,

      receptor_slug: facet.get('slug') || '(sin dato)',
      receptor_nivel_interes: facet.get('nivel_interes'),
      receptor_hasread: 1,
      receptor_hasanswer: 1,
      receptor_answerdate: fecomp,
    });

  };


  var initNewInteraction = function(model, facet, user, myprofile, otherprofile){
    // model: nuevo entrada en la colección de interacciones
    // facet: FactoryFacet, modelo helper para el formulario de alta
    // myprofile: suscripción de mica, en cabeza de la cual queda establecido el pedido
    // user: ususario responsable
    // otherprofile: el perfil de la contraparte
    var fealta = new Date(),
        fecomp = utils.dateToStr(fealta),
        userid = user.id,
        emisorRol = facet.get('rol'),
        receptorRol = (emisorRol === 'comprador' ? 'vendedor' : 'comprador'),
        emisorActividad,
        receptorActividad;

    if(emisorRol === 'comprador'){
      emisorActividad = myprofile.get('comprador').cactividades;
      receptorActividad = otherprofile.get('vendedor').vactividades;
    }else{
      emisorActividad = myprofile.get('vendedor').vactividades;
      receptorActividad = otherprofile.get('comprador').cactividades;
    }
    //console.dir(myprofile.attributes);

    model.set({
      tregistro: facet.get('tregistro'),
      evento: 'mica',
      rubro:'rondas',

      //inscripcion
      fealta: fealta,
      fecomp: fecomp,
      slug: facet.get('slug'),
      description: facet.get('description'),
      estado_alta:'activo',
      nivel_ejecucion: 'iniciado',


      /*** ===== SOLICITANTE  EMISOR ======= */
      emisor_rol: emisorRol,
      emisor_userid: userid,
      emisor_inscriptionid: myprofile.id,
      emisor_rname: myprofile.get('responsable').rname ,
      emisor_rmail: myprofile.get('responsable').rmail,
      emisor_displayName: myprofile.get('solicitante').edisplayName,
      emisor_actividad: emisorActividad,
      emisor_slug: facet.get('slug'),
      emisor_nivel_interes: facet.get('nivel_interes'),
      emisor_hasread: 1,



      /*** ===== SOLICITADO  RECEPTOR ======= */
      receptor_rol: receptorRol,
      receptor_userid: otherprofile.get('user').userid,
      receptor_inscriptionid: otherprofile.id,
      receptor_rname: otherprofile.get('responsable').rname,
      receptor_rmail: otherprofile.get('responsable').rmail,
      receptor_displayName: otherprofile.get('solicitante').edisplayName,
      receptor_actividad: receptorActividad,
      receptor_hasread: 0,
      receptor_hasanswer: 0,

    });

  };
  var updateInteraction = function(model, facet, user, myprofile, otherprofile){
    // model: nuevo entrada en la colección de interacciones
    // facet: FactoryFacet, modelo helper para el formulario de alta
    // myprofile: suscripción de mica, en cabeza de la cual queda establecido el pedido
    // user: ususario responsable
    // otherprofile: el perfil de la contraparte
    var fealta = new Date(),
        fecomp = utils.dateToStr(fealta),
        userid = user.id,
        emisorRol = facet.get('rol'),
        receptorRol = (emisorRol === 'comprador' ? 'vendedor' : 'comprador'),
        emisorActividad,
        receptorActividad;

    if(emisorRol === 'comprador'){
      emisorActividad = myprofile.get('comprador').cactividades;
      receptorActividad = otherprofile.get('vendedor').vactividades;
    }else{
      emisorActividad = myprofile.get('vendedor').vactividades;
      receptorActividad = otherprofile.get('comprador').cactividades;
    }

    model.set({
      //inscripcion
      fealta: fealta,
      fecomp: fecomp,
      slug: facet.get('slug'),
      description: facet.get('description'),


      /*** ===== SOLICITANTE  EMISOR ======= */
      emisor_rol: emisorRol,
      emisor_userid: userid,
      emisor_inscriptionid: myprofile.id,
      emisor_rname: myprofile.get('responsable').rname ,
      emisor_rmail: myprofile.get('responsable').rmail,
      emisor_displayName: myprofile.get('solicitante').edisplayName,
      emisor_actividad: emisorActividad,
      emisor_slug: facet.get('slug'),
      emisor_nivel_interes: facet.get('nivel_interes'),

    });

  };

  //*************************************************************
  //            INTERACTION interaction ANSWER answer FACET
  //*************************************************************
  Entities.MicaInteractionAnswerFacet = Backbone.Model.extend({
    whoami: 'Entities.MicaInteractionFactoryFacet:micarondas.js',
    initialize: function(opts){
      //this.schema.subsector.options = tdata.subSectorOL[this.get('sector')];

    },

    schema: {
        slug:        {type: 'Text',  title: 'Comentario', editorAttrs:{placeholder: 'Su mensaje a la contraparte'}},
        nivel_interes: {type: 'Radio',  title: 'Calificación', options:tdata.nivel_interesOL },

    },
    addRespuesta: function(user, myprofile, otherprofile, interaction){
      var self = this;
      initAnswerInteraction(interaction, self, user, myprofile, otherprofile);
      interaction.update();
    },



    defaults: {
      slug: '',
      description: '',

    },
  });

  //*************************************************************
  //            INTERACTION interaction FACTORY NEW new FACET
  //*************************************************************

  Entities.MicaInteractionFactoryFacet = Backbone.Model.extend({
    whoami: 'Entities.MicaInteractionFactoryFacet:micarondas.js',
    initialize: function(opts){
      //this.schema.subsector.options = tdata.subSectorOL[this.get('sector')];

    },

    schema: {
        rol: {type: 'Select',  title: 'Comprar/vender', options: tdata.rolesInteractionsOL},
        slug:        {type: 'Text',  title: 'Asunto', editorAttrs:{placeholder: 'Su mensaje a la contraparte'}, validators:['required']},
        description: {type: 'TextArea',  title: 'Descripción', },
        nivel_interes: {type: 'Radio',  title: 'Califique su interés en la concreción de esta reunión:', options:tdata.nivel_interesOL },

    },
    createNewInteraction: function(user, myprofile, otherprofile, interaction){
      var self = this;
      if(interaction.id){
        updateInteraction(interaction, self, user, myprofile, otherprofile);

      }else{
        initNewInteraction(interaction, self, user, myprofile, otherprofile);
      }

      interaction.update();
    },



    defaults: {
      tregistro:'solreunion',
      rol: 'no_definido',
      slug: '',
      description: '',

    },
  });




  //*************************************************************
  //            RANKING ranking Ranking FACET
  //*************************************************************
  Entities.MicaRanking = Backbone.Model.extend({
    urlRoot: "/micainteractions/ranking",
    whoami: 'MicaRanking:micarondas.js ',
    idAttribute: "_id",

    initialize: function(opts){

    },


    schema: {
    },



      // var idComprador = reunion.get('comprador')._id;
      // var idVendedor = reunion.get('vendedor')._id;

      // var query = {
      //   $or: [
      //     {'emisor_inscriptionid': idComprador,'receptor_inscriptionid': idVendedor},
      //     {'emisor_inscriptionid': idVendedor,'receptor_inscriptionid': idComprador}
      //   ]
      // };


    getFieldLabel: function(field){
      return _getFieldLabel(this, field);
    },

    validate: function(attrs, options) {
      var errors = {}

      if( ! _.isEmpty(errors)){
        return errors;
      }
    },

    meetingRol: function(){
      return this.get('iscomprador') ? 'comprador' : 'vendedor';
    },

    isVendedorLabel: function(){
      return this.get('isvendedor') ? 'Vendedor': '';
    },
    isCompradorLabel: function(){
      return this.get('iscomprador') ? 'Comprador': '';
    },
    rolLabel: function(){
      return this.isCompradorLabel() + ' ' + this.isVendedorLabel();
    },
    getActividadLabel: function(){
      return tdata.fetchLabel(tdata['sectorOL'], this.get('vactividades'));
    },
    buildCSubSectorList: function(){
      if(this.get('iscomprador')){
        var sub = this.get('csubact');
        var memo = '';
        var atmp = [];
        _.each(sub, function(item, key){
          if(item){
            atmp.push(key);
          }
        });
        return atmp.join('; ');
      }else{
        return '';
      }
    },
    buildVSubSectorList: function(){
      if(this.get('isvendedor')){
        var sub = this.get('vsubact');
        var memo = '';
        var atmp = [];
        _.each(sub, function(item, key){
          if(item){
            atmp.push(key);
          }
        });
        return atmp.join('; ');
      }else{
        return '';
      }
    },


    initBeforeSave: function(){

    },
    update: function(cb){

    },


    defaults: {
       _id: null,


      //inscripcion
      cnumber:'',
      profileid: '',
      userid: '',
      nivel_ejecucion: '',
      estado_alta: 'activo',

      // Profile
      isvendedor: false,
      iscomprador: false,
      vactividades: '',

      // interacciones
      emisor_requests: 0,
      receptor_requests: 0,
      peso: 10000,

      receptorlist:[],
      emisorlist:[],


      //responsable
      rname: '',


      //solicitante
      epais: '',
      eprov: '',


    },


  });

  Entities.MicaRankingNonPaginatedCol = Backbone.PageableCollection.extend({
    whoami: 'MicaRankingNonPaginatedCol: micarondas.js',
    model: Entities.MicaRanking,
    url: "/micainteractions/ranking",

    state:{
      firstPage: 1,
      pageSize: 500,
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




  Entities.MicaRankingPaginatedCol = Backbone.PageableCollection.extend({
    whoami: 'MicaRankingPaginatedCol: micarondas.js',
    model: Entities.MicaRanking,
    url: "/micainteractions/ranking",

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
    // sortfield: 'peso',
    // sortorder: 1,

    // comparator: function(left, right) {
    //   var order = this.sortorder;
    //   var l = left.get(this.sortfield);
    //   var r = right.get(this.sortfield);

    //   if (l === void 0) return -1 * order;
    //   if (r === void 0) return 1 * order;

    //   return l < r ? (1*order) : l > r ? (-1*order) : 0;
    // },

    parseState: function (resp, queryParams, state, options) {
      return {totalRecords: resp[0].total_entries};
    },

    parseRecords: function (resp, options ) {
      return resp[1];
    }


  });



  //*************************************************************
  //           Interaction Summary Resumen resumen summary
  //*************************************************************
  Entities.MicaInteractionSummary = Backbone.Model.extend({
    whoami: 'MicaInteractionSummary:micarondas.js ',
    idAttribute: "_id",

    initialize: function(opts){

    },
    fetchMeetingNumber: function(comprador, vendedor){
      var defer = $.Deferred();
      var self = this;

      var data = {
        comprador: comprador,
        vendedor: vendedor
      };
      //console.log('comprador: [%s]   vendedor: [%s]', comprador, vendedor);

      var p = $.ajax({
          type: 'post',
          url: '/micaagenda/actores',
          data: data,
          dataType: 'json',
          success: function(data){
            if(!data || data ==='no_encontrado'){
              return null;
            }else{
              //console.log('bingo! num:[%s]  e:[%s]', data.num_reunion, data.estado);
              //console.log('bingo!', data.num_reunion);
              self.set('meeting_number', data.num_reunion);
              self.set('meeting_estado', data.estado);
              //console.dir(data);
            }
          }
      });

      return p;


      // var query = {
      //   $or: [
      //     {'emisor_inscriptionid': idComprador,'receptor_inscriptionid': idVendedor},
      //     {'emisor_inscriptionid': idVendedor,'receptor_inscriptionid': idComprador}
      //   ]
      // };

    },
          // self.model.set('meeting_number', num);
          // self.model.set('meeting_estado', estado);



      // var idComprador = reunion.get('comprador')._id;
      // var idVendedor = reunion.get('vendedor')._id;

      // var query = {
      //   $or: [
      //     {'emisor_inscriptionid': idComprador,'receptor_inscriptionid': idVendedor},
      //     {'emisor_inscriptionid': idVendedor,'receptor_inscriptionid': idComprador}
      //   ]
      // };



    buildCSubSectorList: function(){
      if(this.get('iscomprador')){
        var sub = this.get('csubact');
        var memo = '';
        var atmp = [];
        _.each(sub, function(item, key){
          if(item){
            atmp.push(key);
          }
        });
        return atmp.join('; ');
      }else{
        return '';
      }
    },
    buildVSubSectorList: function(){
      if(this.get('isvendedor')){
        var sub = this.get('vsubact');
        var memo = '';
        var atmp = [];
        _.each(sub, function(item, key){
          if(item){
            atmp.push(key);
          }
        });
        return atmp.join('; ');
      }else{
        return '';
      }
    },



    schema: {
    },

    getFieldLabel: function(field){
      return _getFieldLabel(this, field);
    },

    defaults: {
       _id: null,


      //cierto profile
      profileid: '',
      cnumber:'',
      displayName: '',
      pais: '',
      prov: '',


      isvendedor: false,
      vactividades: '',
      vporfolios: 0,

      iscomprador: false,
      cactividades: '',
      cporfolios: 0,

      emisor_requests: 0,
      receptor_requests: 0,
      reu_agendadas: 0,
      peso: 0,

      array_index: 0,

      // en su relación con el profile bajo análisis
      as_emisor: 0,
      as_emisor_nie: 0,
      as_emisor_nir: 0,
      as_emisor_rol: '',
      as_emisor_slug: '',
      as_emisor_answer: '',


      // en su relación con el profile bajo análisis
      as_receptor: 0,
      as_receptor_nie: 0,
      as_receptor_nir: 0,
      as_receptor_rol: '',
      as_receptor_slug: '',
      as_receptor_answer: '',

    },

  });

  Entities.MicaInteractionSummaryCol = Backbone.PageableCollection.extend({
    whoami: 'MicaInteractionSummaryCol: micarondas.js',
    model: Entities.MicaInteractionSummary,

    sortfield: 'peso',
    sortorder: 1,


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


    comparator: function(left, right) {
      var order = this.sortorder;
      var l = left.get(this.sortfield);
      var r = right.get(this.sortfield);

      if (l === void 0) return -1 * order;
      if (r === void 0) return 1 * order;

      return l < r ? (1*order) : l > r ? (-1*order) : 0;
    },

  });



  //*************************************************************
  //            FILTER filter FACET
  //*************************************************************
  Entities.MicaInteractionFilterFacet = Backbone.Model.extend({
    whoami: 'Entities.MicaInteractionFilterFacet:micarondas.js',
    initialize: function(opts){
      this.schema.subsector.options = tdata.subSectorOL[this.get('sector')];

    },

    schema: {
        rolePlaying:   {type: 'Select',  title: 'Rol', options: tdata.rolesOL },
        sector:        {type: 'Select',  title: 'Sector', options: tdata.sectorOL },
        subsector:     {type: 'Select',  title: 'SubSector',  options: tdata.subSectorOL.aescenicas },
        cnumber:       {type: 'Text',    title: 'Número Inscripción' },
        textsearch:    {type: 'Text',    title: 'Búsqueda por texto' },
        provincia:     {type: 'Select',  title: 'Provincia',  options: tdata.provinciasOL },
        nivel_ejecucion: {type: 'Select',  title: 'Aprobación',  options: tdata.nivel_ejecucionOL },
        estado_alta:   {type: 'Select',  title: 'Estado',  options: tdata.estado_altaOL },
    },


    defaults: {
      rolePlaying: 'no_definido',
      provincia: 'no_definido',
      sector: 'no_definido',
      subsector: 'no_definido',
      cnumber: '',
      textsearch: '',

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
  Entities.MicaExportInteractionCol = Backbone.Collection.extend({
    whoami: 'Entities.MicaExportInteractionCol:micarondas.js ',
    url: "/micainteractions",
    model: Entities.MicaInteraction,
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

      exportFactory.processRequest(exportFactory.fetchCollection(self));

    },
  });

  var exportFactory = {
    exportHeadings: [
        {val:'cnumber',                         label:'NroIns',           itemType: 'Text'},
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


    //TODO
    var initialdata = {
      tregistro:'inscripcion',
      evento:'mica',
      edicionevento:'2015',
      rubro:'general',
      cnumber:'',
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



  //TODO
  var _facetFactoryStepOne = function(model){
    var data = _.extend({}, model.get('solicitante'));
    return new Entities.MicaStepOneFacet(data);
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

            if(test) return node;
          }
        }
    });
    return fd;
  };

  var queryCollection = function(query, step){
      var entities = new Entities.MicaInteractionFindByQueryCol();
      var defer = $.Deferred();
      //console.log('query Collection [%s]', entities.whoami);

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
      var request = new Entities.MicaInteraction({_id: entityId});
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
      var entities = new Entities.MicaInteractionFetchOneCol();
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
            defer.resolve(new Entities.MicaInteraction());
          }
        },
        error: function(data){
            defer.resolve(new Entities.MicaInteraction());
        }
      });
      return defer.promise();

    },

    newEntityFactory: function(){
      var request = new Entities.MicaInteraction();
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
      var update = new Entities.MicaInteractionUpdate(query);
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

    getActorList: function(model, rol){
      // rol = [emisor|receptor]
      var query = {},
          fetchingEntities,
          defer = $.Deferred();

      if(rol === 'emisor'){
        query['emisor_inscriptionid'] = model.get('profileid');
      }else{
        query['receptor_inscriptionid'] = model.get('profileid');

      }

      fetchingEntities = queryCollection(query, 'firstPage');


      $.when(fetchingEntities).done(function(entities){

        var filteredEntities = queryFactory(entities);

        if(query){
          filteredEntities.filter(query);
        }

        defer.resolve(filteredEntities);

      });
      return defer.promise();
    },


    fetchByProfile: function(userid, myprofile, otherprofile, mode){
      var query = {};

      // Mode: receptor / emisor
      if(mode === 'emisor'){
        query.emisor_userid = userid;
        query.receptor_inscriptionid = otherprofile.id;

      }else{
        query.receptor_userid = userid;
        query.emisor_inscriptionid = otherprofile.id;

      }

      var fetchingEntities = queryCollection(query, 'reset'),
          defer = $.Deferred();

      $.when(fetchingEntities).done(function(entities){

        //var filteredEntities = queryFactory(entities);

        // if(query){
        //   filteredEntities.filter(query);
        // }

        defer.resolve(entities);

      });
      return defer.promise();
    },

    addNewInteraction: function(facet, user, myprofile, otherprofile, interactionRecord){
      facet.createNewInteraction(user, myprofile, otherprofile, interactionRecord);

    },

    addAnswerInteraction: function(facet, user, myprofile, otherprofile, interactionRecord){
      facet.addRespuesta(user, myprofile, otherprofile, interactionRecord);

    },

    getLinkedListCol: function(query, step){
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
  DocManager.reqres.setHandler("micainteraction:entity", function(id){
    return API.getEntity(id);
  });

  DocManager.reqres.setHandler("micainteraction:queryby:otherprofile", function(userid, myprofile, otherprofile, mode){
    return API.fetchByProfile(userid, myprofile, otherprofile, mode);
  });


  DocManager.reqres.setHandler("micainteractions:new:interaction", function(facet, user, myprofile, otherprofile, interactionRecord){
    return API.addNewInteraction(facet, user, myprofile, otherprofile, interactionRecord);
  });

  DocManager.reqres.setHandler("micainteractions:drop:interaction", function(facet, user, myprofile, otherprofile, interactionRecord){
    //return API.addAnswerInteraction(facet, user, myprofile, otherprofile, interactionRecord);
  });

  DocManager.reqres.setHandler("micainteractions:answer:interaction", function(facet, user, myprofile, otherprofile, interactionRecord){
    return API.addAnswerInteraction(facet, user, myprofile, otherprofile, interactionRecord);
  });

  DocManager.reqres.setHandler("micainteractions:find:meeting", function(facet, user, myprofile, otherprofile, interactionRecord){
    return API.addAnswerInteraction(facet, user, myprofile, otherprofile, interactionRecord);
  });


  DocManager.reqres.setHandler("micainteraction:factory:new", function(user, evento){
    if(user){
      return API.fetchMicaByUser(user, evento);
    }else{
      return API.newEntityFactory();
    }
  });

  DocManager.reqres.setHandler("micainteractions:partial:update", function(models, keys){
    return API.partialUpdate(models, keys);
  });

  DocManager.reqres.setHandler("micainteractions:query:entities", function(query, step){
    return API.getFilteredByQueryCol(query, step);
  });

  DocManager.reqres.setHandler("micainteractions:query:linkedlist", function(query, step){
    return API.getLinkedListCol(query, step);
  });


  DocManager.reqres.setHandler("micainteractions:query:emisorlist", function(model){
    return API.getActorList(model, 'emisor');
  });

  DocManager.reqres.setHandler("micainteractions:query:receptorlist", function(model){
    return API.getActorList(model, 'receptor');
  });


});

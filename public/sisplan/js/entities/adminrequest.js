DocManager.module("Entities", function(Entities, DocManager, Backbone, Marionette, $, _){
  
  Entities.Adminrequest = Backbone.Model.extend({
    urlRoot: "/tramitaciones",
    whoami: 'Entities.Adminrequest:adminrequest.js ',

    idAttribute: "_id",

    schema: {
        slug:         {type: 'Text',      title: 'ASunto',                editorAttrs:{placeholder:'identificación del trámite'}},
        description:  {type: 'TextArea',  title: 'Descripción ejddecutiva del pedido'},
        trequest:     {type: 'Select',    title: 'Tipo de requerimiento', editorAttrs:{placeholder:'Tipo de requerimiento'},options: utils.tipoBudgetMovimList },
        freq:         {type: 'Number',    title: 'Frecuencia',            editorAttrs:{placeholder:'en unidades'}},
        umefreq:      {type: 'Select',    title: 'Unidad de frecuencia',  editorAttrs:{placeholder:'unidad de frecuencia'},options: utils.umeFreqList },
        cantidad:     {type: 'Number',    title: 'Cantidad',              editorAttrs:{placeholder:'en unidades'}},
        ume:          {type: 'Select',    title: 'Unidad de medida',      editorAttrs:{placeholder:'unidad de medida'},options: utils.umeList },
        fenecesidad:  {type: 'DatePicker', title: 'Fecha necesidad',       editorAttrs:{placeholder:'dd/mm/aaaa'}},
        importe:      {type: 'Number',    title: 'Costo de referencia',   editorAttrs:{placeholder:'en unidades'}},
        cudap:        {type: 'Text',      title: 'CUDAP tramitación',     editorAttrs:{placeholder:'solicitud de trámite o expediente'}},
        cgasto:       {type: 'Text',      title: 'Código de Gasto',       editorAttrs:{placeholder:'Cuenta - gasto'}},
        presuprog:    {type: 'Text',      title: 'Fuente financiera',     editorAttrs:{placeholder:'Programa presupuestario + actividad'}},
        presuinciso:  {type: 'Text',      title: 'Inciso / actividad',    editorAttrs:{placeholder:'Objeto del gasto - valor por omisión'}},
        estado_alta:  {type: 'Select',      title: 'Estado de Alta',        editorAttrs:{placeholder:'estado de alta'},    options: utils.estadoAltaStramiteOpLst },
        nivel_ejecucion: {type: 'Select',   title: 'Nivel de ejecución',    editorAttrs:{placeholder:'nivel de ejecución'},options: utils.nivelEjecucionStramiteOpLst },
        nivel_importancia: {type: 'Select', title: 'Nivel de importancia',  editorAttrs:{placeholder:'nivel de importancia'},options: utils.nivelimportanciaOptionList },

    },

    getFieldLabel: function(field){
      if(!(field in this.schema)) return this.get(field) || '';
      
      if(this.schema[field].type === 'Select'){
        var value = this.get(field);
        if(value === 'no_definido' || value === "nodefinido") return '';
        
        var options = this.schema[field].options;
        var selected = _.findWhere(options,{val:value});
        return (selected)? selected.label : value;
      }else{
        return this.get(field);
      }
    },


    defaults: {
      _id: null,

      // datos basicos
      cnumber: '',
      slug: '',
      description: '',
      fenecesidad: '',
      trequest: '',
      tipomov: "solicitud",
      cudap: '',

      // datos heredados de Action
      action_id: "",
      action_cnumber: '',
      action_area: '',

      // datos heredados de Budget
      budget_id: "",
      budget_cnumber: '',
      cgasto: "111.111",

      // cantidad importes
      importe: "0",
      isactive: "1",
      freq: "1",
      umefreq: "global",
      cantidad: "1",
      ume: "global",
      punit: "0",
      costodetallado: 0,
      coldh: "0",
      presuprog: "",
      presuinciso: "",
 
      nivel_ejecucion: "enevaluacion",
      estado_alta: "activo",
      nivel_importancia: "medio",
      useralta: "",
      fealta: "",
      feultmod: "",
      
      itemheader:{
        objeto: '',
        justif: '',
        freq: '',
        umefreq: '',
        cantidad: '',
        fedesde: '',
        fehasta: '',
      },

      items:[],
    },

    itemListFactory: function(){
      var self = this,
          items = self.get('items');

      //console.log('itemsFactory: [%s]',items.length);

      // Polimorphic Request
      if(utils.fetchAdminRequestTemplate(self.get('trequest')) === 'contratos') {
        return new Entities.AdmRqstContratosCol(items);

      } else if(utils.fetchAdminRequestTemplate(self.get('trequest')) === 'pasajes') {
        return new Entities.AdmRqstPasajesCol(items);

      } else {
        return new Entities.AdmRqstComprasCol(items);

      }

    },

    itemHeaderFactory: function(action){
      var self = this,
          itemHeader = self.get('itemheader');
      
      itemHeader.presuprog = self.get('presuprog');
      itemHeader.presuinciso = self.get('presuinciso');
      itemHeader.objeto = self.get('description');

        //console.log('itemHeaderFactory: [%s]: [%s]',self.get('trequest'), utils.fetchListKey(utils.tipoBudgetMovimList, self.get('trequest'))['template'])
        //console.log('itemHeaderFactory: ACTION:[%s] [%s] [%s] [%s]', action.whoami, action.get('slug'), action.participants.length, action.participants.at(0).whoami);
        //console.log('itemHeader: [%s]: [%s]', itemHeader.personas.length, itemHeader.personas[0])
  
      // Polimorphic Request
      if(utils.fetchAdminRequestTemplate(self.get('trequest')) === 'contratos') {

        itemHeader.personas = action.participants.map(function (person){
          return person.get('displayName');
        });
        return new Entities.AdmRqstContratosHeader(itemHeader);
 

      } else if(utils.fetchAdminRequestTemplate(self.get('trequest')) === 'pasajes') {
        //console.log('itemHeaderFactory: ACTION:[%s] [%s] [%s] [%s]', action.whoami, action.get('slug'), action.participants.length, action.participants.at(0).whoami);

        itemHeader.personas = action.participants.map(function (person){
          return person.get('displayName');
        });
        return new Entities.AdmRqstPasajesHeader(itemHeader);


      } else {
        //console.log('itemHeaderFactory: ACTION:[%s] [%s] [%s] [%s]', action.whoami, action.get('slug'), action.participants.length, action.participants.at(0).whoami);
        itemHeader.personas = action.participants.map(function (person){
          return person.get('displayName');
        });
        return new Entities.AdmRqstComprasHeader(itemHeader);
      }

    },

    itemListGenerateItems: function(facet){
      var self = this,
          items = self.get('items'),
          renglones,
          personlist,
          itemsCol,
          beneficiario,
          newitem;

      // Polimorphic Request
      if(utils.fetchAdminRequestTemplate(self.get('trequest')) === 'contratos') {
        itemsCol = new Entities.AdmRqstContratosCol(items);
        renglones = facet.get('cantidad');
        personlist = facet.get('personas');
        for (var i = renglones - 1; i >= 0; i--) {
          if (i > personlist.length) {
            beneficiario = 'a definir';
          } else{
            beneficiario = personlist[i];
          };
          newitem = new Entities.AdmRqstContratosItem({
            slug: 'Contrato locación de obra',
            description: facet.get('objeto'),
            justif: facet.get('justif'),
            freq: facet.get('freq'),
            umefreq: facet.get('umefreq'),
            cantidad: 1,
            ume: facet.get('ume'),
            punit: facet.get('punit'),
            fedesde: facet.get('fedesde'),
            fehasta: facet.get('fehasta'),
            person: beneficiario,
            presuprog: facet.get('presuprog'),
            presuinciso: facet.get('presuinciso'),
          })
          itemsCol.add(newitem);
        }

      } else if(utils.fetchAdminRequestTemplate(self.get('trequest')) === 'pasajes') {
        itemsCol = new Entities.AdmRqstPasajesCol(items);
        renglones = facet.get('cantidad');
        personlist = facet.get('personas');
        for (var i = renglones - 1; i >= 0; i--) {
          if (i > personlist.length) {
            beneficiario = 'a definir';
          } else{
            beneficiario = personlist[i];
          };
          newitem = new Entities.AdmRqstContratosItem({
            slug: facet.get('objeto'),
            description: facet.get('objeto'),
            justif: facet.get('justif'),
            freq: facet.get('freq'),
            umefreq: facet.get('umefreq'),
            cantidad: 1,
            ume: facet.get('ume'),
            punit: facet.get('punit'),
            fedesde: facet.get('fedesde'),
            fehasta: facet.get('fehasta'),
            person: beneficiario,
            presuprog: self.get('presuprog'),
            presuinciso: self.get('presuinciso'),
          })
          itemsCol.add(newitem);

        }

      } else {
        itemsCol = new Entities.AdmRqstComprasCol(items);
        renglones = facet.get('freq');
        personlist = facet.get('personas');
        for (var i = renglones - 1; i >= 0; i--) {
          if (i > personlist.length) {
            beneficiario = 'a definir';
          } else{
            beneficiario = personlist[i];
          };
          newitem = new Entities.AdmRqstContratosItem({
            slug: facet.get('objeto'),
            description: facet.get('objeto'),
            justif: facet.get('justif'),
            freq: facet.get('freq'),
            umefreq: facet.get('umefreq'),
            cantidad: 1,
            ume: facet.get('ume'),
            punit: facet.get('punit'),
            fedesde: facet.get('fedesde'),
            fehasta: facet.get('fehasta'),
            person: beneficiario,
            presuprog: self.get('presuprog'),
            presuinciso: self.get('presuinciso'),
          })
          itemsCol.add(newitem);

        }


      }
      self.set('items', itemsCol.toJSON());
      return itemsCol;
    },

    getItems: function(){
      var self = this,
          items = self.get('items'),
          itemsCol;

      // Polimorphic Request
      if(utils.fetchAdminRequestTemplate(self.get('trequest')) === 'contratos') {
        itemsCol = new Entities.AdmRqstContratosCol(items);

      } else if(utils.fetchAdminRequestTemplate(self.get('trequest')) === 'pasajes') {
        itemsCol = new Entities.AdmRqstPasajesCol(items);

      } else {
        itemsCol = new Entities.AdmRqstComprasCol(items);

      }
      return itemsCol;
    },

    evaluateCost: function(){
      return evaluateRequestCost(this);
    },

    enabled_predicates:['es_relacion_de'],

    updateInheritData: function(action, budget){
      var self = this;
      self.set({
        // datos heredados de Action
        action_id: action.id,
        action_cnumber: action.get('cnumber'),
        action_area: action.get('area'),

        // datos heredados de Budget
        budget_id: budget.id,
        budget_cnumber: budget.get('cnumber'),

      });
    },

    updateCurrentUsertData: function(user){
      var self = this,
          person,
          related;

      if(!self.get('useralta' || !self.id)){
        self.set('useralta', user.id);
      }
      self.set('userultmod', user.id);

      related = user.get('es_usuario_de');
      if(related){
        person = related[0];
        if(person){
          self.set({persona: person.code,personaid: person.id })
        }
      } 

    },
    
    initBeforeCreate: function(action, budget, user){
      var self = this,
          fealta = new Date(),
          fecomp = utils.dateToStr(fealta);

      self.set({fealta:fealta.getTime(), fecomp: fecomp});
      //console.log('InitBeforeCreate!!!!!!!!!!!!!!!!!!!!! [%s][%s]', self.get('gasto'),self.get('slug'));
      self.updateInheritData(action, budget);
      self.updateCurrentUsertData(user); 
    },

    beforeSave: function(){
      var self = this,
          fecha = new Date(),
          fecomp;

      if(!self.id || !self.get('fealta')){
        self.set({
          fealta: fecha.getTime(),
          fecomp: utils.dateToStr(fecha)
        });
      }
      self.set({feultmod:fecha.getTime()});
      
      console.log('BeforeSave: trequest:[%s] cgasto:[%s] ',self.get('trequest'), self.get('cgasto'));
      console.log('utils: [%s]',utils.fetchListKey(utils.tipoBudgetMovimList, self.get('trequest')))

      self.set('cgasto', utils.fetchListKey(utils.tipoBudgetMovimList, self.get('trequest'))['cgasto'] );

    },
    
    
    update: function(action, budget, user, cb){
      console.log('[%s] UPDATE MODEL owner:[%s]',this.whoami, action.get('slug'));
      var self = this,
          errors;
 
      self.beforeSave();
      self.updateInheritData(action, budget);
      self.updateCurrentUsertData(user);
 
      console.log('ready to SAVE');
      console.dir(self.attributes);

      if(!self.save(null,{
        success: function(model){
          //console.log('callback SUCCESS')
          
          // log Activity
          //logActivity(model);
          // log Activity

          //Change Product State
          //changeProductState(model);
          //Change Product State

          cb(null,model);

         }
        })) {

        cb(self.validationError,null);
      }
    },

    updateBasicData: function(user, cb){
      console.log('[%s] UPDATE BASIC DATA:[%s]',this.whoami, this.get('slug'));
      var self = this,
          errors;
 
      self.beforeSave();
      self.updateCurrentUsertData(user);

      if(!self.save(null, {
        success: function(model){
          cb(null,model);
         }
        })) 
      {
        cb(self.validationError,null);
      }
    },

    updateItemHeader: function(user, facet, cb){
      console.log('[%s] UPDATE BASIC DATA:[%s]',this.whoami, this.get('slug'));
      var self = this,
          facetattrs = facet.attributes,

          facetData = {
            itemheader: facetattrs
          },
          errors;


      self.partialUpdate('content', facetData);
      self.set('itemheader', facetattrs);
    },

    updateItemData: function(col, model, costo){
      console.log('[%s] UPDATE ITEM DATA:[%s]',model.whoami,  model.get('slug'));
      var self = this,
          itemcol = col.toJSON(),

          facetData = {
            costodetallado: costo,
            items: itemcol
          },
          errors;


      self.partialUpdate('content', facetData);
      self.set('items', itemcol);
    },

    partialUpdate: function(token, facet, list){
      //facet: es un model o un hash de claves
      //token: 'content': toma las keys directamente de facet
      //       'estado_alta': solo actualiza esta key en base a facet
      // list: opcional. Un array con la lista de _id de registros a actualizar.
      //
      var self = this;
      var query = {};

      if(list){
        query.nodes = list;
      }else{
        query.nodes = [self.id];
      }

      query.newdata = {};

      if(token==='content'){
        query.newdata = facet;

      }else if(token ==='estado_alta'){
        query.newdata['estado_alta'] = facet;

      }else{
        // no se qué hacer... mejor me voy
        return;
      }

  
      //console.log('partial UPDATE: [%s] [%s]', token, facet);
      var update = new Entities.AdminrequestUpdate(query);
      update.save({
        success: function() {
        }
      });
      //log ACTIVITY
      //logActivity(token, self, data);
      //
    },

    validate: function(attrs, options) {
      //if(!attrs) return;
      var errors = {}
      //console.log('validate [%s] [%s] [%s]',attrs, _.has(attrs,'trequest'), attrs.trequest);

      if (_.has(attrs,'trequest') && (!attrs.trequest|| attrs.trequest.length==0)) {
        errors.trequest = "No puede ser nulo";
      }
      if (_.has(attrs,'slug') && ! attrs.slug) {
        errors.slug = "No puede ser nulo";
      }
      if (_.has(attrs,'fecomp')){
        var fecomp_tc = utils.buildDateNum(attrs['fecomp']);
        if(Math.abs(fecomp_tc-(new Date().getTime()))>(1000*60*60*24*30*6) ){
          //errors.fecomp = 'fecha no valida';
        }
        this.set('fecomp_tc',fecomp_tc);
      }

      if( ! _.isEmpty(errors)){
        return errors;
      }
    },

    insertItemCollection: function(itemCol) {
        var self = this;
        self.set({items: itemCol.toJSON()});
    },

    initNewItem: function(item){
      var self = this;
      var itemModel = self.itemTypes[item.get('tipoitem')].initNew(self, item.attributes);
      return itemModel;
    },

    fetchEditFacet: function(){
      return new Entities.AdminrequestCoreFacet(this.attributes,{formType:'long'});
    },

    saveFromPlanningFacet: function(){

    },
  });

/** 
 *  ===============================================
 *          Adminrequest CONTRATOS
 *  ===============================================
*/

  Entities.AdmRqstContratosHeader = Backbone.Model.extend({
    whoami: 'Entities.AdmRqstContratosHeader:adminrequest.js ',

    idAttribute: "_id",

    schema: {
        objeto:   {type: 'TextArea',   title: 'Objeto de la contratación'},
        justif:   {type: 'TextArea',   title: 'Justificación de la Necesidad'},
        freq:     {type: 'Number',     title: 'Plazo',            editorAttrs:{placeholder:'en meses'}},
        umefreq:  {type: 'Select',     title: 'Unidad de tiempo',  editorAttrs:{placeholder:'unidad de tiempo'},options: utils.umeFreqList },
        cantidad: {type: 'Number',     title: 'Cantidad de contratos',  editorAttrs:{placeholder:'en unidades'}},
        ume:      {type: 'Select',     title: 'Unidad de medida',  editorAttrs:{placeholder:'unidad de contrato'},options: utils.umeList },
        punit:    {type: 'Number',     title: 'Importe cuota',  editorAttrs:{placeholder:'importe de cada factura'}},
        fedesde:  {type: 'DatePicker', title: 'Fecha desde',       editorAttrs:{placeholder:'dd/mm/aaaa'}},
        fehasta:  {type: 'DatePicker', title: 'Fecha hasta',       editorAttrs:{placeholder:'dd/mm/aaaa'}},
        presuprog:   {type: 'Text',    title: 'Fuente financiera',     editorAttrs:{placeholder:'Programa presupuestario + actividad'}},
        presuinciso: {type: 'Text',    title: 'Inciso / actividad',    editorAttrs:{placeholder:'Objeto del gasto - valor por omisión'}},
        personas: {type: 'List',       title: 'Beneficiarios',    itemType: 'Text'}    
    },

    getFieldLabel: function(field){
      if(!(field in this.schema)) return '';
      
      if(this.schema[field].type === 'Select'){
        var value = this.get(field);
        if(value === 'no_definido' || value === "nodefinido") return '';
        
        var options = this.schema[field].options;
        var selected = _.findWhere(options,{val:value});
        return (selected)? selected.label : value;
      }else{
        return this.get(field);
      }
    },

    defaults: {
      objeto: '',
      justif: '',
      freq: '1',
      umefreq: 'mes',
      cantidad: '1',
      ume: 'contrato',
      importe: 0,
      fedesde: '',
      fehasta: '',
      presuprog: '',
      presuinciso: '',
      personas: [],
    },
  });
/** 
 *  ===============================================
 *          Adminrequest ITEM - CONTRATOS
 *  ===============================================
*/
  Entities.AdmRqstContratosItem = Backbone.Model.extend({
    whoami: 'Entities.AdmRqstContratosItem:adminrequest.js ',

    idAttribute: "_id",

    schema: {
        person:   {type: 'Text',       title: 'Beneficiario'},
        slug:   {type: 'Text',       title: 'Asunto'},
        description: {type: 'TextArea',   title: 'Objeto contrato'},
        justif:   {type: 'TextArea',   title: 'Justificación de la Necesidad'},
        freq:     {type: 'Number',     title: 'Plazo',            editorAttrs:{placeholder:'en meses'}},
        umefreq:  {type: 'Select',     title: 'Unidad',  editorAttrs:{placeholder:'unidad de tiempo'},options: utils.umeFreqList },
        cantidad: {type: 'Number',     title: 'Contratos',  editorAttrs:{placeholder:'en unidades'}},
        ume:      {type: 'Select',     title: 'Unidad',  editorAttrs:{placeholder:'unidad de contrato'},options: utils.umeList },
        punit:    {type: 'Number',     title: 'Costo/ honorario',  editorAttrs:{placeholder:'valor factura unitaria'}},

        fedesde:  {type: 'DatePicker', title: 'Fecha desde',       editorAttrs:{placeholder:'dd/mm/aaaa'}},
        fehasta:  {type: 'DatePicker', title: 'Fecha hasta',       editorAttrs:{placeholder:'dd/mm/aaaa'}},
        estado_alta:     {type: 'Select',   title: 'Estado de Alta',        editorAttrs:{placeholder:'estado de alta'},    options: utils.estadoAltaStramiteOpLst },
        nivel_ejecucion: {type: 'Select',   title: 'Nivel de ejecución',    editorAttrs:{placeholder:'nivel de ejecución'},options: utils.nivelEjecucionStramiteOpLst },
        presuprog:   {type: 'Text',    title: 'Fuente financiera',     editorAttrs:{placeholder:'Programa presupuestario + actividad'}},
        presuinciso: {type: 'Text',    title: 'Inciso / actividad',    editorAttrs:{placeholder:'Objeto del gasto'}},
    },

    getFieldLabel: function(field){
      if(!(field in this.schema)) return '';
      
      if(this.schema[field].type === 'Select'){
        var value = this.get(field);
        if(value === 'no_definido' || value === "nodefinido") return '';
        
        var options = this.schema[field].options;
        var selected = _.findWhere(options,{val:value});
        return (selected)? selected.label : value;
      }else{
        return this.get(field);
      }
    },

    updateCost: function(){
      //console.log('EvaluateCosto CABECERA BEGIN');
      var previouscost = parseInt(this.get('importe'));
      var isactive = parseInt(this.get('isactive')) === 1 ? 1 : 0;
      var isvalid = this.get('estado_alta') === 'activo' ? 1 : 0;
      var freq = parseInt(this.get('freq'));
      var cantidad = parseInt(this.get('cantidad'));
      var punit = parseInt(this.get('punit'));

      var importe = (isvalid * isactive  * freq * cantidad * punit);
      this.set('importe', importe);
    },

    defaults: {
      slug: '',
      description: '',
      justif: '',
      freq: 1,
      umefreq: 'mes',
      cantidad: 1,
      ume: 'contrato',
      punit: 0,
      importe: 0,
      fedesde: '',
      fehasta: '',
      person: '',
      presuprog: '',
      presuinciso: '',
      nivel_ejecucion: "enevaluacion",
      estado_alta: "activo",
      isactive: "1",
    },
  });

  Entities.AdmRqstContratosCol = Backbone.Collection.extend({
    whoami: 'Entities.AdmRqstContratosCol:adminrequest.js ',
    //url: "/navegar/tramitaciones",
    model: Entities.AdmRqstContratosItem,
    sortfield: 'person',
    sortorder: -1,

    comparator: function(left, right) {
      var order = this.sortorder;
      var l = left.get(this.sortfield);
      var r = right.get(this.sortfield);

      if (l === void 0) return -1 * order;
      if (r === void 0) return 1 * order;

      return l < r ? (1*order) : l > r ? (-1*order) : 0;
    },

  });



/** 
 *  ===============================================
 *          Adminrequest PASAJES
 *  ===============================================
*/
  Entities.AdmRqstPasajesHeader = Backbone.Model.extend({
    whoami: 'Entities.AdmRqstPasajesHeader:adminrequest.js ',

    idAttribute: "_id",

    schema: {
        objeto:   {type: 'TextArea',   title: 'Objeto del viaje'},
        justif:   {type: 'TextArea',   title: 'Justificación de la Necesidad'},
        freq:     {type: 'Number',     title: 'Tramos',            editorAttrs:{placeholder:'en unidades'}},
        umefreq:  {type: 'Select',     title: 'Unidad',  editorAttrs:{placeholder:'tramo'},options: utils.umeFreqList },
        cantidad: {type: 'Number',     title: 'Cantidad de pasajess',  editorAttrs:{placeholder:'en unidades'}},
        ume:      {type: 'Select',     title: 'Unidad de medida',  editorAttrs:{placeholder:'unidad de pasajes'},options: utils.umeList },
        punit:    {type: 'Number',     title: 'Importe tramo',  editorAttrs:{placeholder:'importe de cada tramo'}},
        fedesde:  {type: 'DatePicker', title: 'Fecha Salida',       editorAttrs:{placeholder:'dd/mm/aaaa'}},
        fehasta:  {type: 'DatePicker', title: 'Fecha Regreso',       editorAttrs:{placeholder:'dd/mm/aaaa'}},
        presuprog:   {type: 'Text',    title: 'Fuente financiera',     editorAttrs:{placeholder:'Programa presupuestario + actividad'}},
        presuinciso: {type: 'Text',    title: 'Inciso / actividad',    editorAttrs:{placeholder:'Objeto del gasto - valor por omisión'}},
        personas: {type: 'List',       title: 'Pasajeros',    itemType: 'Text'}
    },

    getFieldLabel: function(field){
      if(!(field in this.schema)) return '';
      
      if(this.schema[field].type === 'Select'){
        var value = this.get(field);
        if(value === 'no_definido' || value === "nodefinido") return '';
        
        var options = this.schema[field].options;
        var selected = _.findWhere(options,{val:value});
        return (selected)? selected.label : value;
      }else{
        return this.get(field);
      }
    },

    defaults: {
      objeto: '',
      justif: '',
      freq: '1',
      umefreq: 'mes',
      cantidad: '1',
      ume: 'pasaje',
      importe: 0,
      fedesde: '',
      fehasta: '',
      presuprog: '',
      presuinciso: '',
      personas: [],
    },
  });
/** 
 *  ===============================================
 *          Adminrequest ITEM - PASAJES
 *  ===============================================
*/
  Entities.AdmRqstPasajesItem = Backbone.Model.extend({
    whoami: 'Entities.AdmRqstPasajesItem:adminrequest.js ',

    idAttribute: "_id",

    schema: {
        person:   {type: 'Text',       title: 'Pasajero'},
        slug:     {type: 'Text',       title: 'Tramos viaje'},
        description: {type: 'TextArea',   title: 'Observaciones viaje'},
        justif:   {type: 'TextArea',   title: 'Justificación de la Necesidad'},
        freq:     {type: 'Number',     title: 'Tramos',            editorAttrs:{placeholder:'en tramos'}},
        umefreq:  {type: 'Select',     title: 'Unidad',  editorAttrs:{placeholder:'tramos'},options: utils.umeFreqList },
        cantidad: {type: 'Number',     title: 'Pasajes',  editorAttrs:{placeholder:'en unidades'}},
        ume:      {type: 'Select',     title: 'Unidad',  editorAttrs:{placeholder:'unidad de pasajes'},options: utils.umeList },
        punit:    {type: 'Number',     title: 'Costo tramo',  editorAttrs:{placeholder:'costo pasaje'}},

        fedesde:  {type: 'DatePicker', title: 'Fecha desde',       editorAttrs:{placeholder:'dd/mm/aaaa'}},
        fehasta:  {type: 'DatePicker', title: 'Fecha hasta',       editorAttrs:{placeholder:'dd/mm/aaaa'}},
        estado_alta:     {type: 'Select',   title: 'Estado de Alta',        editorAttrs:{placeholder:'estado de alta'},    options: utils.estadoAltaStramiteOpLst },
        nivel_ejecucion: {type: 'Select',   title: 'Nivel de ejecución',    editorAttrs:{placeholder:'nivel de ejecución'},options: utils.nivelEjecucionStramiteOpLst },
        presuprog:   {type: 'Text',    title: 'Fuente financiera',     editorAttrs:{placeholder:'Programa presupuestario + actividad'}},
        presuinciso: {type: 'Text',    title: 'Inciso / actividad',    editorAttrs:{placeholder:'Objeto del gasto'}},
    },

    getFieldLabel: function(field){
      if(!(field in this.schema)) return '';
      
      if(this.schema[field].type === 'Select'){
        var value = this.get(field);
        if(value === 'no_definido' || value === "nodefinido") return '';
        
        var options = this.schema[field].options;
        var selected = _.findWhere(options,{val:value});
        return (selected)? selected.label : value;
      }else{
        return this.get(field);
      }
    },

    updateCost: function(){
      //console.log('EvaluateCosto CABECERA BEGIN');
      var previouscost = parseInt(this.get('importe'));
      var isactive = parseInt(this.get('isactive')) === 1 ? 1 : 0;
      var isvalid = this.get('estado_alta') === 'activo' ? 1 : 0;
      var freq = parseInt(this.get('freq'));
      var cantidad = parseInt(this.get('cantidad'));
      var punit = parseInt(this.get('punit'));

      var importe = (isvalid * isactive  * freq * cantidad * punit);
      this.set('importe', importe);
    },

    defaults: {
      slug: '',
      description: '',
      justif: '',
      freq: 1,
      umefreq: 'tramo',
      cantidad: 1,
      ume: 'pasaje',
      punit: 0,
      importe: 0,
      fedesde: '',
      fehasta: '',
      person: '',
      presuprog: '',
      presuinciso: '',
      nivel_ejecucion: "enevaluacion",
      estado_alta: "activo",
      isactive: "1",
    },
  });

  Entities.AdmRqstPasajesCol = Backbone.Collection.extend({
    whoami: 'Entities.AdmRqstPasajesCol:adminrequest.js ',
    //url: "/navegar/tramitaciones",
    model: Entities.AdmRqstPasajesItem,
    sortfield: 'person',
    sortorder: -1,

    comparator: function(left, right) {
      var order = this.sortorder;
      var l = left.get(this.sortfield);
      var r = right.get(this.sortfield);

      if (l === void 0) return -1 * order;
      if (r === void 0) return 1 * order;

      return l < r ? (1*order) : l > r ? (-1*order) : 0;
    },

  });

/** 
 *  ===============================================
 *          Adminrequest COMPRAS
 *  ===============================================
*/
  Entities.AdmRqstComprasHeader = Backbone.Model.extend({
    whoami: 'Entities.AdmRqstComprasHeader:adminrequest.js ',

    idAttribute: "_id",

    schema: {
        objeto:   {type: 'TextArea',   title: 'Objeto del viaje'},
        justif:   {type: 'TextArea',   title: 'Justificación de la Necesidad'},
        freq:     {type: 'Number',     title: 'Ítems',            editorAttrs:{placeholder:'ítems a comprar'}},
        umefreq:  {type: 'Select',     title: 'Unidad',  editorAttrs:{placeholder:'tramo'},options: utils.umeFreqList },
        cantidad: {type: 'Number',     title: 'Cantidad de compras',  editorAttrs:{placeholder:'en unidades'}},
        ume:      {type: 'Select',     title: 'Unidad de medida',  editorAttrs:{placeholder:'unidad de compras'},options: utils.umeList },
        punit:    {type: 'Number',     title: 'Importe tramo',  editorAttrs:{placeholder:'importe'}},
        fedesde:  {type: 'DatePicker', title: 'Fecha lím compra',        editorAttrs:{placeholder:'dd/mm/aaaa'}},
        fehasta:  {type: 'DatePicker', title: 'Fecha lím entrega',       editorAttrs:{placeholder:'dd/mm/aaaa'}},
        presuprog:   {type: 'Text',    title: 'Fuente financiera',     editorAttrs:{placeholder:'Programa presupuestario + actividad'}},
        presuinciso: {type: 'Text',    title: 'Inciso / actividad',    editorAttrs:{placeholder:'Objeto del gasto - valor por omisión'}},
        personas: {type: 'List',       title: 'Proveedores sugeridos',    itemType: 'Text'},
        productos: {type: 'List',      title: 'Productos',    itemType: 'Text'}
    },

    getFieldLabel: function(field){
      if(!(field in this.schema)) return '';
      
      if(this.schema[field].type === 'Select'){
        var value = this.get(field);
        if(value === 'no_definido' || value === "nodefinido") return '';
        
        var options = this.schema[field].options;
        var selected = _.findWhere(options,{val:value});
        return (selected)? selected.label : value;
      }else{
        return this.get(field);
      }
    },

    defaults: {
      objeto: '',
      justif: '',
      freq: '1',
      umefreq: 'item',
      cantidad: '1',
      ume: 'unidad',
      importe: 0,
      fedesde: '',
      fehasta: '',
      presuprog: '',
      presuinciso: '',
      personas: [],
    },
  });
/** 
 *  ===============================================
 *          Adminrequest ITEM - COMPRAS
 *  ===============================================
*/
  Entities.AdmRqstComprasItem = Backbone.Model.extend({
    whoami: 'Entities.AdmRqstComprasItem:adminrequest.js ',

    idAttribute: "_id",

    schema: {
        person:   {type: 'Text',       title: 'Compraro'},
        slug:     {type: 'Text',       title: 'Tramos viaje'},
        description: {type: 'TextArea',   title: 'Observaciones viaje'},
        justif:   {type: 'TextArea',   title: 'Justificación de la Necesidad'},
        freq:     {type: 'Number',     title: 'Tramos',            editorAttrs:{placeholder:'en tramos'}},
        umefreq:  {type: 'Select',     title: 'Unidad',  editorAttrs:{placeholder:'tramos'},options: utils.umeFreqList },
        cantidad: {type: 'Number',     title: 'Compras',  editorAttrs:{placeholder:'en unidades'}},
        ume:      {type: 'Select',     title: 'Unidad',  editorAttrs:{placeholder:'unidad de compras'},options: utils.umeList },
        punit:    {type: 'Number',     title: 'Costo tramo',  editorAttrs:{placeholder:'costo compra'}},

        fedesde:  {type: 'DatePicker', title: 'Fecha desde',       editorAttrs:{placeholder:'dd/mm/aaaa'}},
        fehasta:  {type: 'DatePicker', title: 'Fecha hasta',       editorAttrs:{placeholder:'dd/mm/aaaa'}},
        estado_alta:     {type: 'Select',   title: 'Estado de Alta',        editorAttrs:{placeholder:'estado de alta'},    options: utils.estadoAltaStramiteOpLst },
        nivel_ejecucion: {type: 'Select',   title: 'Nivel de ejecución',    editorAttrs:{placeholder:'nivel de ejecución'},options: utils.nivelEjecucionStramiteOpLst },
        presuprog:   {type: 'Text',    title: 'Fuente financiera',     editorAttrs:{placeholder:'Programa presupuestario + actividad'}},
        presuinciso: {type: 'Text',    title: 'Inciso / actividad',    editorAttrs:{placeholder:'Objeto del gasto'}},
    },

    getFieldLabel: function(field){
      if(!(field in this.schema)) return '';
      
      if(this.schema[field].type === 'Select'){
        var value = this.get(field);
        if(value === 'no_definido' || value === "nodefinido") return '';
        
        var options = this.schema[field].options;
        var selected = _.findWhere(options,{val:value});
        return (selected)? selected.label : value;
      }else{
        return this.get(field);
      }
    },

    updateCost: function(){
      //console.log('EvaluateCosto CABECERA BEGIN');
      var previouscost = parseInt(this.get('importe'));
      var isactive = parseInt(this.get('isactive')) === 1 ? 1 : 0;
      var isvalid = this.get('estado_alta') === 'activo' ? 1 : 0;
      var freq = parseInt(this.get('freq'));
      var cantidad = parseInt(this.get('cantidad'));
      var punit = parseInt(this.get('punit'));

      var importe = (isvalid * isactive  * freq * cantidad * punit);
      this.set('importe', importe);
    },

    defaults: {
      slug: '',
      description: '',
      justif: '',
      freq: 1,
      umefreq: 'item',
      cantidad: 1,
      ume: 'unidad',
      punit: 0,
      importe: 0,
      fedesde: '',
      fehasta: '',
      person: '',
      presuprog: '',
      presuinciso: '',
      nivel_ejecucion: "enevaluacion",
      estado_alta: "activo",
      isactive: "1",
    },
  });

  Entities.AdmRqstComprasCol = Backbone.Collection.extend({
    whoami: 'Entities.AdmRqstComprasCol:adminrequest.js ',
    //url: "/navegar/tramitaciones",
    model: Entities.AdmRqstComprasItem,
    sortfield: 'person',
    sortorder: -1,

    comparator: function(left, right) {
      var order = this.sortorder;
      var l = left.get(this.sortfield);
      var r = right.get(this.sortfield);

      if (l === void 0) return -1 * order;
      if (r === void 0) return 1 * order;

      return l < r ? (1*order) : l > r ? (-1*order) : 0;
    },

  });

// ********************  fin tipos de tramitación **********************
/** 
 *  ===============================================
 *   helper functions: COSTO TRAMITACION
 *  ===============================================
*/
  var evaluateActionrequests = function(reqCol){
    console.log('REQUESTS COL: [%s] [%s]', reqCol.length, reqCol.whoami)
      var importe = {},
          costo = {
            total: 0,
            detallado: 0,

          };

      if(!reqCol.costototal){
        reqCol.costototal = 0;
      }
      if(!reqCol.costodetallado){
        reqCol.costodetallado = 0;
      }

      reqCol.each(function(request){
        importe = evaluateRequestCost(request);
        //console.log('Evaluando Costo: [%s] [%s]', importe, request.get('tgasto'));
        costo.total += importe.total;
        costo.detallado += importe.detallado;
      });

      if (reqCol.costototal !== costo.total || reqCol.costodetallado !== costo.detallado ){
        //console.log('COSTO TOTAL ACCION: [%s] >> [%s]', reqCol.costodetallado, costo.detallado);
        reqCol.trigger('action:requestcost:changed', costo.total, costo.detallado);
      }
      reqCol.costototal = costo.total;
      reqCol.costodetallado = costo.detallado;
      return costo;
  };

  var evaluateRequestCost = function(reqst){
      //console.log('Tramitaciones CONTRATOS: TOTAL COST BEGINGS')
      var costo = {
        total:0,
        detallado:0
        },
        reqstItems = reqst.getItems();


      if(!reqst.costoactual){
        reqst.costoactual = 0;
      }
      costo.total = reqst.get('importe')

      reqstItems.each(function(itemrqst){
        costo.detallado += evaluateRequestItemCost(itemrqst);
      });

      if (reqst.costoactual !== costo.detallado){
        console.log('[%s]:COSTO TOTAL REQUEST: [%s] >> [%s]', reqst.whoami, reqst.costoactual, costo.detallado);
        reqst.trigger('adminrequest:cost:changed', costo.detallado);
      }
      reqst.costoactual = costo.detallado;
      return costo;
  };
  
  var evaluateRequestItemCost = function(reqstItem){
    var isactive = parseInt(reqstItem.get('isactive')) === 1 ? 1 : 0;
    var isvalid = reqstItem.get('estado_alta') === 'activo' ? 1 : 0;
    var freq = parseInt(reqstItem.get('freq'));
    var cantidad = parseInt(reqstItem.get('cantidad'));
    var punit = parseInt(reqstItem.get('punit'));

    var importe = (isvalid * isactive  * freq * cantidad * punit);
    //console.log('ITEM: isactive:[%s] ifreq:[%s] cant:[%s]  punit:[%s] importe:[%s] previouscost:[%s]', isactive, freq, cantidad, punit, importe, previouscost)

    return importe;
  };






  Entities.AdminrequestPlanningCollection = Backbone.Collection.extend({
    whoami: 'Entities.AdminrequestPlanningCollection:admrqst.js ',
    url: "/navegar/tramitaciones",
    model: Entities.AdminrequestPlanningFacet,
    sortfield: 'trequest',
    sortorder: -1,

    comparator: function(left, right) {
      var order = this.sortorder;
      var l = left.get(this.sortfield);
      var r = right.get(this.sortfield);

      if (l === void 0) return -1 * order;
      if (r === void 0) return 1 * order;

      return l < r ? (1*order) : l > r ? (-1*order) : 0;
    },

    saveAll: function(action, budget, user, opt){
      var self = this,
          admrqst;

      console.log('SaveAll BEGINS [%s]', self.length);
      self.each(function (budFacet){
        admrqst = budFacet.admrqstFactory();
        if(admrqst){
          console.log('BINGO: ready to update[%s] items:[%s]', admrqst.get('trequest'), admrqst.get('items').length)
          admrqst.update(action, function(error, admrqst){
            console.log('admrqst Saved: [%s]', admrqst.get('trequest'));
          });

        }
      })
    },

    addAdminrequest: function(admrqst){
      this.add(admrqst);
      this.listenTo(admrqst, 'admrqst:cost:changed', this.evaluateTotalCost);
      //admrqst.on('admrqst:cost:changed', this.evaluateTotalCost, this);
      //this.evaluateTotalCost();
    },

    removeAdminrequest: function(admrqst){
      this.remove(admrqst);
    },

    evaluateTotalCost: function(){
      console.log('TOTAL COST BEGINGS')
      if(!this.costoactual){
        this.costoactual = 0;
      }
      var costo_total = 0;

      this.each(function(admrqst){
        costo_total += admrqst.evaluateCosto();
      });
      if (this.costoactual !== costo_total){
        console.log('COSTO TOTAL ACCION: [%s] >> [%s]', this.costoactual, costo_total);
        this.trigger('action:cost:changed', costo_total);
      }
      this.costoactual = costo_total;
      return costo_total;
    },

  });

  var createNewInstance = function(facet, action, budget, user, cb){
    var attr = {
      slug: facet.get('slug'),
      description: facet.get('description'),
      cudap: facet.get('cudap'),
      trequest: facet.get('trequest'),
      cantidad: facet.get('cantidad'),
      ume: facet.get('ume'),
      fenecesidad: facet.get('fenecesidad'),
      importe: facet.get('importe'),
      presuprog: utils.fetchPresuprog(action.get('area')),
      presuinciso: utils.fetchPresuinciso(facet.get('trequest')),
    };

/*
  "cgasto": "111.000",

  "presuprog": "412",
  "presuinciso": "324",
  "nivel_ejecucion": "enevaluacion",
  "estado_alta": "activo",
  "nivel_importancia": "medio",
  "useralta": "52d7e1bcdff70a4d02993dd8",
  "fealta": 1428288443267,
  "feultmod": 1429538239659,
  "itemheader": {
    "_id": null,
    "objeto": "Pasantes para la carga inicial de datos",
    "justif": "Ayuda para los coordinadores",
    "freq": 3,
    "umefreq": "mes",
    "cantidad": 2,
    "fedesde": "2015-04-01T03:00:00.000Z",
    "fehasta": "2015-07-23T03:00:00.000Z",
    "personas": [
      "Alberto O",
      "sandro.iglesias"
    ],
    "ume": "contrato"
  },
  "items": [
    {
      "slug": "Contrato locación de obra Productor",
      "description": "Pasantes para la carga inicial de datos",
      "justif": "Ayuda para los coordinadores",
      "freq": 3,
      "umefreq": "mes",
      "cantidad": 1,
      "ume": "contrato",
      "punit": 14600,
      "fedesde": "2015-04-01T03:00:00.000Z",
      "fehasta": "2015-07-01T03:00:00.000Z",
      "person": "Alberto Mayorens",
      "estado_alta": "activo",
      "nivel_ejecucion": "enpreparacion",
      "importe": 43800,
      "isactive": "1"
    },
    {
      "slug": "Contrato locación de obra",
      "description": "Pasantes para la carga inicial de datos",
      "justif": "Ayuda para los coordinadores",
      "freq": 3,
      "umefreq": "mes",
      "cantidad": 1,
      "ume": "contrato",
      "punit": 1600,
      "fedesde": "2015-04-01T03:00:00.000Z",
      "fehasta": "2015-07-31T03:00:00.000Z",
      "person": "Joaquin",
      "estado_alta": "activo",
      "nivel_ejecucion": "enevaluacion",
      "importe": 4800,
      "isactive": "1"
    },
    {
      "slug": "Contrato locación de obra",
      "description": "Pasantes para la carga inicial de datos",
      "justif": "Ayuda para los coordinadores",
      "freq": 3,
      "umefreq": "mes",
      "cantidad": 1,
      "ume": "contrato",
      "punit": 8000,
      "fedesde": "2015-04-01T03:00:00.000Z",
      "fehasta": "2015-06-30T03:00:00.000Z",
      "person": "Jorge Lopez Privez",
      "estado_alta": "activo",
      "nivel_ejecucion": "enpreparacion",
      "importe": 24000,
      "isactive": "1"
    },
    {
      "slug": "Contrato locación de obra",
      "description": "Pasantes para la carga inicial de datos",
      "justif": "Ayuda para los coordinadores",
      "freq": 3,
      "umefreq": "mes",
      "cantidad": 1,
      "ume": "contrato",
      "punit": 0,
      "fedesde": "2015-04-01T03:00:00.000Z",
      "fehasta": "2015-06-30T03:00:00.000Z",
      "person": "fulano",
      "estado_alta": "activo",
      "nivel_ejecucion": "enpreparacion",
      "importe": 0,
      "isactive": "1"
    }
  ],
  "monto": "0",
  "persona": "MateoGO",
  "personaid": "52d7e15edff70a4d02993dd7",
  "userultmod": "52d7e1bcdff70a4d02993dd8"



*/



    var arequest = new Entities.Adminrequest(attr);
    arequest.update(action, budget, user, cb);



  };

// USADA PARA LA CREACIÓN RAPIDA DE UN ADMINREQUEST
  Entities.AdminrequestPlanningFacet = Backbone.Model.extend({
    whoami: 'Entities.AdminrequestPlanningFacet:admrqst.js ',

    urlRoot: "/actualizar/tramitaciones",

    initialize: function(options){
 

    },


    schema: {
        slug:         {type: 'Text',      title: 'Asssssunto',                editorAttrs:{placeholder:'identificación del trámite'}},
        description:  {type: 'TextArea',  title: 'Descripción ejecutiva del pedido'},
        trequest:     {type: 'Select',    title: 'Tipo de requerimiento', editorAttrs:{placeholder:'Tipo de requerimiento'},options: utils.tipoBudgetMovimList },
        cantidad:     {type: 'Number',    title: 'Cantidad',              editorAttrs:{placeholder:'en unidades'}},
        ume:          {type: 'Select',    title: 'Unidad de medida',      editorAttrs:{placeholder:'unidad de medida'},options: utils.umeList },
        fenecesidad:  {type: 'Text',      title: 'Fecha necesidad',       editorAttrs:{placeholder:'dd/mm/aaaa'}},
        importe:      {type: 'Number',    title: 'Costo de referencia',   editorAttrs:{placeholder:'en unidades'}},
        cudap:        {type: 'Text',      title: 'CUDAP tramitación',     editorAttrs:{placeholder:'solicitud de trámite o expediente'}},
 

    },

    createNewRequest: function(action, budget, user, cb){
      var self = this;
      console.log('createNew Request begins.[%s][%s][%s]', action.whoami, budget.whoami, user.whoami);
      createNewInstance(self, action, budget, user, cb);

    },


    addItemAdminrequest: function(item){
      this.itemsCol.add(item);
      this.listenTo(item, 'admrqstitem:cost:changed', this.evaluateCosto);
      this.trigger('item:admrqst:added');
      //this.evaluateCosto();
    },

    trashItem:function(item){
      this.itemsCol.remove(item);
      this.trigger('item:admrqst:removed');
      this.evaluateCosto();
    },

    trashMe: function(){
      if(this.get('_id')){
        this.set('estado_alta', 'baja');
        this.evaluateCosto();
        return true;
      }else{
        return false;
      }
    },

    cloneMe: function(){
      var self = this;
      var clone = self.admrqstFactory();
      return clone;
    },

    admrqstFactory: function(){
      var self = this,
          admrqst;

      if(self.hasRelevantCost()){
        self.buildItemsArray();
        admrqst = new Entities.Adminrequest(self.attributes);
        return admrqst;
      }else{
        return null;
      }
    },


    defaults: {
      _id: null,

      slug: "",
      fecha_prev: "",
      description: "",

      tgasto: "no_definido",
      cgasto: "111.111",
      montomanual: "0",
      importe: "0",
      isactive: "1",
      freq: "1",
      umefreq: "global",
      cantidad: "1",
      ume: "global",
      punit: "1",
      coldh: "0",
      presuprog: "",
      presuinciso: "",

      estado_alta: "activo",
      nivel_ejecucion: "enevaluacion",
      nivel_importancia: "media",

      items:[],
    },
  });


  Entities.AdminrequestUpdate = Backbone.Model.extend({
    whoami: 'Entities.AdminrequestUpdate:admrqst.js ',

    urlRoot: "/actualizar/tramitaciones",

  });


  Entities.AdminrequestCollection = Backbone.Collection.extend({
    whoami: 'Entities.AdminrequestCollection:adminrequest.js ',
    url: "/tramitaciones",
    model: Entities.Adminrequest,
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
        {val:'program_cnumber',   label:'Programa',         itemType: 'Text'},
        {val:'tipomov',           label:'Registro',         itemType: 'Text'},
        {val:'tgasto:',           label:'TipoDeGasto',      itemType: 'Text'},
        {val:'cantidad',          label:'Cantidad',         itemType: 'Number'},
        {val:'importe',           label:'Importe',          itemType: 'Number'},
        {val:'ume',               label:'UME',              itemType: 'Text'},

        {val:'slug',              label:'Descripcion',      itemType: 'Text'},
        {val:'nodo',              label:'Nodo',             itemType: 'Text'},
        {val:'area',              label:'Area',             itemType: 'Text'},
        {val:'parent_cnumber',    label:'Accion',           itemType: 'Text'},
        {val:'parent_slug',       label:'DenomAccion',      itemType: 'Text'},

        {val:'fecha_prev',        label:'FechaEjecucion',   itemType: 'Date'},
        {val:'anio_fiscal',       label:'AnioFiscal',       itemType: 'Number'},
        {val:'trim_fiscal',       label:'TrimFiscal',       itemType: 'Number'},

        {val:'tramita',           label:'TramitaPor',       itemType: 'Text'},
        {val:'origenpresu',       label:'OrigenPresu',      itemType: 'Text'},
        {val:'presuprog',         label:'Preventiva',       itemType: 'Text'},
        {val:'presuinciso',       label:'Inciso',           itemType: 'Text'},

        {val:'nivel_ejecucion',   label:'Ejecucion',        itemType: 'Text'},
        {val:'estado_alta',       label:'Alta',             itemType: 'Text'},
        {val:'nivel_importancia', label:'Relevancia',       itemType: 'Text'},
        {val:'descriptores',      label:'Descriptores',     itemType: 'Text'},
    ],

    fetchCollection: function(collection){
      var self = this,
          colItems = [],
          registro,
          data;

      collection.each(function(model){
        registro = [];
        _.each(self.exportHeadings, function(token){
            data = model.get(token.val)|| 'sin_dato';
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
      //console.log(JSON.stringify(query));

      $.ajax({
        type: "POST",
        url: "/excelbuilder",
        dataType: "json",
        //contentType:"application/jsonrequest",
        data: query,
        success: function(data){
            //console.dir(data);
            window.open(data.file)

        }
      });


    }
  };

  Entities.AdminrequestNavCollection = Backbone.Collection.extend({
    whoami: 'Entities.AdminrequestNavCollection:adminrequest.js ',
    url: "/navegar/tramitaciones",
    model: Entities.Adminrequest,
    sortfield: 'cgasto',
    sortorder: -1,

    comparator: function(left, right) {
      var order = this.sortorder;
      var l = left.get(this.sortfield);
      var r = right.get(this.sortfield);

      if (l === void 0) return -1 * order;
      if (r === void 0) return 1 * order;

      return l < r ? (1*order) : l > r ? (-1*order) : 0;
    },

    evaluateActionRequests: function(){
      return evaluateActionrequests(this);
    },
  });
  
  Entities.AdminrequestsFindOne = Backbone.Collection.extend({
    whoami: 'Entities.AdminrequestsFindOne:adminrequest.js ',
    url: "/admrqst/fetch",
    model: Entities.Adminrequest,
    comparator: "cnumber",
  });

  Entities.AdminrequestsUpdate = Backbone.Collection.extend({
    whoami: 'Entities.AdminrequestsUpdate:adminrequest.js ',
    url: "/actualizar/tramitaciones",
    model: Entities.Adminrequest,
    comparator: "cnumber",
  });


  /*
   * ******* FACETA PARA CREAR UNA NUEVA ACCION +**********
   */
  Entities.AdminrequestNewFacet = Backbone.Model.extend({
    whoami: 'AdminrequestNewFacet:adminrequest.js ',

    validate: function(attrs, options) {
      //if(!attrs) return;
      var errors = {}
      //console.log('validate [%s] [%s] [%s]',attrs, _.has(attrs,'tipoitem'), attrs.tipoitem);

      if (_.has(attrs,'tipoitem') && (!attrs.tipitem )) {
        errors.trequest = "No puede ser nulo";
      }
      if (_.has(attrs,'eusuario') && (!attrs.eusuario )) {
        errors.eusuario = "No puede ser nulo";
      }
      if (_.has(attrs,'slug') && ! attrs.slug) {
        errors.slug = "No puede ser nulo";
      }

      if( ! _.isEmpty(errors)){
        return errors;
      }
    },

    addItemCollection: function(model){
      var self = this,
          itemCol = self.getItems();

      itemCol.add(model);
      self.insertItemCollection(itemCol);
      return itemCol;
    },

    insertItemCollection: function(itemCol) {
        var self = this;
        self.set({items: itemCol.toJSON()});
        //console.dir(itemCol.toJSON());
    },

    getItems: function(){
      var itemCol = new Entities.MovimSOItems(this.get('items'));
      return itemCol;

    },

    beforeUpdate: function(){

    },

    update: function(model, cb){
      var self = this,
          attrs = self.attributes,
          items = [];
      console.log('Facet Update: model:[%s]', model.whoami);
      self.beforeUpdate();
      model.set('items', items);
      model.update(cb);

    },


    defaults: {
      _id: null,
      cnumber: "",
      tregistro:"",
      trequest: "",
      ferequest: "",
      slug: "admrqsto nuevoO",
      estado_alta:'media',
      nivel_ejecucion: "enevaluacion",
      nivel_importancia: 'alta',
      description: "",
      items:[]
    },


  });


  Entities.AdminrequestQueryFacet = Backbone.Model.extend({
    //urlRoot: "/comprobantes",
    whoami: 'ActionQueryFacet:comprobante.js ',

    schema: {
        fedesde:  {type: 'Date',   title: 'Desde', placeholder:'dd/mm/aaaa', yearEnd:2018},
        fehasta:  {type: 'Date',   title: 'HastaA', placeholder:'dd/mm/aaaa', yearEnd:2018},
        tgasto:   {type: 'Select', options: utils.tipoAdminrequestMovimList, title:'Tipo de Gasto' },
        nodo:     {type: 'Select', options: utils.actionNodosOptionList, title:'Nodo' },
        area:     {type: 'Select', options: utils.actionAreasOptionList, title:'Área/Nodo' },
        slug:     {type: 'Text',   title: 'Denominación'},
        ejecucion:{type: 'Select', options: utils.admrqstEjecucionOptionList, title:'Nivel ejecución' },
    },

    defaults: {
      fedesde:'',
      fehasta:'',
      tgasto:'',
      area: '',
      slug: '',
      ejecucion:''
    }
  });


  var filterFactory = function (admrqsts){
    var fd = DocManager.Entities.FilteredCollection({
        collection: admrqsts,

        filterFunction: function(filterCriterion){
          var criteria = filterCriterion.toLowerCase();
          return function(admrqst){
            //console.log('filterfunction:[%s]vs [%s]/[%s]/[%s]',criteria,admrqst.get("trequest"),admrqst.get("cnumber"),admrqst.get("slug"));
            if(admrqst.get("trequest").toLowerCase().indexOf(criteria) !== -1
              || admrqst.get("slug").toLowerCase().indexOf(criteria) !== -1
              || admrqst.get("cnumber").toLowerCase().indexOf(criteria) !== -1){
              
              return admrqst;
            }
          }
        }
    });
    return fd;
  };

  var queryFactory = function (admrqsts){
    var fd = DocManager.Entities.FilteredCollection({
        collection: admrqsts,

        filterFunction: function(query){
          return function(admrqst){
            var test = true;
            //if((query.trequest.trim().indexOf(admrqst.get('trequest'))) === -1 ) test = false;
            //console.log('filterfunction:TEST: [%s] [%s] [%s] [%s]',test, query.tgasto,admrqst.get("tipomov"),admrqst.get("cnumber"));
            if(query.tgasto && query.tgasto!=='no_definido') {
              if(query.tgasto.trim() !== admrqst.get('tgasto')) test = false;
            }

            if(query.area && query.area !=='no_definido') {
              if(query.area.trim() !== admrqst.get('area')) test = false;
            }

            if(query.nodo && query.nodo !=='no_definido') {
              if(query.nodo.trim() !== utils.fetchNode(utils.actionAreasOptionList, admrqst.get('area'))){
               test = false;
             }
            }

            if(query.ejecucion && query.ejecucion!=='no_definido') {
              if(query.ejecucion.trim() !== admrqst.get('nivel_ejecucion')) test = false;
            }

            if(query.fedesde.getTime()>admrqst.get('fealta')) test = false;
            if(query.fehasta.getTime()<admrqst.get('fealta')) test = false;

            if(query.slug){
              if(utils.fstr(admrqst.get("slug").toLowerCase()).indexOf(utils.fstr(query.slug)) === -1 && admrqst.get("cnumber").toLowerCase().indexOf(query.slug.toLowerCase()) === -1) test = false;
            }

            if(test) return admrqst;
          }
        }
    });
    return fd;
  };


  var reportQueryFactory = function (reports){
    var fd = DocManager.Entities.FilteredCollection({
        collection: reports,

        filterFunction: function(query){
          return function(report){
            var test = true;
            //if((query.trequest.trim().indexOf(report.get('trequest'))) === -1 ) test = false;
            //console.log('filterfunction:TEST: [%s] [%s] [%s] [%s]',test, query.tipoitem,report.get("tipoitem"),report.get("cnumber"));

            if(query.estado) {
              if(query.estado.trim() !== report.get('estado_alta')) test = false;
            }

            if(query.slug){
              if(utils.fstr(report.get("pslug").toLowerCase()).indexOf(utils.fstr(query.slug)) === -1 && report.get("cnumber").toLowerCase().indexOf(query.slug.toLowerCase()) === -1) test = false;
            }

            if(test) return report;
          }
        }
    });
    return fd;
  };

  var queryCollection = function(query){
      var requests = new Entities.AdminrequestCollection();
      var defer = $.Deferred();
      requests.fetch({
        success: function(data){
          defer.resolve(data);
        }
      });
      var promise = defer.promise();
      return promise;
  };



  var API = {
    getEntities: function(){
      var requests = new Entities.AdminrequestCollection();
      var defer = $.Deferred();
      requests.fetch({
        success: function(data){
          defer.resolve(data);
        }
      });
      var promise = defer.promise();
      return promise;
    },

    getFilteredCol: function(criteria, cb){
      var fetchingAdminrequests = API.getEntities();

      $.when(fetchingAdminrequests).done(function(admrqsts){
        var filteredAdminrequests = filterFactory(admrqsts);
        if(criteria){
          filteredAdminrequests.filter(criteria);
        }
        if(cb) cb(filteredAdminrequests);
      });
    },

    getFilteredByQueryCol: function(query, cb){
      var fetchingAdminrequests = queryCollection(query);

      $.when(fetchingAdminrequests).done(function(admrqsts){

        var filteredAdminrequests = queryFactory(admrqsts);
        if(query){
          filteredAdminrequests.filter(query);
        }
        if(cb) cb(filteredAdminrequests);

      });
    },

    getEntity: function(entityId){
      var request = new Entities.Adminrequest({_id: entityId});
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

    fetchNextPrev: function(type, model, cb){
      var query = {};
      if(type === 'fetchnext') query.cnumber = { $gt : model.get('cnumber')}
      if(type === 'fetchprev') query.cnumber = { $lt : model.get('cnumber')}

      var requests= new Entities.AdminrequestsFindOne();
      requests.fetch({
          data: query,
          type: 'post',
          success: function() {
              if(cb) cb(requests.at(0));
          }
      });
    },
  }


  DocManager.reqres.setHandler("admrqst:entities", function(){
    return API.getEntities();
  });

  DocManager.reqres.setHandler("admrqst:filtered:entities", function(criteria, cb){
    return API.getFilteredCol(criteria,cb);
  });

  DocManager.reqres.setHandler("admrqst:query:entities", function(query, cb){
    return API.getFilteredByQueryCol(query,cb);
  });

  DocManager.reqres.setHandler("admrqst:entity", function(id){
    return API.getEntity(id);
  });

  DocManager.reqres.setHandler("admrqst:fetchprev", function(model, cb){
    return API.fetchNextPrev('fetchprev',model, cb);
  });

  DocManager.reqres.setHandler("admrqst:fetchnext", function(model, cb){
    return API.fetchNextPrev('fetchnext',model, cb);
  });

});

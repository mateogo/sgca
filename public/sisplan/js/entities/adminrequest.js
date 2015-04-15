DocManager.module("Entities", function(Entities, DocManager, Backbone, Marionette, $, _){
  
  Entities.Adminrequest = Backbone.Model.extend({
    urlRoot: "/tramitaciones",
    whoami: 'Entities.Adminrequest:adminrequest.js ',

    idAttribute: "_id",

    schema: {
        slug:         {type: 'Text',      title: 'Asunto',                editorAttrs:{placeholder:'identificación del trámite'}},
        description:  {type: 'TextArea',  title: 'Descripción ejecutiva del pedido'},
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
      tgasto: '',
      cgasto: "111.111",

      // cantidad importes
      importe: "0",
      isactive: "1",
      freq: "1",
      umefreq: "global",
      cantidad: "1",
      ume: "global",
      punit: "0",
      monto: "0",
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
        umefreq: 'mes',
        cantidad: '',
        fedesde: '',
        fehasta: '',
      },

      items:[],
    },

    itemListFactory: function(){
      var self = this,
          items = self.get('items');

      console.log('itemsFactory: [%s]',items.length);

      if(utils.fetchListKey(utils.tipoBudgetMovimList, self.get('trequest'))['template'] === 'contratos') {
        return new Entities.AdmRqstContratosCol(items);
      }

    },

    itemHeaderFactory: function(){
      var self = this,
          itemHeader = self.get('itemheader');

      console.log('itemHeaderFactory: [%s]: [%s]',self.get('trequest'), utils.fetchListKey(utils.tipoBudgetMovimList, self.get('trequest'))['template'])
  
      if(utils.fetchListKey(utils.tipoBudgetMovimList, self.get('trequest'))['template'] === 'contratos') {
        return new Entities.AdmRqstContratosHeader(itemHeader);
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

      if(utils.fetchListKey(utils.tipoBudgetMovimList, self.get('trequest'))['template'] === 'contratos') {
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
            punit: 0,
            fedesde: facet.get('fedesde'),
            fehasta: facet.get('fehasta'),
            person: beneficiario,
          })
          itemsCol.add(newitem);

        };


      }
      self.set('items', itemsCol.toJSON());
      return itemsCol;
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

    updateItemData: function(col, model){
      console.log('[%s] UPDATE ITEM DATA:[%s]',model.whoami,  model.get('slug'));
      var self = this,
          itemcol = col.toJSON(),

          facetData = {
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
        fedesde:  {type: 'DatePicker', title: 'Fecha desde',       editorAttrs:{placeholder:'dd/mm/aaaa'}},
        fehasta:  {type: 'DatePicker', title: 'Fecha hasta',       editorAttrs:{placeholder:'dd/mm/aaaa'}},
        personas: {type: 'List',       title: 'Beneficiarios',     temType: 'Text' },
    
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
      // datos basicos
      objeto: '',
      justif: '',
      freq: '1',
      umefreq: 'mes',
      cantidad: '1',
      ume: 'contrato',
      fedesde: '',
      fehasta: '',
      personas: ['fulano', 'mengano' ],
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
        umefreq:  {type: 'Select',     title: 'Unidad de tiempo',  editorAttrs:{placeholder:'unidad de tiempo'},options: utils.umeFreqList },
        cantidad: {type: 'Number',     title: 'Cantidad de contratos',  editorAttrs:{placeholder:'en unidades'}},
        ume:      {type: 'Select',     title: 'Unidad de medida',  editorAttrs:{placeholder:'unidad de contrato'},options: utils.umeList },
        punit:    {type: 'Number',     title: 'Costo/ honorario',  editorAttrs:{placeholder:'valor factura unitaria'}},

        fedesde:  {type: 'DatePicker', title: 'Fecha desde',       editorAttrs:{placeholder:'dd/mm/aaaa'}},
        fehasta:  {type: 'DatePicker', title: 'Fecha hasta',       editorAttrs:{placeholder:'dd/mm/aaaa'}},
        estado_alta:     {type: 'Select',   title: 'Estado de Alta',        editorAttrs:{placeholder:'estado de alta'},    options: utils.estadoAltaStramiteOpLst },
        nivel_ejecucion: {type: 'Select',   title: 'Nivel de ejecución',    editorAttrs:{placeholder:'nivel de ejecución'},options: utils.nivelEjecucionStramiteOpLst },
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
      slug: '',
      description: '',
      justif: '',
      freq: 1,
      umefreq: 'mes',
      cantidad: 1,
      ume: 'contrato',
      punit: 0,
      fedesde: '',
      fehasta: '',
      person: '',
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
    };
    var arequest = new Entities.Adminrequest(attr);
    arequest.update(action, budget, user, cb);



  };

  Entities.AdminrequestPlanningFacet = Backbone.Model.extend({
    whoami: 'Entities.AdminrequestPlanningFacet:admrqst.js ',

    urlRoot: "/actualizar/tramitaciones",

    initialize: function(options){
 

    },


    schema: {
        slug:         {type: 'Text',      title: 'Asunto',                editorAttrs:{placeholder:'identificación del trámite'}},
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

    evaluateItems: function(){
      var items = this.itemsCol;
      var costodetallado = 0;

      if(items){
        if(items.length){
          items.each(function(item){
            var itemcost = item.evaluateCosto();
            costodetallado += itemcost;
            //console.log('evaluate Items[%s] [%s]', itemcost, costodetallado)
          })
        }
      }
      return costodetallado;
    },

    evaluateCosto: function(){
      //console.log('EvaluateCosto CABECERA BEGIN');
      var previouscost = parseInt(this.get('importe'));
      var isactive = parseInt(this.get('isactive')) === 1 ? 1 : 0;
      var isdetallado = parseInt(this.get('isdetallado')) === 1 ? 1 : 0;
      var isvalid = this.get('estado_alta') === 'activo' ? 1 : 0;
      var freq = parseInt(this.get('freq'));
      var cantidad = parseInt(this.get('cantidad'));
      var montomanual = parseInt(this.get('montomanual'));

      var punit = this.evaluateItems();

      var importe = (isvalid * isactive * isdetallado * freq * cantidad * punit) + (1-isdetallado) * (isvalid * isactive * montomanual);
      //console.log('CABECERA: isactive:[%s] isdetallado:[%s]  freq:[%s] cant:[%s] montomanual:[%s] punit:[%s] importe:[%s] previouscost:[%s]',isactive, isdetallado, freq, cantidad, montomanual, punit, importe, previouscost)

      this.set('punit', punit);
      this.set('importe', importe);

      if(previouscost !== importe){
        console.log(' BUDGET: triggering cost:changed');
        this.trigger('admrqst:cost:changed');
      }
      return importe;
    },

    fetchAdminrequestItems: function(stype){
      var items,
          self = this,
          admrqstsCol,
          admrqstItem,
          type = self.get('tgasto'),
          deflist = utils.admrqstTemplate[type];

      if(self.itemsCol) return itemsCol;

      items = self.get('items');

      if(items.length){
        admrqstsCol = new DocManager.Entities.AdminrequestItemsCollection(items);
        self.itemsCol = admrqstsCol;

      }else{
        var admrqstsCol = new DocManager.Entities.AdminrequestItemsCollection();
        self.itemsCol = admrqstsCol;

        _.each(deflist, function(elem){
          if(elem.val !== 'no_definido'){
            admrqstItem = new DocManager.Entities.AdminrequestItemFacet(self.attributes);

            admrqstItem.set({
              sgasto:elem.val,
              cgasto: elem.cgasto,
              slug: '',
              ume:elem.ume,
              importe: 0,
              montomanual: 0,
              punit: 0,
            })
            admrqstItem.evaluateCosto();

            self.addItemAdminrequest(admrqstItem);
          }
        });        
      }

      return admrqstsCol;
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

    hasRelevantCost: function(){
      var self = this,
          importe;

      importe = self.evaluateCosto();
      if (importe || !parseInt(this.get('isactive')) ){
        return true;
      }
      return false;
    },

    buildItemsArray: function(){
      var self = this,
          items=[],
          importe;
      
      //console.log('AdminrequestFactory: building items:[%s]', self.itemsCol.length);

      if(self.itemsCol){
        //console.log('AdminrequestFactory: building items:[%s]', self.itemsCol.length);
        self.itemsCol.each(function(admrqstItem){
          importe = admrqstItem.evaluateCosto();
          console.log('AdminrequestFactory: building items:[%s] [%s]', admrqstItem.get('sgasto'), importe);
          if(importe || !parseInt(admrqstItem.get('isactive')) ){
            admrqstItem.set('cgasto', utils.fetchListKey(utils.admrqstTemplate[admrqstItem.get('tgasto')], admrqstItem.get('sgasto'))['cgasto'] );
            items.push(admrqstItem.attributes);
          }
        });
      }
      self.set('items', items);
    },

    defaults: {
      _id: null,

      slug: "",
      tramita: "MCN",
      origenpresu: "MCN",
      anio_fiscal: "2015",
      trim_fiscal: "1",
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
      monto: "0",
      coldh: "0",
      presuprog: "",
      presuinciso: "",

      estado_alta: "activo",
      nivel_ejecucion: "enevaluacion",
      nivel_importancia: "media",

      items:[],
    },
  });

  Entities.AdminrequestItemFacet = Backbone.Model.extend({
    whoami: 'Entities.AdminrequestItemFacet:admrqst.js ',

    urlRoot: "/actualizar/tramitaciones",
    initialize: function(options){
      //console.log('[%s] INITIALIZE: Tipo de gasto:[%s]',this.whoami, this.get('tgasto'))
      this.schema = this.buildSchema();

    },

    getOptions: function(){
      return utils.admrqstTemplate[this.get('tgasto')];
    },

    buildSchema: function(){
      var self = this;
      var schema = {
          sgasto:       {type: 'Select',    title:'Tipo de Gasto', options: self.getOptions() },

          slug:         {type: 'Text',      title: 'Descripción del gasto',            editorAttrs:{placeholder:'descripción corta'}},
          freq:         {type: 'Number',    title: 'Frecuencia (días/ show)',    editorAttrs:{placeholder:'veces que aplica a la cantidad'}},
          umefreq:      {type: 'Select',    title: 'Unidad de frecuencia',  editorAttrs:{placeholder:'unidad de frecuencia (show/día/mes/etc.'},options: utils.umeFreqList },
          cantidad:     {type: 'Number',    title: 'Cantidad',          editorAttrs:{placeholder:'en unidades'}},
          ume:          {type: 'Select',    title: 'Unidad de medida',  editorAttrs:{placeholder:'unidad de medida'},options: utils.umeList },

          punit:        {type: 'Text',      title: 'Costo unitario',           editorAttrs:{placeholder:'costo/ precio unitario'}},
   
          fecha_prev:   {type: 'Text',      title: 'Fecha prev ejecución', editorAttrs:{placeholder:'dd/mm/aaaa'}},
          trim_fiscal:  {type: 'Number',    title: 'Trimestre fiscal',  editorAttrs:{placeholder:'Indique 1/2/3/4 Trimestre ejecución presupuestaria'}},
          anio_fiscal:  {type: 'Text',      title: 'Año fiscal',        editorAttrs:{placeholder:'Indique año fiscal (2015)'}},
          origenpresu:  {type: 'Select',    title: 'Origen presupuesto', editorAttrs:{placeholder:'fuente presupuestaria'},options: utils.admrqstOriginList },
          tramita:      {type: 'Select',    title: 'Tramitación',  editorAttrs:{placeholder:'unidad ejecutora'},options: utils.admrqstTramitaPorList },
          description:  {type: 'TextArea',  title: 'Descripción ejecutiva'},
          presuprog:    {type: 'Text',      title: 'Programa presupuestario',  editorAttrs:{placeholder:'fuente de crédito presupuestario'}},
          presuinciso:  {type: 'Text',      title: 'Inciso / actividad',  editorAttrs:{placeholder:'fuente de crédito presupuestario'}},

          isdetallado:  {type: 'Number',    title: 'Presupuesto Detallado? (1/0)',  editorAttrs:{placeholder:'1: Detallado - 0: Costo total informado manualmente'}},
          montomanual:  {type: 'Text',      title: 'Costo informado manual',        editorAttrs:{placeholder:'importe en pesos FINAL informado.'}},

      };
      return schema;
    },

    toggleActivate: function(){
      this.set('isactive', (1 - this.get('isactive')));
    },

    evaluateCosto: function(){
      var previouscost = parseInt(this.get('importe'));
      var isactive = parseInt(this.get('isactive')) === 1 ? 1 : 0;
      var isdetallado = parseInt(this.get('isdetallado')) === 1 ? 1 : 0;
      var freq = parseInt(this.get('freq'));
      var cantidad = parseInt(this.get('cantidad'));

      var punit = parseInt(this.get('punit'));
      var montomanual = parseInt(this.get('montomanual'));
      
      //console.log('DETALLE: isactive:[%s] isdetallado:[%s]  freq:[%s]  montomanual:[%s] punit:[%s] ',isactive, isdetallado, freq, montomanual, punit)
      var importe = (isactive * isdetallado * freq * cantidad * punit) + (1-isdetallado) * (isactive * montomanual);
      this.set('importe', importe);
      if(previouscost !== importe){
        console.log(' ITEM: triggering cost:changed');
        this.trigger('admrqstitem:cost:changed');
      }
      return importe;
    },

    defaults: {
      _id: null,


      slug: "",
      tgasto: "",
      sgasto: "",
      cgasto: "111.111",
      importe: "0",
      montomanual: "0",
      isactive: "1",
      isdetallado: "1",
      freq: "1",
      umefreq: "global",
      cantidad: "0",
      ume: "global",
      punit: "0",
      monto: "0",
      coldh: "0",
      presuprog: "",
      presuinciso: "",
    },
  });

  Entities.AdminrequestItemsCollection = Backbone.Collection.extend({
    whoami: 'Entities.AdminrequestItemsCollection:admrqst.js ',
    url: "/navegar/tramitaciones",
    model: Entities.AdminrequestItemFacet,
    sortfield: 'tgasto',
    sortorder: -1,

    getByCid: function(model){
      return this.filter(function(val) {
        return val.cid === model.cid;
      })
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

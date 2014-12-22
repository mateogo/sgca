DocManager.module("Entities", function(Entities, DocManager, Backbone, Marionette, $, _){
  
  Entities.Budget = Backbone.Model.extend({
    urlRoot: "/presupuestos",
    whoami: 'Entities.Budget:budget.js ',

    idAttribute: "_id",

    defaults: {
      _id: null,
      owner_id: "",
      owner_type: 'action',
      program_cnumber: '',
      tipomov: "presupuesto",
      slug: "",
      nodo: "",
      area: "",
      parent_cnumber: '',
      parent_slug: '',


      fecha_prev: "",
      anio_fiscal: "",
      trim_fiscal: "",

      tramita: "",
      origenpresu: "",
      presuprog: "",
      presuinciso: "",

      tgasto: "",
      cantidad: "",
      punit: "",
      importe: "",
      ume: "global",
      coldh: "",
      analitica: "",

      nivel_ejecucion: "enevaluacion",
      estado_alta: "",
      nivel_importancia: "",
      descriptores: "",
      useralta: "",
      fealta: "",
      feultmod: "",
    },

    enabled_predicates:['es_relacion_de'],

    updateInheritData: function(action){
      var self = this;
      self.set({
        owner_type: 'action',
        owner_id: action.id,
        parent_cnumber: action.get('cnumber'),
        parent_slug: action.get('slug'),
        nodo: action.get('nodo'),
        area: action.get('area'),
        program_cnumber: action.get('cnumber')
      });
    },

    updateCurrentUsertData: function(cb){
      var self = this;
      dao.gestionUser.getUser(DocManager, function (user){
        if(!self.get('useralta')){
          self.set('useralta', user.id);
        }
        self.set('userultmod', user.id);

        var person;
        var related = user.get('es_usuario_de');
        if(related){
          person = related[0];
          if(person){
            self.set({persona: person.code,personaid: person.id })
          }
        } 
        if(cb) cb(self);
      });

    },
    
    initBeforeCreate: function(action, user, cb){
      var self = this,
          fealta = new Date(),
          fecomp = utils.dateToStr(fealta);

      self.set({fealta:fealta.getTime(), fecomp: fecomp});
      console.log('InitBeforeCreate!!!!!!!!!!!!!!!!!!!!! [%s][%s]', self.get('gasto'),self.get('slug'));
      self.updateInheritData(action);
      self.updateCurrentUsertData(cb);
 
    },

    beforeSave: function(action, cb){
      var self = this;
      console.log('initBefore SAVE')
      var feultmod = new Date();
      self.set({feultmod:feultmod.getTime()})

      self.updateInheritData(action);
      self.updateCurrentUsertData(cb);

    },
    
    
    update: function(action, cb){
      console.log('[%s] UPDATE MODEL owner:[%s]',this.whoami, action.get('slug'));
      var self = this;
      self.beforeSave(action, function(docum){
        var errors ;
        console.log('ready to SAVE');
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
      });

    },


    partialUpdate: function(token, facet){
      //facet: es un model o un hash de claves
      //token: 'content': toma las keys directamente de facet
      //       'estado_alta': solo actualiza esta key en base a facet
      //
      var self = this;
      var query = {};
      var list = [];

      //var key = facet.get('key');
      //var data = self.get(key) || {};

      list.push(self.id );
      query.nodes = list;
      query.newdata = {};

      if(token==='content'){
        query.newdata = facet;

      }else if(token ==='estado_alta'){
        query.newdata['estado_alta'] = facet;

      }else{
        // no se qué hacer... mejor me voy
        return;
      }

  
      console.log('partial UPDATE: [%s] [%s]', token, facet);
      var update = new Entities.BudgetUpdate(query);
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
      //console.log('validate [%s] [%s] [%s]',attrs, _.has(attrs,'taccion'), attrs.taccion);

      if (_.has(attrs,'taccion') && (!attrs.taccion|| attrs.taccion.length==0)) {
        errors.taccion = "No puede ser nulo";
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
      return new Entities.BudgetCoreFacet(this.attributes,{formType:'long'});
    },

  });


  Entities.BudgetCoreFacet = Backbone.Model.extend({
    //urlRoot: "/comprobantes",
    whoami: 'BudgetCoreFacet:budget.js ',

    initialize: function(attributes, options){
      var self = this;
      self.options = options;
      console.log('[%s] INITIALIZE  [%s]',self.whoami, arguments.length);

      if(options.formType === 'short'){
        self.schema = self.schema_short;
      }else{
        self.schema = self.schema_long;
      }
    },

    schema_short: {
        tgasto:       {type: 'Select',    title:'Tipo de Gasto', options: utils.tipoBudgetMovimList },
        slug:         {type: 'Text',      title: 'Asunto',            editorAttrs:{placeholder:'descripción corta'}},
        importe:      {type: 'Text',      title: 'Importe',           editorAttrs:{placeholder:'importe en pesos FINAL'}},
        trim_fiscal:  {type: 'Number',    title: 'Trimestre fiscal',  editorAttrs:{placeholder:'Indique 1/2/3/4 Trimestre ejecución presupuestaria'}},
        description:  {type: 'TextArea',  title: 'Descripción ejecutiva'},
        cantidad:     {type: 'Number',    title: 'Cantidad',          editorAttrs:{placeholder:'en unidades'}},
        ume:          {type: 'Select',    title: 'Unidad de medida',  editorAttrs:{placeholder:'unidad de medida'},options: utils.umeList },
    },

    schema_long: {
        tgasto:       {type: 'Select',    title:'Tipo de Gasto', options: utils.tipoBudgetMovimList },
        slug:         {type: 'Text',      title: 'Asunto',            editorAttrs:{placeholder:'descripción corta'}},
        cantidad:     {type: 'Number',    title: 'Cantidad',          editorAttrs:{placeholder:'en unidades'}},
        ume:          {type: 'Select',    title: 'Unidad de medida',  editorAttrs:{placeholder:'unidad de medida'},options: utils.umeList },
        importe:      {type: 'Text',      title: 'Importe',           editorAttrs:{placeholder:'importe en pesos FINAL'}},
        fecha_prev:   {type: 'Text',      title: 'Fecha prev ejecución', editorAttrs:{placeholder:'dd/mm/aaaa'}},
        trim_fiscal:  {type: 'Number',    title: 'Trimestre fiscal',  editorAttrs:{placeholder:'Indique 1/2/3/4 Trimestre ejecución presupuestaria'}},
        anio_fiscal:  {type: 'Number',    title: 'Año fiscal',        editorAttrs:{placeholder:'Indique año fiscal (2015)'}},
        origenpresu:  {type: 'Select',    title: 'Origen presupuesto', editorAttrs:{placeholder:'fuente presupuestaria'},options: utils.budgetOriginList },
        tramita:      {type: 'Select',    title: 'Tramitación',  editorAttrs:{placeholder:'unidad ejecutora'},options: utils.budgetTramitaPorList },
        description:  {type: 'TextArea',  title: 'Descripción ejecutiva'},
        presuprog:    {type: 'Text',      title: 'Programa presupuestrio',  editorAttrs:{placeholder:'fuente de crédito presupuestario'}},
        presuinciso:  {type: 'Text',      title: 'Inciso / actividad',  editorAttrs:{placeholder:'fuente de crédito presupuestario'}},
        estado_alta:  {type: 'Select',options: utils.actionAltaOptionList, title:'Estado alta ' },
        nivel_ejecucion: {type: 'Select',options: utils.budgetEjecucionOptionList, title:'Nivel ejecución' },
        nivel_importancia: {type: 'Select',options: utils.actionPrioridadOptionList, title:'Importancia' },
    },


    //idAttribute: "_id",

    createNewInstance: function(action, user, cb){
      var self = this;
      var budget = new Entities.Budget(self.attributes);

      console.log('[%s]: createNewBudget',self.whoami);

      budget.initBeforeCreate(action, user, function(budget){
        budget.save(null, {
          success: function(model){
            cb(null,model);
          }
        });
      });
    },

    updateModel: function(model){
      model.set(this.attributes)
      return model;
    },

    partialUdateModel: function(model){
      var self = this;
      model.set(self.attributes)
      var facetData = {
          tgasto:       self.get('tgasto'),
          slug:         self.get('slug'),
          cantidad:     self.get('cantidad'),
          ume:          self.get('ume'),
          importe:      self.get('importe'),
          fecha_prev:   self.get('fecha_prev'),
          trim_fiscal:  self.get('trim_fiscal'),
          anio_fiscal:  self.get('anio_fiscal'),
          origenpresu:  self.get('origenpresu'),
          tramita:      self.get('tramita'),
          description:  self.get('description'),
          presuprog:    self.get('presuprog'),
          presuinciso:  self.get('presuinciso'),
          estado_alta:  self.get('estado_alta'),
          nivel_ejecucion: self.get('nivel_ejecucion'),
          nivel_importancia:self.get('nivel_importancia'),      
      };
      model.partialUpdate('content', facetData);

    },

    defaults: {
      _id: null,
      owner_id: "",
      owner_type: 'action',
      program_cnumber: '',
      tipomov: "presupuesto",
      slug: "",
      nodo: "",
      area: "",
      parent_cnumber: '',
      parent_slug: '',

      description: "",

      fecha_prev: "01/01/2015",
      anio_fiscal: "2015",
      trim_fiscal: "1",

      tramita: "MCN",
      origenpresu: "MCN",
      presuprog: "",
      presuinciso: "",

      tgasto: "no_definido",
      cantidad: "1",
      punit: "1",
      importe: "",
      ume: "global",
      coldh: "0",
      analitica: "",

      nivel_ejecucion: "enevaluacion",
      estado_alta: "activo",
      nivel_importancia: "media",
      descriptores: "",
      useralta: "",
      fealta: "",
      feultmod: "",
    },

   });


  Entities.BudgetHeaderFacet = Backbone.Model.extend({
    //urlRoot: "/comprobantes",
    whoami: 'BudgetHeaderFacet:budget.js ',

    schema: {
        tgasto:       {type: 'Select',    title:'Tipo de Gasto', options: utils.tipoBudgetMovimList },
        slug:         {type: 'Text',      title: 'Asunto',            editorAttrs:{placeholder:'descripción corta'}},
        cantidad:     {type: 'Number',    title: 'Cantidad',          editorAttrs:{placeholder:'en unidades'}},
        ume:          {type: 'Select',    title: 'Unidad de medida',  editorAttrs:{placeholder:'unidad de medida',options: utils.umeList }},
        importe:      {type: 'Text',      title: 'Importe',           editorAttrs:{placeholder:'importe en pesos FINAL'}},
        trim_fiscal:  {type: 'Number',    title: 'Trimestre fiscal',  editorAttrs:{placeholder:'Indique 1/2/3/4 Trimestre ejecución presupuestaria'}},
        description:  {type: 'TextArea',  title: 'Descripción ejecutiva'},
    },
    //idAttribute: "_id",

    updateModel: function(model){
      var self = this.
          area;

      model.set(this.attributes)
      area = model.get('area')
      if(area){
        model.set('nodo', utils.fetchNode(utils.budgetAreasOptionList, area));
      }
      return model;
    },
    defaults: {
      _id: null,
      owner_id: "",
      owner_type: 'action',
      program_cnumber: '',
      tipomov: "presupuesto",
      slug: "",
      nodo: "",
      area: "",
      parent_cnumber: '',
      parent_slug: '',

      fecha_prev: "",
      anio_fiscal: "2015",
      trim_fiscal: "1",

      tramita: "MCN",
      origenpresu: "MCN",
      presuprog: "",
      presuinciso: "",

      tgasto: "no_definido",
      cantidad: "",
      punit: "",
      importe: "",
      ume: "global",
      coldh: "",
      analitica: "",

      nivel_ejecucion: "enevaluacion",
      estado_alta: "activo",
      nivel_importancia: "media",
      descriptores: "",
      useralta: "",
      fealta: "",
      feultmod: "",
    },

   });


  Entities.BudgetUpdate = Backbone.Model.extend({
    whoami: 'Entities.BudgetUpdate:budget.js ',

    urlRoot: "/actualizar/presupuestos",

  });



  //Accion Collection
  Entities.BudgetCollection = Backbone.Collection.extend({
    whoami: 'Entities.BudgetCollection:accion.js ',
    url: "/presupuestos",
    model: Entities.Budget,
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

      console.log('collection export [%s]',self.length);


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
          heading: self.fetchLabels(),
          data: col,
          name: 'Items del Presupuesto'
      };

      $.ajax({
        type: "POST",
        url: "/excelbuilder",
        dataType: "json",
        data: query,
        success: function(data){
            console.dir(data);
            window.open(data.file)
        }
      });

    }
  };

  Entities.BudgetNavCollection = Backbone.Collection.extend({
    whoami: 'Entities.BudgetNavCollection:accion.js ',
    url: "/navegar/presupuestos",
    model: Entities.Budget,
    sortfield: 'tgasto',
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
  
  Entities.BudgetsFindOne = Backbone.Collection.extend({
    whoami: 'Entities.BudgetsFindOne:accion.js ',
    url: "/accion/fetch",
    model: Entities.Budget,
    comparator: "cnumber",
  });

  Entities.BudgetsUpdate = Backbone.Collection.extend({
    whoami: 'Entities.BudgetsUpdate:accion.js ',
    url: "/actualizar/accions",
    model: Entities.Budget,
    comparator: "cnumber",
  });


  /*
   * ******* FACETA PARA CREAR UNA NUEVA ACCION +**********
   */
  Entities.BudgetNewFacet = Backbone.Model.extend({
    whoami: 'BudgetNewFacet:accion.js ',

    validate: function(attrs, options) {
      //if(!attrs) return;
      var errors = {}
      //console.log('validate [%s] [%s] [%s]',attrs, _.has(attrs,'tipoitem'), attrs.tipoitem);

      if (_.has(attrs,'tipoitem') && (!attrs.tipitem )) {
        errors.taccion = "No puede ser nulo";
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

      console.log('AddItem [%s] items before Insert:[%s]', model.get('description'), itemCol.length);

      itemCol.add(model);
      console.log('AddItem [%s] items after Insert:[%s]', model.get('description'), itemCol.length);
      self.insertItemCollection(itemCol);
      return itemCol;
    },

    insertItemCollection: function(itemCol) {
        var self = this;
        console.log('INSERT ITEM COLLECTION!!!!!!!!!!! [%s]', itemCol.length);
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
      taccion: "",
      feaccion: "",
      slug: "budgeto nuevoO",
      estado_alta:'media',
      nivel_ejecucion: "enevaluacion",
      nivel_importancia: 'alta',
      description: "",
      items:[]
    },


  });


  Entities.BudgetQueryFacet = Backbone.Model.extend({
    //urlRoot: "/comprobantes",
    whoami: 'ActionQueryFacet:comprobante.js ',

    schema: {
        fedesde:  {type: 'Date',   title: 'Desde', placeholder:'dd/mm/aaaa', yearEnd:2018},
        fehasta:  {type: 'Date',   title: 'HastaA', placeholder:'dd/mm/aaaa', yearEnd:2018},
        tipomov:  {type: 'Select', options: utils.tipoBudgetMovimList, title:'Tipo de Movimiento' },
        area:     {type: 'Select', options: utils.actionAreasOptionList, title:'Área/Nodo' },
        slug:     {type: 'Text',   title: 'Denominación'},
        ejecucion:{type: 'Select', options: utils.budgetEjecucionOptionList, title:'Nivel ejecución' },
    },

    defaults: {
      fedesde:'',
      fehasta:'',
      area: '',
      slug: '',
      ejecucion:''
    }
  });




  var filterFactory = function (budgets){
    var fd = DocManager.Entities.FilteredCollection({
        collection: budgets,

        filterFunction: function(filterCriterion){
          var criteria = filterCriterion.toLowerCase();
          return function(budget){
            //console.log('filterfunction:[%s]vs [%s]/[%s]/[%s]',criteria,budget.get("taccion"),budget.get("cnumber"),budget.get("slug"));
            if(budget.get("taccion").toLowerCase().indexOf(criteria) !== -1
              || budget.get("slug").toLowerCase().indexOf(criteria) !== -1
              || budget.get("cnumber").toLowerCase().indexOf(criteria) !== -1){
              
              return budget;
            }
          }
        }
    });
    return fd;
  };

  var queryFactory = function (budgets){
    var fd = DocManager.Entities.FilteredCollection({
        collection: budgets,

        filterFunction: function(query){
          return function(budget){
            var test = true;
            //if((query.taccion.trim().indexOf(budget.get('taccion'))) === -1 ) test = false;
            console.log('filterfunction:TEST: [%s] [%s] [%s] [%s]',test, query.tgasto,budget.get("tipomov"),budget.get("cnumber"));
            if(query.tgasto && query.tgasto!=='no_definido') {
              if(query.tgasto.trim() !== budget.get('tgasto')) test = false;
            }

            if(query.area && query.area !=='no_definido') {
              if(query.area.trim() !== budget.get('area')) test = false;
            }

            if(query.tipomov && query.tipomov !=='no_definido') {
              if(query.tipomov.trim() !== budget.get('tipomov')) test = false;
            }

            if(query.ejecucion && query.ejecucion!=='no_definido') {
              if(query.ejecucion.trim() !== budget.get('nivel_ejecucion')) test = false;
            }

            if(query.fedesde.getTime()>budget.get('fealta')) test = false;
            if(query.fehasta.getTime()<budget.get('fealta')) test = false;

            if(query.slug){
              if(utils.fstr(budget.get("slug").toLowerCase()).indexOf(utils.fstr(query.slug)) === -1 && budget.get("cnumber").toLowerCase().indexOf(query.slug.toLowerCase()) === -1) test = false;
            }

            if(test) return budget;
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
            //if((query.taccion.trim().indexOf(report.get('taccion'))) === -1 ) test = false;
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
      var accions = new Entities.BudgetCollection();
      var defer = $.Deferred();
      accions.fetch({
        success: function(data){
          defer.resolve(data);
        }
      });
      var promise = defer.promise();
      return promise;
  };

  var fetchBudgetItemlist = function(budgets){
    var itemCol = new Entities.BudgetCollection();
    budgets.each(function(model){
      var items = model.get('items');
      model.set({documid: model.id});
      //console.log('Iterando doc:[%s] itmes[%s]',model.get('cnumber'),model.get('taccion'),items.length);
      _.each(items, function(item){
        if(dao.docum.isType(item.tipoitem, 'notas')){
          var sitems = item.items;
          _.each(sitems, function(sitem){

            var smodel = new Entities.Budget(model.attributes);
            smodel.id = null;
            smodel.set({
              fechagestion: model.get('fecomp'),
              fechagestion_tc: model.get('fecomp_tc'),
              tipoitem: item.tipoitem,
              tipomov: item.tipomov||item.tipoitem,
              product: sitem.product,
              productid: sitem.productid,
              pslug: sitem.pslug,
              tcomputo: sitem.durnominal
            })
            itemCol.add(smodel);

          });

        }else if (dao.docum.isType(item.tipoitem, 'nsolicitud')){
          var sitems = item.items;
          _.each(sitems, function(sitem){

            var smodel = new Entities.Budget(model.attributes);
            smodel.id = null;

            smodel.set({
              fechagestion: model.get('fecomp'),
              fechagestion_tc: model.get('fecomp_tc'),
              tipoitem: item.tipoitem,
              tipomov: item.tipomov||item.tipoitem,
              product: sitem.trequerim,
              productid: "",
              pslug: sitem.description,
              tcomputo: ''
            })
            itemCol.add(smodel);

          });

        }else if (dao.docum.isType(item.tipoitem, 'pemision')){
          var sitems = item.items;
          _.each(sitems, function(sitem){
            var emisiones = sitem.emisiones;
            _.each(emisiones, function(emision){

              var smodel = new Entities.Budget(model.attributes);
              var feg = utils.addOffsetDay(item.fedesde_tc,emision.dayweek);
              smodel.id = null;
              smodel.set({
                fechagestion: feg.date,
                fechagestion_tc: feg.tc,
                tipoitem: item.tipoitem,
                tipomov: item.tipoitem,
                product: sitem.product,
                productid: sitem.productid,
                pslug: sitem.pslug,
                tcomputo: sitem.durnominal
              })
              itemCol.add(smodel);

            });
          });

        }else if (dao.docum.isType(item.tipoitem, 'pdiario')){
            var smodel = new Entities.Budget(model.attributes);
            smodel.id = null;
            smodel.set({
              fechagestion: model.get('fecomp'),
              fechagestion_tc: model.get('fecomp_tc'),
              tipoitem: item.tipoitem,
              tipomov: item.activity,
              product: item.entity,
              productid: item.entityid,
              pslug: item.slug,
              tcomputo: ( (item.feultmod - item.fealta) /1000*60)
            })
            itemCol.add(smodel);

        }else if (dao.docum.isType(item.tipoitem, 'ptecnico')){

          var smodel = new Entities.Budget(model.attributes);
          smodel.id = null;
          smodel.set({
            fechagestion: item.fept,
            fechagestion_tc: item.fept_tc,
            tipoitem: item.tipoitem,
            tipomov: item.estado_qc,
            product: item.product,
            productid: item.productid,
            pslug: item.pslug,
            tcomputo: item.durnominal
          })
          itemCol.add(smodel);

        }
      })

    });
    //console.log('returning ItemCol [%s]',itemCol.length)
    return itemCol;

  };
  
  var isValidDocum = function(docum, query){
    if(query.tcompList.indexOf(docum.get('taccion')) === -1) return false;
    return true;
  };

  var isValidNota = function(docum,item, query){
    if(query.tcompList.indexOf(docum.get('taccion')) === -1) return false;
    if(query.tmovList[docum.get('taccion')].indexOf(item.tipomov) === -1) return false;
    if(query.fedesde > docum.get('fecomp_tc')) return false;
    if(query.fehasta < docum.get('fecomp_tc')) return false;
    return true;
  };
  var isValidPE = function(reportItem, query){
    if(query.tcompList.indexOf(reportItem.get('taccion')) === -1) return false;
    if(query.fedesde > reportItem.get('fechagestion_tc')) return false;
    if(query.fehasta < reportItem.get('fechagestion_tc')) return false;
    return true;
  };
  var isvalidPT = function(reportItem, query){
    if(query.tcompList.indexOf(reportItem.get('taccion')) === -1) return false;
    if(query.fedesde > reportItem.get('fechagestion_tc')) return false;
    if(query.fehasta < reportItem.get('fechagestion_tc')) return false;
    return true;
  };


  var fetchReportItems = function(docum, query, reportCol){
      var items = docum.get('items');
      //console.log('Iterando doc:[%s] itmes[%s]',docum.get('cnumber'),docum.get('taccion'),items.length);
 
      _.each(items, function(item){
        if(dao.docum.isType(item.tipoitem, 'notas')){
          if(isValidNota(docum,item, query)){
            var sitems = item.items;
            _.each(sitems, function(sitem){
              var reportItem = new Entities.ReportItem();
              reportItem.set({
                fechagestion: docum.get('fecomp'),
                fechagestion_tc: docum.get('fecomp_tc'),
                taccion: docum.get('taccion'),
                tipoitem: item.tipoitem,
                cnumber: docum.get('cnumber'),
                documid: docum.id,
                tipomov: item.tipomov||item.tipoitem,
                product: sitem.product,
                productid: sitem.productid,
                pslug: sitem.pslug,
                tcomputo: sitem.durnominal,
                persona: docum.get('persona'),
                personaid: docum.get('personaid'),
                estado_alta: 'alta',
              });

              reportCol.add(reportItem);
            });
          }

        }else if (dao.docum.isType(item.tipoitem, 'pemision')){
          var sitems = item.items;
          _.each(sitems, function(sitem){
            var emisiones = sitem.emisiones;
            _.each(emisiones, function(emision){
              var feg = utils.addOffsetDay(item.fedesde_tc,emision.dayweek);
              var reportItem = new Entities.ReportItem();
              reportItem.set({
                fechagestion: feg.date,
                fechagestion_tc: feg.tc,
                taccion: docum.get('taccion'),
                tipoitem: item.tipoitem,
                cnumber: docum.get('cnumber'),
                documid: docum.id,
                tipomov: item.tipoitem,
                product: sitem.product,
                productid: sitem.productid,
                pslug: sitem.pslug,
                tcomputo: sitem.durnominal,
                persona: docum.get('persona'),
                personaid: docum.get('personaid'),
                estado_alta: 'alta',
              });

              if(isValidPE(reportItem, query)){
                reportCol.add(reportItem);
              }

            });
          });

        }else if (dao.docum.isType(item.tipoitem, 'ptecnico')){
          var reportItem = new Entities.ReportItem();
          reportItem.set({
            fechagestion: item.fept,
            fechagestion_tc: item.fept_tc,
            taccion: docum.get('taccion'),
            tipoitem: item.tipoitem,
            cnumber: docum.get('cnumber'),
            documid: docum.id,
            tipomov: item.estado_qc,
            product: item.product,
            productid: item.productid,
            pslug: item.pslug,
            tcomputo: item.durnominal,
            persona: docum.get('persona'),
            personaid: docum.get('personaid'),
            estado_alta: 'alta',
          });

          if(isvalidPT(reportItem, query)){
            reportCol.add(reportItem);
          }

        }
      })

  };

  var buildReportItemList = function(budgets, query){
    var itemCol = new Entities.ReportItemCollection();
    budgets.each(function(model){
      if(isValidDocum(model, query)){
        fetchReportItems(model, query, itemCol);
      }

    });


    //console.log('returning ItemCol [%s]',itemCol.length)
    return itemCol;

  };


  var fetchProductDuration = function(col, cb){
    var products = new DocManager.Entities.ProductCollection();
    products.fetch({success: function() {
      col.each(function(model){

        var pr = products.find(function(produ){
          //console.log('testing: [%s] vs [%s] / [%s] [%s]',produ.id, model.get('productid'), produ.get('productcode'),model.get('product'))
          return produ.id===model.get('productid');
        });

        if(pr){
          //console.log('pr:[%s] model:[%s]',pr.get('productcode'),model.get('product'));
          var dur = pr.get('patechfacet').durnominal;
          if(!dur ) dur = "0";
          if(parseInt(dur,10)===NaN) dur="0";
          model.set({tcomputo: dur});
        }else{
          model.set({tcomputo: '0'});
        }
      });

      if(cb) cb();
    }});
  };


  var API = {
    getEntities: function(){
      var accions = new Entities.BudgetCollection();
      var defer = $.Deferred();
      accions.fetch({
        success: function(data){
          defer.resolve(data);
        }
      });
      var promise = defer.promise();
      return promise;
    },

    getFilteredCol: function(criteria, cb){
      var fetchingBudgets = API.getEntities();

      $.when(fetchingBudgets).done(function(budgets){
        var filteredBudgets = filterFactory(budgets);
        console.log('getQuery')
        if(criteria){
          filteredBudgets.filter(criteria);
        }
        if(cb) cb(filteredBudgets);
      });
    },

    getFilteredByQueryCol: function(query, cb){
      var fetchingBudgets = queryCollection(query);

      $.when(fetchingBudgets).done(function(budgets){

        var filteredBudgets = queryFactory(budgets);
        if(query){
          filteredBudgets.filter(query);
        }
        fetchProductDuration(filteredBudgets,function(){
          if(cb) cb(filteredBudgets);
        })
      });
    },

    getEntity: function(entityId){
      var accion = new Entities.Budget({_id: entityId});
      var defer = $.Deferred();
      if(entityId){
        accion.fetch({
          success: function(data){
            defer.resolve(data);
          },
          error: function(data){
            defer.resolve(undefined);
          }
       });
      }else{
        defer.resolve(accion);
      }
      return defer.promise();
    },

    fetchNextPrev: function(type, model, cb){
      var query = {};
      if(type === 'fetchnext') query.cnumber = { $gt : model.get('cnumber')}
      if(type === 'fetchprev') query.cnumber = { $lt : model.get('cnumber')}

      var accions= new Entities.BudgetsFindOne();
      accions.fetch({
          data: query,
          type: 'post',
          success: function() {
              if(cb) cb(accions.at(0));
          }
      });
    },
  }


  DocManager.reqres.setHandler("budget:entities", function(){
    return API.getEntities();
  });

  DocManager.reqres.setHandler("budget:filtered:entities", function(criteria, cb){
    return API.getFilteredCol(criteria,cb);
  });

  DocManager.reqres.setHandler("budget:query:entities", function(query, cb){
    return API.getFilteredByQueryCol(query,cb);
  });

  DocManager.reqres.setHandler("budget:entity", function(id){
    return API.getEntity(id);
  });

  DocManager.reqres.setHandler("budget:fetchprev", function(model, cb){
    return API.fetchNextPrev('fetchprev',model, cb);
  });

  DocManager.reqres.setHandler("budget:fetchnext", function(model, cb){
    return API.fetchNextPrev('fetchnext',model, cb);
  });

});
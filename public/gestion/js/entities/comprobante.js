DocManager.module("Entities", function(Entities, DocManager, Backbone, Marionette, $, _){
  
  Entities.Comprobante = Backbone.Model.extend({
    urlRoot: "/comprobantes",
    whoami: 'Entities.Comprobante:comprobante.js ',

    idAttribute: "_id",

    defaults: {
      _id: null,
      tipocomp: "",
      cnumber: "",
      fecomp: "",
      persona: "",
      slug: "",
      estado_alta:'activo',
      nivel_ejecucion: 'alta',
      description: "",
      items:[]
    },

    enabled_predicates:['es_relacion_de'],
    
    initBeforeCreate: function(){
      var fealta = new Date();
      var fecomp = utils.dateToStr(fealta);
      this.set({fealta:fealta.getTime(), fecomp: fecomp});
    },

    beforeSave: function(){
      var feultmod = new Date();
      this.set({feultmod:feultmod.getTime()})
    },

    update: function(cb){
      var self = this;
      self.beforeSave();
      var errors ;
      console.log('ready to SAVE');
      if(!self.save(null,{
        success: function(model){
          //console.log('callback SUCCESS')
          cb(null,model);
        }
      })) {
          cb(self.validationError,null);
      }    
    },

    itemTypes: {
      ptecnico:{
        initNew: function(self, attrs){
          var ptecnico = new Entities.DocumParteTecnico(attrs);
          //console.log('initNew PARTE TECNICO [%s]',ptecnico.get('slug'));
          //do some initialization
          return ptecnico;
        }
      },
      nentrega:{
        initNew: function(self, attrs){
          var item = new Entities.DocumMovimRE(attrs);
          item.set({
            descripcion: self.get('description')
          });
          return item;
        }
      },
      nrecepcion:{
        initNew: function(self, attrs){
          var item = new Entities.DocumMovimRE(attrs);
          item.set({
            descripcion: self.get('description')
          });
          return item;
        }
      },
      pemision:{
        initNew: function(self, attrs){
          var item = new Entities.DocumParteEM(attrs);
          item.set({
            descripcion: self.get('description')
          });
          return item;
        }
      },
    },

    validate: function(attrs, options) {
      //if(!attrs) return;
      var errors = {}
      console.log('validate [%s] [%s] [%s]',attrs, _.has(attrs,'tipocomp'), attrs.tipocomp);

      if (_.has(attrs,'tipocomp') && (!attrs.tipocomp|| attrs.tipocomp.length==0)) {
        errors.tipocomp = "No puede ser nulo";
      }
      if (_.has(attrs,'slug') && ! attrs.slug) {
        errors.slug = "No puede ser nulo";
      }
      if (_.has(attrs,'fecomp')){
        var fecomp_tc = utils.buildDateNum(attrs['fecomp']);
        if(Math.abs(fecomp_tc-(new Date().getTime()))>(1000*60*60*24*30) ){
          errors.fecomp = 'fecha no valida';
        }
        this.set('fecomp_tc',fecomp_tc);
      }

      if( ! _.isEmpty(errors)){
        return errors;
      }
    },

    insertItemCollection: function(itemCol) {
        var self = this;
        console.log('insert items begins items:[%s]', itemCol.length);
        //var itemModel = self[item.get('tipoitem')].initNew(item.attributes);
        self.set({items: itemCol.toJSON()});
    },

    initNewItem: function(item){
      var self = this;
      var itemModel = self.itemTypes[item.get('tipoitem')].initNew(self, item.attributes);
      return itemModel;
    },

    loaditems: function(cb){
        dao.contactfacet.setCol( new ContactFacetCollection(this.get('contactinfo')));

        console.log('[%s] loadcontacts [%s] ',this.whoami, dao.contactfacet.getCol().length);

        cb(dao.contactfacet.getCol());
    },
  });

  //Comprobante Collection
  Entities.ComprobanteCollection = Backbone.Collection.extend({
    whoami: 'Entities.ComprobanteCollection:comprobante.js ',
    url: "/comprobantes",
    model: Entities.Comprobante,
    comparator: "cnumber",
  });

  Entities.ComprobanteFindOne = Backbone.Collection.extend({
    whoami: 'Entities.ComprobanteFindOne:comprobante.js ',
    url: "/comprobante/fetch",
    model: Entities.Comprobante,
    comparator: "cnumber",
  });

  var modelFactory = function(attrs, options){
    //utils.inspect(attrs,1,'modelFactory');
    var model;
    if(attrs.tipoitem==='ptecnico')   model = new Entities.DocumParteTecnico(attrs);
    if(attrs.tipoitem==='nrecepcion') model = new Entities.DocumMovimRE(attrs);
    if(attrs.tipoitem==='nentrega')   model = new Entities.DocumMovimRE(attrs);
    if(attrs.tipoitem==='pemision')   model = new Entities.DocumParteEM(attrs);
    return model;
  };

  Entities.DocumItemsCollection = Backbone.Collection.extend({
    whoami: 'Entities.DocumItemsCollection:comprobante.js ',

    model: function(attrs, options){
      return modelFactory(attrs, options);
      //if(attrs.tipoitem==='ptecnico') return new Entities.DocumParteTecnico(attrs, options);
      //return new Entities.DocumItemCoreFacet(attrs, options);
    },

  });


  /*
   * ******* Parte TECNICO +**********
   */
  Entities.DocumParteTecnico = Backbone.Model.extend({
    whoami: 'DocumParteTecnico:comprobante.js ',

    schema: {
        tipoitem: {type: 'Select',options: utils.tipoDocumItemOptionList },
        slug:     {type: 'Text', title: 'Descripción corta'},
    },

    validate: function(attrs, options) {
      //if(!attrs) return;
      var errors = {}
      console.log('validate [%s] [%s] [%s]',attrs, _.has(attrs,'tipoitem'), attrs.tipoitem);

      if (_.has(attrs,'tipoitem') && (!attrs.tipitem )) {
        errors.tipocomp = "No puede ser nulo";
      }
      if (_.has(attrs,'slug') && ! attrs.slug) {
        errors.slug = "No puede ser nulo";
      }

      if( ! _.isEmpty(errors)){
        return errors;
      }
    },
    insertItemCollection: function(itemCol) {
        var self = this;
        console.log('insert items begins items:[%s]', itemCol.length);
        //var itemModel = self[item.get('tipoitem')].initNew(item.attributes);
        self.set({items: itemCol.toJSON()});
    },

    initNewItem: function(){
      return new Entities.DocumParteTecnicoItem();
    },

    getItems: function(){
      console.log('getItems-2');

      var items = this.get('items');
      return new Entities.PTecnicoItems(items);
    },

    defaults: {
      tipoitem: "",
      slug: "",
      fept: "",
      revision:1,
      product: "",
      pslug:"",
      persona:"",
      sopoentrega:"",
      vbloques:"",
      estado_alta:"",
      nivel_ejecucion:"",
      estado_qc:"ddd",
      resolucion:"",
      framerate:"",
      aspectratio:"",
      rolinstancia:"",
      formatoorig:"",
      au1_content:"",
      au1_channel:"",
      au1_piclevel:"",
      au2_content:"",
      au2_channel:"",
      au2_piclevel:"",
      au3_content:"",
      au3_channel:"",
      au3_piclevel:"",
      au4_content:"",
      au4_channel:"",
      au4_piclevel:"",
      items:[]

    },

  });

  Entities.DocumParteTecnicoItem = Backbone.Model.extend({
    whoami: 'DocumParteTecnicoItem:comprobante.js ',

 
    validate: function(attrs, options) {
      //if(!attrs) return;
      var errors = {}
      //console.log('validate [%s] [%s] [%s]',attrs, _.has(attrs,'ptitcbco'), attrs.ptitcbco);
      //utils.inspect(attrs,1,'pti');

      if (_.has(attrs,'pticaso') && (!attrs.pticaso )) {
        errors.pticaso = "No puede ser nulo";
      }
      if (_.has(attrs,'ptitcbco') && ! attrs.ptitcbco) {
        errors.ptitcbco = "No puede ser nulo";
      }
      if (_.has(attrs,'ptitcbco')){
        this.set('ptitcbco',utils.parseTC(attrs.ptitcbco));
        console.log('ptitcbco: [%s]',this.get('ptitcbco'));
      }
      if (_.has(attrs,'ptiduracion')){
        this.set('ptiduracion',utils.parseTC(attrs.ptiduracion));
        console.log('ptiduracion: [%s]',this.get('ptiduracion'));
      }
      if (_.has(attrs,'ptitcabs')){
        this.set('ptitcabs',utils.parseTC(attrs.ptitcabs));
        console.log('ptitcabs: [%s]',this.get('ptitcabs'));
      }

      if( ! _.isEmpty(errors)){
        return errors;
      }
    },

    defaults: {
      pticaso: '',
      ptiseveridad: '',
      ptidescription: '',
      ptitcbco: '',
      ptiduracion: '',
      pticanal: '',
      ptitcabs: ''
    },

  });

  Entities.PTecnicoItems = Backbone.Collection.extend({
    whoami: 'Entities.PTecnicoItems:comprobante.js ',
    model: Entities.DocumParteTecnicoItem,
    comparator: "ptitcbco",
  });


  /*
   * ******* Movim Recepcion Entrega +**********
   */
  Entities.DocumMovimRE = Backbone.Model.extend({
    whoami: 'DocumMovimRE:comprobante.js ',

    validate: function(attrs, options) {
      //if(!attrs) return;
      var errors = {}
      console.log('validate [%s] [%s] [%s]',attrs, _.has(attrs,'tipoitem'), attrs.tipoitem);

      if (_.has(attrs,'tipoitem') && (!attrs.tipitem )) {
        errors.tipocomp = "No puede ser nulo";
      }
      if (_.has(attrs,'slug') && ! attrs.slug) {
        errors.slug = "No puede ser nulo";
      }

      if( ! _.isEmpty(errors)){
        return errors;
      }
    },
    insertItemCollection: function(itemCol) {
        var self = this;
        console.log('insert items begins items:[%s]', itemCol.length);
        //var itemModel = self[item.get('tipoitem')].initNew(item.attributes);
        self.set({items: itemCol.toJSON()});
    },

    getItems: function(){
      console.log('getItems-1');
      var items = this.get('items');
      return new Entities.MovimREItems(items);
    },

    initNewItem: function(){
      return new Entities.DocumMovimREItem();
    },

    defaults: {
      tipoitem: "",
      slug: "",
      tipomov: "",
      persona: "",
      mediofisico: "",
      soporte_slug: "",
      soporte_id: "",
      descripcion:"",
      items:[]
    },

  });

  Entities.DocumMovimREItem = Backbone.Model.extend({
    whoami: 'DocumMovimREItem:comprobante.js ',

 
    validate: function(attrs, options) {
      //if(!attrs) return;
      var errors = {}
      //console.log('validate [%s] [%s] [%s]',attrs, _.has(attrs,'ptitcbco'), attrs.ptitcbco);
      //utils.inspect(attrs,1,'pti');

      if (_.has(attrs,'product') && (!attrs.product )) {
        errors.pticaso = "No puede ser nulo";
      }
      if( ! _.isEmpty(errors)){
        return errors;
      }
    },

    defaults: {
      product: '',
      pslug:'',
      comentario: '',
      durnominal:'',
    },
  });

  Entities.MovimREItems = Backbone.Collection.extend({
    whoami: 'Entities.MovimREItems:comprobante.js ',
    model: Entities.DocumMovimREItem,
    comparator: "product",
  });

// fin Movim Recepcion entrega

  /*
   * ******* Parte de Emisión +**********
   */
  Entities.DocumParteEM = Backbone.Model.extend({
    whoami: 'DocumParteEM:comprobante.js ',

    validate: function(attrs, options) {
      //if(!attrs) return;
      var errors = {}
      console.log('validate [%s] [%s] [%s]',attrs, _.has(attrs,'tipoitem'), attrs.tipoitem);

      if (_.has(attrs,'tipoitem') && (!attrs.tipitem )) {
        errors.tipocomp = "No puede ser nulo";
      }
      if (_.has(attrs,'slug') && ! attrs.slug) {
        errors.slug = "No puede ser nulo";
      }

      if (_.has(attrs,'fedesde')){
        var fecha = utils.buildDateNum(attrs['fedesde']);
        this.set('fedesde_tc',fecha);
      }
      if (_.has(attrs,'fehasta')){
        var fecha = utils.buildDateNum(attrs['fehasta']);
        this.set('fehasta_tc',fecha);
      }

      if( ! _.isEmpty(errors)){
        return errors;
      }
    },
    insertItemCollection: function(itemCol) {
        var self = this;
        console.log('insert items begins items:[%s]', itemCol.length);
        self.set({items: itemCol.toJSON()});
    },

    getItems: function(){
      var items = this.get('items');
      return new Entities.ParteEMItems(items);
    },

    initNewItem: function(){
      return new Entities.DocumParteEMItem();
    },

    defaults: {
      tipoitem: "",
      tipoemis:"",
      slug: "",
      fedesde:"",
      fehasta:"",
      cobertura:"",
      fuente:"",
      persona: "",
      items:[]
    },

  });

  Entities.DocumParteEMItem = Backbone.Model.extend({
    whoami: 'DocumParteEMItem:comprobante.js ',

 
    validate: function(attrs, options) {
      //if(!attrs) return;
      var errors = {}
      //console.log('validate [%s] [%s] [%s]',attrs, _.has(attrs,'ptitcbco'), attrs.ptitcbco);
      //utils.inspect(attrs,1,'pti');

      if (_.has(attrs,'product') && (!attrs.product )) {
        errors.product = "No puede ser nulo";
      }
      if( ! _.isEmpty(errors)){
        return errors;
      }
    },

    defaults: {
      product: '',
      pslug:'',
      comentario: '',
      durnominal:'',
      qnopt:"",
      qpt:"",
    },
  });

  Entities.ParteEMItems = Backbone.Collection.extend({
    whoami: 'Entities.ParteEMItems:comprobante.js ',
    model: Entities.DocumParteEMItem,
    comparator: "product",
  });
// fin Parte de emisión



  Entities.DocumItemCoreFacet = Backbone.Model.extend({
 
    whoami: 'DocumItemCoreFacet:comprobante.js ',

    schema: {
        tipoitem: {type: 'Select',options: utils.tipoDocumItemOptionList },
        slug:     {type: 'Text', title: 'Descripción corta'},
    },

    createNewDocument: function(cb){
      //console.log('create New Document BEGIN')
      var self = this;
      var docum = new Entities.Comprobante(self.attributes);

      docum.initBeforeCreate();

      docum.save(null, {
        success: function(model){
          //console.log('callback SUCCESS')
          cb(null,model);
        }
      });
    },

    defaults: {
      tipoitem: "",
      slug: "",
    },

   });

  Entities.DocumCoreFacet = Backbone.Model.extend({
    //urlRoot: "/comprobantes",
    whoami: 'Comrpobante:comprobante.js ',

    schema: {
        tipocomp: {type: 'Select',options: utils.tipoComprobanteOptionList },
        slug:     {type: 'Text', title: 'Asunto'},
        description:  {type: 'Text', title: 'Descripción'},
    },
    //idAttribute: "_id",

    createNewDocument: function(cb){
      //console.log('create New Document BEGIN')
      var self = this;
      var docum = new Entities.Comprobante(self.attributes);

      docum.initBeforeCreate();

      docum.save(null, {
        success: function(model){
          //console.log('callback SUCCESS')
          cb(null,model);
        }
      });
    },

    defaults: {
      _id: null,
      tipocomp: "no_definido",
      cnumber: "",
      slug: "",
      description: ""
    },

   });


  //Entities.configureStorage(Entities.Comprobante);


  //Entities.configureStorage(Entities.ComprobanteCollection);
/*
  var initializeComprobantes = function(){
    comprobantes = new Entities.ComprobanteCollection([
      { id: 1, firstName: "Alice", lastName: "Arten", phoneNumber: "555-0184" },
      { id: 2, firstName: "Bob", lastName: "Brigham", phoneNumber: "555-0163" },
      { id: 3, firstName: "Charlie", lastName: "Campbell", phoneNumber: "555-0129" }
    ]);
    comprobantes.forEach(function(comprobante){
      comprobante.save();
    });
    return comprobantes.models;
  };
*/

  var filterFactory = function (documents){
    var fd = DocManager.Entities.FilteredCollection({
        collection: documents,

        filterFunction: function(filterCriterion){
          var criteria = filterCriterion.toLowerCase();
          return function(document){
            console.log('filterfunction:[%s]vs [%s]/[%s]/[%s]',criteria,document.get("tipocomp"),document.get("cnumber"),document.get("slug"));
            if(document.get("tipocomp").toLowerCase().indexOf(criteria) !== -1
              || document.get("slug").toLowerCase().indexOf(criteria) !== -1
              || document.get("cnumber").toLowerCase().indexOf(criteria) !== -1){
              
              return document;
            }
          }
        }
    });
    return fd;
  };


  var API = {
    getEntities: function(){
      //console.log('getFilteredCol: 1-01');
      var comprobantes = new Entities.ComprobanteCollection();
      var defer = $.Deferred();
      comprobantes.fetch({
        success: function(data){
          //console.log('getFilteredCol: 1-02');
          defer.resolve(data);
        }
      });
      var promise = defer.promise();
      //console.log('getFilteredCol: 1-03');
      return promise;
    },

    getFilteredCol: function(criteria, cb){
      //console.log('getFilteredCol: 1');
      var fetchingDocuments = API.getEntities();
      //console.log('getFilteredCol: 2');

      $.when(fetchingDocuments).done(function(documents){
        //console.log('getFilteredCol: 3');
        var filteredDocuments = filterFactory(documents);
        console.log('getFilteredCol: [%s]',criteria);
        if(criteria){
          filteredDocuments.filter(criteria);
        }
        if(cb) cb(filteredDocuments);
      });
      //console.log('getFilteredCol: 5');
    },

    getEntity: function(entityId){
      var comprobante = new Entities.Comprobante({_id: entityId});
      var defer = $.Deferred();
      comprobante.fetch({
        success: function(data){
          defer.resolve(data);
        },
        error: function(data){
          defer.resolve(undefined);
        }
      });
      return defer.promise();
    },

    fetchNextPrev: function(type, model, cb){
      console.log('fetchNextPrev:comprobantes.js begins model:[%s]',model.get('cnumber'));
      var query = {};
      if(type === 'fetchnext') query.cnumber = { $gt : model.get('cnumber')}
      if(type === 'fetchprev') query.cnumber = { $lt : model.get('cnumber')}

      var comprobantes= new Entities.ComprobanteFindOne();
      comprobantes.fetch({
          data: query,
          type: 'post',
          success: function() {
              console.log('callback: length[%s]  model[%s]',comprobantes.length, comprobantes.at(0).get('cnumber'))
              if(cb) cb(comprobantes.at(0));
          }
      });
    }

  };

  DocManager.reqres.setHandler("document:entities", function(){
    return API.getEntities();
  });

  DocManager.reqres.setHandler("document:filtered:entities", function(criteria, cb){
    return API.getFilteredCol(criteria,cb);
  });

  DocManager.reqres.setHandler("document:entity", function(id){
    return API.getEntity(id);
  });

  DocManager.reqres.setHandler("document:fetchprev", function(model, cb){
    return API.fetchNextPrev('fetchprev',model, cb);
  });

  DocManager.reqres.setHandler("document:fetchnext", function(model, cb){
    return API.fetchNextPrev('fetchnext',model, cb);
  });

});

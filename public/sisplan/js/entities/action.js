DocManager.module("Entities", function(Entities, DocManager, Backbone, Marionette, $, _){
  
  Entities.Action = Backbone.Model.extend({
    urlRoot: "/acciones",
    whoami: 'Entities.Action:action.js ',

    idAttribute: "_id",

    defaults: {
      _id: null,
      cnumber: "",
      slug: "nueva acción",
      tregistro:"",
      taccion: "",
      feaccion: "",
      lugarfecha:"",
      fechagestion: "",
      tipomov:"",

      description: "",

      estado_alta:'media',
      nivel_ejecucion: 'enproceso',
      nivel_importancia: 'alta',
      descriptores: "",
      fecomp:"",

      objetivo:"",
      nodo:"",
      area:"",
      requirente:"",
      expediente:"",
      contraparte:"",
      estado_alta:'activo',
      nivel_ejecucion: 'enpreparacion',
      nivel_importancia: 'media',

    },

    enabled_predicates:['es_relacion_de'],
    
    initBeforeCreate: function(cb){
      var self = this,
          fealta = new Date(),
          fecomp = utils.dateToStr(fealta);

      self.set({fealta:fealta.getTime(), fecomp: fecomp});
      console.log('InitBeforeCreate!!!!!!!!!!!!!!!!!!!!! [%s][%s]', self.get('taccion'),self.get('slug'));

      dao.gestionUser.getUser(DocManager, function (user){
        self.set({useralta: user.id, userultmod: user.id});
        var person;
        var related = user.get('es_usuario_de');
        if(related){
          person = related[0];
          if(person){
            console.log('Persona FOUNDed [%s]', person.code);
            self.set({persona: person.code,personaid: person.id })
          }
        } 
        if(cb) cb(self);
      });
    },

    beforeSave: function(cb){
      var self = this;
      console.log('initBefore SAVE')
      var feultmod = new Date();
      self.set({feultmod:feultmod.getTime()})
      dao.gestionUser.getUser(DocManager, function (user){
        if (! self.get('useralta')) self.set({useralta: user.id});
        self.set({userultmod: user.id});
        if(cb) cb(self);
      });

    },
    
    
    update: function(cb){
      console.log('[%s] UPDATE MODEL',this.whoami);
      var self = this;
      self.beforeSave(function(docum){
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
    mainHeaderFacet: function(){
      return new Entities.ActionHeaderFacet(this.attributes);
    },

  });


  Entities.ActionCoreFacet = Backbone.Model.extend({
    //urlRoot: "/comprobantes",
    whoami: 'ActionCoreFacet:action.js ',

    schema: {
        tregistro: {type: 'Select',options: utils.tipoActionEntityList, title:'Tipo de entidad' },
        taccion:   {type: 'Select',options: utils.tipoActionIniciativeList, title:'Tipo de iniciativa' },
        slug:      {type: 'Text', title: 'Denominación'},
        description: {type: 'TextArea', title: 'Descripción'},
    },
    //idAttribute: "_id",

    createNewAction: function(cb){
      var self = this;
      var action = new Entities.Action(self.attributes);

      console.log('[%s]: createNewAction',self.whoami);

      action.initBeforeCreate(function(action){
        action.save(null, {
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

    defaults: {
      _id: null,
      cnumber: "",
      tregistro:"",
      taccion: "",
      feaccion: "",
      slug: "nueva acción",
      estado_alta:'media',
      nivel_ejecucion: 'enproceso',
      nivel_importancia: 'alta',
      description: "",

    },

   });

  Entities.ActionHeaderFacet = Backbone.Model.extend({
    //urlRoot: "/comprobantes",
    whoami: 'ActionHeaderFacet:action.js ',

    schema: {
        tregistro: {type: 'Select',options: utils.tipoActionEntityList, title:'Tipo de entidad' },
        taccion:   {type: 'Select',options: utils.tipoActionIniciativeList, title:'Tipo de iniciativa' },
        slug:      {type: 'Text', title: 'Denominación'},
        feaccion:      {type: 'Text', title: 'Fecha acción'},
        lugarfecha: {type: 'Text', title: 'Detalle lugar/fecha'},
        description: {type: 'TextArea', title: 'Descripción'},
        objetivo: {type: 'TextArea', title: 'Objetivos'},
        area:   {type: 'Select',options: utils.actionAreasOptionList, title:'Area ' },
        estado_alta:   {type: 'Select',options: utils.actionAltaOptionList, title:'Estado alta ' },
        nivel_ejecucion: {type: 'Select',options: utils.actionEjecucionOptionList, title:'Nivel ejecución' },
        nivel_importancia: {type: 'Select',options: utils.actionEjecucionOptionList, title:'Importancia' },
        descriptores: {type: 'Text', title: 'Descriptores'},
    },
    //idAttribute: "_id",

    updateModel: function(model){
      var self = this.
          area;

      model.set(this.attributes)
      area = model.get('area')
      if(area){
        model.set('nodo', utils.fetchNode(utils.actionAreasOptionList, area));
      }
      return model;
    },

    defaults: {
      _id: null,
      cnumber: "",
      tregistro:"",
      taccion: "",
      slug: "",
      feaccion: "",
      lugarfecha:"",
      description: "",
      objetivo:"",
      area:"",
      estado_alta:'activo',
      nivel_ejecucion: 'enpreparacion',
      nivel_importancia: 'media',
      descriptores: ""
    },

   });

  //Accion Collection
  Entities.ActionCollection = Backbone.Collection.extend({
    whoami: 'Entities.ActionCollection:accion.js ',
    url: "/acciones",
    model: Entities.Action,
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
  });

  Entities.ActionNavCollection = Backbone.Collection.extend({
    whoami: 'Entities.ActionCollection:accion.js ',
    url: "/navegar/acciones",
    model: Entities.Action,
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
  });
  
  Entities.ActionsFindOne = Backbone.Collection.extend({
    whoami: 'Entities.ActionsFindOne:accion.js ',
    url: "/accion/fetch",
    model: Entities.Action,
    comparator: "cnumber",
  });

  Entities.ActionsUpdate = Backbone.Collection.extend({
    whoami: 'Entities.ActionsUpdate:accion.js ',
    url: "/actualizar/accions",
    model: Entities.Action,
    comparator: "cnumber",
  });


  /*
   * ******* FACETA PARA CREAR UNA NUEVA ACCION +**********
   */
  Entities.ActionNewFacet = Backbone.Model.extend({
    whoami: 'ActionNewFacet:accion.js ',

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
      slug: "actiono nuevoO",
      estado_alta:'media',
      nivel_ejecucion: 'enproceso',
      nivel_importancia: 'alta',
      description: "",
      items:[]
    },


  });



  var filterFactory = function (actions){
    var fd = DocManager.Entities.FilteredCollection({
        collection: actions,

        filterFunction: function(filterCriterion){
          var criteria = filterCriterion.toLowerCase();
          return function(action){
            //console.log('filterfunction:[%s]vs [%s]/[%s]/[%s]',criteria,action.get("taccion"),action.get("cnumber"),action.get("slug"));
            if(action.get("taccion").toLowerCase().indexOf(criteria) !== -1
              || action.get("slug").toLowerCase().indexOf(criteria) !== -1
              || action.get("cnumber").toLowerCase().indexOf(criteria) !== -1){
              
              return action;
            }
          }
        }
    });
    return fd;
  };

  var queryFactory = function (actions){
    var fd = DocManager.Entities.FilteredCollection({
        collection: actions,

        filterFunction: function(query){
          return function(action){
            var test = true;
            //if((query.taccion.trim().indexOf(action.get('taccion'))) === -1 ) test = false;
            console.log('filterfunction:TEST: [%s] [%s] [%s] [%s]',test, query.tipoitem,action.get("tipoitem"),action.get("cnumber"));
            if(query.tipoitem && query.tipoitem!=='no_definido') {
              if(query.tipoitem.trim() !== action.get('tipoitem')) test = false;
            }
            if(query.tipomov && query.tipomov !=='no_definido') {
              if(query.tipomov.trim() !== action.get('tipomov')) test = false;
            }
            if(query.estado && query.estado!=='no_definido') {
              if(query.estado.trim() !== action.get('estado_alta')) test = false;
            }
            if(query.fedesde.getTime()>action.get('fechagestion_tc')) test = false;
            if(query.fehasta.getTime()<action.get('fechagestion_tc')) test = false;

            if(query.slug){
              if(utils.fstr(action.get("slug").toLowerCase()).indexOf(utils.fstr(query.slug)) === -1 && action.get("cnumber").toLowerCase().indexOf(query.slug.toLowerCase()) === -1) test = false;
            }

            if(test) return action;
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
      var accions = new Entities.ActionCollection();
      var defer = $.Deferred();
      accions.fetch({
        success: function(data){
          defer.resolve(data);
        }
      });
      var promise = defer.promise();
      return promise;
  };

  var fetchActionItemlist = function(actions){
    var itemCol = new Entities.ActionCollection();
    actions.each(function(model){
      var items = model.get('items');
      model.set({documid: model.id});
      //console.log('Iterando doc:[%s] itmes[%s]',model.get('cnumber'),model.get('taccion'),items.length);
      _.each(items, function(item){
        if(dao.docum.isType(item.tipoitem, 'notas')){
          var sitems = item.items;
          _.each(sitems, function(sitem){

            var smodel = new Entities.Action(model.attributes);
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

            var smodel = new Entities.Action(model.attributes);
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

              var smodel = new Entities.Action(model.attributes);
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
            var smodel = new Entities.Action(model.attributes);
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

          var smodel = new Entities.Action(model.attributes);
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

  var buildReportItemList = function(actions, query){
    var itemCol = new Entities.ReportItemCollection();
    actions.each(function(model){
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
      var accions = new Entities.ActionCollection();
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
      var fetchingActions = API.getEntities();

      $.when(fetchingActions).done(function(actions){
        var filteredActions = filterFactory(actions);
        console.log('getQuery')
        if(criteria){
          filteredActions.filter(criteria);
        }
        if(cb) cb(filteredActions);
      });
    },

    getFilteredByQueryCol: function(query, cb){
      var fetchingActions = queryCollection(query);

      $.when(fetchingActions).done(function(actions){
        var docitems = fetchActionItemlist(actions);

        var filteredActions = queryFactory(docitems);
        if(query){
          filteredActions.filter(query);
        }
        fetchProductDuration(filteredActions,function(){
          if(cb) cb(filteredActions);
        })
      });
    },

    getEntity: function(entityId){
      var accion = new Entities.Action({_id: entityId});
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

      var accions= new Entities.ActionsFindOne();
      accions.fetch({
          data: query,
          type: 'post',
          success: function() {
              if(cb) cb(accions.at(0));
          }
      });
    },
    fetchBudget: function(model, opt, cb){
      var query = {};
      query.owner_id = model.id;

      var budgetCol = new Entities.BudgetNavCollection();
      budgetCol.fetch({
          data: query,
          type: 'post',
          success: function() {
              if(cb) cb(budgetCol);
          }
      });

    },
    determinActionCost: function(col){
      var costo = 0;
      if (!col.length) return costo;
      col.each(function(model){
        costo += parseInt(model.get('importe'));
      });
      return costo;
    },

  };


  DocManager.reqres.setHandler("action:evaluate:cost", function(model, opt, cb){
    return API.determinActionCost(model, opt, cb);
  });

  DocManager.reqres.setHandler("action:fetch:budget", function(model, opt, cb){
    return API.fetchBudget(model, opt, cb);
  });

  DocManager.reqres.setHandler("action:entities", function(){
    return API.getEntities();
  });

  DocManager.reqres.setHandler("action:filtered:entities", function(criteria, cb){
    return API.getFilteredCol(criteria,cb);
  });

  DocManager.reqres.setHandler("action:query:entities", function(query, cb){
    return API.getFilteredByQueryCol(query,cb);
  });

  DocManager.reqres.setHandler("action:entity", function(id){
    return API.getEntity(id);
  });

  DocManager.reqres.setHandler("action:fetchprev", function(model, cb){
    return API.fetchNextPrev('fetchprev',model, cb);
  });

  DocManager.reqres.setHandler("action:fetchnext", function(model, cb){
    return API.fetchNextPrev('fetchnext',model, cb);
  });

});

DocManager.module("Entities", function(Entities, DocManager, Backbone, Marionette, $, _){
  Entities.Product = Backbone.Model.extend({

    whoami: 'Product:models.js ',
    urlRoot: "/productos",

    idAttribute: "_id",

    defaults: {
        _id: null,
        tipoproducto:"",
        productcode:"",
 
        slug: "",
        denom: "",

        nivel_importancia: "medio",
        estado_alta: "activo",
        nivel_ejecucion: "planificado",

        project:{},
        patechfacet:{},
        clasification:{},

        notas:[],
        branding:[],
        descripTagList:[],
        contentTagList:[],
    },

    loadchilds: function(ancestor, predicates, cb){
        var self = this,
            querydata = [],
            products= new Entities.ProductChildCollection(),
            query = {};

        console.log('loadchilds:models.js BEGINS [%s] : [%s]',ancestor.get('productcode'),predicates);
        if(!_.isArray(predicates))
            if(_.isObject(predicates)) querydata.push(predicates);
            else return null;
        else querydata = predicates;

        query = {$or: querydata };

        products.fetch({
            data: query,
            type: 'post',
            success: function() {
                if(cb) cb(products);
            }
        });
    },

    loaddocuments:function (cb) {
        var self = this;
        //console.log('loadpacapitulos:models.js begins es_capitulo_de: [%s]',self.get('productcode'));
        //var query = {$or: [{'es_capitulo_de.id':self.id},{'es_instancia_de.id':self.id}, {'es_coleccion_de.id':self.id}]};
        //var query = {cnumber: 'T100006'};
        //var query = {'items.productid': '5252a139a8907e8901000003'};
        var query = {$or: [{'items.items.productid': self.id}, {'items.productid': self.id}]};

        var documCol= new DocManager.Entities.DocumentCollection();
        //console.log('loadpacapitulos:models.js query  [%s] ',query['es_capitulo_de.id']);

        documCol.fetch({
            data: query,
            type: 'post',
            success: function() {
                if(cb) cb(documCol);
            }
        });
    },

    validate: function(attrs, options) {
      var errors = {}
      if (! attrs.productcode) {
        errors.productcode = "no puede quedar en blanco";
      }
      if (! attrs.slug) {
        errors.slug = "no puede quedar en blanco";
      }
      else{
        if (attrs.denom.length < 2) {
          errors.denom = "demasiado corto";
        }
      }
      if( ! _.isEmpty(errors)){
        return errors;
      }
    }
  });

  //Entities.configureStorage(Entities.Product);

  Entities.ProductCollection = Backbone.Collection.extend({

    model: Entities.Product,
    url: "/productos",

    comparator: "productcode"
  });

  Entities.ProductChildCollection = Backbone.Collection.extend({

    model: Entities.Product,

    comparator: "productcode",

    url: "/navegar/productos"
});


  var filterFactory = function (entities){
    var fd = DocManager.Entities.FilteredCollection({
        collection: entities,

        filterFunction: function(filterCriterion){
          var criteria = utils.fstr(filterCriterion.toLowerCase());
          return function(document){
            //console.log('filterfunction:[%s]vs [%s]/[%s]/[%s]',criteria,document.get("tipocomp"),document.get("cnumber"),document.get("slug"));
            if(document.get("productcode").toLowerCase().indexOf(criteria) !== -1
              || document.get("denom").toLowerCase().indexOf(criteria) !== -1
              || utils.fstr(document.get("slug").toLowerCase()).indexOf(criteria) !== -1){
              
              return document;
            }
          }
        }
    });
    return fd;
  };

  var API = {
    getEntities: function(){
      var entities = new Entities.ProductCollection();
      var defer = $.Deferred();

      entities.fetch({
        success: function(data){
          defer.resolve(data);
        }
      });

      var promise = defer.promise();
      return promise;
    },

    getFilteredCol: function(criteria, cb){
      //console.log('getFilteredCol: 1');
      var fetchingEntities = API.getEntities();
      //console.log('getFilteredCol: 2');

      $.when(fetchingEntities).done(function(entities){
        //console.log('getFilteredCol: 3');
        var filteredEntities = filterFactory(entities);
        console.log('getFilteredCol: [%s]',criteria);
        if(criteria){
            filteredEntities.filter(criteria);
        }
        if(cb) cb(filteredEntities);
      });
    },

    getEntity: function(entityId){
      var entity = new Entities.Product({_id: entityId});
      var defer = $.Deferred();

      entity.fetch({
        success: function(data){
          defer.resolve(data);
        },
        error: function(data){
          defer.resolve(undefined);
        }
      });
      return defer.promise();
    }

  };

  DocManager.reqres.setHandler("product:entities", function(){
    return API.getEntities();
  });

  DocManager.reqres.setHandler("product:entity", function(id){
    return API.getEntity(id);
  });

  DocManager.reqres.setHandler("product:filtered:entities", function(criteria, cb){
    return API.getFilteredCol(criteria,cb);
  });

});


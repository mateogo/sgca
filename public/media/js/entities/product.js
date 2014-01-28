MediaManager.module("Entities", function(Entities, MediaManager, Backbone, Marionette, $, _){

  var realization = ['directores', 'productores', 'coproductores', 'realizadores', 'guionistas', 'reparto', 'conduccion', 'fotografia', 'camaras', 'edicion', 'animacion', 'sonido', 'musicos', 'escenografia', 'paisprod', 'provinciaprod' ];
  var realizationTitles = ['Director', 'Productor', 'Coproductor', 'Realizador', 'Guionistas', 'Actores', 'Conducción', 'DF', 'Cámaras', 'Edición', 'Animación', 'Sonido', 'Música original', 'Arte', 'País', 'Provincia' ];

  var clasification = ['vocesautorizadas', 'descriptores', 'descripcion' ];
  var clasificationTitles = ['Voces autorizadas', 'Descriptores', 'Descripción' ];


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

        var documCol= new MediaManager.Entities.DocumentCollection();
        //console.log('loadpacapitulos:models.js query  [%s] ',query['es_capitulo_de.id']);

        documCol.fetch({
            data: query,
            type: 'post',
            success: function() {
                if(cb) cb(documCol);
            }
        });
    },

    getFacet: function(token){
      var self = this;
      var facet ;

      if(realization.indexOf(token)!= -1){
        if(!self.get('realization')){
          self.set('realization',{});
        }
        facet = new Entities.ProductTextFacet(
            { key:'realization',
              datafield: self.get('realization')[token],
              datatitle: realizationTitles[realization.indexOf(token)],
              name: token
            }
        );
      }
      if(clasification.indexOf(token)!= -1){
        facet = new Entities.ProductTextFacet(
            { key:'clasification',
              datafield: self.get('clasification')[token],
              datatitle: clasificationTitles[clasification.indexOf(token)],
              name: token
            }
        );
      }// endif

      console.log('RETURN FACET: [%s] [%s]',facet.get('datafield'),facet.get('datatitle'))
      return facet;
    },

    setFacet: function(token, facet){
      var self = this;
      var query = {};
      var list = [];

      var key = facet.get('key');

      var data = self.get(key);
      data[facet.get('name')] = facet.get('datafield');
      
      list.push(self.id );
      query.nodes = list;
      query.newdata = {};
      query.newdata[key] = data;
 
      console.log('UPDATE: [%s] [%s] [%s]', key, token, data[facet.get('name')])
      var update = new Entities.ProductsUpdate();
      update.fetch({
        data: query,
        type: 'post',
        success: function() {
          console.log('success!!!!!')
            if(cb) cb();
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

    url: "/navegar/productos",

    comparator: "productcode",
  });

  Entities.ProductsUpdate = Backbone.Collection.extend({
    whoami: 'Entities.ProductsUpdate:product.js ',

    model: Entities.Product,

    url: "/actualizar/productos",

    comparator: "productcode",
  });

  Entities.AssetVideoUrl = Backbone.Model.extend({
    whoami: 'AssetVideoUrl:product.js ',
    urlRoot: "/asset/render/video",

    idAttribute: "_id",
    
  });




  Entities.ProductTextFacet = Backbone.Model.extend({
    //urlRoot: "/comprobantes",
    whoami: 'ProductTextFacet:product.js ',

    schema: {
        datafield:  {type: 'TextArea', title: ''},
    },
    //idAttribute: "_id",

    defaults: {
      datafield: "",
      name:"",
      key:"",
      datatitle:"",

    },

  });




  var filterFactory = function (entities){
    var fd = MediaManager.Entities.FilteredCollection({
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

  MediaManager.reqres.setHandler("product:entities", function(){
    return API.getEntities();
  });

  MediaManager.reqres.setHandler("product:entity", function(id){
    return API.getEntity(id);
  });

  MediaManager.reqres.setHandler("product:filtered:entities", function(criteria, cb){
    return API.getFilteredCol(criteria,cb);
  });

});


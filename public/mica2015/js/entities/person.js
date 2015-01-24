DocManager.module("Entities", function(Entities, DocManager, Backbone, Marionette, $, _){
  Entities.Person = Backbone.Model.extend({

    whoami: 'Person: person.js ',
    urlRoot: "/personas",

    idAttribute: "_id",

    defaults: {
        _id: null,
        tipopersona:"persona",
        name: '',
        displayName: '',
        nickName: '',
        tipojuridico:{
            pfisica: true,
            pjuridica: false,
            pideal: true,
            porganismo: false
        },
        roles:{
            adherente:false,
            proveedor:false,
            empleado:false,
        },
        estado_alta: "activo",
        descriptores: "",
        taglist:[],
        description: "",
 
        contactinfo:[],
        notas:[],
        branding:[],
    },

    initBeforeSave: function(){
      var feultmod = new Date();
      this.set({feultmod:feultmod.getTime()})
      if(! this.get('fealta')){
        this.set({fealta:feultmod.getTime()});
      }

    },

    insertuser: function(user, cb){
        //console.log('[%s] insert USER BEGINS',this.whoami);
        //utils.inspect(user.attributes,0, 'INSERT USER');
        
        var self = this,
            predicate = 'es_usuario_de',
            deferreds = [],
            defer;

        user.beforeUpdate();
        //user.set({feum:new Date().getTime()});
        //user.set({denom:user.get('slug')});

        user = self.buildPredicateData(self, user, 1, 100, predicate);
        //console.log('[%s] insertUSER READY TO SAVE',this.whoami);

        defer = user.save(null, {
            success: function (user) {
                console.log('insert user:SUCCESS: [%s] ',user.get('username'));
            },
            error: function () {
                console.log('ERROR: Ocurrió un error al intentar actualizar este nodo: [%s]',user.get('username'));
            }
        });
        deferreds.push(defer);

        $.when.apply(null, deferreds).done(function(){
            console.log('UPDATE user DONE!! id:[%s]',user.id);
            /*

            if(!notas) notas = [];
            data.id = user.id
            data.slug = user.get('slug');
            data.fecha = user.get('fecha');
            data.tiponota = user.get('tiponota');
            data.responsable = user.get('responsable');
            data.url = user.get('url');

            notas.push(data);
            self.set({notas: notas});
            */
            if(cb) cb(user);
        });
    },

    buildPredicateData: function (ancestor, child, seq, numprefix, predicate) {
        var ancestordata = {
                id: ancestor.id,
                code: ancestor.get('nickName'),
                slug: ancestor.get('name'),
                order: ancestor.buildRefNumber(seq,(numprefix||100)),
                predicate: predicate
            };
        var tlist = child.fetchFilteredPredicateArray(predicate, child,ancestor);
        tlist.push(ancestordata);
        
        if(predicate === 'es_capitulo_de')  child.set({es_capitulo_de : tlist});
        if(predicate === 'es_coleccion_de') child.set({es_coleccion_de: tlist});
        if(predicate === 'es_instancia_de') child.set({es_instancia_de: tlist});
        if(predicate === 'es_asset_de')     child.set({es_asset_de: tlist});
        if(predicate === 'es_nota_de')      child.set({es_nota_de: tlist});
        if(predicate === 'es_usuario_de')   child.set({es_usuario_de: tlist});
        if(predicate === 'es_miembro_de')   child.set({es_miembro_de: tlist});
        if(predicate === 'es_relacion_de')  child.set({es_relacion_de: tlist});

        return child;
    },


    update: function(cb){
      var self = this;
      self.initBeforeSave();
      self.save(null, {
          success: function (model) {
              console.log('Exito! se insertó una nueva Person');
              if(cb) cb(model);
          },
          error: function () {
              console.log('Error! Ocurrió un error al intentar insertar una nueva Person');
              if(cb) cb(false);
          }
      });
    },

    validate: function(attrs, options) {
      var errors = {}
      if (! attrs.name) {
        errors.firstName = "no puede quedar en blanco";
      }
      if (! attrs.nickName) {
        errors.lastName = "no puede quedar en blanco";
      }
      else{
        if (attrs.displayName.length < 2) {
          errors.lastName = "demasiado corto";
        }
      }
      if( ! _.isEmpty(errors)){
        return errors;
      }
    }
  });

  //Entities.configureStorage(Entities.Person);

  Entities.PersonCollection = Backbone.Collection.extend({

    model: Entities.Person,
    url: "/personas",

    comparator: "nickName"
  });

  var filterFactory = function (entities){
    var fd = DocManager.Entities.FilteredCollection({
        collection: entities,

        filterFunction: function(filterCriterion){
          var criteria = utils.fstr(filterCriterion.toLowerCase());
          return function(document){
            //console.log('filterfunction:[%s]vs [%s]/[%s]/[%s]',criteria,document.get("tipocomp"),document.get("cnumber"),document.get("slug"));
            if(document.get("nickName").toLowerCase().indexOf(criteria) !== -1
              || utils.fstr(document.get("name").toLowerCase()).indexOf(criteria) !== -1
              || document.get("displayName").toLowerCase().indexOf(criteria) !== -1){

              
              return document;
            }
          }
        }
    });
    return fd;
  };

  var API = {
    getEntities: function(){
      var entities = new Entities.PersonCollection();
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
      var entity = new Entities.Person({_id: entityId});
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

  DocManager.reqres.setHandler("person:entities", function(){
    return API.getEntities();
  });

  DocManager.reqres.setHandler("person:entity", function(id){
    return API.getEntity(id);
  });

  DocManager.reqres.setHandler("person:filtered:entities", function(criteria, cb){
    return API.getFilteredCol(criteria,cb);
  });

});


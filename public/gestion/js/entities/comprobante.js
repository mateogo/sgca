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
      description: ""
    },

    enabled_predicates:['es_relacion_de'],
    
    initBeforeCreate: function(){
      var fealta = new Date();
      this.set({fealta:fealta.getTime()});
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

      if( ! _.isEmpty(errors)){
        return errors;
      }
    }
  });


  Entities.ComprobanteCollection = Backbone.Collection.extend({
    whoami: 'Entities.ComprobanteCollection:comprobante.js ',
    url: "/comprobantes",
    model: Entities.Comprobante,
    comparator: "cnumber",
  });


  Entities.DocumCoreFacet = Backbone.Model.extend({
    urlRoot: "/comprobantes",
 
    whoami: 'Comrpobante:comprobante.js ',

    schema: {
        tipocomp: {type: 'Select',options: utils.tipoComprobaneOptionList },
        slug:     {type: 'Text', title: 'Descripción corta'},
        description:  {type: 'TextArea', title: 'Dato'},
    },

    idAttribute: "_id",

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
      fecha: "",
      tipocomp: "",
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
            if(document.get("tipocomp").toLowerCase().indexOf(criteria) !== -1
              || document.get("slug").toLowerCase().indexOf(criteria) !== -1
              || document.get("description").toLowerCase().indexOf(criteria) !== -1
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
        console.log('getFilteredCol: 4');
        if(criteria){
          filteredDocuments.filter(criteria);
        }
        if(cb) cb(documents);
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


});

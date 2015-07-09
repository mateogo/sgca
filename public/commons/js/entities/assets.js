DocManager.module("Entities", function(Entities, DocManager, Backbone, Marionette, $, _){

  Entities.Asset = Backbone.Model.extend({

    urlRoot: "/activos",
    whoami: 'Entities.Asset:asset.js',

    idAttribute: "_id",

    project:null,

    initialize: function () {

    },

    saveAssetData: function(data, cb){
        var self = this;
        self.buildAssetData(data);
        self.save(null, {
            success: function (model) {
                cb(model);
            },
            error: function () {
                cb(model);
           }
        });
    },

    buildAssetData: function(data){
        var self = this;
        var versions = [];
        versions.push(data.fileversion);
        self.set({name: data.name, urlpath:data.urlpath, type: data.fileversion.type, size: data.fileversion.size, slug:data.slug||data.name, denom: data.denom||data.name, versions:versions});
    },

    fetchFilteredPredicateArray: function(predicate, child, ancestor){
        var tlist = child.get(predicate);
        if(!tlist) {
            tlist = [];
        }else{
            tlist = _.filter(tlist,function(element){
                return element && (element.id!==ancestor.id);
            });
        }
        return tlist;
    },

    buildPredicateData: function (ancestor, child, predicate) {
        var ancestordata = {
                id: ancestor.id,
                code: ancestor.get('cnumber') || 'ASSET',
                slug: ancestor.get('slug'),
                predicate: predicate
            };
        var tlist = child.fetchFilteredPredicateArray(predicate, child, ancestor);
        tlist.push(ancestordata);

        child.set('es_asset_de', tlist);

        return child;
    },

    // publica
    linkChildsToAncestor: function (childs, ancestor, predicate, cb) {
        var deferreds = [], 
            defer;
        if(!_.isArray(childs)){
            var tempo = childs;
            childs = [];
            childs.push(tempo);
        }

        // childs es un array
        for (var i = childs.length - 1; i >= 0; i--) {
            var child = childs[i];

            child = child.buildPredicateData(ancestor, child, predicate);
            ///
            defer = child.save(null, {
                success: function (child) {
                },
                error: function () {
                }
            });
            deferreds.push(defer);
        }

        $.when.apply(null, deferreds).done(function(){
            cb();
        });
    },

    updateAsset: function(data, ancestor, cb){
        var self = this,
            predicate = 'es_asset_de';

        self.buildAssetData(data);
        self.linkChildsToAncestor(self, ancestor, predicate, cb);
    },

    assetFolder: function(){
        var today  = new Date();
        var day    = today.getDate()<10 ? '0'+today.getDate() : today.getDate();
        var month = today.getMonth()+1;
        month  = month<10 ? '0'+month : month;
        var folder = _.template('/assets/<%= y %>/<%= m %>/<%= d %>');

        return folder({y:today.getFullYear() ,m:month, d:day});
    },

    defaults: {
        _id: null,
        name: "",
        slug: "",
        denom: "",
        urlpath:"",
        type:"",
        size:"",
        versions:[],
    }
  });

  Entities.AssetCollection = Backbone.Collection.extend({
    whoami: 'Entities.AssetCollection:asstes.js',
    model: Entities.Asset,

    initialize: function (model, options) {
       if(options) this.options = options;
    },
    url: "/recuperar/activos"
  });


  //*************************************************************
  //            Helper Functions
  //*************************************************************
  var queryCollection = function(query){
      var entities = new Entities.AssetCollection();
      var defer = $.Deferred();

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

  var queryFactory = function (entities){
    var fd = DocManager.Entities.FilteredCollection({
        collection: entities,

        filterFunction: function(query){
          return function(node){
            var test = true;
            //if((query.taccion.trim().indexOf(node.get('taccion'))) === -1 ) test = false;
            //console.log('filterfunction:TEST: [%s] [%s] [%s] [%s]',test, query.taccion,node.get("taccion"),node.get("cnumber"));
            if(query.evento) {
              if(query.evento.trim() !== node.get('evento')) test = false;
            }


            if(test) return node;
          }
        }
    });
    return fd;
  };

  //*************************************************************
  //            entity API
  //*************************************************************
  var API = {

    getEntity: function(entityId){
      var request = new Entities.Asset({_id: entityId});
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


    getEntities: function(query){

      var fetchingEntities = queryCollection(query),
          defer = $.Deferred();

      $.when(fetchingEntities).done(function(entities){


        defer.resolve(entities);

      });
      return defer.promise();
    },

    fetchLocalFilteredEntities: function(col, query){
        var filteredEntities = queryFactory(col);
        if(query){
          filteredEntities.filter(query);
        }
        return filteredEntities;
    },

    groupByPredicate: function(assets, parentid){
        var adjuntos = {},
            predicate,
            tokens,
            lista ;

        assets.each(function(asset){
          tokens = asset.get('es_asset_de');
          _.each(tokens, function(token){
            if(token.id = parentid){
              predicate = token.predicate;
              if(adjuntos[predicate]){
                adjuntos[predicate].push(asset.attributes);
              }else{
                adjuntos[predicate] = [asset.attributes];
              }
            }
          });
        });
        return adjuntos;    
    },
  };

  //*************************************************************
  //            entity HANDLERS
  //*************************************************************
  DocManager.reqres.setHandler("asset:entity", function(id){
    return API.getEntity(id);
  });

  DocManager.reqres.setHandler("assets:filtered:entities", function(query){
    return API.getEntities(query);
  });

  DocManager.reqres.setHandler("assets:local:query", function(entitiesCol, query){
    return API.fetchLocalFilteredEntities(entitiesCol, query);
  });

  DocManager.reqres.setHandler("assets:groupby:predicate", function(assets, parentid){
    return API.groupByPredicate(assets, parentid);
  });

});





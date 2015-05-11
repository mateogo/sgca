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
                code: ancestor.get('productcode') || 'ASSET',
                slug: ancestor.get('slug'),
                predicate: predicate
            };
        var tlist = child.fetchFilteredPredicateArray(predicate, child, ancestor);
        tlist.push(ancestordata);

        child.set(predicate, tlist);

        return child;
    },

    linkChildsToAncestor: function (childs, ancestor, predicate, cb) {
        var deferreds = [], 
            defer;
        if(!_.isArray(childs)){
            var tempo = childs;
            childs = [];
            childs.push(tempo);
        }

        for (var i = childs.length - 1; i >= 0; i--) {
            var child = childs[i];

            child = child.buildPredicateData(ancestor,child, predicate);
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

    model: Entities.Asset,
    
    initialize: function (model, options) {
       if(options) this.options = options;
    },

    url: "/recuperar/activos"
  });

});


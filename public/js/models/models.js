window.Article = Backbone.Model.extend({
    // ******************* PROJECT ***************
    whoami: 'Article:models.js ',
    urlRoot: "/articulos",

    idAttribute: "_id",

    enabled_predicates:['es_capitulo_de','es_coleccion_de','es_instancia_de'],

    initialize: function () {
        this.validators = {};

        this.validators.slug = function (value) {
            return value.length > 0 ? {isValid: true} : {isValid: false, message: "Indique una descripción"};
        };
    },

    validateItem: function (key) {
        return (this.validators[key]) ? this.validators[key](this.get(key)) : {isValid: true};
    },

    // TODO: Implement Backbone's standard validate() method instead.
    validateAll: function () {

        var messages = {};

        for (var key in this.validators) {
            if(this.validators.hasOwnProperty(key)) {
                var check = this.validators[key](this.get(key));
                if (check.isValid === false) {
                    messages[key] = check.message;
                }
            }
        }

        return _.size(messages) > 0 ? {isValid: false, messages: messages} : {isValid: true};
    },

    schema: {
        tiponota:     {type: 'Select',options: utils.notasOptionList },
        fecha:        {type: 'Text', title: 'Fecha', editorAttrs:{placeholder : 'fecha relevante'}},
        slug:         {type: 'Text', title: 'Asunto', editorAttrs:{placeholder : 'asunto'}},
        description:  {type: 'TextArea', title: 'Descripción'},
        url:          {type: 'Text', title: 'URL referencia', editorAttrs:{placeholder : 'fuente de dato- referencia'}},
        responsable:  {type: 'Text', title: 'autor/responsable', editorAttrs:{placeholder : 'referente de la nota'}},
        descriptores: {type: 'Text', title: 'descriptores', editorAttrs:{placeholder : 'separados por ;'}},
    },

    insertBranding: function(data, asset){
        var self = this,
            entries = self.get('branding');

        console.log('insert branding:models.js begins [%s]',self.get('slug'));
        if(!entries) entries = [];

        data.tc = new Date().getTime();
        data.assetId = asset.id;
        data.assetName = asset.get('name');
        entries.push(data);
        self.set({branding: entries});
    },

    loadnotas:function (cb) {
        var self = this;
        var list = self.get('notas');
        console.log('mdel:loadnotas [%s]',list.length);
        var notas = _.map(list, function(elem){
            return new Article(elem);
        });
        cb(notas);
    },
    
    insertNota: function(article, cb){
        console.log('[%s] insertNota BEGINS',this.whoami);
        var self = this,
            predicate = 'es_nota_de',
            notas = self.get('notas'),
            data={},
            deferreds = [],
            defer;

        article.set({feum:new Date().getTime()});
        article.set({denom:article.get('slug')});

        article = self.buildPredicateData(self, article, 1, 100, predicate);
        console.log('[%s] insertNota BEGINS',this.whoami);
        article.buildTagList();

        defer = article.save(null, {
            success: function (article) {
                console.log('insert article:SUCCESS: [%s] ',article.get('slug'));
            },
            error: function () {
                console.log('ERROR: Ocurrió un error al intentar actualizar este nodo: [%s]',article.get('slug'));
            }
        });
        deferreds.push(defer);

        $.when.apply(null, deferreds).done(function(){
            console.log('UPDATE PRODUCTO TO INSERT NOTE:models.js begins [%s]',article.id);

            if(!notas) notas = [];
            data.id = article.id
            data.slug = article.get('slug');
            data.fecha = article.get('fecha');
            data.tiponota = article.get('tiponota');
            data.responsable = article.get('responsable');
            data.url = article.get('url');

            notas.push(data);
            self.set({notas: notas});
            cb(notas);
        });
    },


    loadpaancestors:function (cb) {
        var self = this;
        var list=[],
            rawlist=[];

        _.each(self.enabled_predicates, function(elem){
            if(self.get(elem)){
                list = _.map(self.get(elem),function(item){
                    return new Article({_id:item.id, slug:item.slug,articlecode:item.code,predicate:item.predicate});
                });
                rawlist = _.union(rawlist,list);
            }
        });
        console.log('[%s]: loadpaancestors ends found:[%s]',self.whoami,rawlist.length);
        if(cb) cb(rawlist);
        return rawlist;
    },


    loadassets: function(cb){
        var self = this;
        console.log('loadassets:models.js begins es_asset_de: [%s]',self.get('articlecode'));
        var query = {'es_asset_de.id':self.id};
        var assetCol= new AssetCollection();
        assetCol.fetch({
            data: query,
            type: 'post',
            success: function() {
                if(cb) cb(assetCol);
            }
        });
    },

    isChild: function(){
        var self = this;
        for (var i = self.enabled_predicates.length - 1; i >= 0; i--) {
            if(self.get(self.enabled_predicates[i])){
                if(self.get(self.enabled_predicates[i]).length>0){
                    //console.log('isChild: TRUE');
                    return true;
                }
            }
       };
        //console.log('isChild: FALSE');
        return false;
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

    buildPredicateData: function (ancestor, child, seq, numprefix, predicate) {
        var ancestordata = {
                id: ancestor.id,
                code: ancestor.get('articlecode'),
                slug: ancestor.get('slug'),
                order: 100,
                predicate: predicate
            };
        var tlist = child.fetchFilteredPredicateArray(predicate, child,ancestor);
        tlist.push(ancestordata);
        
        if(predicate === 'es_capitulo_de')  child.set({es_capitulo_de : tlist});
        if(predicate === 'es_coleccion_de') child.set({es_coleccion_de: tlist});
        if(predicate === 'es_instancia_de') child.set({es_instancia_de: tlist});
        if(predicate === 'es_asset_de')     child.set({es_asset_de: tlist});
        if(predicate === 'es_nota_de')      child.set({es_nota_de: tlist});

        return child;
    },


    fetchBrandingEntries: function (query){
        console.log('filtered: begins [%s] [%s]', this.get('slug'),this.get('branding').length);

        var filtered = _.filter(this.get('branding'),function(elem){

            console.log('filtered: [%s]', elem.assetName);
            var filter = _.reduce(query, function(memo, value, key){
                console.log('value: [%s]  key:[%s] elem.key:[%s]',value,key,elem[key]);
                if(value != elem[key]) return memo && false;
                return memo  && true;
            },true);
            return filter;
        });
        var brandingCollection = new Backbone.Collection(filtered,{
            model: BrandingFacet
        });
        console.log('Collection:  [%s]', brandingCollection.at(0).get('tc'));
        return brandingCollection;
    },

    linkChildsToAncestor: function (childs, predicate, cb) {
        var ancestor = this,
            deferreds = [], 
            defer;

        console.log('[%s] linkChildsToAncestor:BEGIN predicate:[%s]  ancestor:[%s]',ancestor.whoami,predicate,ancestor.get('articlecode'));
        for (var i = childs.length - 1; i >= 0; i--) {
            var child = childs[i];

            child = child.buildPredicateData(ancestor,child, i+1,100, predicate);
            ///
            //console.log('linkChilds: ready to insert [%s] / [%s]: [%s] [%s]',i,predicate,child.get(predicate),child.get('slug'));
            defer = child.save(null, {
                success: function (model) {
                    //console.log('saveNode:articledetails success');
                    console.log('insert ChildsToAncestor: SUCCESS: [%s] [%s] ',i,child.get('slug'));
                },
                error: function () {
                    console.log('ERROR: Ocurrió un error al intentar actualizar este nodo: [%s] [%s]',i,child.get('slug'));
                }
            });
            deferreds.push(defer);
        }

        $.when.apply(null, deferreds).done(function(){
            //console.log('deferres done FIRED');
            cb();
            //utils.approuter.navigate('navegar/articulos', {trigger: true, replace: false});
        });
    },


    getTagList: function(){
        //project:{_id : this.model.id} }
        return this.get('taglist');
    },

    buildTagList: function(){
        var descriptores = this.get('descriptores');
        if(descriptores){
            var list = _.filter(_.map(descriptores.split(';'),function(str){return $.trim(str)}),function(str){return str});
            //list = _.map(list,function(str){return {tag: str}; });
            this.set({ taglist : list });
        }else{
            this.set({ taglist : [] });
        }
    },

    assetFolder: function(){
        var today  = new Date();
        var day    = today.getDate()<10 ? '0'+today.getDate() : today.getDate();
        var month = today.getMonth()+1;
        month  = month<10 ? '0'+month : month;
        var folder = _.template('/assets/<%= y %>/<%= m %>/<%= d %>');

        return folder({y:today.getFullYear() ,m:month, d:day});
    },
    createAsset: function(data, cb) {
        var self = this;
        self.asset = new Asset();
        self.asset.saveAssetData(data, cb);
    },

    defaults: {
        _id: null,
        slug: "",
        denom: "",
        fecha:'',

        tiponota:'nota',
        responsable:'',
        descriptores:'',
        description: "",
        url:'',

        nivel_importancia: "medio",
        estado_alta: "activo",
        nivel_ejecucion: "preparado",

        taglist:[],
        branding:[],
        notas:[],
    }

});


window.ArticleCollection = Backbone.Collection.extend({
    // ******************* PROJECT COLLECTION ***************

    model: Article,

    url: "/navegar/articlos"

});

window.Product = Backbone.Model.extend({
    // ******************* PROJECT ***************
    whoami: 'Product:models.js ',
    urlRoot: "/productos",

    idAttribute: "_id",

    enabled_predicates:['es_capitulo_de','es_coleccion_de','es_instancia_de'],

    initialize: function () {
        this.validators = {};

        this.validators.slug = function (value) {
            return value.length > 0 ? {isValid: true} : {isValid: false, message: "Indique una descripción"};
        };
    },

    validateItem: function (key) {
        return (this.validators[key]) ? this.validators[key](this.get(key)) : {isValid: true};
    },

    // TODO: Implement Backbone's standard validate() method instead.
    validateAll: function () {

        var messages = {};

        for (var key in this.validators) {
            if(this.validators.hasOwnProperty(key)) {
                var check = this.validators[key](this.get(key));
                if (check.isValid === false) {
                    messages[key] = check.message;
                }
            }
        }

        return _.size(messages) > 0 ? {isValid: false, messages: messages} : {isValid: true};
    },

    loadnotas:function (cb) {
        var self = this;
        var list = self.get('notas');
        console.log('mdel:loadnotas [%s]',list.length);
        var notas = _.map(list, function(elem){
            return new Article(elem);
        });
        cb(notas);
    },
    
    loadbranding:function (cb) {
        var self = this;
        console.log('mdel:loadbranding');

        var brands = self.fetchBrandingEntries({});
        cb(brands);
    },

    fetchBrandingEntries: function (query){
        console.log('filtered: begins [%s] [%s]', this.get('slug'),this.get('branding').length);

        var filtered = _.filter(this.get('branding'),function(elem){

            console.log('filtered: [%s]', elem.assetName);

            var filter = _.reduce(query, function(memo, value, key){
                console.log('value: [%s]  key:[%s] elem.key:[%s]',value,key,elem[key]);
                if(value != elem[key]) return memo && false;
                return memo  && true;
            },true);
            return filter;

        });

        var brandingCollection = new Backbone.Collection(filtered,{
            model: BrandingFacet

        });
        //console.log('Collection:  [%s]', brandingCollection.at(0).get('tc'));
        return brandingCollection;
    },

    buildBrandingList: function (branding) {
        //var branding = this.relatedController.getBrands();
        var brands = [];

        if(!(branding && branding.length>0)) return;

        branding.each(function(brand){
        console.log('brands iterate:[%s]',brand.get('slug'));
            brands.push(brand.attributes);
        });
        console.log('brands length:[%s]',brands.length);
        this.set({branding:brands});
    },

    loadpaancestors:function (cb) {
        var self = this;
        var list=[],
            rawlist=[];

        _.each(self.enabled_predicates, function(elem){
            if(self.get(elem)){
                list = _.map(self.get(elem),function(item){
                    return new Product({_id:item.id, slug:item.slug,productcode:item.code,predicate:item.predicate});
                });
                rawlist = _.union(rawlist,list);
            }
        });
        console.log('[%s]: loadpaancestors ends found:[%s]',self.whoami,rawlist.length);
        if(cb) cb(rawlist);
        return rawlist;
    },

    loadpacapitulos: function(cb){
        var self = this;
        console.log('loadpacapitulos:models.js begins es_capitulo_de: [%s]',self.get('productcode'));
        var query = {$or: [{'es_capitulo_de.id':self.id},{'es_instancia_de.id':self.id}, {'es_coleccion_de.id':self.id}]};

        var chapCol= new ProductCollection();
        //console.log('loadpacapitulos:models.js query  [%s] ',query['es_capitulo_de.id']);

        chapCol.fetch({
            data: query,
            type: 'post',
            success: function() {
                dao.productsCol.set(chapCol);
                if(cb) cb(dao.productsCol.get());
            }
        });
    },

    loadchilds: function(ancestor, predicates, cb){
        var self = this,
            querydata = [],
            products= new ProductCollection(),
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

    loadassets: function(cb){
        var self = this;
        console.log('loadassets:models.js begins es_asset_de: [%s]',self.get('productcode'));
        var query = {'es_asset_de.id':self.id};
        var assetCol= new AssetCollection();
        assetCol.fetch({
            data: query,
            type: 'post',
            success: function() {
                if(cb) cb(assetCol);
            }
        });
    },

    isChild: function(){
        var self = this;
        for (var i = self.enabled_predicates.length - 1; i >= 0; i--) {
            if(self.get(self.enabled_predicates[i])){
                if(self.get(self.enabled_predicates[i]).length>0){
                    //console.log('isChild: TRUE');
                    return true;
                }
            }
       };
        //console.log('isChild: FALSE');
        return false;
    },

    buildCapNumber: function(iter, prefix){
        var numcap = iter;
        if(prefix){
            numcap += prefix;
        }
        return numcap;
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

    buildPredicateData: function (ancestor, child, seq, numprefix, predicate) {
        var ancestordata = {
                id: ancestor.id,
                code: ancestor.get('productcode'),
                slug: ancestor.get('slug'),
                order: ancestor.buildCapNumber(seq,(numprefix||100)),
                predicate: predicate
            };
        var tlist = child.fetchFilteredPredicateArray(predicate, child,ancestor);
        tlist.push(ancestordata);
        
        if(predicate === 'es_capitulo_de')  child.set({es_capitulo_de : tlist});
        if(predicate === 'es_coleccion_de') child.set({es_coleccion_de: tlist});
        if(predicate === 'es_instancia_de') child.set({es_instancia_de: tlist});
        if(predicate === 'es_asset_de')     child.set({es_asset_de: tlist});
        if(predicate === 'es_nota_de')      child.set({es_nota_de: tlist});

        return child;
    },

    fetchBrandingEntries: function (query){
        console.log('filtered: begins [%s] [%s]', this.get('slug'),this.get('branding').length);

        var filtered = _.filter(this.get('branding'),function(elem){

            console.log('filtered: [%s]', elem.assetName);

            var filter = _.reduce(query, function(memo, value, key){
                console.log('value: [%s]  key:[%s] elem.key:[%s]',value,key,elem[key]);
                if(value != elem[key]) return memo && false;
                return memo  && true;
            },true);
            return filter;

        });

        var brandingCollection = new Backbone.Collection(filtered,{
            model: BrandingFacet

        });
        //console.log('Collection:  [%s]', brandingCollection.at(0).get('tc'));
        return brandingCollection;
    },

    linkChildsToAncestor: function (childs, predicate, cb) {
        var ancestor = this,
            deferreds = [], 
            defer;

        console.log('[%s] linkChildsToAncestor:BEGIN predicate:[%s]  ancestor:[%s]',ancestor.whoami,predicate,ancestor.get('productcode'));
        for (var i = childs.length - 1; i >= 0; i--) {
            var child = childs[i];

            child = child.buildPredicateData(ancestor,child, i+1,100, predicate);
            ///
            //console.log('linkChilds: ready to insert [%s] / [%s]: [%s] [%s]',i,predicate,child.get(predicate),child.get('slug'));
            defer = child.save(null, {
                success: function (model) {
                    //console.log('saveNode:productdetails success');
                    console.log('insert ChildsToAncestor: SUCCESS: [%s] [%s] ',i,child.get('slug'));
                },
                error: function () {
                    console.log('ERROR: Ocurrió un error al intentar actualizar este nodo: [%s] [%s]',i,child.get('slug'));
                }
            });
            deferreds.push(defer);
        }

        $.when.apply(null, deferreds).done(function(){
            //console.log('deferres done FIRED');
            cb();
            //utils.approuter.navigate('navegar/productos', {trigger: true, replace: false});
        });
    },

    insertInstance: function(data, asset, cb){
        console.log('[%s] insertInstance BEGINS',this.whoami);
        var self = this,
            builder = {},
            predicate = 'es_instancia_de',
            //name_template = _.template('Cap: <%= numcap %> - <%= name %> '),
            deferreds = [],
            defer;

        builder._id = null;
        builder.tipoproducto = data.tipoproducto || self.tipoproducto;
        builder.descriptores = data.descriptores;
        builder.nivel_importancia = self.get('nivel_importancia');
        builder.nivel_ejecucion = self.get('nivel_ejecucion');
        builder.estado_alta = self.get('estado_alta');
        builder.slug = data.slug;
        builder.denom = data.denom;


        var instancefacet = {};
        instancefacet.rolinstancia = data.rolinstancia;
        if(asset){
            instancefacet.size = asset.get('size');
            instancefacet.tipofile = asset.get('type');
        }
        builder.painstancefacet = instancefacet;
        /////////
        var instance = new Product(builder);
        instance.buildTagList();

        instance = self.buildPredicateData(self, instance, 1, 100, predicate);

        //console.log('insertInstance:ready to insert: [%s] ',instance.get('slug'));
        defer = instance.save(null, {
            success: function (instance) {
                //console.log('saveNode:productdetails success');
                console.log('insert Instance:SUCCESS: [%s] ',instance.get('slug'));
            },
            error: function () {
                console.log('ERROR: Ocurrió un error al intentar actualizar este nodo: [%s]',instance.get('slug'));
            }
        });
        deferreds.push(defer);

        ////
        $.when.apply(null, deferreds).done(function(){
            if(asset){
                asset.linkChildsToAncestor(asset, instance,'es_asset_de',cb);
            }else{
                //console.log('deferres done FIRED');
                cb();
            }
            //utils.approuter.navigate('navegar/productos', {trigger: true, replace: false});
        });
    },

    insertBranding: function(data, asset){
        var self = this,
            entries = self.get('branding');

        console.log('insert branding:models.js begins [%s]',self.get('slug'));
        if(!entries) entries = [];

        data.tc = new Date().getTime();
        data.assetId = asset.id;
        data.assetName = asset.get('name');
        entries.push(data);
        console.log('BRANDING hash insert [%s] [%s]',entries.length, data.assetName);
        self.set({branding: entries});
    },

   insertNota: function(article, cb){
        console.log('[%s] insertNota BEGINS',this.whoami);
        var self = this,
            predicate = 'es_nota_de',
            notas = self.get('notas'),
            data={},
            deferreds = [],
            defer;

        article.set({feum:new Date().getTime()});
        article.set({denom:article.get('slug')});

        article = self.buildPredicateData(self, article, 1, 100, predicate);
        console.log('[%s] insertNota BEGINS',this.whoami);
        article.buildTagList();

        defer = article.save(null, {
            success: function (article) {
                console.log('insert article:SUCCESS: [%s] ',article.get('slug'));
            },
            error: function () {
                console.log('ERROR: Ocurrió un error al intentar actualizar este nodo: [%s]',article.get('slug'));
            }
        });
        deferreds.push(defer);

        $.when.apply(null, deferreds).done(function(){
            console.log('UPDATE PRODUCTO TO INSERT NOTE:models.js begins [%s]',article.id);

            if(!notas) notas = [];
            data.id = article.id
            data.slug = article.get('slug');
            data.fecha = article.get('fecha');
            data.tiponota = article.get('tiponota');
            data.responsable = article.get('responsable');
            data.url = article.get('url');

            notas.push(data);
            self.set({notas: notas});
            cb(notas);
        });
    },

    insertCapitulos: function(data,cb){
        console.log('insertCapitulos:models.js begins capdesde: [%s]',data.numcapdesde);
        var self = this,
            builder = {},
            predicate = 'es_capitulo_de',
            name_template = _.template('Cap: <%= numcap %> - <%= name %> '),
            deferreds = [],defer;

        builder._id = null;
        builder.tipoproducto = data.tipoproducto || self.tipoproducto;
        builder.descriptores = data.descriptores;
        builder.nivel_importancia = self.get('nivel_importancia');
        builder.nivel_ejecucion = self.get('nivel_ejecucion');
        builder.estado_alta = self.get('estado_alta');


        for (var icap =data.numcapdesde; icap <= data.numcaphasta; icap +=1){
 
            var capitulo = new Product(builder);
            capitulo.buildTagList();
            capitulo = self.buildPredicateData(self, capitulo, icap,data.numcapprefix,predicate);
            capitulo.set({slug:  name_template({numcap: self.buildCapNumber(icap,(data.numcapprefix||100)), name:self.get('slug') })});
            capitulo.set({denom: name_template({numcap: self.buildCapNumber(icap,(data.numcapprefix||100)), name:self.get('denom')})});

            //console.log('insertCapitulos:ready to insert: [%s] [%s]',icap,capitulo.get('slug'));
            defer = capitulo.save(null, {
                success: function (model) {
                    //console.log('saveNode:productdetails success');
                    console.log('insertCapitulos:SUCCESS: [%s] [%s] ',icap,capitulo.get('slug'));
                },
                error: function () {
                    console.log('ERROR: Ocurrió un error al intentar actualizar este nodo: [%s] [%s]',icap,capitulo.get('slug'));
                }
            });
            deferreds.push(defer);
        }
        $.when.apply(null, deferreds).done(function(){
            //console.log('deferres done FIRED');
            cb();
            //utils.approuter.navigate('navegar/productos', {trigger: true, replace: false});
        });
    },

    getTagList: function(){
        //project:{_id : this.model.id} }
        return this.get('taglist');
    },

    buildTagList: function(){
        var descriptores = this.get('descriptores');
        if(descriptores){
            var list = _.filter(_.map(descriptores.split(';'),function(str){return $.trim(str)}),function(str){return str});
            //list = _.map(list,function(str){return {tag: str}; });
            this.set({ taglist : list });
        }else{
            this.set({ taglist : [] });
        }
    },

    assetFolder: function(){
        var today  = new Date();
        var day    = today.getDate()<10 ? '0'+today.getDate() : today.getDate();
        var month = today.getMonth()+1;
        month  = month<10 ? '0'+month : month;
        var folder = _.template('/assets/<%= y %>/<%= m %>/<%= d %>');

        return folder({y:today.getFullYear() ,m:month, d:day});
    },
    createAsset: function(data, cb) {
        var self = this;
        self.asset = new Asset();
        self.asset.saveAssetData(data, cb);
    },

    defaults: {
        _id: null,
        project:{},
        tipoproducto:"",
        productcode:"",
 
        slug: "",
        denom: "",
        notas:[],
        branding:[],

        descriptores: "",
        taglist:[],
        description: "",

        nivel_importancia: "medio",
        estado_alta: "activo",
        nivel_ejecucion: "planificado",
        patechfacet:{},

        resources: []

    }

});

//        patechfacet:{
//            durnominal:null,
//            fecreacion:null,
//            cantcapitulos:null,
//            productora:null,
//        },


window.ProductCollection = Backbone.Collection.extend({
    // ******************* PROJECT COLLECTION ***************

    model: Product,

    url: "/navegar/productos"

});

window.BrowseProductsQuery = Backbone.Model.extend({
    // ******************* BROWSE PRODUCTS ***************
    retrieveData: function(){
        return dao.extractData(this.attributes);
    },
    
    getProject: function(){
        //project:{_id : this.model.id} }
        return this.get('project');
    },
    getProjectId: function(){
        //project:{_id : this.model.id} }
        return this.get('project')._id;
    },
    setProject: function(id,denom){
        var prj = {};
        if(id){
            prj._id = (id||'');
        }
        this.set({project:prj});

        //this.set({prjdenom: (denom||'')});
        utils.viewData.currentProject = denom;
    },

    defaults: {
        project:{},
        productcode:'',
        nivel_ejecucion:'',
        tipoproducto: '',
        nivel_importancia: '',
        taglist: '',
 
        prjdenom:'',
        rubro:'',
        responsable:'',
        contraparte:'',
    }
});

window.ManageTable = Backbone.Model.extend({
    // ******************* BROWSE PRODUCTS ***************
    whoami:'managetable',

    retrieveData: function(){
        return dao.extractData(this.attributes);
    },

    schema: {
        columnById:  {  type: 'Checkboxes', options: null}
    },

    initialize: function () {
        console.log('initialize');
        var TableSchema =  Backbone.Model.extend({
            toString: function() { return this.get('label'); }
            });
        var TableSchemaCollection = Backbone.Collection.extend({
            model: TableSchema
            });
        var tschema = new TableSchemaCollection(utils.productListTableHeader);
        console.log('lista especificacion: [%s][%s]', utils.productListTableHeader.length, tschema.get(1).toString());
        this.schema.columnById.options = tschema;
        //utils.inspect(tschema,0, this.whoami);
    },

    defaults: {
    }
});


window.AddInstanceFacet = Backbone.Model.extend({
    // ******************* BROWSE PRODUCTS ***************
    whoami:'addinstancefacet',

    retrieveData: function(){
        return dao.extractData(this.attributes);
    },

    /*
    retrieveDatasss: function(){
        var qobj = {};
        var keys = _.keys(this.attributes);
        for (var k=0;k<keys.length;k++){
            var data = this.get(keys[k]);
            if(! (data==null || data=="" || data == "0")){
                qobj[keys[k]] = data;
                console.log('retrievedata[%s][%s]',keys[k],data);
            }
        }
        return qobj;
    },
    */

    schema: {
        tipoproducto: {type: 'Select', options: utils.tipoinstanciaOptionList },
        rolinstancia: {type: 'Select', options: utils.rolinstanciasOptionList },
        slug:         {type: 'Text', editorAttrs: {placeholder: 'nombre de archivo'}},
        denom:        {type: 'Text', title: 'denominacion', editorAttrs: {placeholder: 'denominacion'}},
        descriptores: {type: 'Text', title: 'descriptores', editorAttrs:{placeholder: 'descriptores'}},
        url:          {type: 'Text', title: 'URI', editorAttrs:{placeholder: 'URL del objeto digital'}},
   },

    defaults: {
        slug:'',
        rolinstancia:'no_definido',
        tipoproducto:'no_definido',
        denom:'',
        descriptores:'',
    }
});

window.PaCapitulosFacet = Backbone.Model.extend({
    // ******************* BROWSE PRODUCTS ***************
    whoami:'pacapitulosfacet',

    retrieveData: function(){
        return dao.extractData(this.attributes);
    },

    schema: {
        numcapdesde:  {type: 'Number', title: 'Capítulo desde'},
        numcaphasta:  {type: 'Number', title: 'Capítulo hasta'},
        numcapprefix: {type: 'Number', title: 'Prefijo del código'},
        tipoproducto:  {type: 'Select',options: utils.tipoproductoOptionList },
        durnominal:    {type: 'Text', title: 'Duración nominal', editorAttrs:{placeholder : 'duracion mm:ss'}},
        descriptores:  {type: 'Text', title: 'Descriptores', editorAttrs:{placeholder : 'descriptores separados por ;'}},
   },

    defaults: {
        numcapdesde:0,
        numcaphasta:0,
        numcapprefix: 100,
        tipoproducto:'paudiovisual',
        durnominal:'',
        descriptores:'',
    }
});

window.NotasFacet = Backbone.Model.extend({
    // ******************* BROWSE PRODUCTS ***************
    whoami:'notas',

    retrieveData: function(){
        return dao.extractData(this.attributes);
    },

    schema: {
        tiponota:    {type: 'Select',options: utils.notasOptionList },
        fecha:       {type: 'Text', title: 'Fecha', editorAttrs:{placeholder : 'fecha relevante'}},
        slug:     {type: 'Text', title: 'Asunto', editorAttrs:{placeholder : 'asunto'}},
        descr:    {type: 'TextArea', title: 'Descripción'},
        url:      {type: 'Text', title: 'URL referencia', editorAttrs:{placeholder : 'fuente de dato- referencia'}},
        responsable:    {type: 'Text', title: 'autor/responsable', editorAttrs:{placeholder : 'referente de la nota'}},
        descriptores:    {type: 'Text', title: 'descriptores', editorAttrs:{placeholder : 'separados por ;'}},
    },

    defaults: {
        tiponota:'nota',
        fecha:'',
        slug:'',
        descr:'',
        url:'',
        responsable:'',
        descriptores:'',
    }
});

window.PaClasificationFacet = Backbone.Model.extend({
    // ******************* BROWSE PRODUCTS ***************
    whoami:'paclasificationfacet',

    retrieveData: function(){
        return dao.extractData(this.attributes);
    },

    initialize: function () {
        if(this.get('contenido')){
            this.schema.subcontenido.options = dao.pasubcontenido[this.get('contenido')];
        }
    },

    schema: {
        contenido:    {type: 'Select',options: dao.pacontenidos },
        subcontenido: {type: 'Select',options: dao.pasubcontenido.artecultura},
        genero:       {type: 'Select',options: dao.pageneros},
        formato:      {type: 'Select',options: dao.paformatos},
        videoteca:    {type: 'Select',options: dao.videotecas},
        etario:       {type: 'Select',options: dao.etarios},  
   },

    defaults: {
        contenido:'',
        subcontenido:'',
        genero:'',
        formato:'',
        videoteca:'',
        etario:'',
    }
});

window.PaRealizationFacet = Backbone.Model.extend({
    // ******************* BROWSE PRODUCTS ***************
    whoami:'parealizacionfacet',

    retrieveData: function(){
        return dao.extractData(this.attributes);
    },

    schema: {
        realizadores: {type: 'TextArea',editorAttrs:{placeholder : 'realizadores'},editorClass:'input-large' },
        productores: {type: 'TextArea',editorAttrs:{placeholder : 'productores'} },
        actores: {type: 'TextArea',editorAttrs:{placeholder : 'actores'} },
        directores: {type: 'TextArea',editorAttrs:{placeholder : 'directores'} },
        camarografos: {type: 'TextArea',editorAttrs:{placeholder : 'camarografos'} },
        guionistas: {type: 'TextArea',editorAttrs:{placeholder : 'guionistas'} },
        musicos: {type: 'TextArea',editorAttrs:{placeholder : 'musicos'} },
    },

    defaults: {
        realizadores:'',
        productores:'',
        actores:'',
        directores:'',
        camarografos:'',
        guionistas:'',
        musicos:'',
    }
});
window.BrandingFacet = Backbone.Model.extend({
    // ******************* BROWSE PRODUCTS ***************
    whoami:'brandingfacet',

    retrieveData: function(){
        return dao.extractData(this.attributes);
    },

    schema: {
        tipobranding: {type: 'Select',options: utils.tipoBrandingOptionList },
        rolbranding:  {type: 'Select',options: utils.rolBrandingOptionList },
        slug: {type: 'Text',title:'copete', editorAttrs:{placeholder : 'bajada de información'} },
        description: {type: 'TextArea',title:'descripción' },
        url: {type: 'Text',titlo:'destino para más información' },
        estado_alta:  {type: 'Select',options: utils.estadoaltaOptionList },
    },

    defaults: {
        tipobranding:'',
        rolbranding:'',
        slug:'',
        description:'',
        estado_alta:'activo'
    }
});

window.PaInstanceFacet = Backbone.Model.extend({
    // ******************* BROWSE PRODUCTS ***************
    whoami:'painstancefacet',

    retrieveData: function(){
        return dao.extractData(this.attributes);
    },

    schema: {
        rolinstancia:   {type: 'Select',options: utils.rolinstanciasOptionList },
        size:           {type: 'Number', title: 'Tamaño archivo'},
        tipofile:       {type: 'Text', title: 'Tipo / MimeType'},
        framerate:      {type: 'Select',options: utils.framerateOptionList },
        codec:          {type: 'Select',options: utils.codecOptionList },
        formatoorig:    {type: 'Select',options: utils.formatooriginalOptionList },
        aspectratio:    {type: 'Select',options: utils.aspectratioOptionList },
        sopentrega:     {type: 'Select',options: utils.sopentregaOptionList },
        resolucion:     {type: 'Select',options: utils.resolucionOptionList },
        observacion:    {type: 'TextArea'},
    },
    

    defaults: {
        rolinstancia:'',
        size:'',
        tipofile:'',
        tipovideo:'high_res',
        framerate:'25p',
        codec:'',
        formatoorig:'',
        aspectratio:'',
        sopoentrega:'',
        resolucion:'',
        observacion:'',
    }
});


window.PaTechFacet = Backbone.Model.extend({
    // ******************* BROWSE PRODUCTS ***************
    whoami:'patechfacet',

    retrieveData: function(){
        return dao.extractData(this.attributes);
    },

    schema: {
        durnominal: {type: 'Text', title: 'Duración nominal', editorAttrs:{placeholder : 'duracion mm:ss'}},
        cantcapitulos: {type: 'Number', title: 'Cantidad de capítulos'},
        fecreacion: {type: 'Text', title: 'Fecha de creación'},
        productora: {type: 'Text', title: 'Casa productora',editorAttrs:{placeholder:'casa productora'}},
        lugares: {type: 'Text',editorAttrs:{placeholder : 'lugares'} },
        locaciones: {type: 'Text',editorAttrs:{placeholder : 'locaciones'} },
        //productora: {type: 'Select',options:[{val:'perro',label: 'El perro en la luna'},{val:'occidente',label:'Occidente'}], title: 'casa Productora'},
    },
    

    defaults: {
        durnominal:'',
        productora:'',
        fecreacion:'',
        cantcapitulos:0,
        lugares:'',
        locaciones:'',
    }
});
/*
        title:      { type: 'Select', options: ['Mr', 'Mrs', 'Ms'] },
        name:       'Text',
        email:      { validators: ['required', 'email'] },
        birthday:   'Date',
        password:   'Password',
        address:    { type: 'NestedModel', model: Address },
        notes:      { type: 'List', itemType: 'Text' }
*/

// quotation Quotation
window.Quotation = Backbone.Model.extend({
    // ******************* PROJECT ***************
    urlRoot: "/requisitorias",

    idAttribute: "_id",

    initialize: function () {
        this.validators = {};

        this.validators.slug = function (value) {
            return value.length > 0 ? {isValid: true} : {isValid: false, message: "Indique una descripción"};
        };
 
        this.validators.fesolstr = function (value) {
            var parsedate = utils.parseDateStr(value);
            if(parsedate === null) return {isValid: false, message: "Fecha no válida"};
            return {isValid: true} ;
            //return value.length > 0 ? {isValid: true} : {isValid: false, message: "Fecha no válida"};
        };

        this.validators.fenecstr = function (value) {
            var parsedate = utils.parseDateStr(value);
            if(parsedate === null) return {isValid: false, message: "Fecha no válida"};
            return {isValid: true} ;
            //return value.length > 0 ? {isValid: true} : {isValid: false, message: "Fecha no válida"};
        };
    },

    validateItem: function (key) {
        return (this.validators[key]) ? this.validators[key](this.get(key)) : {isValid: true};
    },

    // TODO: Implement Backbone's standard validate() method instead.
    validateAll: function () {

        var messages = {};

        for (var key in this.validators) {
            if(this.validators.hasOwnProperty(key)) {
                var check = this.validators[key](this.get(key));
                if (check.isValid === false) {
                    messages[key] = check.message;
                }
            }
        }

        return _.size(messages) > 0 ? {isValid: false, messages: messages} : {isValid: true};
    },

    getResourceList: function(){
        //project:{_id : this.model.id} }
        return this.get('resources');
    },

    setResourceList: function(rlist){
        this.set({resources:rlist});
    },

    defaults: {
        _id: null,
        project:{},
 
        slug: "",

        nro: '',
        fesol: "",
        fenec: "",
        fesolstr: "",
        fenecstr: "",

        solname: "",
        soldata: "",

        provname: "",
        provdata: "",

        gencond: "",
        partcond: "",

        rubro: "",
        nivel_importancia: "medio",
        estado_alta: "activo",
        nivel_ejecucion: "planificado",

        resources: []
    }

});

window.QuotationCollection = Backbone.Collection.extend({
    // ******************* PROJECT COLLECTION ***************

    model: Quotation,

    url: "/navegar/requisitorias"

});

window.BrowseQuotationsQuery = Backbone.Model.extend({
    // ******************* BROWSE RESOURCE RESOURCE ***************
    retrieveData: function(){
        var query = {};
        var keys = _.keys(this.attributes);
        for (var k=0;k<keys.length;k++){
            var data = this.get(keys[k]);
            if(! (data==null || data=="" || data == "0")){
                query[keys[k]] = data;
            }
        }
        return query;
    },
    getProject: function(){
        //project:{_id : this.model.id} }
        return this.get('project');
    },
    getProjectId: function(){
        //project:{_id : this.model.id} }
        return this.get('project')._id;
    },
    setProject: function(id,denom){
        var prj = {};
        if(id){
            prj._id = (id||'');
        }
        this.set({project:prj});

        //this.set({prjdenom: (denom||'')});
        utils.viewData.currentProject = denom;
    },

    defaults: {
        project:{},
        prjdenom:'',
        rubro:'',
        responsable:'',
        contraparte:'',
        nivel_ejecucion:''
    }
});



window.Project = Backbone.Model.extend({
    // ******************* PROJECT ***************
    urlRoot: "/proyectos",

    idAttribute: "_id",

    initialize: function () {
        this.validators = {};

        this.validators.slug = function (value) {
            return value.length > 0 ? {isValid: true} : {isValid: false, message: "Indique la denominación identificatoria del evento"};
        };

        this.validators.denom = function (value) {
            return value.length > 0 ? {isValid: true} : {isValid: false, message: "Indique denominación oficial del evento"};
        };

        this.validators.responsable = function (value) {
            return value.length > 0 ? {isValid: true} : {isValid: false, message: "Indique un responsable"};
        };

        this.validators.organismo = function (value) {
            return value.length > 0 ? {isValid: true} : {isValid: false, message: "Indique un organismo"};
        };
 
        this.validators.eventdatestr = function (value) {
            var parsedate = utils.parseDateStr(value);
            if(parsedate === null) return {isValid: false, message: "Fecha no válida"};
            return {isValid: true} ;
            //return value.length > 0 ? {isValid: true} : {isValid: false, message: "Fecha no válida"};
        };
    },

    validateItem: function (key) {
        return (this.validators[key]) ? this.validators[key](this.get(key)) : {isValid: true};
    },

    // TODO: Implement Backbone's standard validate() method instead.
    validateAll: function () {

        var messages = {};

        for (var key in this.validators) {
            if(this.validators.hasOwnProperty(key)) {
                var check = this.validators[key](this.get(key));
                if (check.isValid === false) {
                    messages[key] = check.message;
                }
            }
        }

        return _.size(messages) > 0 ? {isValid: false, messages: messages} : {isValid: true};
    },
 

    updateAsset: function(data, cb){
        // create new asset-entry
        var as = {};
        as.versions = [];
        as.name = data.name;
        as.versions.push(data.fileversion);

        as.urlpath = data.urlpath;
        as.slug = as.name;
        as.denom = as.name;
        as.related = {project:this.id};

        console.log('prjmodel:creating new asset');
        var asset = new Asset(as);
        asset.save(null, {
            success: function (model) {
                cb('prjmodel: Success asset updated!');
            },
            error: function () {
                cb('An error occurred while trying to delete this item');
           }
        });
    },

    assetFolder: function(){
        return '/prj/' + (this.id || 'calendar');
    },

    defaults: {
        _id: null,
        denom: "",
        slug: "",
        genero: "",
        isPropio: 1,
        estado_alta: "activo",
        nivel_ejecucion: "planificado",
        nivel_importancia: "",
        responsable: "",
        organismo: "",
        city: "CABA",
        eventdatestr: "",
        eventdate: new Date().getTime(),
        description: "",
        picture: null,
    }
});


window.ProjectCollection = Backbone.Collection.extend({
    // ******************* PROJECT COLLECTION ***************

    model: Project,

    url: "/navegar/proyectos"

});


window.BrowseProjectsQuery = Backbone.Model.extend({
    // ******************* BROWSE PROJECT QUERY ***************
    retrieveData: function(){
        var query = {};
        var keys = _.keys(this.attributes);
        for (var k=0;k<keys.length;k++){
            var data = this.get(keys[k]);
            if(! (data==null || data=="" || data == "0")){
                query[keys[k]] = data;
            }
        }
        return query;
    },

    defaults: {
        responsable:'',
        contraparte:'',
        nivel_ejecucion:''
    }
});


window.BrowseResourcesQuery = Backbone.Model.extend({
    // ******************* BROWSE RESOURCE RESOURCE ***************
    retrieveData: function(){
        var query = {};
        var keys = _.keys(this.attributes);
        for (var k=0;k<keys.length;k++){
            var data = this.get(keys[k]);
            if(! (data==null || data=="" || data == "0")){
                query[keys[k]] = data;
            }
        }
        return query;
    },
    getProject: function(){
        //project:{_id : this.model.id} }
        return this.get('project');
    },
    getProjectId: function(){
        //project:{_id : this.model.id} }
        return this.get('project')._id;
    },
    setProject: function(id,denom){
        var prj = {};
        if(id){
            prj._id = (id||'');
        }
        this.set({project:prj});

        //this.set({prjdenom: (denom||'')});
        utils.viewData.currentProject = denom;
    },

    defaults: {
        project:{},
        prjdenom:'',
        rubro:'',
        responsable:'',
        contraparte:'',
        nivel_ejecucion:''
    }
});


window.Resource = Backbone.Model.extend({
    // ******************* RESOURCE ***************
    urlRoot: "/recursos",

    idAttribute: "_id",

    initialize: function () {
        this.validators = {};

        this.validators.slug = function (value) {
            return value.length > 0 ? {isValid: true} : {isValid: false, message: "Indique la denominación identificatoria del evento"};
        };

        this.validators.denom = function (value) {
            return value.length > 0 ? {isValid: true} : {isValid: false, message: "Indique denominación oficial del evento"};
        };

        this.validators.responsable = function (value) {
            return value.length > 0 ? {isValid: true} : {isValid: false, message: "Indique un responsable"};
        };

    },

    validateItem: function (key) {
        return (this.validators[key]) ? this.validators[key](this.get(key)) : {isValid: true};
    },

    // TODO: Implement Backbone's standard validate() method instead.
    validateAll: function () {

        var messages = {};

        for (var key in this.validators) {
            if(this.validators.hasOwnProperty(key)) {
                var check = this.validators[key](this.get(key));
                if (check.isValid === false) {
                    messages[key] = check.message;
                }
            }
        }

        return _.size(messages) > 0 ? {isValid: false, messages: messages} : {isValid: true};
    },

    loadassets: function(cb){
        var self = this;
        console.log('loadassets:models.js begins es_asset_de: [%s]',self.get('slug'));
        var query = {'es_asset_de.id':self.id};
        var assetCol= new AssetCollection();
        assetCol.fetch({
            data: query,
            type: 'post',
            success: function() {
                if(cb) cb(assetCol);
            }
        });
    },

    updateAsset: function(data, cb){
        // create new asset-entry
        var as = {};
        as.versions = [];
        as.name = data.name;
        as.versions.push(data.fileversion);

        as.urlpath = data.urlpath;
        as.slug = as.name;
        as.denom = as.name;
        console.log('resmodel:creating new asset: '+this.get('project')['_id']);
        as.related = { project: this.get('project')['_id'], resource: this.id};

        var asset = new Asset(as);
        asset.save(null, {
            success: function (model) {
                cb('resmodel: Success asset updated!');
            },
            error: function () {
                cb('An error occurred while trying to delete this item');
           }
        });
    },

    assetFolder: function(){
        return '/res/' + (this.id || 'calendar');
    },




    defaults: {
        _id: null,
        denom: "",
        slug: "",
        rubro: "tecnica",
        estado_alta: "activo",
        nivel_ejecucion: "planificado",
        nivel_importancia: "medio",
        responsable: "",
        contraparte: "",
        description: "",
        fenecesidad: "",
        quote: "",
        project:{},
        picture: null,
        freq:1,
        qty:1,
        ume:'UN'
    }
});

window.ResourceCollection = Backbone.Collection.extend({
    // ******************* RESOURCE COLLECTION ***************
    // otros metodos: initialize, url, model, comparator
    // models:  use get, at or underscore methods

    model: Resource,
    initialize: function (model, options) {
        if(options) this.options = options;
    },
    url: "/navegar/recursos"

});

window.Asset = Backbone.Model.extend({
    // ******************* RESOURCE ***************
    urlRoot: "/activos",
    whoami: 'Asset:models.js',

    idAttribute: "_id",

    project:null,

   initialize: function () {
        this.validators = {};
    },

    validateItem: function (key) {
        return (this.validators[key]) ? this.validators[key](this.get(key)) : {isValid: true};
    },

    // TODO: Implement Backbone's standard validate() method instead.
    validateAll: function () {
        var messages = {};
        for (var key in this.validators) {
            if(this.validators.hasOwnProperty(key)) {
                var check = this.validators[key](this.get(key));
                if (check.isValid === false) {
                    messages[key] = check.message;
                }
            }
        }
        return _.size(messages) > 0 ? {isValid: false, messages: messages} : {isValid: true};
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
        // create new asset-entry
        versions.push(data.fileversion);
        self.set({name: data.name, urlpath:data.urlpath, type: data.fileversion.type, size: data.fileversion.size, slug:data.slug||data.name, denom: data.denom||data.name, versions:versions});
        console.log('[%s] asset builded from data', self.whoami);
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
        
        if(predicate === 'es_capitulo_de')  child.set({es_capitulo_de : tlist});
        if(predicate === 'es_coleccion_de') child.set({es_coleccion_de: tlist});
        if(predicate === 'es_instancia_de') child.set({es_instancia_de: tlist});
        if(predicate === 'es_asset_de')     child.set({es_asset_de: tlist});
        if(predicate === 'es_nota_de')      child.set({es_nota_de: tlist});
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

        console.log('[%s] linkChildsToAncestor:BEGIN predicate:[%s]  ancestor:[%s]',ancestor.whoami,predicate,ancestor.get('productcode'));
        for (var i = childs.length - 1; i >= 0; i--) {
            var child = childs[i];

            child = child.buildPredicateData(ancestor,child, predicate);
            ///
            defer = child.save(null, {
                success: function (child) {
                    //console.log('saveNode:productdetails success');
                    console.log('link Asset:SUCCESS:  [%s] ',child.get('slug'));
                },
                error: function () {
                    console.log('ERROR: Ocurrió un error al intentar actualizar este nodo: [%s] [%s]',i,child.get('slug'));
                }
            });
            deferreds.push(defer);
        }

        $.when.apply(null, deferreds).done(function(){
            //console.log('deferres done FIRED');
            cb();
            //utils.approuter.navigate('navegar/productos', {trigger: true, replace: false});
        });
    },

    updateAsset: function(data, ancestor, cb){
        var self = this,
            predicate = 'es_asset_de';

        self.buildAssetData(data);
        self.linkChildsToAncestor(self, ancestor, predicate, cb);
        console.log('[%s]/updateAsset: END:[%s] / [%s]: [%s]',this.whoami,i,predicate,self.get('slug'));
    },

    assetFolder: function(){
        var today  = new Date();
        var day    = today.getDate()<10 ? '0'+today.getDate() : today.getDate();
        var month = today.getMonth()+1;
        month  = month<10 ? '0'+month : month;
        var folder = _.template('/assets/<%= y %>/<%= m %>/<%= d %>');

        return folder({y:today.getFullYear() ,m:month, d:day});
    },

    getProjectName: function(){
        // todo: instanciar un project 
        // if(!this.project){
        //      var prjid = this.get("related").project;
        //      if(!prjid) return "no definido";
        //      this.project = new Project ({_id:prjid});
        //}
        // return project.getDenom();
        // todo: agregar el metodo getDenom en project
        // pedirle al project su nombre
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

window.AssetCollection = Backbone.Collection.extend({
    // ******************* RESOURCE COLLECTION ***************
    // otros metodos: initialize, url, model, comparator
    // models:  use get, at or underscore methods

    model: Asset,
    initialize: function (model, options) {
       if(options) this.options = options;
    },

    url: "/recuperar/activos"

});

window.User = Backbone.Model.extend({
    // ******************* BROWSE PRODUCTS ***************
    whoami:'user:models.js',

    urlRoot: "/usuarios",

    idAttribute: "_id",
    /*
    getFullName: function(){
        var fullname = this.get('name') + this.get('lastname');
        return fullname;

    },
    */

    /*
    retrieveData: function(){
        return dao.extractData(this.attributes);
    },
    */


    defaults : {
        _id: null,
        displayName:'',
        username:'',
        password:'',
        mail:'',
        roles:[],
        fealta:'',

        estado_alta:'pendaprobacion',
        verificado: {
            mail:false,
            feaprobado: null,
            adminuser: '',
        },
        conduso:[]
    }
});

window.UserFacet = Backbone.Model.extend({
    // ******************* BROWSE PRODUCTS ***************
    whoami:'userfacet:models.js',

    //urlRoot: "/usuario",

    idAttribute: "_id",

    schema: {
        displayName:   {type: 'Text', title: 'Nombre completo', editorAttrs:{placeholder : 'sera utilizado como saludo'}},
        mail:          {type: 'Text', title: 'EMail', editorAttrs:{placeholder : 'sera su nombre de usuario'}},
        password:      {type: 'Password', title: 'Clave' },
    },

    defaults : {
        _id: null,
        displayName:'',
        username:'',
        password:'',
        mail:'',
        roles:[],
        fealta:'',

        estado_alta:'pendaprobacion',
        verificado: {
            mail:false,
            feaprobado: null,
            adminuser: '',
        },
        conduso:[]
    }
});

/*
eq: {
    "domain":null,
    "_events":{},
    "_maxListeners":10,
    "size":36456,
    "path":"/tmp/d6f6b14dfd5194515c6108864a8ae564",
    "name":"danzas-circulares.jpg",
    "type":"image/jpeg",
    "hash":false,
    "lastModifiedDate":"2013-05-24T17:25:39.393Z","
    _writeStream":{ "_writableState":{
                        "highWaterMark":16384,
                        "objectMode":false,
                        "needDrain":true,
                        "ending":true,
                        "ended":true,
                        "finished":true,
                        "decodeStrings":true,
                        "length":0,
                        "writing":false,
                        "sync":false,
                        "bufferProcessing":false,
                        "writecb":null,
                        "writelen":0,
                        "buffer":[]
                    },
                    "writable":true,
                    "domain":null,
                    "_events":{},
                    "_maxListeners":10,
                    "path":"/tmp/d6f6b14dfd5194515c6108864a8ae564",
                    "fd":null,
                    "flags":"w",
                    "mode":438,
                    "bytesWritten":36456,
                    "closed":true
                },
    "length":36456,
    "filename":"danzas-circulares.jpg",
    "mime":"image/jpeg"
}
*/

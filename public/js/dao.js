window.dao = {

    whoami:'daoutils',

    uploadFile: function(uploadingfile, progressbar, cb){
        var formData = new FormData();
        var folder = 'files';
        console.log(' uploadFiles BEGINS folder:[%s]', folder);
        
        if(!uploadingfile) return false;

        formData.append('loadfiles', uploadingfile);
        formData.append('folder',folder);

        var xhr = new XMLHttpRequest();

        xhr.open('POST', '/files');

        xhr.onload = function() {
            var srvresponse = JSON.parse(xhr.responseText);
            var asset = new Asset();
            asset.saveAssetData(srvresponse, function(asset){
                console.log('asset CREATED!: [%s]',srvresponse.name);
                cb(srvresponse, asset);
            });
        };

        xhr.upload.onprogress = function(event) {
            if (event.lengthComputable) {
                var complete = (event.loaded / event.total * 100 | 0);
                $(progressbar).css({'width':complete+'%'});
            }
        };

        xhr.send(formData);    
    },

    quotationsQueryData:function (){
        if (!this.queryQuotationData) {
            this.queryQuotationData = new BrowseQuotationsQuery();
        }
        return this.queryQuotationData;
    },

    productsQueryData:function (){
        if (!this.queryProductData) {
            this.queryProductData = new BrowseProductsQuery();
        }
        return this.queryProductData;
    },

    productsCol:{
        get: function (){
            if (!this.productsCollectionRef) {
                this.productsCollectionRef = new ProductCollection();
            }
            return this.productsCollectionRef;
        },
        set: function(col){
            this.productsCollectionRef = col;
        }
    },

    extractData: function(model){
        var qobj = {};
        _.each(model,function(value,key){
            //console.log('1key:[%s] value:[%s]',key,value);
            if(! (value==null || value==="" || value === "0")){
                qobj[key]=value;
                //console.log('2key:[%s] value:[%s]',key,value);
            }
        });
        return qobj;
    },   

    addinstancefacet: {
        init: function(product){
            console.log('add instancce facet init');
 
            var builder = {};
            builder.slug = product.get('slug');
            builder.denom = product.get('denom');
            this.data = new AddInstanceFacet(builder);
            this.asset = null;
            this.form = null;
            console.log('add instancce facet init OK');
            return this.data;
        },
        setContent: function  (data) {
            this.data.set(data);
        },
        getContent: function(){
            //console.log('addinstancefacet: [%s]',this.data.get('slug'));
            return this.data.retrieveData();
        },
        setAsset: function(asset) {
            this.asset = asset;
        },
        getAsset: function() {
            return this.asset;
        },
        setForm:function(form){
            this.form = form;
        },
        getForm: function(){
            return this.form;
        }
    },

   brandingfacet: {
        init: function(product){
            console.log('branding facet init');
            this.data = new BrandingFacet();
            this.asset = null;
            this.form = null;
             return this.data;
        },
        setContent: function  (data) {
            this.data.set(data);
        },
        getContent: function(){
            if(this.form) this.form.commit(); 
            return this.data.retrieveData();
        },
        setAsset: function(asset) {
            this.asset = asset;
        },
        getAsset: function() {
            return this.asset;
        },
        setForm:function(form){
            this.form = form;
        },
        getForm: function(){
            return this.form;
        }
    },

    pacapitulosfacet: {
        init: function(product){
            var builder = {};
            builder.durnominal = product.get('patechfacet') && product.get('patechfacet').durnominal;
            builder.tipoproducto = product.get('tipoproducto');
            builder.descriptores = product.get('descriptores');
            builder.cantcapitulos = 0;
            this.data = new PaCapitulosFacet(builder);
            return this.data;
        },
        getContent: function(){
            return this.data.retrieveData();
        }
    },

    patechfacet: {
        init: function(product){
            this.data = new PaTechFacet(product.get('patechfacet'));
            return this.data;
        },
        getContent: function(){
            return this.data.retrieveData();
        }
    },

    parealizfacet: {
        init: function(product){
            console.log('parealizfacet: [%s]',product.get('slug'));
            this.data = new PaRealizationFacet(product.get('realization'));
            return this.data;
        },
        getContent: function(){
            return this.data.retrieveData();
        }
    },

    notasfacet: {
        init: function(ancestor){
            console.log('notasfacet: [%s]',ancestor.get('slug'));
            this.data = new Article();
            return this.data;
        },
        getContent: function(){
            return this.data;
        }
    },

    managetable: {
        init: function(product){
            this.data = new ManageTable({
                columnById:this.getActualColumns()
            });
            console.log('managetable: begins');
            return this.data;
        },
        setActualColumns: function () {
            var display = [];
            this.resetColumns();

            _.each(this.get('columnById'),function(element){
                utils.productListTableHeader[element].flag = 1;
            });
        },
        resetColumns: function  () {
            _.each(utils.productListTableHeader,function(element){
                if(element.id<2) element.flag = 1;
                else element.flag = 0;
            });
        },
        getActualColumns: function () {
            var display = [];
            _.each(utils.productListTableHeader,function(element){
                if(element.flag) display.push(element.id);
            });
            //console.log('getActualColumns:[%s]',display[0]);
            return display;
        },
        getContent: function(){
            return this.data.retrieveData();
        },
        get: function(item){
            return this.data.get(item);
        }
    },

    intechfacet: {
        init: function(product){
            console.log('intechfacet: [%s]',product.get('slug'));
            this.data = new PaInstanceFacet(product.get('painstancefacet'));
            return this.data;
        },
        getContent: function(){
            return this.data.retrieveData();
        }
    },

    paclasificationfacet: {
        init: function(product){
            this.data = new PaClasificationFacet(product.get('clasification'));
            return this.data;
        },
        getContent: function(){
            return this.data.retrieveData();
        }
    },

    productViewFactory: function(spec) {
        //spec.product; chapters; ancestors;
        //spec.context
        //spec.chselector; anselector; 
        //spec.anview; chview; notasview
        //spec.chrender; anrender; notasrender
        console.log('product factory called:[%s]',spec.product.get('productcode'));
        var loadChapters = function(cb){
            spec.product.loadpacapitulos(cb);
        };
        var loadNotas = function(cb){
            spec.product.loadnotas(cb);
        };
        var loadBranding = function(cb){
            dao.loadbranding(spec.product, cb);
        };
        var loadInstances = function(cb){
            spec.product.loadpacapitulos(cb);
        };
        var loadAssets = function(cb){
            spec.product.loadassets(cb);
        };
        var loadAncestors = function(cb){
            spec.ancestors = spec.product.loadpaancestors(cb);
        };
        var assetsRender = function(assets){
            console.log('ASSETS renderview:callback: [%s] length:[%s]',spec.asselector, assets.length);
            if(assets) spec.assets = assets.models;
            $(spec.asselector, spec.context).html("");
            _.each(spec.assets,function(asset){
                spec.asview = new AssetAccordionView({model:asset});
                $(spec.asselector, spec.context).append(spec.asview.render().el);
            });
        };
        var brandingRender = function(items){
            console.log('BRANDING renderview:callback: [%S]',spec.brandingselector);
            if(items) spec.brands = items;

            $(spec.brandingselector, spec.context).html("");
            spec.brands.each(function(branding){
                console.log('BRANDING EACH renderview:callback: [%S]',branding.get('slug'));
                spec.brandingview = new BrandingEditView({model:branding, viewController: viewController});
                $(spec.brandingselector, spec.context).append(spec.brandingview.render().el);
            });
        };
        var notasRender = function(items){
            console.log('NOTAS renderview:callback: [%S]',spec.notasselector);
            if(items) spec.notas = items;
            spec.notasview = new NotasView({model:spec.notas});
            $(spec.notasselector, spec.context).html(spec.notasview.render().el);
        };
        var ancestorRender = function(ancestors){
            if(ancestors) spec.ancestors = ancestors;
            console.log('ancestorRender:begins [%s] length:[%s]', spec.anselector, spec.ancestors.length)
            spec.anview = new AncestorView({model:spec.ancestors});
            $(spec.anselector,spec.context).html(spec.anview.render().el);
        };
        var chaptersRender = function(chapters){
            console.log('renderview:callback: [%S]',spec.chselector);
            if(chapters) spec.chapters = chapters;
            //if(!spec.chview) spec.chview = new ProductChaptersView({model:spec.chapters});
            spec.chview = new ProductChaptersView({model:spec.chapters});
            $(spec.chselector, spec.context).html(spec.chview.render().el);
        };
        var instancesRender = function(instances){
            console.log('instancerenderview:callback: [%S]',spec.inselector);
            if(instances) spec.instances = instances;
            //if(!spec.chview) spec.chview = new ProductChaptersView({model:spec.chapters});
            spec.chview = new ProductChaptersView({model:spec.instances});
            $(spec.inselector, spec.context).html(spec.chview.render().el);
        };

        var buildBrandingList= function (branding) {
            //var branding = model.relatedController.getBrands();
            var brands = [];

            if(!(branding && branding.length>0)) return;

            branding.each(function(brand){
            console.log('brands iterate:[%s]',brand.get('slug'));
                brands.push(brand.attributes);
            });
            console.log('brands length:[%s]',brands.length);
            spec.product.set({branding:brands});
        };


        var viewController = {
            fetchInstances: function(cb){
                loadInstances(cb);
            },
            fetchChapters: function(cb){
                loadChapters(cb);
            },
            fetchAncestors: function(cb){
                loadAncestors(cb);
            },
            fetchAssets: function(cb){
                loadAssets(cb);
            },
            fetchNotas: function(cb){
                loadNotas(cb);
            },
            notasrender: function() {
                loadNotas(notasRender);
            },
            brandingrender: function() {
                loadBranding(brandingRender);
            },
            asrender: function() {
                loadAssets(assetsRender);
            },
            chrender: function() {
                loadChapters(chaptersRender);
            },
            inrender: function() {
                loadInstances(instancesRender);
            },
            anrender: function() {
                loadAncestors(ancestorRender);
            },
            getBrands: function () {
                return spec.brands;
            },
            getProduct: function () {
                return spec.product;
            },
            buildBrandingList: function(){
                buildBrandingList(spec.brands);
            },
            setModel: function(pr,cb){
                spec.product = pr;
                loadChapters(cb);
            },
            refresh:function(){
                if(!spec.chapters) {
                    loadchapters(chaptersRender);
                }else{
                    chaptersRender();
                }
            },
        }
        return viewController;
    },

    loadbranding:function (model, cb) {
   
        console.log('mdel:loadbranding');

        var brands = this.fetchBrandingEntries(model, {});
        cb(brands);
    },

    fetchBrandingEntries: function (model, query){
        console.log('filtered: begins [%s] [%s]', model.get('slug'),model.get('branding').length);

        var filtered = _.filter(model.get('branding'),function(elem){

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

    resourcesQueryData:function (){
        if (!this.queryResourceData) {
            this.queryResourceData = new BrowseResourcesQuery();
        }
        return this.queryResourceData;
    },

    projectsQueryData:function (){
        if (!this.queryProjectData) {
            this.queryProjectData = new BrowseProjectsQuery();
        }
        return this.queryProjectData;
    },

    invertedAttributeList: function  (ancestor, products) {
        var self = this,
            data = {name: ancestor.get('productcode'), children:[]},
            entries = ['tipoproducto', 'descriptores','nivel_importancia','nivel_ejecucion','patechfacet','clasification','realization'],
            whoami;

        console.log('Inverted attribute BEGIN PRODUCTS :[%s]', products.length);

        products.each(function(product){
            console.log('PRODUCTS each iteration :[%s]', product.get('slug'));
            whoami = {name:product.get('productcode'), size: 1};
            self.parseProduct(entries, data, product,  whoami);
            console.log(JSON.stringify(data));
        });
        return data;
    },

    parseProduct: function (list, node, model, whoami){
        var self = this,
            entry_node, 
            local_node;
        console.log('parseProduct: list:[%s] node:[%s] whoami:[%s]', list[0], node.name, whoami.name);

        _.each(list, function(entry, index){
            entry_node = self.fetchEntryNode(node, entry);

            if(_.isString(model.get(entry))){
                local_node = self.fetchEntryNode(entry_node, model.get(entry));
                local_node.children.push(whoami);

            }else if ( _.isArray(model.get(entry)) ){
                var list = model.get(entry);
                _.each(list, function(elem){
                    local_node = self.fetchEntryNode(entry_node, elem);
                    local_node.children.push(whoami);
                });

            }else if (_.isObject(model.get(entry))){
                var entries = _.keys(model.get(entry));
                self.parseProduct(entries, entry_node, new Backbone.Model(model.get(entry)),  whoami);
            }
        });
    },

    fetchEntryNode: function (node, entry){
        var enode = _.filter(node.children,function(elem){
            if(elem.name === entry) return true; else return false;
        });
        if(enode && enode.length>0){
            return enode[0];
        }else {
            var newentry = {name:entry, children:[]};
            node.children.push(newentry);
            return newentry;
        }
    },

    pacontenidos: ['artecultura','cienciaTecnologia','cienciasSociales','deporte','educacionTrabajo','historia','infancia','juventud','sociedad','ficcion'],
    pageneros:['animacion', 'biografia', 'curso', 'ficcion', 'docuficcion', 'documental', 'entretenimiento', 'entrevistas', 'telenovela', 'reality', 'recital', 'periodistico', 'noticiero','inespecifico'],
    paformatos:['serie', 'micros', 'cortometraje', 'largometraje', 'trailer', 'promo', 'programa', 'noticiero', 'micro', 'unitarios', 'recital', 'periodistico', 'especial', 'inespecifico'],
    videotecas:['concurso', 'produccionPropia', 'adquisicion', 'coproduccion', 'cesion', 'banco','inespecifico'],
    etarios:['infantil', 'jovenes','adolescentes', 'adulto', 'mayores','inespecifico'],

    pasubcontenido: {
        artecultura: ['musica', 'plastica', 'fotografia', 'arteDigital', 'video', 'teatro', 'animacion', 'otros' ],
        cienciaTecnologia: ['astronomia', 'fisica', 'matematica', 'quimica','otros'],
        cienciasSociales: ['antropologia', 'historia', 'sociologia', 'economia', 'politica', 'otros'],
        deporte: ['historiaDeporte', 'actualidadDeporte', 'deporteAmateur', 'deporteProfesional','otros'],
        educacionTrabajo:['educSexual', 'primerosAuxilios', 'educRural', 'oficios', 'debateEducativo','otros' ],
        historia: ['universal', 'argentinaSXX', 'argentinaSXiX', 'biografia','otros'],
        infancia: ['pedagogia', 'recreacion', 'curricula','otros'],
        juventud: ['pedagogia', 'recreacion', 'curricula','otros'],
        sociedad: ['gastronomia', 'ddhh', 'familia', 'respSocial', 'salud','otros' ],
        ficcion: ['novela', 'thriller', 'drama', 'comedia', 'accion','otros' ],
    },


};
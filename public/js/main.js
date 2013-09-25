var AppRouter = Backbone.Router.extend({

    whoami: 'AppRouter: ',

    routes: {
        ""                      : "home",
        "login"                 : "browseProjects",
        "about"                 : "about",

        "ver/proyecto/:id"      : "viewprojectDetails",
        "proyectos"             : "listProjects",
        "navegar/proyectos"     : "browseProjects",
        "navegar/proyectos/pag/:page"  : "browseProjects",
        "proyectos/pag/:page"   : "listProjects",
        "proyectos/add"         : "addProject",
        "proyectos/:id"         : "projectDetails",

        "recursos"              : "browseResources",
        "navegar/recursos"      : "browseResources",
        "navegar/recursos/pag/:page"  : "browseResources",
        "recursos/pag/:page"   : "listResources",
        "recursos/add"          : "addResource",
        "recursos/:id"          : "resourceDetails",

        "requisitorias"          : "browseQuotations",
        "navegar/requisitorias"  : "browseQuotations",
        "navegar/requisitorias/pag/:page"  : "browseQuotations",
        "requisitorias/add"      : "addQuotation",
        "requisitorias/:id"      : "quotationDetails",

        "productos/add"          : "addProduct",
        "navegar/productos"      : "browseProducts",
        "navegar/productos/pag/:page"  : "browseProducts",
        "productos/:id"          : "productDetails",

        "activos/:id"            : "assetDetails"
        
    },


    initialize: function () {
        this.headerView = new HeaderView();
        $('.header').html(this.headerView.el);
    },

    home: function () {
        console.log('home:main.js');
        if (!this.homeView) {
            this.homeView = new HomeView();
        }
        $('#content').html(this.homeView.el);
        this.headerView.selectMenuItem('home-menu');
    },

    about: function () {
        console.log('about:main.js');
        if (!this.aboutView) {
            this.aboutView = new AboutView();
        }
        $('#content').html(this.aboutView.el);
        this.headerView.selectMenuItem('about-menu');
    },

    quotationDetails: function (id) {
        console.log('quotationDetails:main.js');
        //if (!this.quotationListLayoutView) {
        //    alert('create view 2');
        //    this.quotationListLayoutView = new QuotationListLayoutView({model: utils.quotationsQueryData()});
        //}
        $('#content').html(new QuotationListLayoutView({model: utils.quotationsQueryData()}).el);
        var quotation = new Quotation({_id: id});
        quotation.fetch({success: function() {
            $("#listcontent").html(new QuotationView({model: quotation}).el);
        }});
        this.headerView.selectMenuItem();
    },

    browseQuotations: function(page) {
        console.log('browseQuotations:main.js');
        //if (!this.quotationListLayoutView) {
        //    alert('create view 1');
        //    this.quotationListLayoutView = new QuotationListLayoutView({model: utils.quotationsQueryData()});
        //}
        $('#content').html(new QuotationListLayoutView({model: utils.quotationsQueryData()}).el);
        //var queryset = _.clone(this.queryQuotationData.attributes);
        var p = page ? parseInt(page, 10) : 1,
            query = utils.quotationsQueryData().retrieveData(),
            quotationList = new QuotationCollection();

        quotationList.fetch({
            data: query,
            type: 'post',
            //data: $.param({rubro:'tecnica'}),
            //data: JSON.stringify({rubro:'tecnica'}),
            success: function() {
                $("#listcontent").html(new QuotationListView({model: quotationList, page: p}).el);
            }
        });
        this.headerView.selectMenuItem('browse-menu');
        //console.log("browse quotation end");
    },

    addQuotation: function() {
        console.log('addQuotation:main.js');
        $('#content').html(new QuotationListLayoutView({model: utils.quotationsQueryData()}).el);

        var quotation = new Quotation({project: utils.quotationsQueryData().getProject() });
 
        $('#listcontent').html(new QuotationView({model: quotation}).el);
        //utils.editor.render('description');
        //var myEditor = new nicEditor({fullPanel : true }).panelInstance('description');
        //myEditor.addEvent('add', function() { alert( myEditor.instanceById('myArea2').getContent() );});});
        this.headerView.selectMenuItem();
        //this.headerView.selectMenuItem('add-menu');
    },

    addProduct: function() {
        console.log('addProduct:main.js');
        $('#content').html(new ProductViewLayout({model: utils.productsQueryData()}).el);

        var product = new Product({project: utils.productsQueryData().getProject() });
 
        $('#listcontent').html(new ProductView({model: product}).el);
        //utils.editor.render('description');
        //var myEditor = new nicEditor({fullPanel : true }).panelInstance('description');
        //myEditor.addEvent('add', function() { alert( myEditor.instanceById('myArea2').getContent() );});});
        //this.headerView.selectMenuItem();
        //this.headerView.selectMenuItem('add-menu');
    },

    productDetails: function (id) {
        console.log('productDetails:main.js');

        $('#content').html(new ProductViewLayout({model: utils.productsQueryData()}).el);

        var product = new Product({_id: id});
        product.fetch({success: function() {
            $("#listcontent").html(new ProductView({model: product}).el);

            //product.loadpacapitulos(function(chapters){
            //    console.log('ready to render chapters:main chapters:[%s]',chapters.length);
            //   $("#chapters").html(new ProductChaptersView({model: chapters}).render().el);
            //});
     
        }});
    },

    browseProducts: function(page) {
        console.log('browseProducts:main.js');
        var p = page ? parseInt(page, 10) : 1;
        var browseproducts = new ProductBrowseView({page:p, el:'#content',parenttag:'content'});
        /*

        $('#content').html(new ProductListLayoutView({model: utils.productsQueryData()}).el);

        var p = page ? parseInt(page, 10) : 1,
            query = utils.productsQueryData().retrieveData(),
            productList = new ProductCollection();

        productList.fetch({
            data: query,
            type: 'post',
            success: function() {
                // ProductListView controller: productlist.js
                $("#listcontent").html(new ProductListView({model: productList, page: p}).el);
            }
        });
        //this.headerView.selectMenuItem('browse-menu');
        */
    },



    listProjects: function(page) {
        console.log('listProjects:main.js');
        //console.log('list:main.js');
        var p = page ? parseInt(page, 10) : 1,
            projectList = new ProjectCollection();

        if (!this.projectListLayoutView) {
            this.projectListLayoutView = new ProjectListLayoutView();
        }
        $('#content').html(this.projectListLayoutView.el);
        projectList.fetch({success: function() {
            $("#listcontent").html(new ProjectListView({model: projectList, page: p}).el);
        }});
        this.headerView.selectMenuItem('home-menu');
    },

    browseProjects: function(page) {
        console.log('browseProjects:main.js');
        $('#content').html(new ProjectListLayoutView({model: utils.projectsQueryData()}).el);

        var p = page ? parseInt(page, 10) : 1,
            query = utils.projectsQueryData().retrieveData(),
            projectList = new ProjectCollection();

        projectList.fetch({
            data: query,
            type: 'post',
            //data: $.param({rubro:'tecnica'}),
            //data: JSON.stringify({rubro:'tecnica'}),
            success: function() {
                $("#listcontent").html(new ProjectListView({model: projectList, page: p}).el);
            }
        });
        this.headerView.selectMenuItem('browse-menu');
    },

    viewprojectDetails: function (id) {
        console.log('viewprojectDetails:main.js');
        $('#content').html(new ProjectViewLayout({model: utils.resourcesQueryData()}).el);
        projectview(id);
    },

    projectDetails: function (id) {
        var project = new Project({ _id: id});
        project.fetch({success: function() {
            utils.currentproject = project;
            $("#content").html(new ProjectView({model: project}).el);
        }});
        this.headerView.selectMenuItem();
    },

    addProject: function() {
        var project = new Project();
        $('#content').html(new ProjectView({model: project}).el);
        this.headerView.selectMenuItem('add-menu');
    },

    listResources: function(page) {
        console.log('list:main.js');
        // parseInt(num,radix)// converts a strint to integer in the selected base
        var p = page ? parseInt(page, 10) : 1,
            resourceList = new ResourceCollection();

        if (!this.projectListLayoutView) {
            this.projectListLayoutView = new ProjectListLayoutView();
        }
        $('#content').html(this.projectListLayoutView.el);

        resourceList.fetch({success: function() {
            $("#listcontent").html(new ResourceListView({model: resourceList, page: p}).el);
        }});
        this.headerView.selectMenuItem('browse-menu');
    },

    resourceDetails: function (id) {
        console.log('resourceDetails:main.js');
        //if (!this.resourceListLayoutView) {
        //    alert('create view 2');
        //    this.resourceListLayoutView = new ResourceListLayoutView({model: utils.resourcesQueryData()});
        //}
        $('#content').html(new ResourceListLayoutView({model: utils.resourcesQueryData()}).el);
        var resource = new Resource({_id: id});
        resource.fetch({success: function() {
            $("#listcontent").html(new ResourceView({model: resource}).el);
        }});
        this.headerView.selectMenuItem();
    },

    browseResources: function(page) {
        console.log('browseResources:main.js');
        //if (!this.resourceListLayoutView) {
        //    alert('create view 1');
        //    this.resourceListLayoutView = new ResourceListLayoutView({model: utils.resourcesQueryData()});
        //}
        //$('#content').html(new ResourceListLayoutView({model: utils.resourcesQueryData()}).el);
        //var queryset = _.clone(this.queryResourceData.attributes);
        var p = page ? parseInt(page, 10) : 1,
            query = utils.resourcesQueryData().retrieveData(),
            resourceList = new ResourceCollection();

        resourceList.fetch({
            data: query,
            type: 'post',
            //data: $.param({rubro:'tecnica'}),
            //data: JSON.stringify({rubro:'tecnica'}),
            success: function() {
                var rlv = new ResourceListView({model: resourceList, page: p});
                $("#content").html(rlv.el);
            }
        });
        this.headerView.selectMenuItem('browse-menu');
        //console.log("browse resource end");
    },
    assetDetails: function(id)
    {  
        console.log('assetDetails:main.js');
        
        if (!this.AssetLayoutView) {
            this.AssetLayoutView = new AssetLayoutView();
        }

        $('#content').html(this.AssetLayoutView.el);

        var asset = new Asset({_id: id});
        asset.fetch( {success: function()
        {
            $("#listcontent").html(new AssetView({model: asset}).el);

        }});

        this.headerView.selectMenuItem('browse-menu');
    },

    filesList: function()
    {
        console.log('fileList:main.js');
        // FIXME : El proyecto lo harcodeo, se debe pasar en la funcion
        var query = {related: {project: '519fbc3255658d6d18000001'}};

        //todo: configurar el query que realiza el callback
        fileList = new AssetCollection();
        //todo: 
        fileList.fetch({
            data: query,
            type: 'post',
     
            success: function () {
                
                var lista= new AssetListView({model:fileList});
                $("#content").html(lista.el);
            }

        });
    },
    //Esta funcion tiene que mostrar los datos de los detalles del archivo
    assetDetailsTest: function(id)
    {
        /*
        var project = new Project({ _id: id});
        
        project.fetch({success: function() 
        {
            utils.currentproject = project;
            
            $("#content").html(new ProjectView({model: project}).el);
        }});

        this.headerView.selectMenuItem();

        return false;
        */
        
        // Backbone se encarga de pasarle el id correspondiente
        // asset.fetch le ordena a backbone ir a buscar el objeto
        // al servidor, con el id pasado por argumento, cuando
        // asset.fetch es configurado con el objeto {success: function()
        // {
        // $("#content").html(new AssetView({model:asset}))
        // Este asset esta siendo referenciado utilizando la tecnica closure. 
        // donde el objeto no muere y sigue permaneciendo activo.
        // AssetView es la vista, que le paso el model adecuado para armarla
        // AssetView  referencia al controlador de la vista que extiende de backbone. 
        // }}

        console.log('assetDetails:main.js');

        var asset = new Asset({_id: id});

        asset.fetch( {success: function()
        {
            $("#content").html(new AssetView({model: asset}).el);

        }});
    },
    addResource: function() {
        console.log('addResource:main.js');
        $('#content').html(new ResourceListLayoutView({model: utils.resourcesQueryData()}).el);

        var resource = new Resource({project: utils.resourcesQueryData().getProject() });
 
        $('#listcontent').html(new ResourceView({model: resource}).el);
        //utils.editor.render('description');
        //var myEditor = new nicEditor({fullPanel : true }).panelInstance('description');
        //myEditor.addEvent('add', function() { alert( myEditor.instanceById('myArea2').getContent() );});});
        this.headerView.selectMenuItem();
        //this.headerView.selectMenuItem('add-menu');
    }
});
 
utils.loadTemplate(['HomeView', 'HeaderView', 'AboutView', 'ProjectListLayoutView', 'ProjectView',
    'ProjectListItemView', 'ResourceView', 'ResourceListItemView', 
    'ResourceListLayoutView', 'ResourceQuoteView',
    'QuotationListLayoutView', 'QuotationView', 'QuotationResourceItemView', 'QuotationListItemView',
    'PrjHeaderView','ProjectViewLayout','ReqResDetailView','AssetListItemView',
    'AssetAccordionView','AssetVersionListItemView','AssetView','AssetLayoutView',
    'ProductListLayoutView','ProductView','ProductListItemView','ProductPaTechFacetView','ProductViewLayout'], function() {
    app = new AppRouter();
    utils.approuter = app;
    Backbone.history.start();
});
//$ Backbone HeaderView utils ResourceView ResourceCollection HomeView AboutView ProjectCollection ProjectListLayoutView ProjectListView ProjectView ResourceListLayoutView ResourceListView app Project Resource

// AssetView, que carga el objeto utils.loadTemplate([AssetView]) se hace referencia al nombre del archivo html donde se van cargar los html

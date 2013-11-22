var AppRouter = Backbone.Router.extend({

    whoami: 'AppRouter: ',

    routes: {
        ""                       : "home",
        "login"                  : "browseProjects",
        "about"                  : "about",

        "ver/proyecto/:id"       : "viewprojectDetails",
        "proyectos"              : "listProjects",
        "navegar/proyectos"      : "browseProjects",
        "navegar/proyectos/pag/:page"  : "browseProjects",
        "proyectos/pag/:page"    : "listProjects",
        "proyectos/add"          : "addProject",
        "proyectos/:id"          : "projectDetails",

        "recursos"               : "browseResources",
        "navegar/recursos"       : "browseResources",
        "navegar/recursos/pag/:page"  : "browseResources",
        "recursos/pag/:page"     : "listResources",
        "recursos/add"           : "addResource",
        "recursos/:id"           : "resourceDetails",

        "requisitorias"          : "browseQuotations",
        "navegar/requisitorias"  : "browseQuotations",
        "navegar/requisitorias/pag/:page"  : "browseQuotations",
        "requisitorias/add"      : "addQuotation",
        "requisitorias/:id"      : "quotationDetails",

        "productos/add"          : "addProduct",
        "navegar/productos"      : "browseProducts",
        "navegar/productos/pag/:page"  : "browseProducts",
        "productos/:id"          : "productDetails",

        "articulos/add"          : "addArticle",
        "navegar/articulos"      : "browseArticles",
        "navegar/articulos/pag/:page"  : "browseArticles",
        "articulos/:id"          : "articleDetails",

        "personas/add"          : "addPerson",
        "navegar/personas"      : "browsePersons",
        "navegar/personas/pag/:page"  : "browsePersons",
        "personas/:id"          : "personDetails",

        "activos/add"            : "assetDetails",
        "activos/:id"            : "assetDetails",
        "navegar/activos"        : "browseAssets"
        
    },


    initialize: function () {
        this.headerView = new HeaderView();
        $('.header').html(this.headerView.el);
    },

    addPerson: function() {
        console.log('addPerson:main.js');
        $('#content').html(new PersonViewLayout().el);

        var person = new Person();
 
        $('#listcontent').html(new PersonView({model: person}).el);
    },

    personDetails: function (id) {
        console.log('personDetails:main.js');

        $('#content').html(new PersonViewLayout().el);

        var person = new Person({_id: id});
        person.fetch({success: function() {
            $("#listcontent").html(new PersonView({model: person}).el);     
        }});
    },

    browsePersons: function(page) {
        console.log('browsePersons:main.js');
        var p = page ? parseInt(page, 10) : 1;
        var browsepersons = new PersonBrowseView({page:p, el:'#content',parenttag:'content'});
    },


    home: function () {
        console.log('home:main.js');
        var user = new User();
        if (!this.homeView) {
            this.homeView = new HomeView({model: user});
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
        //    this.quotationListLayoutView = new QuotationListLayoutView({model: dao.quotationsQueryData()});
        //}
        $('#content').html(new QuotationListLayoutView({model: dao.quotationsQueryData()}).el);
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
        //    this.quotationListLayoutView = new QuotationListLayoutView({model: dao.quotationsQueryData()});
        //}
        $('#content').html(new QuotationListLayoutView({model: dao.quotationsQueryData()}).el);
        //var queryset = _.clone(this.queryQuotationData.attributes);
        var p = page ? parseInt(page, 10) : 1,
            query = dao.quotationsQueryData().retrieveData(),
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
        $('#content').html(new QuotationListLayoutView({model: dao.quotationsQueryData()}).el);

        var quotation = new Quotation({project: dao.quotationsQueryData().getProject() });
 
        $('#listcontent').html(new QuotationView({model: quotation}).el);
        //utils.editor.render('description');
        //var myEditor = new nicEditor({fullPanel : true }).panelInstance('description');
        //myEditor.addEvent('add', function() { alert( myEditor.instanceById('myArea2').getContent() );});});
        this.headerView.selectMenuItem();
        //this.headerView.selectMenuItem('add-menu');
    },

    addProduct: function() {
        console.log('addProduct:main.js');
        $('#content').html(new ProductViewLayout({model: dao.productsQueryData()}).el);

        var product = new Product({project: dao.productsQueryData().getProject() });
 
        $('#listcontent').html(new ProductView({model: product}).el);
        //utils.editor.render('description');
        //var myEditor = new nicEditor({fullPanel : true }).panelInstance('description');
        //myEditor.addEvent('add', function() { alert( myEditor.instanceById('myArea2').getContent() );});});
        //this.headerView.selectMenuItem();
        //this.headerView.selectMenuItem('add-menu');
    },

    addArticle: function() {
        console.log('addArticle:main.js');
        $('#content').html(new ArticleViewLayout().el);

        var article = new Article();
 
        $('#listcontent').html(new ArticleView({model: article}).el);
    },

    articleDetails: function(id) {
        console.log('articleDetails:main.js');
        $('#content').html(new ArticleViewLayout().el);

        var article = new Article({_id: id});
        article.fetch({success: function() {
            $('#listcontent').html(new ArticleView({model: article}).el);
        }});
    },

    productDetails: function (id) {
        console.log('productDetails:main.js');

        $('#content').html(new ProductViewLayout({model: dao.productsQueryData()}).el);

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

        $('#content').html(new ProductListLayoutView({model: dao.productsQueryData()}).el);

        var p = page ? parseInt(page, 10) : 1,
            query = dao.productsQueryData().retrieveData(),
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
        $('#content').html(new ProjectListLayoutView({model: dao.projectsQueryData()}).el);

        var p = page ? parseInt(page, 10) : 1,
            query = dao.projectsQueryData().retrieveData(),
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
        $('#content').html(new ProjectViewLayout({model: dao.resourcesQueryData()}).el);
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
        //    this.resourceListLayoutView = new ResourceListLayoutView({model: dao.resourcesQueryData()});
        //}
        $('#content').html(new ResourceListLayoutView({model: dao.resourcesQueryData()}).el);
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
        //    this.resourceListLayoutView = new ResourceListLayoutView({model: dao.resourcesQueryData()});
        //}
        //$('#content').html(new ResourceListLayoutView({model: dao.resourcesQueryData()}).el);
        //var queryset = _.clone(this.queryResourceData.attributes);
        var p = page ? parseInt(page, 10) : 1,
            query = dao.resourcesQueryData().retrieveData(),
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

    addResource: function() {
        console.log('addResource:main.js');
        $('#content').html(new ResourceListLayoutView({model: dao.resourcesQueryData()}).el);

        var resource = new Resource({project: dao.resourcesQueryData().getProject() });
 
        $('#listcontent').html(new ResourceView({model: resource}).el);
        //utils.editor.render('description');
        //var myEditor = new nicEditor({fullPanel : true }).panelInstance('description');
        //myEditor.addEvent('add', function() { alert( myEditor.instanceById('myArea2').getContent() );});});
        this.headerView.selectMenuItem();
        //this.headerView.selectMenuItem('add-menu');
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

        //this.headerView.selectMenuItem('browse-menu');
    },

    browseAssets: function()
    {
        console.log('fileList:main.js');
        // FIXME : El proyecto lo harcodeo, se debe pasar en la funcion
        var query = {related: {project: '5228df86c113982b02000001'}};

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

});


utils.loadTemplate(['HomeView', 'HeaderView', 'AboutView', 'ProjectListLayoutView', 'ProjectView',
    'ProjectListItemView', 'ResourceView', 'ResourceListItemView', 
    'ResourceListLayoutView', 'ResourceQuoteView',
    'QuotationListLayoutView', 'QuotationView', 'QuotationResourceItemView', 'QuotationListItemView',
    'PrjHeaderView','ProjectViewLayout','ReqResDetailView','AssetListItemView',
    'AssetAccordionView','AssetVersionListItemView','AssetView','AssetLayoutView',
    'ProductListLayoutView','ProductView','ProductListItemView','ProductPaTechFacetView',
    'ProductViewLayout','ArticleView', 'ArticleViewLayout','BrandingEditView',
    'PersonView','PersonViewLayout','PersonTableLayoutView'], function() {
    app = new AppRouter();
    utils.approuter = app;
    Backbone.history.start();
});

window.ProductViewLayout = Backbone.View.extend({

    whoami:'ProductViewLayout',

    initialize:function () {
        this.render();
    },

    render:function () {
        $(this.el).html(this.template(this.model.toJSON()));
        return this;
    },

    events: {
        "click  .prjview"  : "prjview",
        "click  .testview"    : "testview",
    },

    testview: function(){
        console.log('ProductViewLayout:productlayout: CLICK');

    },

    prjview: function(){
        utils.approuter.navigate('ver/proyecto/'+utils.productsQueryData().getProjectId(), true);
        return false;
    },

});

utils.productViewFactory = function(spec) {
    //spec.product
    //spec.chapters
    //spec.context
    //spec.chselector
    //spec.anselector
    //spec.anview
    //spec.chview
    //spec.chrender
    //spec.anrender
    console.log('product factory called:[%s]',spec.product.get('productcode'));
    var loadChapters = function(cb){
        console.log('loadchapters:begin [%s]', spec.product.get('productcode'));
        spec.product.loadpacapitulos(cb);
    };
    var chaptersRender = function(chapters){
        console.log('renderview:callback: [%S]',spec.chselector);
        if(chapters) spec.chapters = chapters;
        //if(!spec.chview) spec.chview = new ProductChaptersView({model:spec.chapters});
        spec.chview = new ProductChaptersView({model:spec.chapters});
        $(spec.chselector, spec.context).html(spec.chview.render().el);
    };
    var ancestorRender = function(){
        if(spec.product.isChild()){
            if(!spec.anview) spec.anview = new AncestorView({model:spec.product});
            console.log('ancestorRender:begins [%S]', spec.anselector)
            $(spec.anselector,spec.context).html(spec.anview.render().el);
        };
    };

    var viewController = {
        fetchChapters: function(cb){
            loadChapters(cb);
        },
        chrender: function() {
            console.log('chview.render');
            loadChapters(chaptersRender);
        },
        anrender: function() {
            console.log('ancestor.render');
            ancestorRender();
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
};

window.ProductChaptersView = Backbone.View.extend({

    initialize: function () {

        //$("#chapters").html(new ProductChaptersView({model: chapters}).render().el);
        //$("#chapters").html(new ProductChaptersView({model: chapters}).render().el);

        console.log('ProductChaptersView:INIT');
        this.listenTo(this.model, "change", this.changeevent,this);
        this.model.bind("change", this.changeevent, this);
        this.model.bind("destroy", this.destroyevent, this);
    },

    events: {
        "click  .chapteritem" : "chapteritem",
        "click  .testview" : "testview",
    },
    
    tagName:'ul',
    
    className:'nav nav-list',

    changeevent: function(){
        console.log('changeevent:ChapterInlineView:productlist CHANGE');
        this.render();

    },
    destroyevent: function () {
        console.log('destroyevent:ChapterInlineView:productlist DESTROY');
        this.close();
    },

    chapteritem:function(){
        console.log('productChaptersView: CLICK');

    },

    testview: function(){
        console.log('ProductChaptersView:productlist: CLICK');

    },

    render: function () {
        console.log('ProductChaptersView: render BEGIN');
        var that = this;
        var products = this.model.models;
        var len = products.length;
        //$(this.el).html('<ul class="nav nav-list"></ul>');

        _.each(products,function(element){
            console.log('each: element: [%s]',element.get('productcode'));
            $(that.el).append(new ChapterInlineView({model: element}).render().el);
        });
        return this;
    }
});

window.ChapterInlineView = Backbone.View.extend({

    tagName: "li",
    
    template: _.template("<button class='btn-block btn-link chapteritem'>[<%= es_capitulo_de.capnum %>]: <%= productcode %></button>"),

    events: {
        "click  .chapteritem" : "chapteritem",
        "click  .testview" : "testview",
    },

    testview: function(){
        console.log('ChapterInLineView:productlist: CLICK');

    },

    chapteritem:function(){
        console.log('ChapterINLINEView: CLICK');
        utils.approuter.navigate('productos/'+this.model.id, true);
    },

    initialize: function () {
        this.model.bind("change", this.changeevent, this);
        this.model.bind("destroy", this.destroyevent, this);
    },

    render: function () {
        console.log('each2: element: [%s]',this.model.get('productcode'));
 
        $(this.el).html(this.template(this.model.toJSON()));
        return this;
    },
    changeevent: function(){
        console.log('changeevent:ChapterInlineView:productlist CHANGE');
        this.render();

    },
    destroyevent: function () {
        console.log('destroyevent:ChapterInlineView:productlist DESTROY');
        this.close();
    },
});

window.AncestorView = Backbone.View.extend({

    tagName: "li",
    
    template: _.template("<button class='btn-block btn-link ancestorpa'><%= productcode %></button>"),

    events: {
        "click  .ancestorpa" : "ancestorpa",
    },

    ancestorpa:function(){
        console.log('ancestorView: CLICK');
        utils.approuter.navigate('productos/'+this.model.get('es_capitulo_de').product, true);
    },

    initialize: function () {
        this.model.bind("change", this.render, this);
        this.model.bind("destroy", this.close, this);
    },

    render: function () {
        $(this.el).html(this.template(this.model.toJSON()));
        return this;
    }
});
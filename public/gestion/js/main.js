utils.loadTemplate(['HomeView', 'HeaderView', 'AboutView','DocumEditLayoutView', 'DocumNavbar',
    'DocumEditMin', 'DocumShowDef','DocumEditCore' ], function() {
    //app = new AppRouter();
    //utils.approuter = app;
    //Backbone.history.start();
    $('[data-toggle=offcanvas]').click(function() {
        $('.row-offcanvas').toggleClass('active');
    });
    DocManager.start();
});



/*
var AppRouter = Backbone.Router.extend({

    whoami: 'AppRouter: ',

    routes: {
        ""                       : "home",
        "login"                  : "browseProjects",
        "about"                  : "about",

        
    },


    initialize: function () {
        this.headerView = new HeaderView();
        $('.header').html(this.headerView.el);
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


});
*/



var AppRouter = Backbone.Router.extend({

    whoami: 'bacua AppRouter:bacua/main.js ',

    routes: {
        ""                       : "login",
        "home"                   : "home",
        "about"                  : "about",

    },

    initialize: function () {
        console.log('appRouter:initialize:main.js');
        var self = this;
        dao.currentUser.getUser(function(user){
            var theUser = user ? new User(user) : new User();
            console.log('Initialize:main.js YES!!! [%s]',user.username);
            if(!self.headerView){
                self.headerView = new HeaderView({model: theUser});
                $('.header').html(self.headerView.el);
            }
        });
    },

    viewproduct: function(id) {
        console.log('[%s] viewproduct BEGIN',this.whoami);

        var viewproduct = new ProductView({el:'#content', productid:id, parenttag:'content'});
 
    },

    home_ant: function () {
        console.log('home:main.js');
        if (!this.homeView) {
            this.homeView = new HomeView();
        }
        $('#content').html(this.homeView.el);
        this.headerView.selectMenuItem('home-menu');
    },

    home: function(){
        console.log('home:main.js');
        var self = this;
        dao.currentUser.getUser(function(user){
            console.log('YES!!! [%s]',user.username);
            this.headerView = new HeaderView({model: new User(user)});
            $('.header').html(this.headerView.el);

            if(false){
                app.navigate('navegar/productos', false);
                self.browseProducts();
            } else {
                window.location = '/studio/productions';
            }
        });
    },

    login: function () {
        console.log('login:main.js BEGINS');
        var user = new UserLogin();
        if (!this.homeView) {
            this.homeView = new HomeView({model: user});
        }
        $('#content').html(this.homeView.el);
        // if(!this.headerView){
        //     this.headerView = new HeaderView({model: new User()});
        //     $('.header').html(this.headerView.el);
        // }
        //this.headerView.selectMenuItem('home-menu');
    },

    about: function () {
        console.log('about:main.js');
        if (!this.aboutView) {
            this.aboutView = new AboutView();
        }
        $('.marketing').html(this.aboutView.el);
        this.headerView.selectMenuItem('about-menu');
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


});
 
utils.loadTemplate(['HomeView', 'HeaderView', 'AboutView'], function() {
    app = new AppRouter();
    utils.approuter = app;
    Backbone.history.start();
});

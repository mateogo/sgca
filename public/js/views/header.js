window.HeaderView = Backbone.View.extend({

    initialize: function () {
        // model: User
        //console.log('headerView INIT');
        this.render();
    },

    templates: {
        logged:   'HeaderViewLogged',
        unlogged: 'HeaderViewNotLogged',
        visitor: 'HeaderViewVisitor',
    },

    getTemplate: function(){
        var menu = 'unlogged';

        if(this.model.get('displayName')){
            menu = 'logged'
            var roles = this.model.get('roles');
            if(roles){
                if(_.indexOf(roles,'adherente') != -1){
                    menu = 'visitor';
                }
            }
        }
        //console.log('displayName:[%s] [%s]',menu, this.model.get('displayName'))
        return utils.templates[this.templates[menu] ]; //'HeaderViewLogged'
    },


    render: function () {
        var self = this;
        var template = self.getTemplate();

        //console.log('HeaderView F:[%s]  O:[%s]', _.isFunction(template),_.isObject(template));
        //console.log('HeaderView [%s]', _.isFunction(template(self.model.toJSON()));
        //$(this.el).html((self.model.toJSON()));
        $(this.el).html(template(this.model.toJSON()));
        return this;
    },

    selectMenuItem: function (menuItem) {
        $('.nav li').removeClass('active');
        if (menuItem) {
            $('.' + menuItem).addClass('active');
        }
    }

});
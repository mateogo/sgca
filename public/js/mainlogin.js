window.AboutView = Backbone.View.extend({
    whoami: 'AboutView:mainlogin.js',

    initialize:function () {
        console.log('[%s] INIT',this.whoami);
        this.render();
    },
    render:function () {
        $(this.el).html(this.template());
        return this;
    }
});

window.ContentView = Backbone.View.extend({
    whoami: 'contentview:mainlogin.js',

    initialize:function () {
        console.log('[%s] INIT',this.whoami);

        this.user = new UserFacet();
        this.registrationView = new RegistrationView({model:this.user, el:'#signupbox'});
    },

    events: {
        "click .js-about"   : 'about',
        "click #asistencia" : 'needAssistance',

    },

    about: function(){
        console.log('about')
        
        if (!this.aboutView) {
            this.aboutView = new AboutView();
        }
        $('.js-about-content').html(this.aboutView.el);

        $('#loginbox').hide(); $('#aboutbox').show();
        //app.about();
    },

    needAssistance: function(){
        $('#loginbox').hide(); $('#asistbox').show()
    },

});



window.RegistrationView = Backbone.View.extend({
    whoami: 'RegistrationView:mainlogin.js',

    initialize:function () {
        console.log('[%s] INIT',this.whoami);
    },

    events: {
        "click .altausuario"       : "formuser",
        "click .js-insertuser"     : "insertNewUser",
        
        "click .js-login-submit"   : 'loginuser',
        "click .js-newUser"   : 'newuser',

        "click .js-about"   : 'about',

        "change": "change",
        "change:": "change",
    },


    newuser: function(){
        var self = this;
        console.log('New User');
        self.formuser();
    },


    about: function(){
        $('#loginbox').hide(); $('#aboutbox').show()
    },
    
    loginuser: function(event){
        var e = event.originalEvent;
        //event.stopPropagation();
        //event.preventDefault();
        //e.stopPropagation();
        //e.preventDefault();

        var self = this;

        //console.log('********  LOGIN user submit: [%s] [%s]', this.model.get('username'), this.model.get('password'));

 /*       var usercol = new Backbone.Collection(this.model.attributes,{
            url: "/login",
            model: User
        })
*/
/*
        $.ajax({
            data: {username:self.model.get('username'),password:self.model.get('password')},
            //username: self.model.get('username'),
            //password: self.model.get('password'),
            username: self.model.get('username'),
            password: self.model.get('password'),
            type: 'post',
            url: '/login',
            success: function() {
                console.log('callback SUCCESS');
            }
        });
*/
/*
        this.model.save(null, {
            success: function (model) {
                console.log('Login Callback success[%s]', model);
            },
            error: function () {
                console.log('Login Callback error');
            }
        });
*/
    },

    insertNewUser: function(){
        console.log('insertNewUser')

        var self = this;
        self.model.validusername(this.model.get('username'),function(error){
            if(error){
                console.log('error')
            }else{
                var errors = self.model.validate(self.model.attributes, {strict: true});
                if(errors){
                    self.displayValidationErrors(errors);

                }else{
                    console.log('ok READY TO INSERT')
                    self.model.addNewUser(function(user){
                        console.log('bbbbbBBBBBYYYYYYEEEEE')
                        $('#signupbox').hide(); 
                        $('#loginbox').show();

                    });

                }
            }
        });
    },


    change: function(event){
        var target = event.target;
        var change = {};
        var error;

        if(target.type==='checkbox'){
            change[target.name] = target.checked;
        }else{
            change[target.name] = target.value;
        }

        console.log('change!!! value:[%s]',target.value);

        error = this.model.validate(change);
        if(error){
            if(error[target.name]){
                console.log('Validate: Errors[%s]', error[target.name])
                this.addValidationError(target.id, error[target.name], this.el);
            }else{
                this.removeValidationError(target.id, this.el);            
                this.model.set(change);
            }
        }else{
            this.removeValidationError(target.id, this.el);            
            this.model.set(change);            
        }

        //utils.showAlert('Success!', 'name:['+target.name+'] value:['+target.value+'] key:['+target.id+'] checked:['+target.checked+'] type:['+target.type+'] change:['+change[target.name]+']', 'alert-success');

        // var check = this.model.validateItem(target.id);
        // if (check.isValid === false) {
        //     this.addValidationError(target.id, check.message, this.el);
        // } else {
        //    this.removeValidationError(target.id, this.el);
        // }
    },

    displayValidationErrors: function (messages) {
        for (var key in messages) {
            if (messages.hasOwnProperty(key)) {
                this.addValidationError(key, messages[key], this.el);
            }
        }
        //this.showAlert('Warning!', 'Fix validation errors and try again', 'alert-warning');
    },

    addValidationError: function (field, message, context) {
        console.log('f[%s] [%s]','#' + field,message)
        var controlGroup = $('#' + field, context).parent().parent();
        controlGroup.addClass('has-error');
        $('.help-block', controlGroup).html(message);
    },

    removeValidationError: function (field, context) {
        var controlGroup = $('#' + field, context).parent().parent();
        controlGroup.removeClass('has-error');
        $('.help-block', controlGroup).html('');
    },



    formuser: function () {
    },


    render:function () {
        return this;
    }

});


var AppRouter = Backbone.Router.extend({

    whoami: 'AppRouter:mainlogin.js',

    routes: {
        ""                       : "login",
        "login"                  : "loginhome",
    },

    initialize: function () {
        console.log('[%s] BEGINS',this.whoami);
        this.initContentView();
    },

    initContentView: function(){
        if (!this.contentView) {
            this.contentView = new ContentView({el:'.js-content'});
        }
    },

    loginhome: function(){
        var self = this;
        console.log('******* LoginHome');
        window.location = '/';
    },

    login: function () {
        console.log('login:mainlogin.js ROOT route');
    },

});

utils.loadTemplate([        
        'AboutView', 
    ], function() {

    window.app = new AppRouter();

    Backbone.history.start();
});



window.HomeView = Backbone.View.extend({
	whoami: 'homeview:home.js',

    initialize:function () {
        console.log('HomeView initialize [%s]', this.model.get('username'));
        this.render();
    },

  	events: {
        "click .altausuario"       : "formuser",
        "click .js-login-submit"   : 'loginuser',
        "change": "change",
    },
    
    loginuser: function(){
        var self = this;
        console.log('LOGIN user clic: [%s] [%s]', this.model.get('username'), this.model.get('password'));
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

    change: function(event){
        var target = event.target;
        var change = {};
        change[target.name] = target.value;
        this.model.set(change);
    },


    formuser: function () {
    	console.log('[%s] formuser BEGIN ', this.whoami);
        var self = this,
            usermodel = this.model,
            facet = new UserFacet(usermodel),
            form = new Backbone.Form({
                model: facet,
            });

        form.on('change', function(form, editorContent) {
            var errors = form.commit();
        });
            

        var modal = new Backbone.BootstrapModal({
            content: form,
            title: 'Alta de nuevo usuario',
            okText: 'aceptar',
            cancelText: 'cancelar',
            animate: false
        });

        modal.open(function(){
            var errors = form.commit();
            usermodel.set({displayName:facet.get('displayName')});
            usermodel.set({password:facet.get('password')});
            usermodel.set({mail:facet.get('mail')});
         	usermodel.set({username:facet.get('mail')});
         	console.log('[%s] before SAVE',self.whoami);

	        usermodel.save(null, {
	            success: function (model) {
	             	console.log('saveNode:newuser success');
	                utils.showAlert('Exito!', 'El nodo se actualizó correctamente', 'alert-success');
	            },
	            error: function () {
	                utils.showAlert('Error', 'Ocurrió un error al intentar actualizar este nodo', 'alert-error');
	            }
	        });
        });
    }, 

    render:function () {
        $(this.el).html(this.template(this.model.toJSON()));
        return this;
    }

});
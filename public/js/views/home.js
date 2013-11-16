window.HomeView = Backbone.View.extend({
	whoami: 'homeview:home.js',

    initialize:function () {
        this.render();
    },

  	events: {
        "click .altausuario"       : "formuser",
    },


    formuser: function () {
    	console.log('[%s] formuser BEGIN ', this.whoami);
        var self = this,
            usermodel = this.model,
            facet = new UserFacet(usermodel),
            form = new Backbone.Form({
                model: facet,
            });
        /*
        form.on('contenido:change', function(form, contenidoEditor) {
            var contenido = contenidoEditor.getValue(),
                newOptions = dao.pasubcontenido[contenido];
            form.fields.subcontenido.editor.setOptions(newOptions);
        });
        */
        form.on('change', function(form, contenidoEditor) {
            var errors = form.commit();
            //dao.pacapitulosfacet.getContent();
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
	                //app.navigate('productos/' + model.id, false);
	                //self.renderall();
	                utils.showAlert('Exito!', 'El nodo se actualizó correctamente', 'alert-success');
	            },
	            error: function () {
	                utils.showAlert('Error', 'Ocurrió un error al intentar actualizar este nodo', 'alert-error');
	            }
	        });


            /*
            usermodel.insertCapitulos(dao.pacapitulosfacet.getContent(),function(){
                self.beforeSave();
                console.log('formcapitulos:userdetails, ready to RELOAD CHAPTERS [%s]','useros/' + usermodel.id);
                self.renderChilds();
                //utils.approuter.navigate('useros/' + usermodel.id, {trigger: true, replace: false});
            });
			*/
        });
    }, 

    render:function () {
        $(this.el).html(this.template());
        return this;
    }

});
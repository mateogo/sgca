DocManager.module("LoginApp.Edit", function(Edit, DocManager, Backbone, Marionette, $, _){

  Edit.Layout = Marionette.LayoutView.extend({

    tagName: "div",
    className: "container",
    attributes: {
      id: 'defaultLayout'
    },

    getTemplate: function(){
      return utils.templates.LoginDefaultLayout;
    },

    regions: {
      loginRegion:     '#loginbox',
     }
  });

  //*************************************************************
  //           LOGIN FORM
  //*************************************************************
  Edit.LoginForm = DocManager.LoginApp.Common.Views.FormLogin.extend({
    whoami: 'LoginForm: edit_view.js',
    getTemplate: function(){
      return utils.templates.LoginForm;
    },

    templateHelpers: function(){
      var self = this;
      return {
        formatDate: function(date){
          return moment(date).format('dddd LL');
        },
        getFieldLabel: function(fieldName){
          return self.model.getFieldLabel(fieldName);
        }
      };
    },

    initialize: function(options){
      var self = this;
      this.events = _.extend({},this.formevents,this.events);
      this.delegateEvents();
    },

    events: {
      "click #registeruser": "registerUser",
      "click .js-login-submit": "login",
      "click .js-recoverypass": 'recoveryPass'
    },

    registerUser: function(e){
      e.stopPropagation();e.preventDefault();
      this.trigger('register:user:form');

    },

    login: function(e){
      this.trigger('login:user');
    },

    recoveryPass: function(e){
      this.trigger('login:recoverpass');
    }

  });


  //*************************************************************
  //           REGISTER FORM
  //*************************************************************
  Edit.SignUpForm = Marionette.ItemView.extend({
    whoami: 'SignUpForm: edit_view.js',

    getTemplate: function(){
        return utils.templates.SignUpForm;
    },

    templateHelpers: function(){
      var self = this;
      return {
        formatDate: function(date){
          return moment(date).format('dddd LL');
        },
        getFieldLabel: function(fieldName){
          return self.model.getFieldLabel(fieldName);
        }
      };
    },

    initialize: function(options){
      var self = this;
      this.events = _.extend({},this.formevents,this.events);
      this.delegateEvents();
    },

    onRender: function(){
      Backbone.Form.validators.errMessages.required = 'Dato requerido';
      Backbone.Form.validators.errMessages.email = 'No es un correo válido';
      Backbone.Form.validators.errMessages.match = 'El dato no coincide';

      this.form = new Backbone.Form({
        model: this.model,
        template: (this.model.isEmployee() ? utils.templates.SignUpFormEmployeeFields : utils.templates.SignUpFormFields)
      });

      this.form.on('username:blur', function(form, editorContent) {
          //console.log('***Blur:key: [%s] value:[%s]', editorContent.key,editorContent.getValue());

          this.model.validusername(editorContent.getValue(),function(error){
              if(error){
                  form.fields[editorContent.key].setError('Ya existe este usuario en la base de datos');
                  //var errors = form.commit({validate:true});
              }else{
                  form.fields[editorContent.key].clearError();
                  form.fields[editorContent.key].validate();
              }
          });
      });


      this.form.render();
      this.$el.find('#formContainer').html(this.form.el);
      //this.validateSubRubroSelect();
    },

    events: {
      "click #signinlink": "loginUser",
      "click #btn-signup": "saveNewUser",
    },

    saveNewUser: function(e){
      var self = this;
      e.stopPropagation();e.preventDefault();
      var errors = self.form.commit({validate: true});
      if(!errors){
        self.model.validusername(self.model.get('username'),function(error){
            if(error){
              var errors = self.form.commit({validate:true});
            }else{
              self.trigger('create:new:user', self.model);
            }
        });
      }else{
        //console.log('comit VALIDATION has ERRORS')
      }

    },

    loginUser: function(e){
      e.stopPropagation();e.preventDefault();
      this.trigger('login:user:form');

    }
  });

  /**
   * Vista formulario para cambiar contraseña
   */
  Edit.RecoveryView = Marionette.ItemView.extend({
    getTemplate: function(){
      return utils.templates.ProfileEditPasswordForm;
    },
    onRender: function(){
      var self = this;
      setTimeout(function(){
        self.$el.find('[name=password]').focus();
      });
    },
    showError: function(msg){
      this.$el.find('.alert').html(msg).slideDown();
    },
    hideError: function(){
      this.$el.find('.alert').hide();
    },
    commit: function(){
      this.model.set('password',this.$el.find('[name=password]').val());
    },
    validate: function(){
      var ok = true;
      var pass = this.$el.find('[name=password]').val();
      var newPass = this.$el.find('[name=newpassword]').val();
      if(pass !== newPass){
        this.showError('Las claves no coinciden, favor ingrese nuevamente la nueva contraseña');
        ok = false;

      }else if(pass.length < 6){
        this.showError('La clave es demasiado corta, favor ingrese al menos seis dígitos alfanuméricos');
        ok = false;
      }
      return ok;
    },
    events: {
      'click .js-submit': 'onSubmit'
    },
    onSubmit: function(){
      this.hideError();
      if(this.validate()){
        this.commit();
        var self = this;
        var $btn = this.$el.find('.js-submit');
        $btn.button('loading');
        var p = DocManager.request('user:changepassword',this.model);
        p.done(function(){
          self.trigger('password:changed');
          $btn.button('reset');
        }).fail(function(err){
          this.showError('No se pudo cambiar la contraseña');
          $btn.button('reset');
        });
      }
    }
  });


  /**
   * vista popup para pedir cambio de contreseña
   */
  Edit.RecoveryPass = Marionette.ItemView.extend({
    initialize: function(){
      this.listenTo(this,'ok',this.okClicked.bind(this));
    },
    getTemplate: function(){
      return utils.templates.RecoveryPassword;
    },
    onRender: function(){
      var self = this;
      setTimeout(function(){
        self.$el.find('[name=username]').focus();
      },500);
    },
    getEmail: function(){
      return this.$el.find('[name=username]').val();
    },

    showError: function(msg){
      this.$el.find('.alert').html(msg).slideDown();
    },
    hideError: function(){
      this.$el.find('.alert').hide();
    },

    okClicked: function (modal) {
        modal.preventClose();
        this.hideError();
        var self = this;
        var username = this.$el.find('[name=username]').val();
        this.model.set('username',this.$el.find('[name=username]').val());
        this.model.loadusers(username,function(users){
          if(users.length > 0){
            self.trigger('user:recovery',users.at(0));
            modal.close();
          }else{
            self.showError('No existe un usuario registrado con dicho email');
          }
        });
    }
  });

  /**
   * @param  {[type]} email puede ser nulo
   */
  Edit.recoveryPassPopup = function(userFacet){
    var view = new Edit.RecoveryPass({model:userFacet});

    var modal = new Backbone.BootstrapModal({
      content: view,
      title: 'Recuperación de clave de acceso',
      okText: 'Confirmar',
      cancelText: 'cancelar',
      enterTriggersOk: false,
      animate: true
    });

    modal.open();
    return view;
  };


});

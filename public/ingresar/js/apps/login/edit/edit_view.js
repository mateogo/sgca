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
          console.log('templateHelpers!!!!!!!! oops!')
          return moment(date).format('dddd LL');
        },
        getFieldLabel: function(fieldName){
          console.log('templateHelpers!!!!!!!! oops!')
          return self.model.getFieldLabel(fieldName);
        }
      };
    },

    initialize: function(options){
      console.log('LoginForm INIT')
      var self = this;
      this.events = _.extend({},this.formevents,this.events);
      this.delegateEvents();
    },

    events: {
      "click #registeruser": "registerUser",
      "click .js-login-submit": "login",

    },

    registerUser: function(e){
      e.stopPropagation();e.preventDefault();
      console.log('registerUser Click');
      this.trigger('register:user:form');

    },
 
    login: function(e){
      console.log('LoginUser Click');
      this.trigger('login:user');

    },
 
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
          console.log('templateHelpers!!!!!!!! oops!')
          return moment(date).format('dddd LL');
        },
        getFieldLabel: function(fieldName){
          console.log('templateHelpers!!!!!!!! oops!')
          return self.model.getFieldLabel(fieldName);
        }
      };
    },

    initialize: function(options){
      console.log('SignUpForm INIT')
      var self = this;
      this.events = _.extend({},this.formevents,this.events);
      this.delegateEvents();
    },

    onRender: function(){
      console.log('OnRender: [%s]',this.model.whoami);
      Backbone.Form.validators.errMessages.required = 'Dato requerido';
      Backbone.Form.validators.errMessages.email = 'No es un correo válido';
      Backbone.Form.validators.errMessages.match = 'El dato no coincide';

      this.form = new Backbone.Form({
        model: this.model,
        template: utils.templates.SignUpFormFields
      });

      this.form.on('username:blur', function(form, editorContent) {
          console.log('***Blur:key: [%s] value:[%s]', editorContent.key,editorContent.getValue());

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
      console.log('NewUser CLICK')
      var errors = self.form.commit({validate: true});
      if(!errors){
        self.model.validusername(self.model.get('username'),function(error){
            if(error){
              console.log('validation HAS ERRORS')
              var errors = self.form.commit({validate:true});
            }else{
              console.log('validation OK')
              self.trigger('create:new:user', self.model);
            }
        });        
      }else{
        console.log('comit VALIDATION has ERRORS')
      }

    },

    loginUser: function(e){
      e.stopPropagation();e.preventDefault();
      console.log('loginUser Click');
      this.trigger('login:user:form');

    }
  });
  
  
});



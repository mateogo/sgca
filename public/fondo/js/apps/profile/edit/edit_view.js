DocManager.module("ProfileApp.Edit", function(Edit, DocManager, Backbone, Marionette, $, _){

  Edit.Layout = Marionette.LayoutView.extend({

    getTemplate: function(){
      return utils.templates.ProfileEditLayout;
    },
    
    regions: {
      userRegion:     '#user-region',
      passwordRegion: '#password-region',
      personRegion:   '#person-region',
      relatedRegion:  '#related-region'
    }
  });



  Edit.Form = Marionette.ItemView.extend({

    formevents: {
      "click button.js-submit": "submitClicked",
      "click button.js-cancel": "cancelClicked",
      "change": "change"
    },

    onRender: function(){
      var self = this;
          /*      this.$(".js-datepicker").datepicker({
                        format: "dd/mm/yyyy"
                    }).on('changeDate',function(ev){
                        console.log('change DATEPICKER');
                        self.change(ev);

                    });
          */      
    },

    buildTags: function(target){
      console.log('buildtags [%s]', target.selectedOptions)
      if(target.multiple){
        var list = [];
        _.each(target.selectedOptions, function(elem){
          console.log('Selected: [%s]  [%s]', elem.label, elem.value)
          list.push(elem.value)
        })
        this.model.set(target.name, list);        
      }
    },

    change: function (event) {
        //utils.hideAlert();
        //console.log('FORM CHANGE')
        var target = event.target;
        var change = {};

        if(target.type==='checkbox'){
          this.model.get(target.name)[target.value] = target.checked;
          //console.log('CHANGE: checked:[%s]: name:[%s] value:[%s]',target.checked, target.name, target.value);
        }else{
          change[target.name] = target.value;
          this.model.set(change);          
          //console.log('[%s] CHANGE: [%s]: [%s] [%s]',this.model.whoami, target.name, target.value, target['multiple']);
        }
        if(target['dataset']){
          if(target['dataset'].role === 'tagsinput'){
            this.buildTags(target)
          }
        }

        var err = this.model.validate(change);
        this.onFormDataInvalid((err||{}));
    },

    submitClicked: function(e){
      e.preventDefault();
      var err = this.model.validate(this.model.attributes);

      if(err){
        this.onFormDataInvalid((err||{}));
      }else{
        //var data = Backbone.Syphon.serialize(this);
        console.log('FORM SUBMITTED');
        this.trigger("form:submit", this.model);        
      }

    },

    cancelClicked: function(e){
      e.preventDefault();
      this.close()
    },

    showAlert: function(title, text, klass){
      this.$('.alert').removeClass("alert-error alert-warning alert-success alert-info");
      this.$('.alert').addClass(klass);
      this.$('.alert').html('<strong>' + title + '</strong> ' + text);
      this.$('.alert').show();

    },

    onFormNotifications: function(msgs, tstyle){
      var $view = this.$el,
          selector;

      if(!tstyle){
        tstyle = 'warning';
      }
      if(['warning','succes','error'].indexOf(tstyle) === -1){
        tstyle = 'warning';
      }
      
      tstyle = 'has-' + tstyle;
      selector = "." + tstyle;

      console.log('onForm Notifications [%s][%s]', tstyle, selector);

      var clearFormErrors = function(){
        $view.find(selector).each(function(){
          $(this).removeClass(tstyle);
          $('.help-block', $(this)).html("");
        });
      }

      var markErrors = function(value, key){
        var $controlGroup = $view.find("#" + key).closest('.form-group');
        $controlGroup.addClass(tstyle);
        $('.help-block', $controlGroup).html(value);
      }

      clearFormErrors();
      _.each(msgs, markErrors);
    },

    onFormDataInvalid: function(errors){
      //console.log('FORM ON RENDER')
      var $view = this.$el;

      var clearFormErrors = function(){
        //var $view = $view.find("form");
        var $form = $view;
        $form.find(".has-error").each(function(){
          $(this).removeClass("has-error");
          $('.help-block', $(this)).html("");
        });
      }

      var markErrors = function(value, key){
        var $controlGroup = $view.find("#" + key).closest('.form-group');
        $controlGroup.addClass("has-error");
        $('.help-block', $controlGroup).html(value);
      }

      clearFormErrors();
      _.each(errors, markErrors);
    }
  });


  Edit.Profile = Edit.Form.extend({
    
    templates: {
      user:     'ProfileEditUserForm',
      person:   'ProfileEditPersonForm',
      related:  'ProfileEditRelatedForm',
      password:  'ProfileEditPasswordForm',
    },

    getTemplate: function(){
      return utils.templates[this.templates[this.options.formtemplate]];
    },

    initialize: function(options){
      var self = this;
      this.events = _.extend({},this.formevents,this.events);
      this.delegateEvents();
      this.options = options;
    },

    onRender: function(){
      var self = this;
    },

    events: {

    },
  });





});




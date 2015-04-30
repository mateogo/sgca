DocManager.module("FondoRequestApp.Edit", function(Edit, DocManager, Backbone, Marionette, $, _){
  
  Edit.Layout = Marionette.LayoutView.extend({

    templateData: '<div id="form-region"></div>',

    tagName: "div",
    attributes: {
      id: 'mainFormLayout'
    },

    getTemplate: function(){
      return _.template(this.templateData)
    },
    regions: {
      formRegion: '#form-region',
    },

    events: {
      'click .js-basicedit':'onClickBaseEdit',
    },

    onClickBaseEdit: function(){
      console.log('Click basicEdit')
      this.trigger('edit:basic:data');
    },

  });
  
  //NOT FOUND VIEW
  Edit.NotFoundView = Marionette.ItemView.extend({
    tagName: 'h2',
    className: 'text-danger',
    render: function(){
      this.$el.html('La tramitación no existe');
    }
  });

  // ********** WIZARD FORM LAYOUT **********
  Edit.MovilidadWizardLayout = Marionette.LayoutView.extend({
    whoami: 'MovilidadWizardLayout',
    tagName: "div",
    attributes: {
      id: 'formWizardLayout'
    },
    initialize: function(opts){
      console.log('[%s] INIT', this.whoami);
      if(opts.tab){
        this.selectedTab = opts.tab;
      }
      // ver LPVNLO
      Marionette.ItemView.prototype.initialize.apply(this,arguments);
    },

    regions: {
      steponeRegion:   '#stepone-region',
      steptwoRegion:   '#steptwo-region',
      stepthreeRegion: '#stepthree-region',
      stepfourRegion:  '#stepfour-region',
      stepfiveRegion:  '#stepfive-region',
    },

    getTemplate: function(){
      return utils.templates.FondoMovilidadInscriptionFormLayout;
    },
    onRender: function(){
      // if(this.selectedTab){
      //   this.selectTab(this.selectedTab);
      // }
    },
    events: {
      'click .js-openevent': 'openEventClicked',
    },
    
    openEventClicked: function(e){
      e.stopPropagation();
      DocManager.trigger('events:list',this.model);
    }
  });

  
  Edit.StepOneForm = DocManager.FondoRequestApp.Common.Views.Form.extend({
    whoami: 'StepOneForm',    
    getTemplate: function(){
      return utils.templates.RegistroEntidadForm;
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
//      console.log('Edit.DOCUMENT BEGINS')
      var self = this;
      this.events = _.extend({},this.formevents,this.events);
      this.delegateEvents();
    },

    onRender: function(){
      var self = this;
      console.log('rendering')
      $('#myWizard').wizard();

      // INIT radio tipo juridico
      self.$('.radio-custom').radio();
      if(self.model.get('etipojuridico') === 'pfisica') self.$('.togglejuridica').addClass('hidden');


      $('#myWizard').on('actionclicked.fu.wizard', function (evt, data) {
        var step = data.step;
        if(step == 1){
          console.log('[%s]: wizard EVENT: step:[%s]  direction:[%s]', self.whoami, data.step, data.direction);
          if(data.direction === 'next'){
            if(!self.validateStep(step)){
              evt.preventDefault();
              $('#myWizard').wizard('selectedItem', {step: step});
            }else{
              console.log('Validation OK',step)
            }
          }
        } 
      });


    },
    validateStep: function(step){
      var errors = this.model.validateStep(step);
      this.onFormDataInvalid((errors||{}));
      if(errors){
        return false
      }else{
        return true;
      }
    },

    events: {

    },

    stateinput:function(e){ 
      e.preventDefault();
      e.stopPropagation();

      this.change(e);
      //Atrapa el pais elegido
      console.log('Stateinput CHANGE[%s]', eprov)
      var country = this.model.get('epais');
      var province = this.model.get('eprov');
      
      //Si no es Argentina convierte el <select> en <input>
      if (country !='AR'){
//        $('#eprov').replaceWith('<input class="form-control" type="text" name="eprov" id="eprov">');
          console.log('no es arg stateinput');
          this.$('.js-provext').show();
          this.$('.js-provarg').hide();
//        vacia el contenido de la provincia del exterior para no traer el valor de la prov argentina grabada en el model
          this.$('.js-provext').val(' ')
      }
      else{
        //Eligio otro pais y vuelve a elegir Argentina se arman las opciones de provincias otra vez
//        var aprov = utils.buildSelectOptions("eprov",utils.provinciasOptionList.Argentina, province);
//        $('#eprov').replaceWith('<select class="form-control" id="eprov" name="eprov> aprov("eprov")</select>');
//        $('#eprov').html(aprov);
        console.log('es arg stateinput')
          this.$('.js-provarg').show();
          this.$('.js-provext').hide();
      }
    },

    uservalidation: function(e){
      e.preventDefault();
      e.stopPropagation();

      this.change(e);
      
      var self = this,
          usermail = self.model.get('eusuario'),
          post;

      console.log('User validation: [%s]', usermail);
      this.trigger('user:validate', self, usermail, function(user, msgs){
        if(user){
          console.log('UserValidation CB [%s]',user.get('username[%s]'),msgs); 
        }else{
          console.log('UserValidation CB el usuario NO EXISTE [%s]',msgs);
        }
        post = msgs ? {'eusuario': msgs} : {};
        self.onFormNotifications(post);
      });

    },


  });
  
  Edit.StepTwoForm = DocManager.FondoRequestApp.Common.Views.Form.extend({
    whoami: 'StepTwoForm',
    
    getTemplate: function(){
      return utils.templates.ParticipacionesAnterioresForm;
    },

    initialize: function(options){
      var self = this;
      this.events = _.extend({},this.formevents,this.events);
      this.delegateEvents();
    },

    onRender: function(){
      var self = this;

      // INIT radio tipo juridico
      self.$('.radio-custom').radio();
      self.$('.checkbox-custom').checkbox();
      //if(self.model.get('etipojuridico') === 'pfisica') self.$('.togglejuridica').addClass('hidden');

      $('#myWizard').on('actionclicked.fu.wizard', function (evt, data) {
        var step = data.step;
        if(step == 2){
          console.log('[%s]: wizard EVENT: step:[%s]  direction:[%s]', self.whoami, data.step, data.direction);
          if(data.direction === 'next'){
            if(!self.validateStep(step)){
              evt.preventDefault();
              $('#myWizard').wizard('selectedItem', {step: step});
            }else{
              console.log('Validation OK',step)
            }
          }
        }

      });    
    },
    validateStep: function(step){
      var errors = this.model.validateStep(step);
      this.onFormDataInvalid((errors||{}));
      if(errors){
        return false
      }else{
        return true;
      }
    },

  });

  Edit.StepThreeForm = DocManager.FondoRequestApp.Common.Views.Form.extend({
    whoami: 'StepThreeForm',
    
    getTemplate: function(){
      return utils.templates.MovilidadDatosGeneralesForm;
    },

    initialize: function(options){
      var self = this;
      this.events = _.extend({},this.formevents,this.events);
      this.delegateEvents();
    },

    onRender: function(){
      var self = this;

      // INIT radio tipo juridico
      self.$('.radio-custom').radio();
      self.$('.checkbox-custom').checkbox();
      //if(self.model.get('etipojuridico') === 'pfisica') self.$('.togglejuridica').addClass('hidden');

      $('#myWizard').on('actionclicked.fu.wizard', function (evt, data) {
        var step = data.step;
        if(step == 2){
          console.log('[%s]: wizard EVENT: step:[%s]  direction:[%s]', self.whoami, data.step, data.direction);
          if(data.direction === 'next'){
            if(!self.validateStep(step)){
              evt.preventDefault();
              $('#myWizard').wizard('selectedItem', {step: step});
            }else{
              console.log('Validation OK',step)
            }
          }
        }

      });    
    },
    validateStep: function(step){
      var errors = this.model.validateStep(step);
      this.onFormDataInvalid((errors||{}));
      if(errors){
        return false
      }else{
        return true;
      }
    },

  });

  Edit.StepFourForm = DocManager.FondoRequestApp.Common.Views.Form.extend({
    whoami: 'StepFourForm',
    
    getTemplate: function(){
      return utils.templates.MovilidadCostosForm;
    },

    initialize: function(options){
      var self = this;
      this.events = _.extend({},this.formevents,this.events);
      this.delegateEvents();
    },

    onRender: function(){
      var self = this;

      // INIT radio tipo juridico
      self.$('.radio-custom').radio();
      self.$('.checkbox-custom').checkbox();
      //if(self.model.get('etipojuridico') === 'pfisica') self.$('.togglejuridica').addClass('hidden');

      $('#myWizard').on('actionclicked.fu.wizard', function (evt, data) {
        var step = data.step;
        if(step == 2){
          console.log('[%s]: wizard EVENT: step:[%s]  direction:[%s]', self.whoami, data.step, data.direction);
          if(data.direction === 'next'){
            if(!self.validateStep(step)){
              evt.preventDefault();
              $('#myWizard').wizard('selectedItem', {step: step});
            }else{
              console.log('Validation OK',step)
            }
          }
        }

      });    
    },
    validateStep: function(step){
      var errors = this.model.validateStep(step);
      this.onFormDataInvalid((errors||{}));
      if(errors){
        return false
      }else{
        return true;
      }
    },

  });
    
  Edit.StepFiveForm = DocManager.FondoRequestApp.Common.Views.Form.extend({
    whoami: 'StepFiveForm',
    
    getTemplate: function(){
      return utils.templates.FileUploadingForm;
    },

    initialize: function(options){
      var self = this;
      this.events = _.extend({},this.formevents,this.events);
      this.delegateEvents();
    },

    onRender: function(){
      var self = this;

      // INIT radio tipo juridico
      self.$('.radio-custom').radio();
      self.$('.checkbox-custom').checkbox();
      //if(self.model.get('etipojuridico') === 'pfisica') self.$('.togglejuridica').addClass('hidden');

      $('#myWizard').on('actionclicked.fu.wizard', function (evt, data) {
        var step = data.step;
        if(step == 2){
          console.log('[%s]: wizard EVENT: step:[%s]  direction:[%s]', self.whoami, data.step, data.direction);
          if(data.direction === 'next'){
            if(!self.validateStep(step)){
              evt.preventDefault();
              $('#myWizard').wizard('selectedItem', {step: step});
            }else{
              console.log('Validation OK',step)
            }
          }
        }

      });    
    },
    validateStep: function(step){
      var errors = this.model.validateStep(step);
      this.onFormDataInvalid((errors||{}));
      if(errors){
        return false
      }else{
        return true;
      }
    },

  });


});

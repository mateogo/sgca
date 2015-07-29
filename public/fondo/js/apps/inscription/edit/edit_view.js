DocManager.module("FondoRequestApp.Edit", function(Edit, DocManager, Backbone, Marionette, $, _){

  var AppCommon = DocManager.module('App.Common');
  
  Edit.Layout = Marionette.LayoutView.extend({
    templateData: '<div id="form-region"></div>',

    tagName: "div",
    attributes: {
      id: 'mainFormLayout'
    },

    onRender: function(){
    },

    getTemplate: function(){
      return _.template(this.templateData)
    },
    
    regions: {
      formRegion: '#form-region',
    },

    events: {
      'click .js-basicedit':'onClickBaseEdit',
      'click ': 'formSubmit',
    },

    onFormSubmit: function(){
      //console.log('Click basicEdit')
    },

    onClickBaseEdit: function(){
      //console.log('Click basicEdit')
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
  Edit.WizardLayout = Marionette.LayoutView.extend({
    whoami: 'WizardLayout',
    tagName: "div",
    
    attributes: {
      id: 'formWizardLayout'
    },

    initialize: function(opts){
      if(opts.tab){
        this.selectedTab = opts.tab;
      }
    },
    
    onRender: function(){
    },

    onShow: function(){

      $('#myWizard').wizard();
      registerStepWizardAction();

    },

    regions: {
      steponeRegion:   '#stepone-region',
      steptwoRegion:   '#steptwo-region',
      stepthreeRegion: '#stepthree-region',
      stepfourRegion:  '#stepfour-region',
      stepfiveRegion:  '#stepfive-region',
    },

    getTemplate: function(){
      return utils.templates.FondoMovLayout;
    },

    events: {
      'click .js-openevent': 'openEventClicked',
      'click .js-provisorio': 'submitFormProvisorio',
      'click .js-definitivo': 'submitFormDefinitivo',
      'click  .js-termsofuse': 'termsOfUse',
      'change #legal': 'change',
    },

    change: function(e){
      if(this.$('#legal').prop('checked')){
          this.model.set('legal','aceptado');
        }else{
          this.model.set('legal','pendiente');
        }

    },
    termsOfUse: function(e){
      var self = this;
      e.preventDefault();
      e.stopPropagation();

      DocManager.confirm(utils.templates.FondoTerminosYCondiciones(),{okText: 'Aceptar', cancelText: 'cancelar'}).done(function(){
          self.$('#legal').prop('checked', true);
      });
    },

    submitFormProvisorio: function(evt){
      evt.stopPropagation();
      this.trigger('submit:form:provisorio', this.model);

    },

    submitFormDefinitivo: function(evt){
      evt.stopPropagation();

      if(!checkAttachments()) {
        evt.preventDefault();
        Message.error('Debe adjuntar los documentos solicitados para grabar definitivo');
      }else{
        this.trigger('submit:form:definitivo', this.model);
      }

    },
    
    openEventClicked: function(e){
      e.stopPropagation();
      this.trigger('submit:form',this.model);
    },

    openEventClicked: function(e){
      e.stopPropagation();
      DocManager.trigger('events:list',this.model);
    }

  });

  
  //*************************************************************
  //           FORM STEP-ONE: EMPRESA
  //*************************************************************
  Edit.StepOneForm = DocManager.FondoRequestApp.Common.Views.Form.extend({
    whoami: 'StepOneForm',    
    getTemplate: function(){
      return utils.templates.FondoMov01Form;
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
      var self = this;
      $('#myWizard').wizard();

      // INIT radio tipo juridico
      self.$('.radio-custom').radio();
      self.$('.checkbox-custom').checkbox();

      // ayuda popover
      self.$('[data-toggle="popover"]').popover()
      helpPopUp(self);

      var $div = self.$el.find('.js-avatar').append($('<div></div>'));

      self.avatarEditor = new Edit.AvatarEditor({
        model: self.model,
        el: $div,
      })
      self.avatarEditor.render();

    },

    validateStep: function(step){
      var errors = this.model.validateStep(step) ;

      if(this.model.get('tsolicitud')=== 'movilidad_mica' && !getSession().mica.id){
        console.log('Tsolicitud con PROBLEMAS')
        errors = errors ||{};
        errors.tsolicitud = 'Para aplicar a MOVILIDAD MICA debe contar con una INSCRIPCIÓN ACTIVA en dicho evento';

      }

      this.onFormDataInvalid((errors || {}));
      if(errors){
        return false
      }else{
        return true;
      }
    },

    events: {
      'change #tsolicitud':'changeTsol',
    },

    changeTsol: function(event){
      var self = this,
          tsol = event.target.value;
      console.log('tsolicitud:[%s]',tsol);
      if(tsol === 'movilidad_mica'){
        self.model.set({
          eventname:  'Participación en MICA, número inscripción: ' + getSession().mica.get('cnumber'),
          eventtype: 'mica',
          eventurl: 'http://mica.cultura.gob.ar/'
        });
        self.render();

      }

    },

    uservalidation: function(e){
      e.preventDefault();
      e.stopPropagation();

      this.change(e);
      
      var self = this,
          usermail = self.model.get('eusuario'),
          post;

      this.trigger('user:validate', self, usermail, function(user, msgs){
        if(user){

        }else{

        }
        post = msgs ? {'eusuario': msgs} : {};
        self.onFormNotifications(post);
      });

    },


  });
  
  
  //*************************************************************
  //           FORM STEP-DOS: REPRESENTANTE
  //*************************************************************
  Edit.StepTwoLayout = Marionette.LayoutView.extend({

    tagName: "div",
    attributes: {
      id: 'mainForm02Layout'
    },

    getTemplate: function(){
      return utils.templates.FondoMov02Layout;
    },

    onRender: function(){
      var self = this;
      self.$('.radio-custom').radio();
      self.$('.checkbox-custom').checkbox();
    },

    events: {
    },

    regions: {
      formRegion: '#form-region',
      representanteRegion: '#representante-region',
    },

  });
  //*************************************************************
  //           FORM STEP-DOS: REQUIRENTE
  //*************************************************************
  Edit.StepTwoForm = DocManager.FondoRequestApp.Common.Views.Form.extend({
    whoami: 'StepTwoForm',
    
    getTemplate: function(){
      return utils.templates.FondoMov02Form;
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
      $('#myWizard').wizard();

      if(self.model.get('etipojuridico') === 'pfisica') self.$('.togglejuridica').addClass('hidden');
      if(self.model.get('fondo2014') === 'no') self.$('#fondo-detail').addClass('hidden');
      if(self.model.get('mica2014') === 'no') self.$('#mica-detail').addClass('hidden');

      // ayuda popover
      self.$('[data-toggle="popover"]').popover()
      helpPopUp(self);

      self.toggleStateInput();

    },

    events: {
      'change #epais':'stateinput',
    },

    stateinput:function(e){ 
      e.preventDefault();
      e.stopPropagation();

      this.change(e);
      this.toggleStateInput(e);
    },

    toggleStateInput: function(e){
      if (this.model.get('epais') !='AR'){
          this.$('.js-provext').show();
          this.$('.js-provarg').hide();
          if(e) this.$('.js-provext').val('')
      }
      else{
          this.$('.js-provarg').show();
          this.$('.js-provext').hide();
      }
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

  //*************************************************************
  //           FORM STEP-TRES: ITINERARIO
  //*************************************************************
  Edit.StepThreeLayout = Marionette.LayoutView.extend({

    tagName: "div",
    attributes: {
      id: 'mainForm03Layout'
    },

    getTemplate: function(){
      return utils.templates.FondoMov03Layout;
    },
    onRender: function(){
      var self = this;
 
      self.$('.radio-custom').radio();
      self.$('.checkbox-custom').checkbox();

    },
    
    events: {
    },

    regions: {
      formRegion: '#form-region',
      itinerarioRegion: '#itinerario-region',
      pasajeroRegion: '#pasajero-region',
    },
  });
  
  Edit.StepThreeForm = DocManager.FondoRequestApp.Common.Views.Form.extend({
    whoami: 'StepThreeForm',
    
    getTemplate: function(){
      return utils.templates.FondoMov03Form;
    },

    initialize: function(options){
      var self = this;
      this.events = _.extend({},this.formevents,this.events);
      this.delegateEvents();
    },

    templateHelpers: function(){
      var self = this;
      return {
        linkType: function(item){
          return utils.fetchLabel(utils.linkTypeOpLst, item);
        },
        formatDate: function(date){
          return moment(date).format('dddd LL');
        },
        getFieldLabel: function(fieldName){
          return self.model.getFieldLabel(fieldName);
        }
      };
    },

    onRender: function(){
      var self = this;

      // INIT radio tipo juridico
      self.$('.radio-custom').radio();
      self.$('.checkbox-custom').checkbox();

      $('#myWizard').wizard();

      //if(self.model.get('etipojuridico') === 'pfisica') self.$('.togglejuridica').addClass('hidden');
      initTagsInput(self, 'vdescriptores');
      // ayuda popover

      self.$('[data-toggle="popover"]').popover()
      helpPopUp(self);

    },

    events: {
      'click .js-btn-add1': 'linksAudio',
      'click .js-btn-remove': 'removeAudio',
      'change #epais':'stateinput',
    },


    removeAudio: function(e){
      $(e.target).parents('.ventry:first').remove();
      e.preventDefault();
      return false;
    },

    linksAudio: function(e){
      var self = this,
          controlForm = self.$('.vaudiocontrols div:first'),
          currentEntry = $(e.target).parents('.ventry:first'),
          newEntry = $(currentEntry.clone()).appendTo(controlForm);
      
      e.preventDefault();
      newEntry.find('input.vaudio').val('');
      controlForm.find('.ventry:not(:last) .js-btn-add1')
          .removeClass('js-btn-add1').addClass('js-btn-remove')
          .removeClass('btn-warning').addClass('btn-danger')
          .html('<span class="glyphicon glyphicon-minus"></span>');
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
  var initTagsInput = function(view, elem){
    view.$('#'+elem).tagsinput();
    var items = view.model.get(elem);
    if(items){
      _.each(items, function(item){

          view.$('#'+elem).tagsinput('add',item);

      });
    }

  }

  //*************************************************************
  //           FORM STEP-CUATRO: ADJUNTOS
  //*************************************************************
  Edit.StepFourLayout = Marionette.LayoutView.extend({

    tagName: "div",
    attributes: {
      id: 'mainForm04Layout'
    },

    getTemplate: function(){
      return utils.templates.FondoMov04Layout;
    },
    onRender: function(){
      var self = this;

      self.$('.radio-custom').radio();
      self.$('.checkbox-custom').checkbox();

    },
    events: {
    },

    regions: {
      formRegion: '#form-region',
      porfolioRegion: '#cporfolio-region',
    },

  });

 Edit.StepFourForm = DocManager.FondoRequestApp.Common.Views.Form.extend({
    whoami: 'StepFourForm',
    
    getTemplate: function(){
      return utils.templates.FondoMov04Form;
    },

    initialize: function(options){
      var self = this;
      this.events = _.extend({},this.formevents,this.events);
      this.delegateEvents();
    },

    templateHelpers: function(){
      var self = this;
      return {
        linkType: function(item){
          return utils.fetchLabel(utils.linkTypeOpLst, item);
        },
        formatDate: function(date){
          return moment(date).format('dddd LL');
        },
        getFieldLabel: function(fieldName){
          return self.model.getFieldLabel(fieldName);
        }
      };
    },

    onRender: function(){
      var self = this;

      // INIT radio tipo juridico
      self.$('.radio-custom').radio();
      self.$('.checkbox-custom').checkbox();
      //if(self.model.get('etipojuridico') === 'pfisica') self.$('.togglejuridica').addClass('hidden');
      //self.$('.togglejuridica').addClass('hidden');
      //initTagsInput(self, 'cdescriptores');
      buildAttachments(self, self.model);

      $('#myWizard').wizard();
    },

    events: {
    },
        
    validateStep: function(step){
      var self = this,
          errors = this.model.validateStep(step);

      if(!checkAttachments()) {
        Message.warning('Debe adjuntar los documentos solicitados para grabar definitivo');
      }

      this.onFormDataInvalid((errors||{}));
      if(errors){
        return false
      }else{
        return true;
      }
    },

  });

  //*************************************************************
  //       AJUNTO IMAGEN DE LA EMPRESA EN STEP-ONE
  //*************************************************************
  Edit.AvatarEditor = Marionette.ItemView.extend({
    tagName: 'div',
    template: false,
    initialize: function(opts){

    },

    onRender: function(){
      
      this.attachView = new AppCommon.AttachmentImageBox({
            el:this.$el,
            model: this.model.get('eavatar'),
            templates: {
              list: utils.templates.ImageBoxLayoutView,
              itemRender: utils.templates.ImageBoxItem,
            }
            
      });

      this.attachView.render();
      
      var self = this;
      this.listenTo(this.attachView,'change',function(){
        self.$el.find('#empty-region').removeClass('alert alert-danger');
        self.commit();
      });
    },
    onDestroy: function(){
      if(this.attachView){
        this.attachView.destroy();
        this.attachView = null;
      }
    },
    validate: function(){
      var files = this.attachView.getFiles();
      var ok = true;
      
      if(files.length < 2){
        ok = false;
        this.$el.find('#empty-region').addClass('alert alert-danger');
      }else{
        this.$el.find('#empty-region').removeClass('alert alert-danger');
      }
      
      return ok;
    },
    commit: function(){
      var files = this.attachView.getFiles();
      if(files){
        if(files.length){
          this.model.set('eavatar',files.at(0).toJSON());
        }
      }
    },

  });


//=======================
// Helper functions
// =======================

  var getSession = function(){
    return Edit.Session;
  };

  var buildAttachments = function(view, model){
    var model = getSession().model,
        adjuntos = getSession().adjuntos,
        tsolicitud = getSession().views.stepOne.model.get('tsolicitud'),
        attachTypes;

    if(tsolicitud === 'movilidad_mica'){
      attachTypes = ['cartaministra',  'docidentidad', 'constanciacuit', 'resenia'];
    }else{
      attachTypes = ['especifico', 'cartaministra', 'invitacion',  'docidentidad', 'constanciacuit', 'resenia'];

    }


    _.each(attachTypes, function(attchType){
      var data = {
        _id: model.get('_id'),
        cnumber: model.get('cnumber'),
        predicate: attchType,
        slug: model.get('slug'),
      }
      var token = new DocManager.Entities.AssetToken(data);
      token.id = model.get('_id');

      if(adjuntos[attchType] && adjuntos[attchType].length){
        token.assets = new DocManager.Entities.AssetCollection(adjuntos[attchType]); 
      }else{
        token.assets = new DocManager.Entities.AssetCollection(); 
      }

      view[attchType] = new AppCommon.AttachmentView({el:view.$el.find('#'+attchType), model:token});
      view[attchType].render();

    });

  };






/*
      this.attachDocIdentidad = new AppCommon.AttachmentView({el:this.$el.find('#docidentidad'),model:this.model});
      this.attachEspecifico = new AppCommon.AttachmentView({el:this.$el.find('#especifico'),model:this.model});
      this.attachInvitacion = new AppCommon.AttachmentView({el:this.$el.find('#invitacion'),model:this.model});
      this.attachConstanciacuit = new AppCommon.AttachmentView({el:this.$el.find('#constanciacuit'),model:this.model});
      this.attachResenia = new AppCommon.AttachmentView({el:this.$el.find('#resenia'),model:this.model});
      this.attachrRsolucionotorgam = new AppCommon.AttachmentView({el:this.$el.find('#resolucionotorgam'),model:this.model});
      this.attachDesignacionautoridades = new AppCommon.AttachmentView({el:this.$el.find('#designacionautoridades'),model:this.model});
      this.attachBalanceentidad = new AppCommon.AttachmentView({el:this.$el.find('#balanceentidad'),model:this.model});
      this.attachEstatutoentidad = new AppCommon.AttachmentView({el:this.$el.find('#estatutoentidad'),model:this.model});

      this.attachEspecifico.render();
      this.attachInvitacion.render();
      this.attachConstanciacuit.render();
      this.attachResenia.render();
      this.attachrRsolucionotorgam.render();
      this.attachDesignacionautoridades.render();
      this.attachBalanceentidad.render();
      this.attachEstatutoentidad.render();
      this.attachDocIdentidad.render();

*/





  var validateWizardStep = function(evt, data){
    evt.stopPropagation();
    var step = data.step;
    var currentStep = parseInt(step);
    var forward = data.direction === 'next';
    var targetStep = currentStep + (forward ? 1 : -1);
    var session = getSession();
    //console.log('wizard LAYOUT [%s] new age:[%s]/[%s] frwd: [%s] session[%s]',step, currentStep, targetStep , forward,session );
    if(step === 1){

      if(!session.views.stepOne.validateStep(step)) {
        evt.preventDefault();
        Message.warning('Debe completar los campos obligatorios para avanzar');
        $('#myWizard').wizard('selectedItem', {step: step});
      }else{
        DocManager.trigger('wizard:next:step', step);
        setNextStep(evt, data, step, currentStep, forward, targetStep)
      }
 
    }else if(step === 2){

      if(!session.views.stepTwoForm.validateStep(step)) {
        evt.preventDefault();
        Message.warning('Debe completar los campos obligatorios para avanzar');
        $('#myWizard').wizard('selectedItem', {step: step});
      }else{
        DocManager.trigger('wizard:next:step', step);
        setNextStep(evt, data, step, currentStep, forward, targetStep)
      }

    }else if(step === 3){

      if(!session.views.stepThreeForm.validateStep(step) || !checkTramosList(getSession().tramos) || !checkPersonas(getSession().pasajeros)) {
        evt.preventDefault();
        Message.warning('Hay errores en el formulario');
        $('#myWizard').wizard('selectedItem', {step: step});
      }else{
        DocManager.trigger('wizard:next:step', step);
        setNextStep(evt, data, step, currentStep, forward, targetStep)
      }

    }else if(step === 4){

      if(!session.views.stepFourForm.validateStep(step)) {
        evt.preventDefault();
        Message.error('Debe adjuntar los documentos solicitados para avanzar');
        $('#myWizard').wizard('selectedItem', {step: step});
      }else{
        DocManager.trigger('wizard:next:step', step);
        setNextStep(evt, data, step, currentStep, forward, targetStep)
      }

    }

  };

  var setNextStep = function (evt, data, step, currentStep, forward, targetStep){
    //console.log('NEXT STEP [%s] new age:[%s]/[%s] frwd: [%s] ',getSession().model.get('solicitante').tsolicitud, currentStep, targetStep, forward );
    // if(targetStep === 3 && getSession().model.get('solicitante').tsolicitud !== 'musica' ){
    //   evt.preventDefault();
    //   $('#myWizard').wizard('selectedItem', {
    //     step: (forward ? 4 : 2)
    //   });
    // }
  };

  var checkTramosList = function(refCol){
    var errors = {},
        evType = getSession().views.stepOne.model.get('eventtype');

    if(refCol.length === 0){
      errors.referencias = 'ATENCIÓN: debe ingresar el ITINERARIO DETALLADO <br> o lista de TRAMOS, si es Gira';
      Message.error(errors.referencias);
      return false;

    }else if(refCol.length >2 && evType !== 'gira'){
      errors.referencias = 'ATENCIÓN: Para solicitar más de 2 tramos deberá seleccionar la CATEGORÍA "Ayuda a Giras Artísticas y Culturales" en el PASO 1.';
      Message.error(errors.referencias);
      return false;

    }else{

      return true;

    }
  };

  var checkPersonas = function(refCol){
    var errors = {},
        qpaxmin = getSession().views.stepThreeForm.model.get('qpaxmin');

    if(refCol.length === 0){
      errors.referencias = 'ATENCIÓN: debe ingresar Pasajeros ';
      Message.error(errors.referencias);
      return false;

    }else if(refCol.length < qpaxmin ){
      errors.referencias = 'ATENCIÓN: Ha informado menos pasajeros que el mínimo indicado: ' + qpaxmin;
      Message.warning(errors.referencias);
      return true;

    }else{
      return true;
    }
  };
  
  var checkAttachments = function(){
      var view = getSession().views.stepFourForm,
          tsolicitud = getSession().views.stepOne.model.get('tsolicitud'),
          attacherror = {},
          hasErrors = false,
          uploaded = 0,
          attachTypes;

      if(tsolicitud === 'movilidad_mica'){
        attachTypes = ['cartaministra',  'docidentidad', 'constanciacuit', 'resenia'];
      }else{
        attachTypes = ['especifico', 'cartaministra', 'invitacion',  'docidentidad', 'constanciacuit', 'resenia'];
      }
      _.each(attachTypes, function(type){

        if(!view[type] || !view[type].model.assets.length){
          hasErrors = true;
          attacherror[type] = 'Debe adjuntar archivo';
          getSession().views.stepFour.model.set(type, false);
        }else{
          getSession().views.stepFour.model.set(type, true);
        }
      });

      return !hasErrors;

  };



  var registerStepWizardAction = function(){

    $('#myWizard').on('actionclicked.fu.wizard', function (evt, data) {
      evt.stopPropagation();
      var step = data.step;
      var currentStep = parseInt(step);
      var forward = data.direction === 'next';
      var targetStep = currentStep + (forward ? 1 : -1);
      var session = getSession();

      if(data.direction === 'next'){
        validateWizardStep(evt, data);
      }else{
        setNextStep(evt, data, step, currentStep, forward, targetStep)

      }
    });

  };



//=======================
// Helper functions
// =======================
  var helpPopUp = function(view){

      var $targets = view.$( '[rel~=tooltip]' ),
          $target  = false,
          $tooltip = false,
          title   = false;
   
      $targets.bind('mouseenter', function(){
          $target  = $( this );
          tip     = $target.attr( 'title' );
          tooltip = $( '<div id="tooltip"></div>' );
   
          if( !tip || tip == '' ) return false;
   
          $target.removeAttr( 'title' );
          tooltip.css( 'opacity', 0 )
                 .html( tip )
                 .appendTo( 'body' );
   
          var init_tooltip = function(){
              if( $( window ).width() < tooltip.outerWidth() * 1.5 )
                  tooltip.css( 'max-width', $( window ).width() / 2 );
              else
                  tooltip.css( 'max-width', 340 );
   
              var pos_left = $target.offset().left + ( $target.outerWidth() / 2 ) - ( tooltip.outerWidth() / 2 ),
                  pos_top  = $target.offset().top - tooltip.outerHeight() - 20;
   
              if( pos_left < 0 ){
                  pos_left = $target.offset().left + $target.outerWidth() / 2 - 20;
                  tooltip.addClass( 'left' );
              }else
                  tooltip.removeClass( 'left' );
   
              if( pos_left + tooltip.outerWidth() > $( window ).width() ){
                  pos_left = $target.offset().left - tooltip.outerWidth() + $target.outerWidth() / 2 + 20;
                  tooltip.addClass( 'right' );
              }else
                  tooltip.removeClass( 'right' );
   
              if( pos_top < 0 ){
                  var pos_top  = $target.offset().top + $target.outerHeight();
                  tooltip.addClass( 'top' );
              }else
                  tooltip.removeClass( 'top' );
   
              tooltip.css( { left: pos_left, top: pos_top } )
                     .animate( { top: '+=10', opacity: 1 }, 50 );
          };
   
          init_tooltip();
          $( window ).resize( init_tooltip );
   
          var remove_tooltip = function(){
              tooltip.animate( { top: '-=10', opacity: 0 }, 50, function(){
                  $( this ).remove();
              });
   
              $target.attr( 'title', tip );
          };
   
          $target.bind( 'mouseleave', remove_tooltip );
          tooltip.bind( 'click', remove_tooltip );
      });

  };
    
});

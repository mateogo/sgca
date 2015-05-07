DocManager.module("MicaRequestApp.Edit", function(Edit, DocManager, Backbone, Marionette, $, _){
  
  Edit.Layout = Marionette.LayoutView.extend({

    templateData: '<div id="form-region"></div>',

    tagName: "div",
    attributes: {
      id: 'mainFormLayout'
    },

    onRender: function(){
      console.log('STEP MAIN LAYOUT RENDER ******************************')
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
      console.log('Click basicEdit')
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
  Edit.MicaWizardLayout = Marionette.LayoutView.extend({
    whoami: 'MicaWizardLayout',
    tagName: "div",
    attributes: {
      id: 'formWizardLayout'
    },
    initialize: function(opts){
      console.log('[%s] INIT *********', this.whoami);
      if(opts.tab){
        this.selectedTab = opts.tab;
      }
      // ver LPVNLO
      //Marionette.ItemView.prototype.initialize.apply(this,arguments);

      // this.events = _.extend({},this.formevents,this.events);
      // this.delegateEvents();
    },
    onRender: function(){

      console.log('************  wizardLayout RENDER **************')
      // var self = this;
      // console.log('rendering')
      // $('#myWizard').wizard();
      // $('#myWizard').on('finished.fu.wizard', function (evt, data) {
      //   console.log('IAJJUUUU')
      // });

    },
    onShow: function(){

      console.log('************  wizardLayout SHOW **************')
      // var self = this;
      // console.log('rendering')
      // $('#myWizard').wizard();
      $('#myWizard').wizard();
      // $('#myWizard').on('finished.fu.wizard', function (evt, data) {
      //   console.log('IAJJUUUU')
      // });
      // $('#daleche').click(function (evt, data) {
      //   console.log('IAJJUUUU 2')
      // });

    },

    regions: {
      steponeRegion:   '#stepone-region',
      steptwoRegion:   '#steptwo-region',
      stepthreeRegion: '#stepthree-region',
      stepfourRegion:  '#stepfour-region',
      stepfiveRegion:  '#stepfive-region',
    },

    getTemplate: function(){
      return utils.templates.MicaInscriptionFormLayout;
    },

    events: {
      'click .js-openevent': 'openEventClicked',
      'click .js-provisorio': 'submitForm',
      'click .js-definitivo': 'submitFormDefinitivo',
    },

    submitForm: function(){
        console.log('IAJJUUUU 3');
        this.trigger('submit:form', this.model);

    },

    submitFormDefinitivo: function(){
        console.log('Submit Definitivo');
        this.trigger('submit:form:definitivo', this.model);

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
  Edit.StepOneForm = DocManager.MicaRequestApp.Common.Views.Form.extend({
    whoami: 'StepOneForm',    
    getTemplate: function(){
      return utils.templates.MicaInscripcion01Form;
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

      // ayuda popover
      self.$('[data-toggle="popover"]').popover()

//////////////
      helpPopUp(self);
///////////




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
  
  
  //*************************************************************
  //           FORM STEP-DOS: REPRESENTANTE
  //*************************************************************
  Edit.StepTwoLayout = Marionette.LayoutView.extend({

    tagName: "div",
    attributes: {
      id: 'mainForm02Layout'
    },

    getTemplate: function(){
      return utils.templates.MicaInscripcion02Layout;
    },

    onRender: function(){
      console.log('STEP TWO LAYOUT RENDER ******************************')
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
  //           FORM STEP-DOS: REPRESENTANTES
  //*************************************************************
  Edit.StepTwoForm = DocManager.MicaRequestApp.Common.Views.Form.extend({
    whoami: 'StepTwoForm',
    
    getTemplate: function(){
      return utils.templates.MicaInscripcion02Form;
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

  //*************************************************************
  //           FORM STEP-TRES: VENDEDOR
  //*************************************************************
  Edit.StepThreeLayout = Marionette.LayoutView.extend({

    tagName: "div",
    attributes: {
      id: 'mainForm03Layout'
    },

    getTemplate: function(){
      return utils.templates.MicaInscripcion03Layout;
    },
    onRender: function(){
      console.log('InlinieOnRender')
      var self = this,
          $seller = self.$('#data.switch input#seller');
      self.$('.radio-custom').radio();
      self.$('.checkbox-custom').checkbox();
      console.log('ON RENDER ******: [%s]', self.model.get('rolePlaying').vendedor);
      if(true){
        self.$('#infovendedor').toggleClass("hidden", !$seller.is(":checked"));
      }
    },
    events: {
      'change #seller':'openSeller',
    },

    openSeller: function(ev){
      var self = this,
          $seller = self.$('#data.switch input#seller');
      console.log('OpenSeller')
      self.$('#infovendedor').toggleClass("hidden", !$seller.is(":checked"));

      if($seller.is(":checked")){
        console.log('VENDEDOR: TRUE')
        self.model.set('rolePlaying',{vendedor: true});
      }else{
        console.log('VENDEDOR: FALSE')
        self.model.set('rolePlaying',{vendedor: false});        
      }
    },

    regions: {
      formRegion: '#form-region',
      vporfolioRegion: '#vporfolio-region',
    },
  });
  
  Edit.StepThreeForm = DocManager.MicaRequestApp.Common.Views.Form.extend({
    whoami: 'StepThreeForm',
    
    getTemplate: function(){
      return utils.templates.MicaInscripcion03Form;
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

      //self.$('.togglejuridica').addClass('hidden');
      _.each(['aescenicas', 'audivisual', 'disenio', 'editorial', 'musica', 'videojuegos'], function(item){
          if(item === self.model.get('vactividades')){

          }else{
            var selector = '#toggle-v' + item;
            console.log('toggling: [%s]', selector);

            self.$(selector).addClass('hidden');

          }

      });


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
    events: {
      'click .js-btn-add1': 'linksAudio',
      'click .js-btn-remove': 'removeAudio',
    },

    removeAudio: function(e){
      console.log('remove Audio link');
      $(e.target).parents('.ventry:first').remove();
      e.preventDefault();
      return false;
    },

    linksAudio: function(e){
      var self = this,
          controlForm = self.$('.vaudiocontrols div:first'),
          currentEntry = $(e.target).parents('.ventry:first'),
          newEntry = $(currentEntry.clone()).appendTo(controlForm);
      
      console.log('Links Audio');
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

  //*************************************************************
  //           FORM STEP-CUATRO: COMPRADOR
  //*************************************************************
  Edit.StepFourLayout = Marionette.LayoutView.extend({

    tagName: "div",
    attributes: {
      id: 'mainForm04Layout'
    },

    getTemplate: function(){
      return utils.templates.MicaInscripcion04Layout;
    },
    onRender: function(){
      console.log('InlinieOnRender')
      var self = this,
          $seller = self.$('#data.switch input#buyer');

      self.$('.radio-custom').radio();
      self.$('.checkbox-custom').checkbox();

      console.log('ON RENDER COMPRADOR ******: [%s]', self.model.get('rolePlaying').comprador);
      if(true){
        self.$('#infocomprador').toggleClass("hidden", !$seller.is(":checked"));
      }

    },
    events: {
      'change #buyer':'openBuyer',
    },

    openBuyer: function(ev){
      var self = this,
          $seller = self.$('#data.switch input#buyer');
      console.log('OpenBuyer')
      self.$('#infocomprador').toggleClass("hidden", !$seller.is(":checked"));

      if($seller.is(":checked")){
        console.log('VENDEDOR: TRUE')
        self.model.set('rolePlaying',{comprador: true});
      }else{
        console.log('VENDEDOR: FALSE')
        self.model.set('rolePlaying',{comprador: false});        
      }

    },

    regions: {
      formRegion: '#form-region',
      porfolioRegion: '#porfolio-region',
    },

  });

 Edit.StepFourForm = DocManager.MicaRequestApp.Common.Views.Form.extend({
    whoami: 'StepFourForm',
    
    getTemplate: function(){
      return utils.templates.MicaInscripcion04Form;
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
      //self.$('.togglejuridica').addClass('hidden');

      _.each(['aescenicas', 'audivisual', 'disenio', 'editorial', 'musica', 'videojuegos'], function(item){
          if(item === self.model.get('cactividades')){

          }else{
            var selector = '#toggle-c' + item;
            console.log('toggling: [%s]', selector);

            self.$(selector).addClass('hidden');

          }

      });

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
    events: {
      'click .js-btn-add1': 'linksAudio',
      'click .js-btn-remove': 'removeAudio',
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
  //           ALTA REPRESENTANTE ADICIONAL
  //*************************************************************
  Edit.NewRepresentante = DocManager.MicaRequestApp.Common.Views.Form.extend({
    whoami:'NewRepresentante:edit_view.js',
    templates: {
      representante: 'RepresentanteForm',
    },

    getTemplate: function(){
      return utils.templates[this.templates['representante']];
    },

    initialize: function(options){
      console.log('Nuevo Representante');
      var self = this;
      this.events = _.extend({},this.formevents,this.events);
      this.delegateEvents();
      this.options = options;
    },
 
    events: {
      "click .js-js-newrepresentante": "newRepresentante",
      "click .js-productsch": "productsearch",
      "click .js-personsch": "personsearch",
    },

    newRepresentante: function(){
      var self = this;
      console.log('new Representante');
      this.trigger('add:new:representante', this.model, function(entity){
        console.log('alta requerim: Cerrar esta ventana!!!!');
        self.destroy();
      });

    },
  });




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

/*

        //AGREGAR CAMPOS ADICIONALES PARA VENDEDOR
        $(document).on('click', '.btn-add', function(e) {e.preventDefault();
            var controlForm = $('.vaudiocontrols div:first'),
                currentEntry = $(this).parents('.ventry:first'),
                newEntry = $(currentEntry.clone()).appendTo(controlForm);
            newEntry.find('input.vaudio').val('');
            controlForm.find('.ventry:not(:last) .btn-add')
                .removeClass('btn-add').addClass('btn-remove')
                .removeClass('btn-warning').addClass('btn-danger')
                .html('<span class="glyphicon glyphicon-minus"></span>');
        }).on('click', '.btn-remove', function(e){
        $(this).parents('.ventry:first').remove();
        e.preventDefault();
        return false;
        });

        $(document).on('click', '.btn-add2', function(e) {e.preventDefault();
            var controlForm = $('.vvideocontrols div:first'),
                currentEntry = $(this).parents('.ventry:first'),
                newEntry = $(currentEntry.clone()).appendTo(controlForm);
            newEntry.find('input.vvideo').val('');
            controlForm.find('.ventry:not(:last) .btn-add2')
                .removeClass('btn-add2').addClass('btn-remove')
                .removeClass('btn-warning').addClass('btn-danger')
                .html('<span class="glyphicon glyphicon-minus"></span>');
        }).on('click', '.btn-remove', function(e) {
        $(this).parents('.ventry:first').remove();
        e.preventDefault();
        return false;
        });

        $(document).on('click', '.btn-add3', function(e) {e.preventDefault();
            var controlForm = $('.vimgcontrols div:first'),
                currentEntry = $(this).parents('.ventry:first'),
                newEntry = $(currentEntry.clone()).appendTo(controlForm);
            newEntry.find('input.vimg').val('');
            controlForm.find('.ventry:not(:last) .btn-add3')
                .removeClass('btn-add3').addClass('btn-remove')
                .removeClass('btn-warning').addClass('btn-danger')
                .html('<span class="glyphicon glyphicon-minus"></span>');
        }).on('click', '.btn-remove', function(e) {
        $(this).parents('.ventry:first').remove();
        e.preventDefault();
        return false;
        });

        $(document).on('click', '.btn-add4', function(e) {e.preventDefault();
            var controlForm = $('.vwebcontrols div:first'),
                currentEntry = $(this).parents('.ventry:first'),
                newEntry = $(currentEntry.clone()).appendTo(controlForm);
            newEntry.find('input.vweb').val('');
            controlForm.find('.ventry:not(:last) .btn-add4')
                .removeClass('btn-add4').addClass('btn-remove')
                .removeClass('btn-warning').addClass('btn-danger')
                .html('<span class="glyphicon glyphicon-minus"></span>');
        }).on('click', '.btn-remove', function(e) {
        $(this).parents('.ventry:first').remove();
        e.preventDefault();
        return false;
        });

        $(document).on('click', '.btn-add5', function(e) {e.preventDefault();
            var controlForm = $('.vothercontrols div:first'),
                currentEntry = $(this).parents('.ventry:first'),
                newEntry = $(currentEntry.clone()).appendTo(controlForm);
            newEntry.find('input.vother').val('');
            controlForm.find('.ventry:not(:last) .btn-add5')
                .removeClass('btn-add5').addClass('btn-remove')
                .removeClass('btn-warning').addClass('btn-danger')
                .html('<span class="glyphicon glyphicon-minus"></span>');
        }).on('click', '.btn-remove', function(e) {
        $(this).parents('.ventry:first').remove();
        e.preventDefault();
        return false;
        });


*/
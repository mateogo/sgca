DocManager.module("MicaRequestApp.Showcase", function(Showcase, DocManager, Backbone, Marionette, $, _){

  var AppCommon = DocManager.module('App.Common');
  
  Showcase.Layout = Marionette.LayoutView.extend({

    templateData: '<div id="form-region"></div>',

    tagName: "div",
    attributes: {
      id: 'mainFormLayout'
    },

    onRender: function(){
      //console.log('STEP MAIN LAYOUT RENDER ******************************')
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
  Showcase.NotFoundView = Marionette.ItemView.extend({
    tagName: 'h2',
    className: 'text-danger',
    render: function(){
      this.$el.html('La tramitación no existe');
    }
  });





  // ********** WIZARD FORM LAYOUT **********
  Showcase.MicaWizardLayout = Marionette.LayoutView.extend({
    whoami: 'MicaWizardLayout',
    tagName: "div",
    attributes: {
      id: 'formWizardLayout'
    },
    initialize: function(opts){
      if(opts.tab){
        this.selectedTab = opts.tab;
      }
      // ver LPVNLO
      //Marionette.ItemView.prototype.initialize.apply(this,arguments);

      // this.events = _.extend({},this.formevents,this.events);
      // this.delegateEvents();
    },
    onRender: function(){
    },

    onShow: function(){
      var self = this;


      $('#myWizard').wizard();


      $('#myWizard').on('actionclicked.fu.wizard', function (evt, data) {
        evt.stopPropagation();
        var step = data.step;
        var currentStep = parseInt(step);
        var forward = data.direction === 'next';
        var targetStep = currentStep + (forward ? 1 : -1);
        //console.log('wizard LAYOUT:[%s]/[%s] frwd: [%s]', currentStep, targetStep , forward);

        if(targetStep === 3 && self.model.get('solicitante').tsolicitud !== 'musica' ){
            evt.preventDefault();
            $('#myWizard').wizard('selectedItem', {
              step: (forward ? '4' : '2')
            });          

        }
        if(targetStep === 4 && self.model.get('solicitante').tsolicitud !== 'aescenicas'){
            evt.preventDefault();
            $('#myWizard').wizard('selectedItem', {
              step: (forward ? '5' : '3')
            });          
        }

      });

    },

    regions: {
      steponeRegion:   '#stepone-region',
      steptwoRegion:   '#steptwo-region',
      stepthreeRegion: '#stepthree-region',
      stepfourRegion:  '#stepfour-region',
      stepfiveRegion:  '#stepfive-region',
    },

    getTemplate: function(){
      return utils.templates.MicaShowcaseFormLayout;
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
      DocManager.confirm(utils.templates.MicaTerminosYCondiciones(),{okText: 'Aceptar', cancelText: 'cancelar'}).done(function(){
          self.$('#legal').prop('checked', true);
      });
    },

    submitFormProvisorio: function(evt){
      evt.stopPropagation();
      this.trigger('submit:form:provisorio', this.model);

    },

    submitFormDefinitivo: function(evt){
      evt.stopPropagation();
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
  Showcase.StepOneForm = DocManager.MicaRequestApp.Common.Views.Form.extend({
    whoami: 'StepOneForm',    
    getTemplate: function(){
      return utils.templates.MicaShowcase01Form;
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
      registerStepWizardAction(self, '1');

      // INIT radio tipo juridico
      self.$('.radio-custom').radio();

      // ayuda popover
      self.$('[data-toggle="popover"]').popover()
      self.toggleStateInput();

      helpPopUp(self);
      
      var $div = self.$el.find('.js-avatar').append($('<div></div>'));

      self.avatarEditor = new Showcase.AvatarEditor({
        model: self.model,
        el: $div,
      })
      self.avatarEditor.render();

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
//        $('#eprov').replaceWith('<input class="form-control" type="text" name="eprov" id="eprov">');
          this.$('.js-provext').show();
          this.$('.js-provarg').hide();
          if(e) this.$('.js-provext').val('')
      }
      else{
        //Eligio otro pais y vuelve a elegir Argentina se arman las opciones de provincias otra vez
//        var aprov = utils.buildSelectOptions("eprov",utils.provinciasOptionList.Argentina, province);
//        $('#eprov').replaceWith('<select class="form-control" id="eprov" name="eprov> aprov("eprov")</select>');
//        $('#eprov').html(aprov);
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
  Showcase.StepTwoLayout = Marionette.LayoutView.extend({

    tagName: "div",
    attributes: {
      id: 'mainForm02Layout'
    },

    getTemplate: function(){
      return utils.templates.MicaShowcase02Layout;
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
      integranteRegion: '#representante-region',
    },

  });
  //*************************************************************
  //           FORM STEP-DOS: REPRESENTANTES
  //*************************************************************
  Showcase.StepTwoForm = DocManager.MicaRequestApp.Common.Views.Form.extend({
    whoami: 'StepTwoForm',
    
    getTemplate: function(){
      return utils.templates.MicaShowcase02Form;
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

      registerStepWizardAction(self, '2');

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
  //           FORM STEP-TRES: MUSICA
  //*************************************************************
  Showcase.StepThreeLayout = Marionette.LayoutView.extend({

    tagName: "div",
    attributes: {
      id: 'mainForm03Layout'
    },

    getTemplate: function(){
      return utils.templates.MicaShowcase03Layout;
    },
    onRender: function(){
      var self = this,
          $buttonswitch = self.$('#data.switch input#musica');
      self.$('.radio-custom').radio();
      self.$('.checkbox-custom').checkbox();

      if(true){
        self.$('#infomusica').toggleClass("hidden", !$buttonswitch.is(":checked"));
      }
    },
    events: {
      'change #musica':'openMusica',
    },

    openMusica: function(ev){
      var self = this,
          $buttonswitch = self.$('#data.switch input#musica');
          
      self.$('#infomusica').toggleClass("hidden", !$buttonswitch.is(":checked"));

      if($buttonswitch.is(":checked")){
        self.model.set('rolePlaying',{musica: true});
      }else{
        self.model.set('rolePlaying',{musica: false});        
      }
    },

    regions: {
      formRegion: '#form-region',
      mreferenceRegion: '#mreference-region',
    },
  });
  
  Showcase.StepThreeForm = DocManager.MicaRequestApp.Common.Views.Form.extend({
    whoami: 'StepThreeForm',
    
    getTemplate: function(){
      return utils.templates.MicaShowcase03Form;
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
      initTagsInput(self, 'vdescriptores');



      //self.$('.togglejuridica').addClass('hidden');
      _.each(['aescenicas', 'audiovisual', 'disenio', 'editorial', 'musica', 'videojuegos'], function(item){
          if(item === self.model.get('vactividades')){

          }else{
            var selector = '#toggle-v' + item;

            self.$(selector).addClass('hidden');

          }

      });
      registerStepWizardAction(self, '3');
    },

    events: {
      'click .js-btn-add1': 'linksAudio',
      'click .js-btn-remove': 'removeAudio',
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
  //           FORM STEP-CUATRO: COMPRADOR
  //*************************************************************
  Showcase.StepFourLayout = Marionette.LayoutView.extend({

    tagName: "div",
    attributes: {
      id: 'mainForm04Layout'
    },

    getTemplate: function(){
      return utils.templates.MicaShowcase04Layout;
    },
    onRender: function(){
      var self = this,
          $buttonswitch = self.$('#data.switch input#aescenica');

      self.$('.radio-custom').radio();
      self.$('.checkbox-custom').checkbox();
      if(true){
        self.$('#infoaescenica').toggleClass("hidden", !$buttonswitch.is(":checked"));
      }

    },
    events: {
      'change #aescenica':'openAescenica',
    },

    openAescenica: function(ev){
      var self = this,
          $buttonswitch = self.$('#data.switch input#aescenica');
      self.$('#infoaescenica').toggleClass("hidden", !$buttonswitch.is(":checked"));

      if($buttonswitch.is(":checked")){
        self.model.set('rolePlaying',{aescenica: true});
      }else{
        self.model.set('rolePlaying',{aescenica: false});        
      }

    },

    regions: {
      formRegion: '#form-region',
      areferenceRegion: '#areference-region',
    },

  });

 Showcase.StepFourForm = DocManager.MicaRequestApp.Common.Views.Form.extend({
    whoami: 'StepFourForm',
    
    getTemplate: function(){
      return utils.templates.MicaShowcase04Form;
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
      initTagsInput(self, 'cdescriptores');

      _.each(['aescenicas', 'audiovisual', 'disenio', 'editorial', 'musica', 'videojuegos'], function(item){
          if(item === self.model.get('cactividades')){

          }else{
            var selector = '#toggle-c' + item;

            self.$(selector).addClass('hidden');

          }

      });
      registerStepWizardAction(self, '4');

    },
    events: {
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
  Showcase.NewRepresentante = DocManager.MicaRequestApp.Common.Views.Form.extend({
    whoami:'NewRepresentante:edit_view.js',
    templates: {
      representante: 'RepresentanteForm',
    },

    getTemplate: function(){
      return utils.templates[this.templates['representante']];
    },

    initialize: function(options){
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
      this.trigger('add:new:representante', this.model, function(entity){
        self.destroy();
      });

    },
  });

  //*************************************************************
  //       AJUNTO IMAGEN DE LA EMPRESA EN STEP-ONE
  //*************************************************************
  Showcase.AvatarEditor = Marionette.ItemView.extend({
    tagName: 'div',
    template: false,
    initialize: function(opts){
      //console.log('AVATAR Editor RENDER model:[%s]',this.model.whoami);

    },
    onRender: function(){

/*
      this.attachView = new AppCommon.AttachmentView({
            el:this.$el,
            model:this.model,
            collection: this.model.get('photos'),
            templates: {
              list: utils.templates.PhotosLayoutView,
              itemRender: utils.templates.PhotoItem,
              itemEditor: utils.templates.PhotoItemEditorView
            }
            
      });
*/      
      
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

  //*************************************************************
  //       PORFOLIO: REFERENCIAS
  //*************************************************************
  Showcase.ReferenceItemView = Marionette.ItemView.extend({
    whoami: 'Showcase.ReferenceItemView:edit_view.js',
    //tagName: "div",

    getTemplate: function(){
      return utils.templates.ReferenciasItemView;
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



  });

  Showcase.ReferenceItemLayoutView = Marionette.LayoutView.extend({
    whoami: 'Showcase.ReferenceItemLayoutView:edit_view.js',
    //tagName: "div",
    //className: "list-group",

    //childView: Views.SidebarItem,
    //childViewContainer: "article",
    
    initialize: function(opts){
      this.options = opts;
    },
 
    getTemplate: function(){
      return utils.templates.ReferenciasItemList;
    },

    onRender: function(){
      var itemView = new Showcase.ReferenceItemView({
        model: this.model
      });

      var itemEdit = new Showcase.ReferenceFormView({
        model: this.model
      });
      this.getRegion('itemEditRegion').show(itemEdit);      
      this.getRegion('itemViewRegion').show(itemView);      
    },

    regions: {
      itemEditRegion: '#reference-item-edit-region',
      itemViewRegion: '#reference-item-view-region',
    },

    events: {
      'click .js-itemdata-edit': 'editItem',
      'click .js-itemdata-remove': 'removeItem',
    },

    activeView: 'view',
    editItem: function(){
      if(this.activeView === 'view'){
        // this.getRegion('itemViewRegion').$el.hide();
        // this.getRegion('itemEditRegion').$el.show();
        this.$el.find('#reference-item-view-region').hide();
        this.$el.find('#reference-item-edit-region').show();
        this.$el.find('.js-itemdata-edit').html('<span class="glyphicon glyphicon-ok" aria-hidden="true"></span>');
        this.activeView = "edit";

      }else{
        // this.getRegion('itemViewRegion').$el.show();
        // this.getRegion('itemEditRegion').$el.hide();
        this.$el.find('#reference-item-edit-region').hide();
        this.$el.find('#reference-item-view-region').show();
        this.$el.find('.js-itemdata-edit').html('<span class="glyphicon glyphicon-edit" aria-hidden="true"></span>');
        this.activeView = "view";

      }


    },
    removeItem: function(){
      this.trigger('remove:item', this.model);

    },

  });

  Showcase.ReferenceListView = Marionette.CollectionView.extend({
    whoami: 'Showcase.ReferenceListView:edit_view.js',
    //tagName: "div",
    //className: "list-group",

    //childView: Views.SidebarItem,
    //childViewContainer: "article",
    childView: Showcase.ReferenceItemLayoutView,

    initialize: function(opts){
      this.options = opts;
    },
 
    events: {
    },

    onRender: function(){
      //console.log('[%s] RENDER ',this.whoami)      
    },

    childEvents: {
      'remove:item': function(view, model){
        //console.log('Bubbled event[%s] [%s]', arguments.length, model.get('slug'));
        this.collection.remove(model);

      }

    },


    childViewOptions: function(model, index) {
      //console.log('childViewOptions [%s] [%s] [%s]',model.whoami, model.get('slug'), this.options.itemtype);
      // return {
      //   model: model,
      //   collection: model.getItems(),
      //   itemtype:this.options.itemtype,
      // }
    },
    
  });

  Showcase.ReferenceFormView = Marionette.LayoutView.extend({
    whoami: 'Showcase.ReferenceFormView:edit_view.js',
    //tagName: "div",
    //className: "list-group",

    //childView: Views.SidebarItem,
    //childViewContainer: "article",
    
    initialize: function(opts){
      this.options = opts;
    },
 
    getTemplate: function(){
      return utils.templates.ReferenciasFormLayout;
    },

    onRender: function(){
      var itemEditor = new Backbone.Form({
        model: this.model,
        template: utils.templates.ReferenciasItemEditor,
      });

      itemEditor.on('blur', function(form, editor){
        var error = form.commit();
      });

      this.getRegion('editRegion').show(itemEditor);
    },

/*
    onRender: function(){
      console.log('onRender:[%s]', this.model.whoami);
      this.form = new Backbone.Form({
        model: this.model,
        template: this.templates['form'],
      });
      this.form.render();
      this.$el.find('#formContainer').html(this.form.el);
    },

*/
    regions: {
      editRegion: '#reference-item-editor',
    },

    events: {
    },

  });





  Showcase.ReferenceEditor = Marionette.LayoutView.extend({
    whoami: 'Showcase.ReferenceEditor:edit_view.js',

    tagName: "div",
    attributes: {
      id: 'referenciasLayout'
    },

    initialize: function(opts){
      //console.log('[%s] INIT model:[%s]',this.whoami, this.model.whoami);
      this.options = opts;

      this.listView = this.initListView();
      this.formView = this.initFormView();

    },

    getTemplate: function(){
      return utils.templates.ReferenciasLayout;
    },

    initListView: function(){
      var view = new Showcase.ReferenceListView({
        collection: this.collection
      })
      return view;

    },

    initFormView: function(){
      var view = new Showcase.ReferenceFormView({
        model: this.model
      })
      return view;

    },

    onRender: function(){
      this.getRegion('formRegion').show(this.formView);
      this.getRegion('listRegion').show(this.listView);
    },

    regions: {
      listRegion: '#references-list-region',
      formRegion: '#references-form-region',
    },

    events: {
      'click .js-add-new-item': 'addNewItem',
    },

    addNewItem: function(){
      this.collection.add(this.model.clone() );
      this.model.clear();
      this.formView.render();


    },


  });



  //*************************************************************
  //       PORFOLIO EDITOR VIEW
  //*************************************************************
  Showcase.PorfolioEditor = DocManager.MicaRequestApp.Common.Views.Form.extend({
    template: false,
    initialize: function(opts){
      this.events = _.extend({},this.formevents,this.events);
      this.delegateEvents();
      this.options = opts;
    },

    onRender: function(){
    },
   
    getTemplate: function(){
      return utils.templates.PorfolioEditor;
    },



  });



  //*************************************************************
  //       PORFOLIO EDITOR VIEW
  //*************************************************************
  Showcase.PorfolioEditorView = Marionette.LayoutView.extend({
    tagName: 'div',

    regions: {
      porfolioEditor: '#porfolioEditor',
      referencesContainer: '#referencesContainer',
    },

    initialize: function(opts){
      this.options = opts;
    },

    onRender: function(){
      this.createPorfolioEditor();
      this.createReferenceView();
    },
   
    getTemplate: function(){
      return utils.templates.PorfolioEditorLayout;
    },

    createPorfolioEditor: function(){
      var self = this;

      this.porfolioEditor = new Showcase.PorfolioEditor({
        model: this.model,
      });

      this.getRegion('porfolioEditor').show(this.porfolioEditor);
    },

    createReferenceView: function(){
      var self = this,
          references = new DocManager.Entities.PorfolioReferenceCol(self.model.get('referencias'));

      this.referenceEditor = new Showcase.ReferenceEditor({
        model: new DocManager.Entities.PorfolioReference(),
        collection: references,
      });

      this.getRegion('referencesContainer').show(this.referenceEditor);
    },

    events: {
      "click .js-instructivo-porfolio" : "showInstructivo",
    },

    showInstructivo: function(e){
      var self = this;
      e.preventDefault();
      e.stopPropagation();

      if(this.options.editorOpts){
        DocManager.confirm(this.helpDataTpl(this.options.editorOpts),{okText: 'Aceptar', cancelText: 'cancelar'}).done(function(){
            self.$('#legal').prop('checked', true);
        });
      }

    },
    helpDataTpl: function(opts){
      var item;

      //console.log('Actividad: [%s]',opts.parentModel.get('vactividades') || opts.parentModel.get('cactividades'));

      if(opts){
        if(opts.parentModel){
          item = opts.parentModel.get('vactividades') || opts.parentModel.get('cactividades')

          if(item === 'aescenicas')        return utils.templates.MicaInstructivoArtesEscenicas();
          else if(item === 'musica')       return utils.templates.MicaInstructivoMusica();
          else if(item === 'audiovisual') return utils.templates.MicaInstructivoAudiovisual();
          else if(item === 'disenio')      return utils.templates.MicaInstructivoDisenio();
          else if(item === 'videojuegos')  return utils.templates.MicaInstructivoVideojuego();
          else if(item === 'editorial')    return utils.templates.MicaInstructivoEditorial();
        }
      }

      return utils.templates.MicaInstructivoDefault();
    },

    commit: function(){
      this.model.set('referencias', this.referenceEditor.collection.toJSON());
    },


  });




//=======================
// Helper functions
// =======================

  var registerStepWizardAction = function(stepView, currentStep){
    var step;

    $('#myWizard').on('actionclicked.fu.wizard', function (evt, data) {
      evt.stopPropagation();
      step = data.step;
      //console.log('wizard step:[%s] currentStep:[%s]', step, currentStep );
      if(step == currentStep && data.direction === 'next'){
        if(!stepView.validateStep(step)){
          evt.preventDefault();
          $('#myWizard').wizard('selectedItem', {step: step});

        }else{
          if(currentStep === '3'){

            if(DocManager.request('validate:mreferencias', stepView)){

              DocManager.trigger('showcase:wizard:next:step', step);

            }else{

              evt.preventDefault();
              $('#myWizard').wizard('selectedItem', {step: step});

            }
 
          }else if(currentStep === '4'){

            if(DocManager.request('validate:areferencias', stepView)){

              DocManager.trigger('showcase:wizard:next:step', step);

            }else{
              evt.preventDefault();
              $('#myWizard').wizard('selectedItem', {step: step});
            }

          }else{
            DocManager.trigger('showcase:wizard:next:step', step);

          }


        }
      }
    });
  };

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

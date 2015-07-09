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
      //TODO
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
  //           FORM STEP-CUATRO: COMPRADOR
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
  Edit.NewRepresentante = DocManager.FondoRequestApp.Common.Views.Form.extend({
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

  //*************************************************************
  //       PORFOLIO: REFERENCIAS
  //*************************************************************
  Edit.ReferenceItemView = Marionette.ItemView.extend({
    whoami: 'Edit.ReferenceItemView:edit_view.js',
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

  Edit.ReferenceItemLayoutView = Marionette.LayoutView.extend({
    whoami: 'Edit.ReferenceItemLayoutView:edit_view.js',
    
    initialize: function(opts){
      this.options = opts;
    },
 
    getTemplate: function(){
      return utils.templates.ReferenciasItemList;
    },

    onRender: function(){
      var itemView = new Edit.ReferenceItemView({
        model: this.model
      });

      var itemEdit = new Edit.ReferenceFormView({
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
        this.$el.find('#reference-item-view-region').hide();
        this.$el.find('#reference-item-edit-region').show();
        this.$el.find('.js-itemdata-edit').html('<span class="glyphicon glyphicon-ok" aria-hidden="true"></span>');
        this.activeView = "edit";

      }else{
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

  Edit.ReferenceListView = Marionette.CollectionView.extend({
    whoami: 'Edit.ReferenceListView:edit_view.js',
    //tagName: "div",
    //className: "list-group",

    //childView: Views.SidebarItem,
    //childViewContainer: "article",
    childView: Edit.ReferenceItemLayoutView,

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

  Edit.ReferenceFormView = Marionette.LayoutView.extend({
    whoami: 'Edit.ReferenceFormView:edit_view.js',
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





  Edit.ReferenceEditor = Marionette.LayoutView.extend({
    whoami: 'Edit.ReferenceEditor:edit_view.js',

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
      var view = new Edit.ReferenceListView({
        collection: this.collection
      })
      return view;

    },

    initFormView: function(){
      var view = new Edit.ReferenceFormView({
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
  Edit.PorfolioEditor = DocManager.FondoRequestApp.Common.Views.Form.extend({
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
  Edit.PorfolioEditorView = Marionette.LayoutView.extend({
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

      this.porfolioEditor = new Edit.PorfolioEditor({
        model: this.model,
      });

      this.getRegion('porfolioEditor').show(this.porfolioEditor);
    },

    createReferenceView: function(){
      var self = this,
          references = new DocManager.Entities.PorfolioReferenceCol(self.model.get('referencias'));

      this.referenceEditor = new Edit.ReferenceEditor({
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
          //TODO

          // item = opts.parentModel.get('vactividades') || opts.parentModel.get('cactividades')

          // if(item === 'aescenicas')        return utils.templates.FondoInstructivoArtesEscenicas();
          // else if(item === 'musica')       return utils.templates.FondoInstructivoMusica();
          // else if(item === 'audiovisual') return utils.templates.FondoInstructivoAudiovisual();
          // else if(item === 'disenio')      return utils.templates.FondoInstructivoDisenio();
          // else if(item === 'videojuegos')  return utils.templates.FondoInstructivoVideojuego();
          // else if(item === 'editorial')    return utils.templates.FondoInstructivoEditorial();


        }
      }

      return utils.templates.FondoInstructivoDefault();
    },

    commit: function(){
      this.model.set('referencias', this.referenceEditor.collection.toJSON());
    },


  });



//=======================
// Helper functions
// =======================

  var getSession = function(){
    return Edit.Session;
  };

  var buildAttachments = function(view, model){
    var model = getSession().model;
    var adjuntos = getSession().adjuntos;


    var attachTypes = ['especifico', 'cartaministra', 'invitacion',  'docidentidad', 'constanciacuit', 'resenia'];
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
        Message.warning('Debe completar los campos obligatorios para avanzar');
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

    }else if(refCol.length >1 && evType !== 'gira'){
      errors.referencias = 'ATENCIÓN: tenés que ingresar sólo un destino (Ida y Vuelta)';
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

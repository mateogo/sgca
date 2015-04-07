DocManager.module("AdminrequestsApp.Edit", function(Edit, DocManager, Backbone, Marionette, $, _){
  //http://localhost:3000/sisplan/#costo/accion/5499dc3be64014a608ed4b25/edit


  Edit.Layout = Marionette.LayoutView.extend({
    attributes: {
      id: 'activityLayout',
      role: 'main',
    },

    getTemplate: function(){
      return utils.templates.StramiteEditLayout;
    },
    
    regions: {
      actionRegion:     '#action-region',
      mainRegion:       '#main-region',
      budgetRegion:     '#budget-region',
      filterRegion:     '#filter-region',
      requestRegion:    '#request-region',
      controlRegion:    '#control-region',


      summaryRegion:    '#summary-region',
    }
  });


  Edit.ActivityShowBudgetItem = Marionette.ItemView.extend({
    tagName: 'tr',
    whoami:'ActivityShowBudgetItem',

    getTemplate: function(){
      return utils.templates.StramiteShowBudgetItem;
    },

    initialize: function(options){
      console.log('[%s] INIT [%s]',this.whoami, this.model.get('slug'));
      this.options = options;
    },
 
    events: {
      "click a.js-edit": "editClicked"
    },

    editClicked: function(e){
      e.preventDefault();
      this.trigger("action:edit", this.model);
    }
  });


  // BUDGET COMPOSITE
  Edit.ActivityShowBudgetComposite = Marionette.CompositeView.extend({
    //tagName: "div",
    //className: "list-group",

    childView: Edit.ActivityShowBudgetItem,
    childViewContainer: "tbody",

    getTemplate: function(){
      return utils.templates.StramiteShowBudgetItemComposite;
    },

    events: {
      "click .js-newrequest": "newActivity"
    },

    newActivity: function(e){
      console.log('NEW activity CLICK [%s]', this.parentView.whoami);
      e.preventDefault();
      this.trigger("activity:new", this.model);
    },

    setMainParentView: function(view){
      this.parentView = view;
    },
    
    initialize: function(options){
      this.options = options;
      console.log('BudgetComposite INIT VIEW, triggering')
    },

    childViewOptions: function(model, index) {
    },

  });

  var BudgetItemRegion = Marionette.Region.extend({
  });

  // BUDGET INSTANCE LAYOUT
  Edit.ActivityShowBudgetInstance = Marionette.LayoutView.extend({

    whoami:'ActivityShowBudgetInstance / tpl:ActivityShowBudgetLayout',
    //tagName: 'div',
    //className: 'table table-condensed table-bordered',
    attributes: {
      id: 'instanceLayout',
    },

    getTemplate: function(){
      return utils.templates.StramiteShowBudgetLayout;
    },

    initialize: function(options){
      console.log('[%s] INIT [%s]',this.whoami, this.model.get('slug'));
      this.collection = new DocManager.Entities.BudgetItemsCollection(this.model.get('items'));
      this.options = options;
    },
         
    events: {
      "click a.js-edit": "editClicked"
    },

    editClicked: function(e){
      e.preventDefault();
      this.trigger("action:edit", this.model);
    },

    regions: {
      budgetItemRegion: '#budgetitem'
    },

    onShow:function(){
      console.log('onSHOW!!!!!!!!!!!!!!!!!!')
      //for (var i in arguments){console.log("[%s]: [%s]",i,arguments[i])}

      var budgetComposite = new Edit.ActivityShowBudgetComposite({
        collection: this.collection,
        model: this.model
      });

      budgetComposite.setMainParentView(this);

      this.budgetItemRegion.show(budgetComposite);
    },

  });

  //MAIN PANEL WITH BUDGETS
  Edit.ActivityShowBudgets = Marionette.CompositeView.extend({
    tagName:'div',
    className:'panel',
    whoami:'ActiviyShowBudget',

    initialize: function(options){
      console.log('[%s]: [%s] options:[%s]',this.whoami, this.collection.length, options);
      this.options = options;
    },

    getTemplate: function(){
      return utils.templates.StramiteShowBudgetComposite;
    },

    childView: Edit.ActivityShowBudgetInstance,
    childViewContainer: "div#budgetinstance",
        
    events: {
    },

    childEvents: {
      'register:budget:events': function(view, model){
        console.log('MAIN PANEL bubled Activity NEW [%s]', arguments.length);
        this.trigger('register:budget:events', view, model);
      },
    },

    childViewOptions: function(model, index) {
      // do some calculations based on the model
      // console.log('childViewOptions [%s]',model.whoami);
      // return {tpl: this.options.tpl};
    }
  });

  // ============ ControlPanel View ===============
  Edit.ControlPanelView = Marionette.LayoutView.extend({
    whoami: 'Edit.ControlPanelView :build_views',

    tagName: "div",

    attributes: {
      id: 'controlpanelView',
      class: 'col-xs-12 col-md-12'
    },

    templates: {
      ctrlpanel: 'StramiteEditControlPanelView'
    },

    getTemplate: function(){
      return utils.templates[this.templates['ctrlpanel']];
    },

    initialize: function(options){
      var self = this;
      this.options = options;
    },

    regions: {
      filterRegion:     '#filter-region',
    },
    
    events: {
      "click a.js-newrequest": "newrequest",
      "click .js-save": 'saveall',
      "click .js-showaction": 'showaction',
      "click .js-editaction": 'editaction',
    },


    showaction: function(e){
      e.preventDefault();
      e.stopPropagation();
      this.trigger('show:action');
    },
    editaction: function(e){
      e.preventDefault();
      e.stopPropagation();
      this.trigger('edit:action');
    },

    saveall: function(e){
      e.preventDefault();
      e.stopPropagation();
      this.trigger('save:all');
    },

    cancelall: function(e){
      e.preventDefault();
      e.stopPropagation();
      this.trigger('cancel:all');
    },

    newrequest: function(e){
      e.preventDefault();
      e.stopPropagation();
      this.trigger('create:new:request');
    },

  });

  Backgrid.ActionAdminrequestCell = Backgrid.Cell.extend({
      // Cell default class names are the lower-cased and dasherized
      // form of the the cell class names by convention.
      className: "action-cell",
      render: function(){
          if(!this.rendered){
             var btnEdit = $('<button class="btn-link js-requestedit" title="editar"><span class="glyphicon glyphicon-edit"></span></button>');
             var btnRemove = $('<button class="btn-link js-requesttrash" title="borrar"><span class="glyphicon glyphicon-remove"></span></button>');
             this.$el.append(btnEdit).append(btnRemove);
             this.rendered = true;
          }
         return this;
      },
      events: {
          'click button.js-edit': 'editClicked',
          'click button.js-trash': 'trashClicked',
      },
        
      editClicked: function(e){
          e.stopPropagation();e.preventDefault();
          //this.trigger('participant:edit',this.model);
          //DocManager.trigger('participant:edit',participantsApp.Model.selectedAction,this.model);
      },
        
      trashClicked: function(e){
          e.stopPropagation();e.preventDefault();
          //this.trigger('participant:remove',this.model);
          //DocManager.trigger('participant:remove',participantsApp.Model.selectedAction,this.model);
      }
    });
  
  
  Edit.gridCreator = function(collection){
      return new Backgrid.Grid({
          className: 'table table-condensed table-bordered table-hover',
          collection: collection,
          columns: [
                    {name: 'cnumber',label: 'Tramitación',cell: 'string',editable:false},
                    {name: 'trequest',label: 'Tipo',cell: 'string',editable:false},
                    {name: 'slug',label: 'Descripción',cell: 'string',editable:false},
                    {name: 'cantidad',label: 'Cantidad',cell: 'number',editable:false},
                    {name: 'importe',label: 'Importe',cell: 'number',editable:false},
                    {name: 'cudap',label: 'CUDAP',cell: 'string',editable:false},
                    {label: 'Acciones',cell: 'actionAdminrequest',editable:false,sortable:false},
                   ]
        });
  }; 
  
  
  Edit.filterCreator = function(collection){
      return new Backgrid.Extension.ClientSideFilter({
          collection: collection,
          fields: ['slug']
        });
  };









  // ============ Summary View ===============
    Edit.SummaryView = Marionette.ItemView.extend({
    whoami: 'Edit.SummaryView :build_views',

    tagName: "div",

    attributes: {
      id: 'summaryView',
      class: 'col-xs-12 col-md-12'
    },

    getTemplate: function(){
      return _.template('<h2><span class="pull-right">Presupuesto total: $<%= accounting.format(costo_total) %></span></h2>');
    },

    initialize: function(options){
      var self = this;
      this.options = options;
      this.model.bind('change', this.render, this);
    },

  });


  // ============ ITEM BUDGET COL ===============
  Edit.ActivityItem = Marionette.ItemView.extend({
    whoami: 'Edit.ActivityItem ItemView:build_views',
    tagName: "tr",

    templates: {
      activity:      'ActivityEditItemView'
    },

    getTemplate: function(){
      return utils.templates[this.templates['activity']];
    },

    initialize: function(options){
      //console.log('[%s] BEGINS',this.whoami);
      var self = this;
      this.options = options;
      this.model.on('cost:evaluated', this.render, this);
      this.parentView = options.parentView;
    },

    events: {
      "change .js-row-chbx":  'rowchbx',
      "change .js-head-chbx": 'headchbx',
      "change": "change",

      "click .js-isactive": 'isactive',
      "click .js-trash":    'trashitem',
      "click .js-clone":    'cloneitem',
      "click a":            'navigate',
      "click .js-edit":     'editActivity',
    },

    cloneitem: function(e){
      e.preventDefault();
      e.stopPropagation();
      this.trigger('clone:activity:item', this.model);
 
    },
    editActivity: function(e){
      e.preventDefault();
      e.stopPropagation();
      this.trigger('edit:activity:item', this.model);
 
    },
    trashitem: function(e){
      e.preventDefault();
      e.stopPropagation();
      this.trigger('trash:activity:item', this.model);
    },

    isactive: function(e){
      e.preventDefault();
      e.stopPropagation();
      this.model.toggleActivate();
      this.trigger('changed:activity:item', this.model);
    },

    rowchbx: function (e) {
      console.log('yes1')
      e.preventDefault();
      e.stopPropagation();

    },
 
    headchbx: function (e) {
      console.log('yes2')
      e.preventDefault();
      e.stopPropagation();

    },
 
    change: function (event) {
        //utils.hideAlert();
        event.preventDefault();
        event.stopPropagation();
        console.log('input ITEM CHANGE')
        var target = event.target;
 
        this.model.set(target.name, target.value);

        this.trigger('changed:activity:item', this.model);
        //console.log('CHANGE: [%s]: [%s]',target.name, target.value);
        //var err = this.model.validate(change);
        //this.onFormDataInvalid((err||{}));
    },

    triggers: {
    },

    navigate: function(e){
      e.preventDefault();
      e.stopPropagation();
      this.trigger(this.model.get('navigationTrigger'), this.model);
      return false;
    },

    onRender: function(){
      //console.log('rendering again: [%s]', this.model.get('cantidad'))
      // if(this.model.selected){
      //   this.$el.addClass("active");
      // };
    }
  });

  // ============ BUDGET COL COMPOSITE===============
  Edit.ActivityComposite = Marionette.CompositeView.extend({
    whoami: 'Edit.ActivityComposite:build_views',
    tagName: "div",
    className: "panel",

    childView: Edit.ActivityItem,
    childViewContainer: "tbody#activityitems",
    
    templates: {
      activity:      'ActivityEditDetailComposite'
    },

    getTemplate: function(){
      //var template = this.options.navtemplate || 'docum';
      return utils.templates[this.templates['activity']];
    },

    initialize: function(options){
      //console.log('[%s] BEGINS importe:[%s]',this.whoami,  this.model.get('importe'));
      var self = this;
      this.options = options;
    },
    
    childViewOptions: function(model, index) {
        return {parentView: this};
    },

    childEvents: {
      'changed:activity:item': function(view, item){
        //console.log('bubled item CHANGED [%s]', arguments.length);
        this.refreshView()
      },

      'clone:activity:item': function(view, item){
        //console.log('bubled EDIT [%s]', arguments.length);
        this.trigger('clone:activity:item', view, item);
      },

      'edit:activity:item': function(view, item){
        //console.log('bubled EDIT [%s]', arguments.length);
        this.trigger('edit:activity:item', view, item);
      },

      'trash:activity:item': function(view, item){
        //console.log('bubled TRASH [%s]', arguments.length);
        this.trigger('trash:activity:item', view, item);
      }
    },

    events: {
      "change .js-row-chbx":  'rowchbx',
      "change .js-head-chbx": 'headchbx',
      "change": "change",
      "click .js-isactive": 'isactive',
      "click .js-clone": 'cloneactivity',
      "click .js-edit": 'editActivity',
      "click .js-trash": 'trashactivity',
    },

    editActivity: function(e){
     this.trigger('edit:activity', this.model);
 
    },

    cloneactivity: function(e){
      e.preventDefault();
      e.stopPropagation();
      this.trigger('clone:activity', this.model);
 
    },

    isactive: function(e){
      e.preventDefault();
      e.stopPropagation();
      this.model.set('isactive', (1 - this.model.get('isactive')))
      this.refreshView();

    },

    trashactivity: function(e){
      e.preventDefault();
      e.stopPropagation();
      this.trigger('trash:activity', this.model);
    },

    rowchbx: function (e) {
      e.preventDefault();
      e.stopPropagation();

    },
 
    headchbx: function (e) {
      console.log('yes2')
      e.preventDefault();
      e.stopPropagation();

    },
 
    change: function (event) {
        //utils.hideAlert();
        console.log('input CHANGE')
        var target = event.target;
 
        this.model.set(target.name, target.value);
        this.refreshView();
        //console.log('CHANGE: [%s]: [%s]',target.name, target.value);
        //var err = this.model.validate(change);
        //this.onFormDataInvalid((err||{}));
    },

    refreshView: function(){
        //this.model.evaluateCosto();
        this.trigger('cost:changed', this.model);
        //this.render();
    },

    brandClicked: function(e){
      e.preventDefault();
      this.trigger("brand:clicked");
    }
  });


  Edit.modaledit = function(facet, opt, cb){
        var form = new Backbone.Form({
                model: facet,
            });

        form.on('change', function(form, editorContent) {
            var errors = form.commit();
            return false;
        });

        form.on('blur', function(form, editorContent) {
            return false;
        });

        var modal = new Backbone.BootstrapModal({
            content: form,
            title: opt.captionlabel || 'Editar',
            okText: (opt.aceptar || 'aceptar'),
            cancelText: 'cancelar',
            enterTriggersOk: false,
            animate: false
        });

        modal.on('ok',function(){
          console.log('MODAL ok FIRED');
        });

        modal.open(function(){
            console.log('modal CLOSE');
            var errors = form.commit();
            cb(facet);
        });
  };
























// ====================== old stuff ========================

  Edit.MainLayout = Marionette.LayoutView.extend({
    className:'row js-mainlayout',

    getTemplate: function(){
      return utils.templates.ActionEditMainLayout;
    },
    
    regions: {
      headerRegion:  '#main-header-region',
      activityRegion:  '#activity-region',
      contextRegion: '#main-context-region',
    }
  });

  Edit.InlineForm = Marionette.ItemView.extend({
    tagName:'div',
    className:'js-InLineForm',

    getTemplate: function(){
       return utils.templates.ActionInlineFormHook;
    },

    initialize: function(options){
      var self = this;
      this.options = options;
    },

    events: {
      "click .js-inlineFormSubmit": "formsubmit",
      "click .js-inlineFormCancel": "formcancel",
    },

    formsubmit: function(e){
      e.preventDefault();
      e.stopPropagation();
      var self = this;
      console.log('FormSubmit CLICKED');
      self.trigger('form:submit',self.model);
    },

    formcancel: function(e){
      e.preventDefault();
      e.stopPropagation();
      var self = this;
      console.log('FormSubmit CLICKED');
      self.trigger('form:cancel',self.model);
    },

    triggers: {
      //"click a": "document:new"
    },

    onRender: function(){
      this.$('#inner-form-hook').html(this.options.form.render().el);
    }
  });



  Edit.inlineedit = function(opt, cb){
        // #js-form.hook: lo provee la view
        var formHook = opt.hook || '.js-form-hook';
        console.log('inlineEdit[%s]',formHook);

        var submitform = true,
            form = new Backbone.Form({
                model: opt.facet
            }),
            fcontainer = new Backbone.Model({
              caption: opt.captionlabel,
              submit: 'Aceptar',
              cancel: 'Cancelar',
            });

        form.on('change', function(form, editorContent) {
            var errors = form.commit();
            return false;
        });
        form.on('blur', function(form, editorContent) {
            return false;
        });        

        var formContainer = new Edit.InlineForm({
          model:fcontainer,
          form: form
        });
        formContainer.on('form:submit', function(theModel){
          var errors = form.commit();
          console.log('FormClose!!!  [%s]',opt.facet.get('description'));
          formCleanClose();
        });
        formContainer.on('form:cancel', function(theModel){
          console.log('FormCancel');
          submitform = false;
          formCleanClose();
        });

        opt.view.$(formHook).html(formContainer.render().el);
        
        var formCleanClose = function(){
          formContainer.destroy();
          cb(opt.facet, submitform);
        };

  };


  Edit.createInstance = function(opt, cb){
        console.log('modal ACTION NEW');
        console.log('opt.facet: [%s]',opt.facet.whoami)

        var self = opt.view,
            facet = opt.facet,
            form = new Backbone.Form({
                model: facet
            });


        form.on('change', function(form, editorContent) {
            console.log('change');
            var errors = form.commit();
            return false;
        });

        form.on('blur', function(form, editorContent) {
            console.log('blur');
            //var errors = form.commit();
            return false;
        });

        var modal = new Backbone.BootstrapModal({
            content: form,
            title: opt.cation,
            okText: 'aceptar',
            cancelText: 'cancelar',
            enterTriggersOk: false,
            animate: false
        });

        modal.on('ok',function(){
          console.log('MODAL ok FIRED');
          //modal.preventClose();

        });

        modal.open(function(){
            console.log('modal CLOSE');
            var errors = form.commit();
            if(cb)
              cb(facet, true);
        });
  };


  Edit.MainHeader = DocManager.AdminrequestsApp.Common.Views.Form.extend({
    whoami:'Edit.MainHeader: edit_views.js',
    tagName: 'div',
    className: 'panel',

    getTemplate: function(){
      return utils.templates.ActivityMainHeader;
    },

    initialize: function(options){
      console.log('[%s] BEGINS',this.whoami);
      var self = this;
      this.events = _.extend({},this.formevents,this.events);
      this.delegateEvents();
    },

    onRender: function(){
      var self = this;
      this.$("#fealta").datepicker({
            inline: true,
            dateFormat: 'dd/mm/yy',
            minDate: 0,
            //defaultDate: self.model.get('items')[0].fevento,
            altField: "#fealta"
      });
    },

    events: {
      "click .js-editMainHeader": "mainheaderedit",

      "click .js-personsch": "personsearch",
      "click .js-organismosch": "organismosearch",
      "click #fevento": "dateselector",
      "click #nuevo-req-btn": "editDetailForm",
      "change #eusuario": "uservalidation",
    },

    mainheaderedit: function(e){
      e.preventDefault();
      e.stopPropagation();

      this.trigger('main:header:edit', this.model);
    },

  });


  Edit.ActivityPanelItem = Marionette.ItemView.extend({
    whoami: 'Edit.ActivityPanelITEM:edit_views',
    tagName: "tr",

    templates: {
      activity:      'ActionActivityItem'
    },

    getTemplate: function(){
      return utils.templates[this.templates['activity']];
    },

    initialize: function(options){
      console.log('[%s] BEGINS',this.whoami);
      var self = this;
      this.options = options;
      this.parentView = options.parentView;
    },

    events: {
      "click a": "navigate",
      "click .js-editactivity": "edititem",
    },

    triggers: {
    },

    edititem: function(e){
      console.log('ActivityITEM edit')
      e.preventDefault();
      e.stopPropagation();
      this.trigger('edit:activity:item', this.model);
      return false;
    },

    navigate: function(e){
      e.preventDefault();
      e.stopPropagation();
      this.trigger(this.model.get('navigationTrigger'), this.model);
      return false;
    },

    onRender: function(){
      // if(this.model.selected){
      //   this.$el.addClass("active");
      // };
    }
  });


  Edit.ActivityPanel = Marionette.CompositeView.extend({
    whoami: 'Edit.ActivityPanel:edit_views',
    tagName: "div",
    className: "panel",

    childView: Edit.ActivityPanelItem,
    childViewContainer: "tbody#activity-table",
    
    templates: {
      activity:      'ActionActivityHeader'
    },

    initialize: function(options){
      console.log('[%s] BEGINS [%s]',this.whoami, this.collection.length);
      var self = this;
      this.options = options;
    },
    
    childViewOptions: function(model, index) {
        return {parentView: this};
    },


    getTemplate: function(){
      //var template = this.options.navtemplate || 'docum';
      return utils.templates[this.templates['activity']];
    },

    
    events: {
    },

    brandClicked: function(e){
      e.preventDefault();
      this.trigger("brand:clicked");
    }
  });





  Edit.Search = DocManager.AdminrequestsApp.Common.Views.SearchPanel.extend({
    initialize: function(options){
      this.optiones = options;
      var self = this;
    }, 
  });



  Edit.Document = DocManager.AdminrequestsApp.Common.Views.Form.extend({
    
    // tagName:'form',
    // className: 'form-horizontal',

    getTemplate: function(){
      return utils.templates.DocumEditCore;
    },

    initialize: function(options){
      console.log('Edit.DOCUMENT BEGINS')
      var self = this;
      this.events = _.extend({},this.formevents,this.events);
      this.delegateEvents();


    },

    onRender: function(){
      var self = this;
      this.$("#fevento").datepicker({
            inline: true,
            dateFormat: 'dd/mm/yy',
            minDate: 40,
            //defaultDate: self.model.get('items')[0].fevento,
            altField: "#fevento"
      });
      //this.$("#fevento").datepicker('setDate', '+40');

    //this.$('#fevento').datepicker( "dialog", "10/12/2012" );
    },


    events: {
      "click .js-personsch": "personsearch",
      "click .js-organismosch": "organismosearch",
      "click #fevento": "dateselector",
      "click #nuevo-req-btn": "editDetailForm",
      "change #eusuario": "uservalidation",

    },

    dateselector:function(){

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

    itemFormBtnShow: function(e){
      this.$('#itemFormBtn').prop('disabled', false);
    },


    editDetailForm: function(e){
      e.preventDefault();
      console.log('Toggle REQ FORM');
      this.trigger('sitem:edit', this.model);
      this.$('#itemFormBtn').prop('disabled', true);

      return false;
    },

    organismosearch: function(){
      var self = this,
          query = this.$('#organismosch').val();

      console.log('organismosearch [%s]',query);
      this.trigger('person:select', query, function(entity){
        self.model.set({organismo:entity.get('nickName')});
        self.model.set({organismoid:entity.id});
        self.render();
      });
    },

    personsearch: function(){
      var self = this,
          query = this.$('#personsch').val();

      console.log('personsearch [%s]',query);
      this.trigger('person:select', query, function(entity){
        self.model.set({persona:entity.get('nickName')});
        self.model.set({personaid:entity.id});
        self.render();
      });
    },
  });



  // ventana modal
  Edit.modalSearchEntities = function(type, query, cb){
        var options = {
          documents: {
            title:'buscar comprobantes',
            collection: new DocManager.Entities.ComprobanteCollection(),
            model: new Backbone.Model({query:query}),
            searchtrigger:"document:filtered:entities",
            childViewOptions:{
              itemtype:'documentos'
            }
          },

          persons: {
            title:'buscar personas',
            collection: new DocManager.Entities.PersonCollection(),
            model: new Backbone.Model({query:query}),
            searchtrigger:"person:filtered:entities",
            childViewOptions:{
              itemtype:'persons'
            }  
          },

          products: {
            title:'buscar productos',
            collection: new DocManager.Entities.ProductCollection(),
            model: new Backbone.Model({query:query}),
            searchtrigger:"product:filtered:entities",
            childViewOptions:{
              itemtype:'products'
            }  
          }

        }
        var form = new Edit.Search(options[type]);

        form.on('childview:item:found',function(form,model){
          if(cb) cb(model);
          modal.close();
        });
            
        var modal = new Backbone.BootstrapModal({
            content: form,
            title: options[type].title,
            okText: 'aceptar',
            cancelText: 'cancelar',
            animate: false
        });

        modal.open(function(){
            console.log('ME CERRARON [%s]');
        });
  };

  // ventana modal

  // ventana modal Edición del horario de Emision
  Edit.pemisHourEdit = function(model, cb){
        console.log('Modal Parte de Emisión');
        var form = new Backbone.Form({
                model: model,
            });

        form.on('change', function(form, editorContent) {
            var errors = form.commit();
        });
            
        var modal = new Backbone.BootstrapModal({
            content: form,
            title: 'Horario de emisión',
            okText: 'aceptar',
            cancelText: 'cancelar',
            animate: false
        });

        modal.open(function(){
            var errors = form.commit();            
            if(cb) cb(model);
        });
  };



  // ventana modal
  Edit.createItem = function(model){
        console.log('Modal ITEM NEW');
        var facet = new DocManager.Entities.DocumItemCoreFacet({
                tipoitem: model.get('tipocomp'),
                slug: model.get('slug'),
            }),
            form = new Backbone.Form({
                model: facet,
            });

        form.on('change', function(form, editorContent) {
            var errors = form.commit();
        });
            
        var modal = new Backbone.BootstrapModal({
            content: form,
            title: 'Nuevo renglón de comprobante',
            okText: 'aceptar',
            cancelText: 'cancelar',
            animate: false
        });

        modal.open(function(){
            var errors = form.commit();
            var item = model.initNewItem(facet);
            Edit.Session.items.add(item);
        });
  };

  //Edición del SubItem de comprobante SOLICITUD
  Edit.SolicitudDetail = DocManager.AdminrequestsApp.Common.Views.Form.extend({
    whoami:'SolicitudDetail:edit_view.js',
    
    // tagName:'form',
    // className: 'form-horizontal',

    templates: {
      nsolicitud: 'DocumEditPSO',
    },

    getTemplate: function(){
      return utils.templates[this.templates[this.options.itemtype]];
    },

    initialize: function(options){
      console.log('Nuevo Requerimiento [%s]',options.itemtype);
      var self = this;
      this.events = _.extend({},this.formevents,this.events);
      this.delegateEvents();
      this.options = options;
    },
 
    events: {
      "click .js-newSolDetail": "altarequerim",
      "click .js-productsch": "productsearch",
      "click .js-personsch": "personsearch",
    },

    altarequerim: function(){
      var self = this;
      console.log('alta requerim BEGINS!!!!');
      this.trigger('details:form:submit', this.model, function(entity){
        console.log('alta requerim: Cerrar esta ventana!!!!');
        self.destroy();

      });

    },

    personsearch: function(){
      var self = this,
          query = this.$('#personsch').val();

      this.trigger('person:select', query, function(entity){
        self.model.set({persona:entity.get('nickName')});
        self.model.set({personaid:entity.id});
        self.render();
      });
    },

    productsearch: function(){
      var self = this,
          query = this.$('#product').val();

      this.trigger('product:select', query, function(entity){
        console.log('callback: [%s] [%s]',self.whoami,entity.get('slug'));
        var duracion="";
        if(entity.get('patechfacet')){
          duracion = entity.get('patechfacet').durnominal;
        }

        self.model.set({product:entity.get('productcode'), productid: entity.id,pslug:entity.get('slug'), durnominal: duracion});
        self.render();
      });
    },

  });



  // Cabecera del itam
  Edit.ItemHeader = DocManager.AdminrequestsApp.Common.Views.Form.extend({
    whoami:'ItemHeader:edit_view.js',
    
    // tagName:'form',
    // className: 'form-horizontal',

    templates: {
      ptecnico:   'DocumEditPT',
      nsolicitud: 'DocumEditPSO',
      nrecepcion: 'DocumEditRE',
      nentrega:   'DocumEditRE',
      npedido:    'DocumEditRE',
      pemision:   'DocumEditEM',
    },

    getTemplate: function(){
      return utils.templates[this.templates[this.options.itemtype]];
    },

    initialize: function(options){
      var self = this;
      this.events = _.extend({},this.formevents,this.events);
      this.delegateEvents();
      this.options = options;
    },
 
    events: {
      "click .js-productsch": "productsearch",
      "click .js-personsch": "personsearch",
    },

    personsearch: function(){
      var self = this,
          query = this.$('#personsch').val();

      this.trigger('person:select', query, function(entity){
        self.model.set({persona:entity.get('nickName')});
        self.model.set({personaid:entity.id});
        self.render();
      });
    },

    productsearch: function(){
      var self = this,
          query = this.$('#product').val();

      this.trigger('product:select', query, function(entity){
        console.log('callback: [%s] [%s]',self.whoami,entity.get('slug'));
        var duracion="";
        if(entity.get('patechfacet')){
          duracion = entity.get('patechfacet').durnominal;
        }

        self.model.set({product:entity.get('productcode'), productid: entity.id,pslug:entity.get('slug'), durnominal: duracion});
        self.render();
      });
    },

  });

  Edit.ItemLayout = Marionette.LayoutView.extend({
    className: 'row',

    getTemplate: function(){
      return utils.templates.DocumEditPTLayout;
    },
    
    events: {
      "click button.js-submit": "submitClicked",
      "click button.js-cancel": "cancelClicked",
      "click button.js-addItem": "addItem",
    },

    submitClicked: function(e){
      e.preventDefault();
      this.trigger("form:submit");
    },

    cancelClicked: function(e){
      e.preventDefault();
      this.close()
    },

    addItem: function(e){
      e.preventDefault();
      this.trigger("sit:add:item");
    },
    
    regions: {
      ptheaderRegion: '#itemheader-region',
      ptlistRegion:   '#itemlist-region'
    }
  });


  Edit.PTecnicoListItem = DocManager.AdminrequestsApp.Common.Views.Form.extend({
    templates: {
      ptecnico:   'DocumEditPTItem',
      nsolicitud: 'DocumEditSOItem',
      nrecepcion: 'DocumEditREItem',
      nentrega:   'DocumEditREItem',
      npedido:    'DocumEditREItem',
      pemision:   'DocumEditEMItem',
    },

    getTemplate: function(){
      console.log('getTEMPLATES: [%s]',this.templates[this.options.itemtype]);
      return utils.templates[this.templates[this.options.itemtype]];
    },

    tagName:'form',
    className: 'form-horizontal list-group-item',
 
    //tagName: "li",
    //className:"list-group-item",
    initialize: function(options){
      var self = this;
      this.events = _.extend({},this.formevents,this.events);
      this.delegateEvents();
      this.options = options;
      this.model.bind("tc:change", this.tcChange, this);
    },

    events: {
      "click .js-sitremove": "sitremove",
      "click .js-productsch": "productsearch",
    },

    tcChange: function(key){
      console.log('tcChange: [%s]',key);
      this.$('#'+key).val(this.model.get(key));
    },

    productsearch: function(){
      var self = this,
          query = this.$('#product').val();

      this.trigger('product:select', query, function(entity){
        console.log('callback: [%s] [%s]',entity.get('patechfacet'),entity.get('patechfacet').durnominal);
        var duracion="";
        if(entity.get('patechfacet')){
          duracion = entity.get('patechfacet').durnominal;
        }
        self.model.set({product:entity.get('productcode'), productid: entity.id,pslug:entity.get('slug'), durnominal: duracion});
        self.render();
      });
    },



    triggers: {
      //"click a": "document:new"
    },

    sitremove: function(){
      this.trigger('sit:remove:item', this.model);
    },

    onRender: function(){
    }
  });

  Edit.PTecnicoList = Marionette.CollectionView.extend({
    tagName: "div",
    className: "list-group",

    childView: Edit.PTecnicoListItem,
        
    events: {
    },
    
    initialize: function(options){
      this.options = options;
    },

    childViewOptions: function(model, index) {
      // do some calculations based on the model
      console.log('childViewOptions [%s]',model.whoami);
      return {
        itemtype:this.options.itemtype,
      }
    },

    onFormSubmit:function(){
      console.log('submit form:PTI-LIST');
      this.trigger("sit:form:submit");

    },

  });



  Edit.PEmisionDateItem = Marionette.ItemView.extend({
 
    getTemplate: function(){
      if(this.model.get('isActive')){
        return _.template('<button class="btn btn-info js-date" title="Repite: <%= repite %>  <%= comentario %> "><%= hourmain %></button>');
      }else{
        return _.template('<button class="btn btn-link js-date" title="ingrese horario <%= utils.dayweek[dayweek ]%>"><%= hourmain %></button>');
      }
    },

    tagName:'td',
    //className: 'col-sm-1',
 
    //tagName: "li",
    //className:"list-group-item",
    initialize: function(options){
      var self = this;
      this.options = options;
    },

    events: {
      "click .js-sitremove": "sitremove",
      "click .js-productsch": "productsearch",
      "click .js-date": "dateItem",

    },

    dateItem: function(){
      var self = this;
      console.log('dateItem CLICKED [%s]',self.model.get('dayweek'));
      self.trigger('date:select',self.model,function(entity){
        console.log('dateItem BACK');
        self.render();
      });
    },

    productsearch: function(){
      var self = this,
          query = this.$('#product').val();

      this.trigger('product:select', query, function(entity){
        console.log('callback: [%s] [%s]',entity.get('patechfacet'),entity.get('patechfacet').durnominal);
        var duracion="";
        if(entity.get('patechfacet')){
          duracion = entity.get('patechfacet').durnominal;
        }
        self.model.set({product:entity.get('productcode'), productid: entity.id,pslug:entity.get('slug'), durnominal: duracion});
        self.render();
      });
    },

    triggers: {
      //"click a": "document:new"
    },

    sitremove: function(){
      this.trigger('sit:remove:item', this.model);
    },

    onRender: function(){
    }
  });


  Edit.PEmisionListItem = Marionette.CompositeView.extend({
    templates: {
      pemision:   'DocumEditEMItem',
    },

    getTemplate: function(){
      return utils.templates[this.templates[this.options.itemtype]];
    },

    tagName:'tr',
    //className: 'list-group-item',
    
    childView: Edit.PEmisionDateItem,
    //childViewContainer: "tr",

    //tagName: "li",
    //className:"list-group-item",
    initialize: function(options){
      console.log('PEmisionListItem: COMPOSITE INITIALIZE [%s]',options.itemtype);
      var self = this;
      this.options = options;
      //this.collection = model.get('emisiones');
      //console.log('PEmisionListItem: COMPOSITE INITIALIZE [%s]',this.collection.length);
    },

    events: {
      "click .js-sitremove": "sitremove",
      "click .js-productsch": "productsearch",
    },

    productsearch: function(){
      var self = this,
          query = this.$('#product').val();

      this.trigger('product:select', query, function(entity){
        console.log('callback: [%s] [%s]',entity.get('patechfacet'),entity.get('patechfacet').durnominal);
        var duracion="";
        if(entity.get('patechfacet')){
          duracion = entity.get('patechfacet').durnominal;
        }
        self.model.set({product:entity.get('productcode'), productid: entity.id,pslug:entity.get('slug'), durnominal: duracion});
        self.render();
      });
    },



    triggers: {
      //"click a": "document:new"
    },

    onFormDataInvalid: function(errors){

    },

    sitremove: function(){
      this.trigger('sit:remove:item', this.model);
    },

    onRender: function(){
      console.log('on render PEmisionListItem: COMPOSITE INITIALIZE');
    }
  });

  Edit.PEmisionList = Marionette.CompositeView.extend({
    tagName: "table",
    className: "table table-bordered table-hover table-condensed hours",

    getTemplate: function(){
      return utils.templates['DocumEditEMHeader'];
    },

    childView: Edit.PEmisionListItem,
    childViewContainer: "tbody",

    initialize: function(options){
      console.log('PEmisionList:INITIALIZE');
      
      this.options = options;
    },

    childViewOptions: function(model, index) {
      // do some calculations based on the model
      console.log('PEmisionList:childViewOptions [%s] [%s]',model.get('pslug'),index);
      return {
        collection: model.get('emisiones'),
        itemtype:this.options.itemtype,
      }
    },

    onFormSubmit:function(){
      console.log('submit form:PTI-LIST');
      this.trigger("sit:form:submit");
    },
  });


});
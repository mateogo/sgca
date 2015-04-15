DocManager.module("AdminrequestsApp.Build", function(Build, DocManager, Backbone, Marionette, $, _){
  
  Build.Layout = Marionette.LayoutView.extend({
    getTemplate: function(){
      return utils.templates.StramiteBuildMainLayout;
    },
    regions: {
      headerRegion: '#header-region',
      controlRegion: '#control-region',
      basicdataRegion: '#basicdata-region',
      itemheaderRegion: '#itemheader-region',
      itemsRegion: '#items-region',
    },
    events: {
      'click .js-basicedit':'onClickBaseBuild',
      'click .js-itemheaderedit':'onClickItemHeaderEdit',
      
    },
    onClickBaseBuild: function(){
      console.log('Click basicEdit')
      this.trigger('edit:basic:data');
    },
    onClickItemHeaderEdit: function(){
      console.log('click ItemHeaderEdit js-itemheaderedit')
      this.trigger('edit:itemheader:data');
    },
    onClickResumeMode: function(){
      //Build.Controller.showResume(this.model);
    },
  });
  
  Build.NotFoundView = Marionette.ItemView.extend({
    tagName: 'h2',
    className: 'text-danger',
    render: function(){
      this.$el.html('La tramitación no existe');
    }
  });

  Build.HeaderInfo = Marionette.ItemView.extend({
    tagName: 'div',
    initialize: function(opts){
      console.log('HeaerInfo INIT')
      if(opts.tab){
        this.selectedTab = opts.tab;
      }
      // ver LPVNLO
      Marionette.ItemView.prototype.initialize.apply(this,arguments);
    },
    getTemplate: function(){
      return utils.templates.StramiteBuildHeaderView;
    },
    onRender: function(){
      // if(this.selectedTab){
      //   this.selectTab(this.selectedTab);
      // }
    },
    events: {
      'click .js-openevent': 'openEventClicked',
      'click .js-openresume': 'openResumeClicked',
      'click .js-openresource': 'notYet',
      'click .js-opentask': 'notYet'
    },
    
    selectTab: function(str){
      var item = '.js-open'+str;
      this.$el.find('li.active').removeClass('active');
      this.$el.find(item).addClass('active');
    },
    
    notYet: function(){
      Message.info('Disponible proximamente');
    },
    
    openResumeClicked: function(e){
      e.stopPropagation();
      DocManager.trigger('artActivity:edit',this.model);
    },
    
    openEventClicked: function(e){
      e.stopPropagation();
      DocManager.trigger('events:list',this.model);
    }
  });

  
  Build.ResumeView = Marionette.ItemView.extend({
    getTemplate: function(){
      return utils.templates.StramiteBuildHeaderDataView;
    },
    templateHelpers: function(){
      var self = this;
      return {
        formatDate: function(date){
          //return 'mingaLaFecha'
          return moment(date).format('dddd LL');
        },
        getFieldLabel: function(fieldName){
          return self.model.getFieldLabel(fieldName);
        }
      };
    }
  });
  
  Build.BasicEditor = Marionette.ItemView.extend({
    tagName: 'div',

    initialize: function(opts){
      this.originalModel = _.clone(opts.model);
    },

    getTemplate: function(){
      return utils.templates.StramiteBuildBasicEditorLayout;
    },

    onRender: function(){
      console.log(this.model);
      this.form = new Backbone.Form({
        model: this.model,
        template: utils.templates.StramiteBuildBasicEditorForm
      });
      this.form.render();
      this.$el.find('#formContainer').html(this.form.el);
      //this.validateSubRubroSelect();
      //this.validateLocacion();
    },
    
    validateSubRubroSelect: function(){
      var rubroSelected = this.$el.find('[name=rubro]').val();
      var subOptions = utils.subtematicasOptionList[rubroSelected];
      if(subOptions){
        this.form.fields.subrubro.editor.setOptions(subOptions);
      }
    },
    
    validateLocacion: function(){
      var locacionSelected = this.$el.find('[name=locacion]').val();
      var subOptions = _.where(utils.localList,{locacion:locacionSelected});
      if(subOptions){
        this.form.fields.local.editor.setOptions(subOptions);
      }
    },
    
    done: function(){
      Build.Controller.showResume(this.model);
    },
    
    events: {
      'click .js-save': 'onSave',
      'click .js-cancel': 'onCancel',
    },
    
    
    onSave: function(){
      var errors = this.form.commit(),
          self = this;
      
      if(!errors){
        self.trigger('save:basic:editor', function(error){
          Message.error('Ops! no se pudo guardar');
        });
      }
    },
    
    onCancel: function(){
      // if(this.model.isNew()){
      //   DocManager.navigateBack();  
      // }else{
      //   Build.Controller.showResume(this.model);
      // }
      console.log('Cancel CLICKED')
      this.trigger('cancel:basic:editor');
    }
    
  });

  Build.ControlPanelLayoutView = Marionette.LayoutView.extend({
    whoami: 'Build.ControlPanelView :build_view',

    tagName: "div",

    attributes: {
      id: 'controlpanelView',
      class: 'col-xs-12 col-md-12'
    },

    templates: {
      ctrlpanel: 'StramiteBuildControlPanel'
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

  Build.ItemHeaderView = Marionette.ItemView.extend({
    tagName: 'div',
    attributes: {
      id: 'itemHeaderView',
      //class: 'col-xs-12 col-md-12'
    },
    initialize: function(opts){
      this.originalModel = _.clone(opts.model);
    },

    getTemplate: function(){
      return utils.templates.StramiteBuildItemHeaderView;
    },
    
    templateHelpers: function(){
      var self = this;
      return {
        formatDate: function(date){
          //return 'mingaLaFecha'
          return moment(date).format('dddd LL');
        },
        getFieldLabel: function(fieldName){
          return self.model.getFieldLabel(fieldName);
        }
      };
    },    
  });


  Build.ItemHeaderEditor = Marionette.ItemView.extend({
    tagName: 'div',
    attributes: {
      id: 'itemHeaderEditor',
      //class: 'col-xs-12 col-md-12'
    },

    initialize: function(opts){
      this.originalModel = _.clone(opts.model);
    },

    getTemplate: function(){
      return utils.templates.StramiteBuildItemHeaderLayout;
    },

    onRender: function(){
      console.log(this.model);
      this.form = new Backbone.Form({
        model: this.model,
        //template: utils.templates.StramiteBuildBasicEditorForm
      });
      this.form.render();
      this.$el.find('#formContainer').html(this.form.el);
    },
            
    events: {
      'click .js-save': 'onSave',
      'click .js-cancel': 'onCancel',
      'click .js-itemgenerator': 'onGenerateItems',
    },
    
    onGenerateItems: function(){
      var errors = this.form.commit(),
          self = this;

      if(!errors){
        self.trigger('generate:items:editor', self.model, function(error){
          Message.error('Ops! Hay errores en el formulario');
        });
      }
    },
    
    onSave: function(){
      var errors = this.form.commit(),
          self = this;

      if(!errors){
        self.trigger('save:itemheader:editor', self.model, function(error){
          Message.error('Ops! no se pudo guardar');
        });
      }
    },
    
    onCancel: function(){
      console.log('Cancel CLICKED')
      this.trigger('cancel:itemheader:editor');
    }
    
  });

  Build.ItemListLayout = Marionette.LayoutView.extend({
    className: 'row row-offcanvas row-offcanvas-left',

    getTemplate: function(){
      return utils.templates.StramiteBuildItemListLayout;
    },
    
    regions: {
      tableRegion: '#table-region',
      filterRegion : '#filter-region'
    },
    
    events: {
      'click button.js-participantnew': 'newClicked'
    },
    
    newClicked: function(e){
      console.log('new clicked');
      //this.trigger('participant:new');
    }
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
          'click button.js-requestedit': 'editClicked',
          'click button.js-requesttrash': 'trashClicked',
      },
        
      editClicked: function(e){
          e.stopPropagation();e.preventDefault();
          console.log('item EDIT [%s] ', this.model.get('description'));

          //this.model.trigger('request:item:edit');
          //this.trigger('request:item:edit',this.model);

          Build.Session.views.layout.trigger('request:item:edit',this.model);
      },
        
      trashClicked: function(e){
          e.stopPropagation();e.preventDefault();
          //this.trigger('participant:remove',this.model);
          //DocManager.trigger('participant:remove',participantsApp.Model.selectedAction,this.model);
      }
    });
  
  
  Build.itemsGridCreator = function(collection){
      return new Backgrid.Grid({
          className: 'table table-condensed table-bordered table-hover',
          collection: collection,
          columns: [
                    {name: 'person',label: 'Beneficiario',cell: 'string',editable:false},
                    {name: 'slug',label: 'Descripción',cell: 'string',editable:false},
                    {name: 'freq',label: 'Cantidad',cell: 'number',editable:false},
                    {name: 'punit',label: 'Importe',cell: 'number',editable:false},
                    {name: 'fedesde',label: 'Fe desde',cell: 'string',editable:false},
                    {name: 'fehasta',label: 'Fe hasta',cell: 'string',editable:false},
                    {label: 'Acciones',cell: 'actionAdminrequest',editable:false,sortable:false},
                   ]
        });
  }; 
  
  Build.filterCreator = function(collection){
      return new Backgrid.Extension.ClientSideFilter({
          collection: collection,
          fields: ['slug', 'person']
        });
  };

  Build.ItemEditor = Marionette.ItemView.extend({
    tagName: 'div',

    initialize: function(opts){
      this.originalModel = _.clone(opts.model);
    },

    getTemplate: function(){
      return utils.templates.StramiteBuildItemEdit;
    },

    onRender: function(){
      console.log('[%s] [%s]', this.model.get('person'), this.model.whoami);
      this.form = new Backbone.Form({
        model: this.model,
        template: utils.templates.StramiteBuildItemForm
      });
      this.form.render();
      this.$el.find('#formContainer').html(this.form.el);
      //this.validateSubRubroSelect();
      //this.validateLocacion();
    },
    
    
    done: function(){
      Build.Controller.showResume(this.model);
    },
    
    events: {
      'click .js-save': 'onSave',
      'click .js-cancel': 'onCancel',
    },
    
    
    onSave: function(){
      var errors = this.form.commit(),
          self = this;
      
      if(!errors){
        self.trigger('save:item:editor', self.model, function(error){
          Message.error('Ops! no se pudo guardar');
        });
      }
    },
    
    onCancel: function(){
      // if(this.model.isNew()){
      //   DocManager.navigateBack();  
      // }else{
      //   Build.Controller.showResume(this.model);
      // }
      console.log('Cancel CLICKED')
      this.trigger('cancel:item:editor');
    }
    
  });
  
  
});
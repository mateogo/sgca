DocManager.module("RondasApp.Common.Views", function(Views, DocManager, Backbone, Marionette, $, _){

  Views.filterPopup = function(filterData, FilterModel, targetEvent, filterTitle){
    if(!filterData){
      filterData=   new FilterModel();
    }

    filterData.schema.subsector.options = tdata.subSectorOL[filterData.get('sector')];
    var form = new Backbone.Form({model:filterData});

    form.on('sector:change', function(form, editorContent) {
        var contenido = editorContent.getValue(),
            newOptions = tdata.subSectorOL[contenido];
        form.fields.subsector.editor.setOptions(newOptions);
    });

    var modal = new Backbone.BootstrapModal({
      content: form,
      title: filterTitle || 'Filtros' ,
      okText: 'aceptar',
      cancelText: 'cancelar',
      enterTriggersOk: false,
    });

    modal.on('ok',function(){
        form.commit();
        DocManager.trigger(targetEvent, filterData);
    });

    modal.open();
  };


        // form.on('tipocontacto:change', function(form, editorContent) {
        //     console.log('onchange:key');
        //     var contenido = editorContent.getValue(),
        //         newOptions = utils.tipocontactoOL[contenido];
        //     form.fields.subcontenido.editor.setOptions(newOptions);
        // });

        // form.on('contenido:tematica:change', function(form, editor, editorContent) {
        //     var tematica = editor.nestedForm.fields.tematica.getValue(),
        //       newOptions = utils.subtematicasOptionList[tematica];
        //     //utils.inspect(editorContent,0,'editorContent',3);
        //     form.fields.contenido.editor.nestedForm.fields.subtematica.editor.setOptions(newOptions);
        // });




  Views.Layout = Marionette.LayoutView.extend({
    //className: 'container',

    getTemplate: function(){
      return utils.templates.CommonBaseLayout;
    },
    
    regions: {
      //navbarRegion:  '#navbar-region',
      sidebarRegion: '#sidebar-region',
      mainRegion:        '#base-region',

      headerInfoRegion:  '#sidebar1-region',
      itemsInfoRegion:   '#sidebar2-region',

      itemEditRegion: '#itemedit-region',
      linksRegion:   '#panel-region',
    },
    
    events: {
      'click button.js-participantnew': 'newClicked'
    },
    
    newClicked: function(e){
      this.trigger('participant:new');
    }
  });

  Views.MainLayout = Marionette.LayoutView.extend({
    //className: 'container',
    attributes: {
      id: 'mainLayout',
      role: 'main',
    },

    getTemplate: function(){
      return utils.templates.CommonMainLayout;
    },

    hideList: function(){
      this.$('#list-region').hide();
    },

    showList: function(){
      this.$('#list-region').show();
    },
    
    regions: {
      headerRegion:  '#header-region',
      listRegion:    '#list-region',
      editRegion:    '#edit-region',
      footerRegion:  '#footer-region',
    },
    
    events: {
      'click button.js-participantnew': 'newClicked'
    },
    
    newClicked: function(e){
      this.trigger('participant:new');
    }
  });


  Views.SideBarPanel = Marionette.ItemView.extend({
    //article id="sidebar-region" role="navigation" class="sistema-box" -->
    tagName: "ul",
    className:"context-menu panel",
    attributes: {
      //href:'#'
    },

    initialize: function(options){
      //console.dir(options);
      var self = this;
      this.options = options;
    },

    getTemplate: function(){
      return utils.templates.CommonSideBarPanel;
    },

    events: {
      "click .js-newentity": "newentity",
      "click .js-newbudget": "newbudget",
      "click .js-newactivity": "newactivity",
      "click .js-newparticipant": "newparticipant",
      "click .js-newlocation": "newlocation",
      "click .js-newartactivity": "newartactivity",
      "click .js-showartactivity": "showartactivity",
    },

    triggers: {
      //"click a": "document:new"
    },

    modelChanged: function(){
      console.log('bind EVENT SIDEBAR ITEM');
    },

    newactivity: function(e){
      console.log('activity');
      e.preventDefault();
      this.trigger('activity:new');
      return false;
    },
    

    onRender: function(){
      // if(this.model.selected){
      //   this.$el.addClass("active");
      // };
    }
  });



  Views.Form = Marionette.ItemView.extend({

    formevents: {
      "click button.js-submit": "submitClicked",
      "click button.js-cancel": "cancelClicked",
      "change": "change"
    },

    onRender: function(){
      var self = this;
    },

    change: function (event) {
        var target = event.target,
            change = {};
        
        if(!target.name) return;
				
        switch (target.type){
						case 'checkbox':
              //console.log('checked:[%s]: name:[%s] value:[%s]',target.checked, target.name, target.value);
							this.model.get(target.name)[target.value] = target.checked;
              //{
              //  name: {something: true, elsesomething: false, etc: true}
              //}
							//console.log('checked:[%s]: name:[%s] value:[%s]',target.checked, target.name, target.value);
							break;
						case 'radio':
              //console.log('[%s]:[%s]   checked:[%s]: name:[%s] value:[%s] ',this.model.whoami,this.model.get(target.name),target.checked, target.name, target.value);
              if(this.model.get(target.name)[target.value]){
                this.model.get(target.name)[target.value] = target.checked;
              }else{
                change[target.name] = target.value;
                this.model.set(change); 
              }
              //{
              //  name: {something: fase, elsesomething: true, etc: false}
              //  or
              //  name: elsesomething
              //}
              //$('#ccoperativa').radio('check');
						 	//console.log('checked:[%s]: name:[%s] value:[%s] [%s]',target.checked, target.name, target.value, this.model.get(target.name)[target.value]);
							break;
						
						case 'select-multiple':
              //console.log('CHANGE MULTIPLE: name:[%s] id[%s] value:[%s] tags:[%s]', target.name, target.id, target.value, this.$('#'+target.id).tagsinput('items'));
              this.model.set(target.name, this.$('#'+target.id).tagsinput('items'));  
						  break;
						
						default:
							change[target.name] = target.value;
							this.model.set(change);
							//console.log('CHANGE DEFAULT: [%s]: [%s] [%s]',target.name, target.value, target['multiple']);
              //console.dir(this.model.attributes)
              break;
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

      //console.log('onForm Notifications [%s][%s]', tstyle, selector);

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
        //console.log('Mark Erross: value: [%s]  key:[%s]', value, key)
        var $controlGroup = $view.find("#" + key).closest('.form-group');
        $controlGroup.addClass("has-error");
        $('.help-block', $controlGroup).html(value);
      }

      clearFormErrors();
      _.each(errors, markErrors);
    }
  });


  Views.gridFactory = function(collection, columns){
      return new Backgrid.Grid({
          className: 'table table-condensed table-bordered table-hover',
          collection: collection,
          columns: columns
        });
  }; 
  
  Views.filterFactory = function(collection, fieldList){
      return new Backgrid.Extension.ClientSideFilter({
          collection: collection,
          fields: fieldList,
        });
  };


  Views.ModelEditorLayout = Marionette.LayoutView.extend({

    getTemplate: function(){
      return utils.templates.BrowseProfileLayout;
    },
    
    regions: {
      //navbarRegion:  '#navbar-region',
      controlRegion: '#control-region',
      showRegion:    '#show-region',
      editRegion:    '#edit-region',


    },
    
    events: {
      'click button.js-close': 'closeView',
      'click button.js-aceptar-comprador': 'aceptarComprador',
    },
    aceptarComprador: function(e){
      this.trigger('accept:buyer');
    },
    
    closeView: function(e){
      this.trigger('close:view');
    }
  });




  //************** CRUD STUFF
  Views.CrudLayout = Marionette.LayoutView.extend({
    whoami: 'CrudLayout:',

    tagName: "div",

    attributes: {
      id: 'crudLayout'
    },
    
    regions: {
      filterRegion: '#filter-region',
      tableRegion: '#table-region',

    },

    initialize: function(options){
      var self = this;
      if(options){
        if(options.template) self.setTemplate(options.template)
        if(options.formTemplate) self.setFormTemplate(options.formTemplate)
        this.options = options;
      }
      if(options.filterInstance){
        this.filter = options.filterInstance;
      }
    },

    onRender: function(){

    },
            
    templates: {
      base: _.template('<div id="form-region"></div><div id="list-region"></div>'),
      form: _.template('<div>Algun Form</div>'),
    },

    setTemplate: function(tpl){
      this.templates.base = tpl;
    },

    setFormTemplate: function(tpl){
      this.templates.form = tpl;
    },

    getTemplate: function(){
      return this.templates['base'];
    },

    events: {
      'click .js-basicedit':'onClickBaseEdit',
      'click .js-save': 'onSave',
      'click .js-cancel': 'onCancel',
      'click .js-filter': 'filterList',
      'click button.js-item-edit': 'itemEdit',
      'click button.js-item-trash': 'itemTrash',
    },

    filterList: function(e){
      //console.log('FILTER LIST: [%s]', this.options.filterEventName);
      Views.filterPopup(this.filter, this.options.filterModel, this.options.filterEventName, this.options.filterTitle);
    },

    itemEdit: function(){
      //console.log('ITEM bubbled!!!')
    },

    onClickBaseEdit: function(){
      this.trigger('edit:basic:data');
    },

    onSave: function(e){
      e.stopPropagation();
  
      this.trigger('save:crud:editor');
      // var errors = this.form.commit(),
      //     self = this;

      // console.log('SavE CLICKED [%s]',self.model.get('denominacion'));
      // self.trigger('save:crud:editor', this.model);
      
      // if(!errors){
      //   self.trigger('save:crud:editor', function(error){
      //     Message.error('Ops! no se pudo guardar');
      //   });
      // }
    },
    
    onCancel: function(){
      this.trigger('cancel:basic:editor');
    },

  });



  Views.CrudManager = Backbone.Model.extend({
    whoami: 'CrudManager:crud_views.js ',
    idAttribute: "_id",
    
    initialize: function(attrs, opts){
      var self = this;
      this.options = opts;

      //filter
      self.filterFactory(self.collection, self.get('filtercols'));

      // gridcols
      self.gridFactory(self.collection,self.get('gridcols'));

      // deploy layout
      self.createLayout(opts);
      //self.createForm(opts);
    },

    getLayout: function(){
      return this.layout;
    },

    filterFactory: function(collection, fieldList){
      var self = this;
      //console.log('FilterFactory: [%s]',self.options.filterEditor)
      if(self.options.filterEditor){
        this.filter = new self.options.filterEditor({
            collection: collection,
            model: self.options.filterInstance,
            filterEventName: self.options.filterEventName,
            filterTitle: self.options.filterTitle,
            fields: fieldList,
          });
          
      }else{
        this.filter = new Backgrid.Extension.ClientSideFilter({
            collection: collection,
            fields: fieldList,
          });
          
      }
    },
    
    gridFactory: function(collection, columns){
      //console.log('GridFactory: collection[%s] [%s]', collection.length, this.collection.length)
      var self = this;

      if(self.options.collectionView){
        this.grid = new self.options.collectionView({
            collection: this.collection,         
        });

      }else{
        this.grid = new Backgrid.Grid({
            className: 'table table-condensed table-bordered table-hover',
            collection: this.collection,
            columns: columns
          });
      }



      // this.collection.on('trash:item:crud', function(model){
      //     this.remove(model);
      // });

    },

    createLayout: function(opts){
      var self = this;
      var data = _.extend({}, self.get('layoutdefaults'), {itemssofar: self.collection.length});

      self.layout = new Views.CrudLayout({
        model: new Backbone.Model(data),
        template: opts.layoutTpl,
        filterEventName: opts.filterEventName,
        filterModel: opts.filterModel,
        filterTitle: opts.filterTitle,
        filterInstance: opts.filterInstance,
        // TODO: :filterTemplate: opts.filterTemplate,
      });

      self.layout.on('show',function(){
        self.layout.filterRegion.show(self.filter);
        self.layout.tableRegion.show(self.grid);
      });

      self.layout.on('save:crud:editor', function(){
        //self.form.commit();
        //self.collection.add(self.form.model);

        //DocManager.trigger(self.get('editEventName'), new self.options.editModel());

      });
    },

    createForm: function(opts){
      var self = this;
      if(self.options.EditorView){
        self.form = new self.options.EditorView({
            model: self.options.modelToEdit,
            editorOpts: (opts.editorOpts ? opts.editorOpts : {}),
        });

      }else{
        self.form = new Backbone.Form({
            model: self.options.modelToEdit,
            template: self.options.formTpl,
            collection: self.collection,
        });
      }

    },
    createTable: function(){

    },

    defaults: {

    },

  });
  ////////////////

});

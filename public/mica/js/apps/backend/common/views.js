DocManager.module("BackendApp.Common.Views", function(Views, DocManager, Backbone, Marionette, $, _){

  var decoActividad = {
    'musica': {label:'MÚSICA', 'class': 'label-mica-musica'},
    'aescenicas': {label:'ARTES ESCÉNICAS', 'class': 'label-mica-aescenicas'},
    'audiovisual': {label:'', 'class': 'label-mica-audiovisual'},
    'disenio': {label:'DISEÑO', 'class': 'label-mica-diseno'},
    'editorial': {label:'EDITORIAL', 'class': 'label-mica-editorial'},
    'videojuegos': {label:'VIDEOJUEGOS', 'class': 'label-mica-videojuegos'},
  };

  Views.renderLabelActividad = function(actividad){
    var $span = $('<span class="label label-mica"></span>');
    if(actividad in decoActividad){
      var deco = decoActividad[actividad];
      $span.html(deco.label).addClass(deco.class);
    }else{
      $span.html(actividad);
    }
    return $span;
  };

  Views.filterPopup = function(filterData, FilterModel, targetEvent, filterTitle){
    if(!filterData){
      filterData = new FilterModel();
    }

    if(filterData.schema.subsector)
      filterData.schema.subsector.options = tdata.subSectorOL[filterData.get('sector')];

   if(filterData.schema.subgenero)
      filterData.schema.subgenero.options = tdata.subgeneroOL[filterData.get('tsolicitud')];

     var form = new Backbone.Form({model:filterData});

    form.on('sector:change', function(form, editorContent) {
        var contenido = editorContent.getValue(),
            newOptions = tdata.subSectorOL[contenido];
        form.fields.subsector.editor.setOptions(newOptions);
    });

    form.on('tsolicitud:change', function(form, editorContent) {
        form.fields.subgenero.editor.setOptions(tdata.subgeneroOL[editorContent.getValue()]);
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
        DocManager.trigger(targetEvent, filterData, 'reset');
    });

    modal.open();
  };

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

    hideEdit: function(){
      this.$('#edit-region').hide();
    },

    showEdit: function(){
      this.$('#edit-region').show();
    },

    hideView: function(){
      this.$('#view-region').hide();
    },

    showView: function(){
      this.$('#view-region').show();
    },


    regions: {
      headerRegion:  '#header-region',
      listRegion:    '#list-region',
      editRegion:    '#edit-region',
      viewRegion:    '#view-region',
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
    },

    newactivity: function(e){
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
      this.close();
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

      var clearFormErrors = function(){
        $view.find(selector).each(function(){
          $(this).removeClass(tstyle);
          $('.help-block', $(this)).html("");
        });
      };

      var markErrors = function(value, key){
        var $controlGroup = $view.find("#" + key).closest('.form-group');
        $controlGroup.addClass(tstyle);
        $('.help-block', $controlGroup).html(value);
      };

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
      };

      var markErrors = function(value, key){
        var $controlGroup = $view.find("#" + key).closest('.form-group');
        $controlGroup.addClass("has-error");
        $('.help-block', $controlGroup).html(value);
      };

      clearFormErrors();
      _.each(errors, markErrors);
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
      formRegion: '#formContainer',
      tableRegion: '#table-region',
      filterRegion: '#filter-region',
      paginatorRegion: '#paginator-region',

    },

    initialize: function(options){
      var self = this;
      if(options){
        if(options.template) self.setTemplate(options.template);
        if(options.formTemplate) self.setFormTemplate(options.formTemplate);
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

    // getTemplate: function(){
    //   return this.templates['base'];
    // },

    events: {
      'click #textsearchbtn': 'textFilter',
      'keyup #querytext': 'onChangeQueryText',
      'click .js-basicedit':'onClickBaseEdit',
      'click .js-save': 'onSave',
      'click .js-cancel': 'onCancel',
      'click .js-filter': 'filterList',
      'click .js-excel': 'downloadExcel',
      'click .js-showcase-excel': 'downloadShowcaseExcel',
      'click button.js-item-edit': 'itemEdit',
      'click button.js-item-trash': 'itemTrash',
      //'input #querytext': 'textFilter',
    },

    onChangeQueryText: function(e){
      if(e.keyCode === 13){
        e.preventDefault();
        e.stopPropagation();
        this.textFilter(e);
      }
    },

    textFilter: function(e){
      e.preventDefault();
      e.stopPropagation();
      if(!this.filter) return;

      this.filter.set('textsearch',this.$('#querytext').val());

      DocManager.trigger(this.options.filterEventName, this.filter, 'reset');
    },

    downloadShowcaseExcel: function(e){
      e.preventDefault();
      e.stopPropagation();
      DocManager.trigger('showcase:suscriptions:export:excel');
    },

    downloadExcel: function(e){
      e.preventDefault();
      e.stopPropagation();
      DocManager.trigger('mica:suscriptions:export:excel');
    },

    filterList: function(e){
      Views.filterPopup(this.filter, this.options.filterModel, this.options.filterEventName, this.options.filterTitle);
    },

    itemEdit: function(){
    },

    onClickBaseEdit: function(){
      this.trigger('edit:basic:data');
    },

    onSave: function(e){
      e.stopPropagation();

      this.trigger('save:crud:editor');
    },

    onCancel: function(){
      this.trigger('cancel:basic:editor');
    },

  });

  Views.ModelEditorLayout = Marionette.LayoutView.extend({

    initialize: function(opts){
      this.options = opts;
    },

    getTemplate: function(){
      if(!this.options.template)
        return utils.templates.CommonModelEditorLayout;
      else
        return this.options.template;
    },

    regions: {
      controlRegion: '#control-region',
      showRegion:    '#show-region',
      editRegion:    '#edit-region',


    },

    events: {
      'click button.js-close': 'closeView',
      'click button.js-aceptar-comprador': 'aceptarComprador',
      'click button.js-aceptar-showcase': 'aceptarShowcase',
      'click button.js-aceptar-micaranking': 'aceptarMicaranking',

    },

    aceptarComprador: function(e){
      this.trigger('accept:buyer');
    },

    aceptarShowcase: function(e){
      this.trigger('accept:showcase');
    },

    aceptarMicaranking: function(e){
      this.trigger('accept:micaranking');
    },

    closeView: function(e){
      this.trigger('close:view');
    }
  });




  Views.CrudManager = Backbone.Model.extend({
    whoami: 'CrudManager:crud_views.js ',
    idAttribute: "_id",

    initialize: function(attrs, opts){
      var self = this;
      //model, collection, tablecols
      this.options = opts;
      self.filterFactory(self.collection, self.get('filtercols'));
      self.gridFactory(self.collection, self.get('gridcols'));
      self.createLayout(opts);
      //self.createForm(opts);
    },

    getLayout: function(){
      return this.layout;
    },

    filterFactory: function(collection, fieldList){
      this.filter = new Backgrid.Extension.ClientSideFilter({
          collection: collection,
          fields: fieldList,
        });
    },

    gridFactory: function(collection, columns){
      this.grid = new Backgrid.Grid({
          className: 'table table-condensed table-bordered table-hover',
          collection: this.collection,
          columns: columns
        });

      this.gridpaginator = new Backgrid.Extension.Paginator({
          windowSize:40,
          slideScale: 0.10,
          goBackFirstOnSort:false,
          collection: this.collection,
        });


    },

    createLayout: function(opts){
      var self = this;
      //console.log('createLayout:[%s]', opts.layoutdefaults);

      var data = _.extend({}, opts.layoutdefaults, {itemssofar: self.collection.length});

      self.layout = new Views.CrudLayout({
        model: new Backbone.Model(data),
        template: opts.layoutTpl,
        filterEventName: opts.filterEventName,
        filterModel: opts.filterModel,
        filterTitle: opts.filterTitle,
        filterInstance: opts.filterInstance,
      });

      self.layout.on('show',function(){
        //self.layout.filterRegion.show(self.filter);
        self.layout.tableRegion.show(self.grid);
        self.layout.paginatorRegion.show(self.gridpaginator);
        //self.layout.formRegion.show(self.form);
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

  var SlimPopup =  Marionette.LayoutView.extend({
    className: 'slim-popup',
    template: _.template('<div><div class="header"><span class="header-title"></span><div class="header-toolbar"><div class="btn-link js-tomain" style="display:none">Abrir en página base |</div> <div class="btn-link js-close" style="cursor:pointer">Cerrar</div></div></div><div class="body"></div></div>'),
    regions: {
      bodyRegion: '.body'
    },
    setTitle: function(str){
      this.$el.find('.header-title').html(str);
      return this;
    },
    width: function(str){
      this.$el.width(str);
      return this;
    },
    height: function(str){
      this.$el.height(str);
      return this;
    },
    center: function(){
      var w = this.$el.outerWidth(true);
      var h = this.$el.outerHeight(true);
      var screenWidth = $(window).width();
      var screenHeight = $(window).height();
      var top = screenHeight/2 - h/2;
      var left = screenWidth/2 - w/2;
      this.$el.css('top',top).css('left',left);
      return this;
    },
    setNavigationUrl: function(url){
      this.url = url;
      this.$el.find('.js-tomain').show();
    },
    toMainView: function(){
      DocManager.navigate(this.url,{trigger:true});
      this.destroy();
      return this;
    },
    close: function(){
      this.destroy();
      return this;
    },
    events: {
      'click .js-close': 'close',
      'click .js-tomain': 'toMainView'
    }
  });

  Views.slimPopup = function($content){

    var popup = new SlimPopup();
    popup.$el.css('display','none');
    $('body').append(popup.render().el);
    popup.bodyRegion.show($content);
    popup.body = $content;
    popup.$el.fadeIn();
    popup.$el.draggable({containment:$('body'),handle:'.header'});
    popup.$el.resizable({containment:$('body'),minWidth:200,minHeight:200});
    popup.once('destroy',function(){
      popup.$el.draggable('destroy');
    });
    popup.center();
    return popup;
  };

});

DocManager.module("MicaRequestApp.Edit", function(Edit, DocManager, Backbone, Marionette, $, _){
  
  Edit.CrudLayout = Marionette.LayoutView.extend({
    whoami: 'CrudLayout:',

    tagName: "div",

    attributes: {
      id: 'crudLayout'
    },
    
    regions: {
      formRegion: '#formContainer',
      tableRegion: '#table-region',
      filterRegion: '#filter-region',

    },

    initialize: function(options){
      var self = this;
      console.log('[%s] INIT', self.whoami);
      if(options){
        if(options.template) self.setTemplate(options.template)
        if(options.formTemplate) self.setFormTemplate(options.formTemplate)
        this.options = options;
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
      'click button.js-item-edit': 'itemEdit',
      'click button.js-item-trash': 'itemTrash',
    },

    itemEdit: function(){
      console.log('ITEM bubbled!!!')
    },

    onClickBaseEdit: function(){
      console.log('Click basicEdit')
      this.trigger('edit:basic:data');
    },

    onSave: function(e){
      e.stopPropagation();
      console.log('onSave:[%s]', this.cid)
  
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
      console.log('Cancel CLICKED')
      this.trigger('cancel:basic:editor');
    },

  });
/*
  Edit.CrudEditor = Marionette.ItemView.extend({
    tagName: 'div',

    initialize: function(opts){
      var self = this;
      if(opts){
        if(opts.template) self.setTemplate(opts.template)
        if(opts.formTemplate) self.setFormTemplate(opts.template)
        self.options = opts;
      }    
    },

    templates: {
      base: _.template('<div id="form-region">algo</div>'),
      form: _.template('<div id="form-region">algo</div>'),
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

    onRender: function(){
      console.log('onRender:[%s]', this.model.whoami);
      this.form = new Backbone.Form({
        model: this.model,
        template: this.templates['form'],
      });
      this.form.render();
      this.$el.find('#formContainer').html(this.form.el);
    },
        
    events: {
      'click .js-save': 'onSave',
      'click .js-cancel': 'onCancel',
    },
    
    
    onSave: function(){
      var errors = this.form.commit(),
          self = this;

    },
    
    onCancel: function(){
      console.log('Cancel CLICKED')
      this.trigger('cancel:basic:editor');
    }
    
  });

*/    
  Backgrid.RepresentanteActionCell = Backgrid.Cell.extend({
      // Cell default class names are the lower-cased and dasherized
      // form of the the cell class names by convention.
      className: "action-cell",
      render: function(){
          if(!this.rendered){
             var btnEdit = $('<button class="btn-link js-item-edit" title="editar"><span class="glyphicon glyphicon-edit"></span></button>');
             var btnRemove = $('<button class="btn-link js-item-trash" title="borrar"><span class="glyphicon glyphicon-remove"></span></button>');
             this.$el.append(btnEdit).append(btnRemove);
             this.rendered = true;
          }
         return this;
      },
      events: {
          'click button.js-item-edit': 'editClicked',
          'click button.js-item-trash': 'trashClicked',
      },
        
      editClicked: function(e){

        this.trigger('edit:item:action');
        console.log('Click ITEM [%s]:[%s]', this.model.whoami, this.model.get('denominacion'));
        this.model.trigger('edit:me');
        DocManager.trigger('representante:edit',this.model);

      },
        
      trashClicked: function(e){
        console.log('trash Clicked-1');
        this.model.trigger('trash:item:crud', this.model);
      }
  });
  
  Backgrid.CporfolioActionCell = Backgrid.Cell.extend({
      // Cell default class names are the lower-cased and dasherized
      // form of the the cell class names by convention.
      className: "action-cell",
      render: function(){
          if(!this.rendered){
             var btnEdit = $('<button class="btn-link js-item-edit" title="editar"><span class="glyphicon glyphicon-edit"></span></button>');
             var btnRemove = $('<button class="btn-link js-item-trash" title="borrar"><span class="glyphicon glyphicon-remove"></span></button>');
             this.$el.append(btnEdit).append(btnRemove);
             this.rendered = true;
          }
         return this;
      },
      events: {
          'click button.js-item-edit': 'editClicked',
          'click button.js-item-trash': 'trashClicked',
      },
        
      editClicked: function(e){

        this.trigger('edit:item:action');
        console.log('Click ITEM [%s]:[%s]', this.model.whoami, this.model.get('slug'));
        this.model.trigger('edit:me');
        DocManager.trigger('cporfolio:edit',this.model);

      },
        
      trashClicked: function(e){
        console.log('trash Clicked-2');
        this.model.trigger('trash:item:crud', this.model);
      }
  });
  
  Backgrid.VporfolioActionCell = Backgrid.Cell.extend({
      // Cell default class names are the lower-cased and dasherized
      // form of the the cell class names by convention.
      className: "action-cell",
      render: function(){
          if(!this.rendered){
             var btnEdit = $('<button class="btn-link js-item-edit" title="editar"><span class="glyphicon glyphicon-edit"></span></button>');
             var btnRemove = $('<button class="btn-link js-item-trash" title="borrar"><span class="glyphicon glyphicon-remove"></span></button>');
             this.$el.append(btnEdit).append(btnRemove);
             this.rendered = true;
          }
         return this;
      },
      events: {
          'click button.js-item-edit': 'editClicked',
          'click button.js-item-trash': 'trashClicked',
      },
        
      editClicked: function(e){

        this.trigger('edit:item:action');
        console.log('Click ITEM [%s]:[%s]', this.model.whoami, this.model.get('slug'));
        this.model.trigger('edit:me');
        DocManager.trigger('vporfolio:edit',this.model);

      },
        
      trashClicked: function(e){
        console.log('trash Clicked-3');
        this.model.trigger('trash:item:crud', this.model);
      }

  });
  
  
  Edit.gridFactory = function(collection, columns){
      return new Backgrid.Grid({
          className: 'table table-condensed table-bordered table-hover',
          collection: collection,
          columns: columns
        });
  }; 
        /*
        { name: 'vip',label: 'VIP',cell: 'vip',editable:false},
        { name: 'displayName',label: 'Nombre',cell: 'string',editable:false},
        {name: 'nickName',label: 'Alias',cell: 'string',editable:false},
        {name: 'email',label: 'email',cell: 'string',editable:false},
        {label: 'Acciones',cell: 'action',editable:false,sortable:false},  

        ['name','displayName','email']
        */
  
  Edit.filterFactory = function(collection, fieldList){
      return new Backgrid.Extension.ClientSideFilter({
          collection: collection,
          fields: fieldList,
        });
  };

  Edit.CrudManager = Backbone.Model.extend({
    whoami: 'CrudManager:crud_views.js ',
    idAttribute: "_id",
    
    initialize: function(attrs, opts){
      var self = this;
      //model, collection, tablecols
      console.log('CRUD MANAGER INIT arguments: [%s]  Editor View[%s]', arguments.length, opts.EditorView)

      this.options = opts;
      self.filterFactory(self.collection,self.get('filtercols'));
      self.gridFactory(self.collection,self.get('gridcols'));
      self.createLayout(opts);
      self.createForm(opts);


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

      this.collection.on('trash:item:crud', function(model){

          this.remove(model);

      });
    },

    createLayout: function(opts){
      var self = this;
      var data = _.extend({}, self.get('layoutdefaults'), {itemssofar: self.collection.length});
      //console.log('createLayout: [%s]', self.options.layoutTpl)

      self.layout = new Edit.CrudLayout({
        model: new Backbone.Model(data),
        template: self.options.layoutTpl,
      });

      self.layout.on('show',function(){
        self.layout.filterRegion.show(self.filter);
        self.layout.tableRegion.show(self.grid);
        self.layout.formRegion.show(self.form);
      });

      self.layout.on('save:crud:editor', function(){
        console.log('registerSaveEvent Called: form:[%s]', self.form.cid);
        self.form.commit();
        self.collection.add(self.form.model);
        console.log('[%s]Adding Model[%s] To Col: [%s]:[%s]',self.form.cid, self.form.model.cid,self.form.model.get('slug'), self.collection.length)

        DocManager.trigger(self.get('editEventName'), new self.options.editModel());

      });
    },

    createForm: function(opts){
      var self = this;
      if(self.options.EditorView){
        console.log('CRUD MANAGER: Create EditorForm: [%s] [%s]',  self.options.modelToEdit.whoami, self.collection.length)
        self.form = new self.options.EditorView({
            model: self.options.modelToEdit,
            editorOpts: (opts.editorOpts ? opts.editorOpts : {}),
        });

      }else{
        console.log('CRUD MANAGER: Create BackboneForm: [%s] [%s]',  self.options.modelToEdit.whoami, self.collection.length)
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
/*
  var createGridController = function(layout, col){

    var filter = Edit.filterFactory(col, ['slug']);
    console.log('createGridController')

    layout.filterRegion.show(filter);
    layout.tableRegion.show(table);
  };

*/

});

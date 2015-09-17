DocManager.module("SalonRequestApp.Edit", function(Edit, DocManager, Backbone, Marionette, $, _){
  
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
        this.model.trigger('edit:me');
        DocManager.trigger('representante:edit',this.model);

      },
        
      trashClicked: function(e){
        this.model.trigger('trash:item:crud', this.model);
      }
  });

  Backgrid.IntegranteActionCell = Backgrid.Cell.extend({
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
        this.model.trigger('edit:me');
        DocManager.trigger('integrante:edit',this.model);

      },
        
      trashClicked: function(e){
        this.model.trigger('trash:item:crud', this.model);
      }
  });

  Backgrid.ReferenciaActionCell = Backgrid.Cell.extend({
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
        this.model.trigger('edit:me');
        DocManager.trigger('referencias:edit',this.model);

      },
        
      trashClicked: function(e){
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
        this.model.trigger('edit:me');
        DocManager.trigger('cporfolio:edit',this.model);

      },
        
      trashClicked: function(e){
        this.model.trigger('trash:item:crud', this.model);
      }
  });
  
  Backgrid.ItinerarioActionCell = Backgrid.Cell.extend({
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
        this.model.trigger('edit:me');
        DocManager.trigger('tramos:edit',this.model);
      },
        
      trashClicked: function(e){
        this.model.trigger('trash:item:crud', this.model);
      }

  });
  
  Backgrid.PasajeroActionCell = Backgrid.Cell.extend({
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
        this.model.trigger('edit:me');
        DocManager.trigger('pasajeros:edit',this.model);
      },
        
      trashClicked: function(e){
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
        self.form.commit();
        self.collection.add(self.form.model);
        //console.log('save:crud:editor [%s][%s]', self.form.model.whoami, self.get('editEventName'));


        DocManager.trigger(self.get('editEventName'), new self.options.editModel());


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

});

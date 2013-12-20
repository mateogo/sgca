DocManager.module("DocsApp.Edit", function(Edit, DocManager, Backbone, Marionette, $, _){
  Edit.Layout = Marionette.Layout.extend({
    className: 'row row-offcanvas row-offcanvas-left',

    getTemplate: function(){
      return utils.templates.DocumEditLayoutView;
    },
    
    regions: {
      navbarRegion:  '#navbar-region',
      itemEditRegion: '#itemedit-region',
      sidebarRegion: '#sidebar-region',
      linksRegion:   '#panel-region',
      mainRegion:    '#main-region'
    }
  });


  Edit.Search = DocManager.DocsApp.Common.Views.SearchPanel.extend({
    initialize: function(options){
      this.optiones = options;
      var self = this;
    }, 
  });



  Edit.Document = DocManager.DocsApp.Common.Views.Form.extend({
    
    tagName:'form',
    className: 'form-horizontal',

    getTemplate: function(){
      return utils.templates.DocumEditCore;
    },

    initialize: function(options){
      var self = this;
      this.events = _.extend({},this.formevents,this.events);
      this.delegateEvents();
   },

    events: {
      "click .js-personsch": "personsearch",
    },

    personsearch: function(){
      var self = this,
          query = this.$('#persona').val();

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
            itemViewOptions:{
              itemtype:'documentos'
            }
          },

          persons: {
            title:'buscar personas',
            collection: new DocManager.Entities.PersonCollection(),
            model: new Backbone.Model({query:query}),
            searchtrigger:"person:filtered:entities",
            itemViewOptions:{
              itemtype:'persons'
            }  
          },

          products: {
            title:'buscar productos',
            collection: new DocManager.Entities.ProductCollection(),
            model: new Backbone.Model({query:query}),
            searchtrigger:"product:filtered:entities",
            itemViewOptions:{
              itemtype:'products'
            }  
          }

        }
        var form = new Edit.Search(options[type]);

        form.on('itemview:item:found',function(form,model){
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
  Edit.createInstance = function(view){
        console.log('modal DOCUM NEW');
        var self = view,
            facet = new DocManager.Entities.DocumCoreFacet(),
            form = new Backbone.Form({
                model: facet,
            });

        form.on('change', function(form, contenidoEditor) {
            var errors = form.commit();
        });
            
        var modal = new Backbone.BootstrapModal({
            content: form,
            title: 'Alta rápida comprobantes',
            okText: 'aceptar',
            cancelText: 'cancelar',
            animate: false
        });

        modal.open(function(){
            var errors = form.commit();
            facet.createNewDocument(function(err, model){
              DocManager.trigger("documents:list");
            });
        });
  };

  // ventana modal
  Edit.createItem = function(model){
        console.log('Modal ITEM NEW');
        var facet = new DocManager.Entities.DocumItemCoreFacet(),
            form = new Backbone.Form({
                model: facet,
            });

        form.on('change', function(form, contenidoEditor) {
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


  // PARTE TECNICO
  Edit.PTecnicoHeader = DocManager.DocsApp.Common.Views.Form.extend({
    whoami:'PTecnico:edit_view.js',
    
    tagName:'form',
    className: 'form-horizontal',

    getTemplate: function(){
      return utils.templates.DocumEditPT;
    },

    initialize: function(options){
      var self = this;
      this.events = _.extend({},this.formevents,this.events);
      this.delegateEvents();
    },
 
    events: {
      "click .js-productsch": "productsearch",
      "click .js-personsch": "personsearch",
    },

    personsearch: function(){
      var self = this,
          query = this.$('#productora').val();

      this.trigger('person:select', query, function(entity){
        self.model.set({productora:entity.get('nickName')});
        self.model.set({productoraid:entity.id});
        self.render();
      });
    },

    productsearch: function(){
      var self = this,
          query = this.$('#product').val();

      this.trigger('product:select', query, function(entity){
        self.model.set({product:entity.get('productcode')});
        self.render();
      });
    },

  });

  Edit.PTecnicoLayout = Marionette.Layout.extend({
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
      this.trigger("pti:add:item");
    },
    
    regions: {
      ptheaderRegion: '#ptheader-region',
      ptlistRegion:   '#ptlist-region'
    }
  });


  Edit.PTecnicoListItem = DocManager.DocsApp.Common.Views.Form.extend({
    getTemplate: function(){
      return utils.templates.DocumEditPTItem;
    },
    tagName:'form',
    className: 'form-horizontal list-group-item',
 
    //tagName: "li",
    //className:"list-group-item",
    initialize: function(options){
      var self = this;
      this.events = _.extend({},this.formevents,this.events);
      this.delegateEvents();
    },

    events: {
      "click .js-ptiremove": "ptiremove",
    },

    triggers: {
      //"click a": "document:new"
    },

    ptiremove: function(){
      this.trigger('pti:remove:item', this.model);
    },

    onRender: function(){
    }
  });

  Edit.PTecnicoList = Marionette.CollectionView.extend({
    tagName: "div",
    className: "list-group",

    itemView: Edit.PTecnicoListItem,
        
    events: {
    },

    onFormSubmit:function(){
      console.log('submit form:PTI-LIST');
      this.trigger("pti:form:submit");

    },

  });

});
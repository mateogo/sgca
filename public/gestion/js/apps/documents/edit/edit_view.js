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
      console.log('iniTIALIZE: [%s]',this.model.get('query'));
      this.optiones = options;
      var self = this;
      console.log('Search panel initizlize: [%s]',options.searchtrigger)
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
      this.events = _.extend({},this.formevents);
      this.delegateEvents();
    },
 
  });


  // PARTE TECNICO
  Edit.PTecnico = DocManager.DocsApp.Common.Views.Form.extend({
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
    },

    productsearch: function(){
      var self = this,
          query = this.$('#product').val();
      console.log('productearch [%s]',query);
      this.trigger('product:select', query, function(entity){
        self.model.set({product:entity.get('productcode')});
        console.log('volvimos!! [%s]',entity.get('productcode'));
        self.render();
      });


    },
  });


  // ventana modal
  Edit.modalSearchEntities = function(type, query, cb){
        console.log('modal SEARCH ENTITIES [%s] [%s]',type,query);
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
        //options[type].model = new Backbone.Model({query:query});
        var form = new Edit.Search(options[type]);

        form.on('itemview:item:found',function(form,model){
          //console.log('callback ITEMFOUND [%s]',model.get('cnumber'));
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
            console.log('form: on:change');
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
            console.log('close: [%s]',facet.get('slug'));
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
            console.log('form: on:change');
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
            console.log(' MODAL close: [%s] : [%s]',facet.get('tipoitem'),facet.get('slug'),model.get('slug'));
            var item = model.initNewItem(facet);
            Edit.Session.items.add(item);
            //facet.createNewDocument(function(err, model){
            //  DocManager.trigger("documents:list");
            //});
        });
  };

});

/*
  Edit.Document = DocManager.DocsApp.Common.Views.Form.extend({
    initialize: function(){
      this.title = "Edit " + this.model.get("firstName") + " " + this.model.get("lastName");
    },

    onRender: function(){
      if(this.options.generateTitle){
        var $title = $('<h1>', { text: this.title });
        this.$el.prepend($title);
      }

      this.$(".js-submit").text("Update document");
    }
  });
*/


/*
  Edit.Panel = Marionette.ItemView.extend({
    template: "#document-list-panel",

    triggers: {
      "click button.js-new": "document:new"
    },

    events: {
      "submit #filter-form": "filterReceipts"
    },

    ui: {
      criterion: "input.js-filter-criterion"
    },

    filterReceipts: function(e){
      e.preventDefault();
      var criterion = this.$(".js-filter-criterion").val();
      this.trigger("documents:filter", criterion);
    },

    onSetFilterCriterion: function(criterion){
      this.ui.criterion.val(criterion);
    }
  });
*/

DocManager.module("DocsApp.List", function(List, DocManager, Backbone, Marionette, $, _){
  List.Layout = Marionette.Layout.extend({
    className: 'row row-offcanvas row-offcanvas-left',

    getTemplate: function(){
      return utils.templates.DocumEditLayoutView;
    },
    
    regions: {
      navbarRegion:  '#navbar-region',
      sidebarRegion: '#sidebar-region',
      linksRegion:   '#panel-region',
      mainRegion:    '#main-region'
    }
  });

  List.Document = Marionette.ItemView.extend({
    tagName: "tr",

    getTemplate: function(){
      return _.template(utils.buildRowRenderTemplate(utils.documListTableHeader,utils.buildTableRowTemplates));
    },
/*
    template: _.template(
      '<td><%= cnumber %></td>' +
      '<td><%= tipocomp %></td>'  +
      '<td><%= slug %></td>'  +
      '<td>' +
       ' <a href="#comprobantes/<%= _id %>" class="btn btn-xs js-show" role="button">' +
        '  Show' +
        '</a>' +
        '<a href="#comprobantes/<%= _id %>/edit" class="btn btn-xs js-edit" role="button" >' +
         ' Edit' +
        '</a>' +
        '<button type="link" class="btn btn-warning btn-xs js-delete">' +
         ' Delete' +
        '</button>' +
      '</td>'
    ),

*/
    events: {
      "click": "highlightName",
      "click td a.js-show": "showClicked",
      "click td a.js-edit": "editClicked",
      "click button.js-delete": "deleteClicked",
      "click button.js-show": "showClicked",
      "click button.js-edit": "editClicked",
    },

    flash: function(cssClass){
      var $view = this.$el;
      $view.hide().toggleClass(cssClass).fadeIn(800, function(){
        setTimeout(function(){
          $view.toggleClass(cssClass)
        }, 500);
      });
    },

    highlightName: function(e){
      this.$el.toggleClass("warning");
    },

    showClicked: function(e){
      console.log('showCLICKED in ITEM VIESW [%s]',this.model.get('slug'));
      e.preventDefault();
      e.stopPropagation();
      this.trigger("document:show", this.model);
    },

    editClicked: function(e){
      e.preventDefault();
      e.stopPropagation();
      this.trigger("document:edit", this.model);
    },

    deleteClicked: function(e){
      e.stopPropagation();
      this.trigger("document:delete", this.model);
    },

    remove: function(){
      var self = this;
      this.$el.fadeOut(function(){
        Marionette.ItemView.prototype.remove.call(self);
      });
    }
  });




  var NoDocumentsView = Marionette.ItemView.extend({
    template: _.template('<td colspan="3">No hay comprobantes para mostrar</td>'),
    tagName: "tr",
    className: "alert"
  });




  List.Documents = Marionette.CompositeView.extend({
    tagName: "table",
    className: "table table-bordered table-hover",

    getTemplate: function(){
      //console.log(utils.buildTableHeader(utils.documListTableHeader));
      return _.template(utils.buildTableHeader(utils.documListTableHeader)+'<tbody></tbody>');
    },

    //template: _.template()
      //'<thead><tr><td>comprob</td><td>tipo</td><td>Descripción</td><td>Acciones</td></tr></thead><tbody></tbody>'
      //'<thead><tr><th>comprob</th><th>tipo</th><th>Descripción</th><th>Acciones</th></tr></thead><tbody></tbody>'
    //),

    emptyView: NoDocumentsView,
    itemView: List.Document,
    itemViewContainer: "tbody",

    initialize: function(){
      this.listenTo(this.collection, "reset", function(){
        this.appendHtml = function(collectionView, itemView, index){
          collectionView.$el.append(itemView.el);
        }
      });
    },

    onCompositeCollectionRendered: function(){
      this.appendHtml = function(collectionView, itemView, index){
        collectionView.$el.prepend(itemView.el);
      }
    }
  });



  // ventana modal
  List.queryForm = function(query, cb){
        var facet = new DocManager.Entities.DocumQueryFacet(query ),
            form = new Backbone.Form({
                model: facet
            });


        form.on('change', function(form, editorContent) {
            //console.log('change');
            var errors = form.commit();
            return false;
        });

        form.on('blur', function(form, editorContent) {
            //console.log('blur');
            //var errors = form.commit();
            return false;
        });

        var modal = new Backbone.BootstrapModal({
            content: form,
            title: 'Consulta comprobantes',
            okText: 'aceptar',
            cancelText: 'cancelar',
            enterTriggersOk: false,
            animate: false
        });

        modal.on('ok',function(){
          //console.log('MODAL ok FIRED');
          //modal.preventClose();

        });

        modal.open(function(){
            //console.log('modal CLOSE');
            var errors = form.commit();
            if(cb) cb(facet);
        });
  };


});



/*
  List.Panel = Marionette.ItemView.extend({
    template: "#document-list-panel",

    triggers: {
      "click button.js-new": "document:new"
    },

    events: {
      "submit #filter-form": "filterDocuments"
    },

    ui: {
      criterion: "input.js-filter-criterion"
    },

    filterDocuments: function(e){
      e.preventDefault();
      var criterion = this.$(".js-filter-criterion").val();
      this.trigger("documents:filter", criterion);
    },

    onSetFilterCriterion: function(criterion){
      this.ui.criterion.val(criterion);
    }
  });
*/


DocManager.module("BudplanApp.List", function(List, DocManager, Backbone, Marionette, $, _){
  
  List.Layout = Marionette.LayoutView.extend({
    className: 'row',

    getTemplate: function(){
      return utils.templates.BplannerListLayout;
    },
    
    regions: {
      breadcrumbRegion: 	'#breadcrumb-region',
      filterRegion: 			'#filter-region',
      analyseRegion: 			'#analyse-region',
      messagesRegion: 		'#messages-region',
      d3Region: 					'#d3-region',
      summaryRegion: 			'#summary-region',
      detailRegion: 			'#detail-region',
    }
  });


  List.FilterView = Marionette.ItemView.extend({
    //article id="sidebar-region" role="navigation" class="sistema-box" -->
		whoami: 'List.FilterView',
    tagName: "ul",
    className:"context-menu panel",
    attributes: {
    },

    initialize: function(options){
      var self = this;
      this.options = options;
    },

    templates: {
      filterview:   'BplannerListFilterView',
    },

    getTemplate: function(){
      return utils.templates[this.templates['filterview']];
    },

    events: {
      "change": "change",
      "click .js-newentity": "newentity",
      "click .js-newbudget": "newbudget",
    },

    triggers: {
      //"click a": "document:new"
    },

    change: function(event){
	    console.log('FORM CHANGE')
	    var target = event.target;

	    if(target.type==='checkbox'){
	        this.model.set(target.name, target.checked);
	    }else{
	        this.model.set(target.name, target.value);
	    }
	    this.model.trigger('change:filter');

    },

    modelChanged: function(){
      console.log('bind EVENT SIDEBAR ITEM')
    },

    onRender: function(){
    }
  });


  List.AnalyseView = Marionette.ItemView.extend({
    //article id="sidebar-region" role="navigation" class="sistema-box" -->
		whoami: 'List.AnalyseView',

    tagName: "ul",
    className:"context-menu panel",
    attributes: {
    },

    initialize: function(options){
      var self = this;
      this.options = options;
    },

    templates: {
      analyseview:   'BplannerListAnalyseView',
    },

    getTemplate: function(){
      return utils.templates[this.templates['analyseview']];
    },

    events: {
      "click .js-sumnodo": "summarybynodo",
      "click .js-sumarea": "summarybyarea",
      "click .js-sumaction": "summarybyaction",
      "click .js-sumtgasto": "summarybytgasto",
    },

    triggers: {
      //"click a": "document:new"
    },
    summarybynodo: function(e){
      this.summary(e,'nodo');
    },
    summarybyarea: function(e){
      this.summary(e, 'area');
    },
    summarybyaction: function(e){
      this.summary(e,'action');
    },
    summarybytgasto: function(e){
      this.summary(e,'tgasto');
    },
    summary: function(e, type){
      e.preventDefault();
      e.stopPropagation();

      console.log('BUTTON CLICK')
      this.trigger('render:summary:by',type, function(){

      });

    },

    modelChanged: function(){
      console.log('bind EVENT SIDEBAR ITEM')
    },

    onRender: function(){
    }
  });





  List.SummaryItem = Marionette.ItemView.extend({
  
    tagName: "tr",
    
    attributes: {
      href:'#'
    },
    
    //className:"list-group-item",
  	
  	templates: {
      sumarioitem: 'BplannerListSummaryItem'
    },

    getTemplate: function(){
      return utils.templates[this.templates['sumarioitem']]
    },

  
    events: {
      "click": "navigate",
    },
    initialize: function(options){
      this.options = options;
    },

    navigate: function(e){
      e.preventDefault();
      this.trigger('item:found',this.model);
    },

    onRender: function(){

/*      if(this.model.selected){
        this.$el.addClass("active");
      };
*/
    }
  });




  List.SummaryPanel = Marionette.CompositeView.extend({
    tagName: "div",

    getTemplate: function(){
      return utils.templates.BplannerListSummaryView;
    },
  
    childView: List.SummaryItem,
    childViewContainer: "tbody",
        
    events: {
      "click .js-filter-by-id" : "documentList",
    },

  });



  List.ActionBudget = Marionette.ItemView.extend({
    tagName: "tr",

    getTemplate: function(){
      return _.template(utils.buildRowRenderTemplate(utils.budgetListTableHeader,utils.buildTableRowTemplates));
    },

    events: {
      "click": "highlightName",
      "click td a.js-show": "showClicked",
      "click td a.js-edit": "editClicked",
      "click button.js-delete": "deleteClicked",
      "click button.js-show": "showClicked",
      "click button.js-edit": "editClicked",
      "click .js-zoom" : 'viewRelated',
      "change .tselect"  : "checkbox",
    },

    flash: function(cssClass){
      var $view = this.$el;
      $view.hide().toggleClass(cssClass).fadeIn(800, function(){
        setTimeout(function(){
          $view.toggleClass(cssClass)
        }, 500);
      });
    },

    checkbox: function(event){
      if(event.target.checked)  this.trigger("budget:row:selected", true, this.model);
      if(!event.target.checked) this.trigger("budget:row:selected", false, this.model);
    },

    areRelatedVisible: false,

    viewRelated: function(){
      var self = this;
      console.log('View Related');
      if(self.areRelatedVisible){
        console.log('ready to REMOVE DOCUMENTS:RELATED');

          self.layout.removeRegion(self.model.get('budgetid'));

          var tr = $('#'+self.model.get('budgetid')).closest('tr');
          //tr.css("background-color","#FF3700");
          tr.remove();
          
          /*tr.fadeOut(400, function(){
              tr.remove();
          });*/

      }else{
        console.log('ready to trigger DOCUMENTS:RELATED');

        this.trigger('dcuments:related',this.model, function(){
          //no hay callbacl. futuros usos
        });

      }
      self.areRelatedVisible = !self.areRelatedVisible;

      return false;
    },

    highlightName: function(e){
      this.$el.toggleClass("warning");
    },

    showClicked: function(e){
      console.log('showCLICKED in ITEM VIESW [%s]',this.model.get('slug'));
      e.preventDefault();
      e.stopPropagation();
      this.trigger("budget:show", this.model);
    },

    editClicked: function(e){
      e.preventDefault();
      e.stopPropagation();
      this.trigger("budget:edit", this.model);
    },

    deleteClicked: function(e){
      e.stopPropagation();
      this.trigger("budget:delete", this.model);
    },

    remove: function(){
      var self = this;
      this.$el.fadeOut(function(){
        Marionette.ItemView.prototype.remove.call(self);
      });
    }
  });




  var NoBudgetsView = Marionette.ItemView.extend({
    template: _.template('<td colspan="3">No hay presupuestos para mostrar</td>'),
    tagName: "tr",
    className: "alert"
  });




  List.DetailedCompositeView = Marionette.CompositeView.extend({
    tagName: "table",
    className: "table table-bordered table-hover table-condensed",

    getTemplate: function(){
      //console.log(utils.buildTableHeader(utils.budgetListTableHeader));
      return _.template(utils.buildTableHeader(utils.budgetListTableHeader)+'<tbody></tbody>');
    },


    emptyView: NoBudgetsView,
    childView: List.ActionBudget,
    childViewContainer: "tbody",

    events: {
      "click .js-sortcolumn": "changeOrder",
    },

    changeOrder: function(event){

      var target = event.target;
      console.log('CLICKKKKKKKK!!!! [%s] [%s]',target,target.name);
      this.trigger("budget:sort", target.name);
    },

    initialize: function(){
      this.listenTo(this.collection, "reset", function(){
        this.appendHtml = function(collectionView, childView, index){
          collectionView.$el.append(childView.el);
        }
      });
    },

    onRenderCollection: function(){
      this.appendHtml = function(collectionView, childView, index){
        collectionView.$el.prepend(childView.el);
      }
    }
  });







  List.RelatedBudget = Marionette.ItemView.extend({
    tagName: "div",
    //className: 'item-group',

    getTemplate: function(){
      return utils.templates.BudgetRelatedDOC;
    },
    initialize: function(){
      console.log('RelatedBudgets ITEM View: INIT')
    },

    events: {
      "click .js-budgetview": "viewBudget",
    },

    viewBudget: function(){
      console.log('clie View DOCUMENT!')

      this.trigger('view:related:budget',this.model, function(){
        //no hay callbacl. futuros usos
      });
    },


    remove: function(){
      var self = this;
      this.$el.fadeOut(function(){
        Marionette.ItemView.prototype.remove.call(self);
      });
    }
  });

  List.ProductHeader = Marionette.ItemView.extend({
    tagName: "div",
    //className: 'item-group',

    getTemplate: function(){
      return utils.templates.BudgetRelatedPRHeader;
    },

    initialize: function(){
      console.log('RelatedProducts ITEM View: INIT')
    },

    events: {
    },

    remove: function(){
      var self = this;
      this.$el.fadeOut(function(){
        Marionette.ItemView.prototype.remove.call(self);
      });
    }
  });

  List.RelatedProduct = Marionette.ItemView.extend({
    tagName: "div",

    getTemplate: function(){
      return utils.templates.BudgetRelatedPR;
    },

    initialize: function(){
      console.log('RelatedProducts ITEM View: INIT')
    },

    events: {
      "click .js-productbrowse": "viewProduct",
      "click .js-productedit": "editProduct",
    },

    editProduct: function(){
      console.log('clie Edit PRODUCT!')

      this.trigger('edit:related:product',this.model, function(){
          //no hay callbacl. futuros usos
      });


    },

    viewProduct: function(){
      console.log('clie View PRODUCT!')

      this.trigger('view:related:product',this.model, function(){
          //no hay callbacl. futuros usos
      });


    },

    remove: function(){
      var self = this;
      this.$el.fadeOut(function(){
        Marionette.ItemView.prototype.remove.call(self);
      });
    }
  });

  List.RelatedProducts = Marionette.CollectionView.extend({
    tagName: "div",
    //className: "list-group",

    childView: List.RelatedProduct,

    initialize: function(){
      console.log('RelatedProducts View: INIT')
    },

  });

  List.RelatedBudgets = Marionette.CollectionView.extend({
    tagName: "div",
    className: "list-group",

    childView: List.RelatedBudget,

    initialize: function(){
      console.log('RelatedBudgets View: INIT')
    },

  });


  List.RelatedLayout = Marionette.LayoutView.extend({

    getTemplate: function(){
      return utils.templates.BudgetRelatedLayout;
    },
    
    regions: {
      productRegion:   '#product-region',
      productsRegion:  '#products-region',
      budgetsRegion: '#budgets-region',
      hookRegion:      '#hook-region'
    }
  });


  // ventana modal
  List.queryForm = function(query, cb){
        var facet = new DocManager.Entities.BudgetQueryFacet(query ),
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
            title: 'Consulta presupuestos',
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

  // ventana modal
  List.viewBudget = function(view, cb){


    var modal = new Backbone.BootstrapModal({
        content: view,
        title: 'Vista comprobante',
        okText: 'aceptar',
        cancelText: 'cancelar',
        enterTriggersOk: false,
        animate: true
    });

    modal.on('shown', function(){
      console.log('shown')
      view.trigger('show');
    });

    modal.on('ok',function(){
      console.log('yew, ok')
    });

    modal.open(function(){
      console.log('open callback yew, ok')
    });
  };

  // ventana modal
  List.groupEditForm = function(cb){
        var facet = new DocManager.Entities.BudgetGropuEditFacet(),
            form = new Backbone.Form({
                model: facet
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
            title: 'Edición de presupuestos seleccionados',
            okText: 'aceptar',
            cancelText: 'cancelar',
            enterTriggersOk: false,
            animate: false
        });

        modal.on('ok',function(){
        });

        modal.open(function(){
            var errors = form.commit();
            if(cb) cb(facet);
        });
  };


});



/*
  List.Panel = Marionette.ItemView.extend({
    template: "#budget-list-panel",

    triggers: {
      "click button.js-new": "budget:new"
    },

    events: {
      "submit #filter-form": "filterBudgets"
    },

    ui: {
      criterion: "input.js-filter-criterion"
    },

    filterBudgets: function(e){
      e.preventDefault();
      var criterion = this.$(".js-filter-criterion").val();
      this.trigger("budgets:filter", criterion);
    },

    onSetFilterCriterion: function(criterion){
      this.ui.criterion.val(criterion);
    }
  });
*/


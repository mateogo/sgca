DocManager.module("DocsApp.Edit", function(Edit, DocManager, Backbone, Marionette, $, _){
  Edit.Layout = Marionette.Layout.extend({
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

  //Edit.Document = Marionette.ItemView.extend({

  Edit.Document = DocManager.DocsApp.Common.Views.Form.extend({
    
    tagName:'form',
    className: 'form-horizontal',

    getTemplate: function(){
      return utils.templates.DocumEditCore;
    },
 
  });


  Edit.NavItem = Marionette.ItemView.extend({
    template: _.template('<a href="#<%= url %>"><%= name %></a>'),
    tagName: "li",

    events: {
      "click a": "navigate"
    },

    triggers: {
      //"click a": "document:new"
    },


    navigate: function(e){
      console.log('list.NavItem navigate');
      e.preventDefault();
      this.trigger("document:new");
    },

    onRender: function(){
      if(this.model.selected){
        this.$el.addClass("active");
      };
    }
  });

  Edit.NavPanel = Marionette.CompositeView.extend({
    //template: "#header-template",
    tagName: "nav",
    className: "navbar navbar-default",

    itemView: Edit.NavItem,
    itemViewContainer: "ul",
    
    getTemplate: function(){
      return utils.templates.DocumNavbar;
    },
    
    events: {
      "click a.brand": "brandClicked"
    },

    brandClicked: function(e){
      e.preventDefault();
      console.log('brand-clicked');
      //this.trigger("brand:clicked");
    }
  });


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

DocManager.module("DocsApp.Common.Views", function(Views, DocManager, Backbone, Marionette, $, _){

  Views.SearchItem = Marionette.ItemView.extend({
    templates: {
      documentos: _.template('<strong><%= cnumber %></strong> : <%= slug %>'),
      persons:    _.template('<strong><%= nickName %></strong> : <%= name %>'),
      products:   _.template('<strong><%= productcode %></strong> : <%= slug %>'),
    },

    getTemplate: function(){
      return this.templates[this.options.itemtype];
    },

    tagName: "a",
    attributes: {
      href:'#'
    },
    className:"list-group-item",

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
      if(this.model.selected){
        this.$el.addClass("active");
      };
    }
  });

  Views.SearchPanel = Marionette.CompositeView.extend({
    tagName: "div",

    getTemplate: function(){
      return utils.templates.SearchEntitiesForm;
    },
  
    itemView: Views.SearchItem,
    itemViewContainer: ".list-group",
        
    events: {
      "click .js-filter-by-id" : "documentList",
    },

    documentList: function(){
      var criteria = $('input',this.$el).val(),
          self = this;
      console.log('filtered list SEARCH [%s]',criteria)

      DocManager.request(this.options.searchtrigger, criteria, function(documents){
          console.log('Filtered CALLBACK: [%s]',documents.length);
          self.collection = documents;
          self.render();
      });
    },
  });


  Views.Form = Marionette.ItemView.extend({

    formevents: {
      "click button.js-submit": "submitClicked",
      "change": "change"
    },

    change: function (event) {
        //utils.hideAlert();
        var target = event.target;
        var change = {};
        change[target.name] = target.value;
        this.model.set(change);
        var err = this.model.validate(change);
        this.onFormDataInvalid((err||{}));
    },
/*        if(this.model.isValid()){
           console.log('validación ok')
        }else{
           console.log('validación failed [%s]',this.model.validationError)
        }
*/ 
    submitClicked: function(e){
      e.preventDefault();
      //var data = Backbone.Syphon.serialize(this);
      console.log('FORM SUBMITTED');
      this.trigger("form:submit", this.model);
    },

    onFormDataInvalid: function(errors){
      var $view = this.$el;

      var clearFormErrors = function(){
        //var $form = $view.find("form");
        var $form = $view;
        $form.find(".has-error").each(function(){
          $(this).removeClass("has-error");
          $('.help-block', $(this)).html("");
        });
      }

      var markErrors = function(value, key){
        var $controlGroup = $view.find("#" + key).closest('.form-group');
        $controlGroup.addClass("has-error");
        $('.help-block', $controlGroup).html(value);
      }

      clearFormErrors();
      _.each(errors, markErrors);
    }
  });

  Views.NavItem = Marionette.ItemView.extend({
    template: _.template('<a href="#<%= url %>" title="<%= navigationTrigger %>"><%= name %></a>'),
    tagName: "li",

    events: {
      "click a": "navigate",
    },

    triggers: {
      //"click a": "document:new"
    },

    navigate: function(e){
      e.preventDefault();
      this.trigger(this.model.get('navigationTrigger'), this.model);
    },

    onRender: function(){
      if(this.model.selected){
        this.$el.addClass("active");
      };
    }
  });

  Views.NavPanel = Marionette.CompositeView.extend({
    tagName: "nav",
    className: "navbar navbar-default",

    itemView: Views.NavItem,
    itemViewContainer: "ul",
    
    getTemplate: function(){
      return utils.templates.DocumNavbar;
    },
    
    events: {
      "click a.brand": "brandClicked",
      "click .js-filter-by-id" : "documentList"
    },

    documentList: function(){
      console.log('documentList: [%s]',$('input',this.$el).val())
      this.trigger("documents:filtered:list",$('input',this.$el).val());
    },

    brandClicked: function(e){
      e.preventDefault();
      this.trigger("brand:clicked");
    }
  });

  Views.SidebarItem = Marionette.ItemView.extend({
    template: _.template('<%= slug %>'),
    tagName: "a",
    attributes: {
      href:'#'
    },
    className:"list-group-item",

    events: {
      "click": "navigate",
    },

    triggers: {
      //"click a": "document:new"
    },

    navigate: function(e){
      console.log('navigate event');
      e.preventDefault();
      this.trigger('item:edit', this.model);
      return false;
    },

    onRender: function(){
      if(this.model.selected){
        this.$el.addClass("active");
      };
    }
  });

  Views.SidebarPanel = Marionette.CollectionView.extend({
    tagName: "div",
    className: "list-group",

    itemView: Views.SidebarItem,
    itemViewContainer: "a",
    
    
    events: {
      "click a": "brandClicked",
      "click .js-filter-by-id" : "documentList"
    },

    documentList: function(){
      console.log('documentList: [%s]',$('input',this.$el).val())
      this.trigger("documents:filtered:list",$('input',this.$el).val());
    },

    brandClicked: function(e){
      e.preventDefault();
      console.log('PANEL event');
      this.trigger("brand:clicked");
    }
  });



});

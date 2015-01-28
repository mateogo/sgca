DocManager.module("ProfileApp.Edit", function(Edit, DocManager, Backbone, Marionette, $, _){

  Edit.Layout = Marionette.LayoutView.extend({

    getTemplate: function(){
      return utils.templates.ProfileEditLayout;
    },
    
    regions: {
      userRegion:    '#user-region',
      personRegion:  '#person-region',
      relatedRegion: '#related-region'
    }
  });

  Edit.Profile = DocManager.DocsApp.Common.Views.Form.extend({
    
    templates: {
      user:     'ProfileEditUserForm',
      person:   'ProfileEditPersonForm',
      related:  'ProfileEditRelatedForm',
    },

    getTemplate: function(){
      return utils.templates[this.templates[this.options.formtemplate]];
    },

    initialize: function(options){
      var self = this;
      this.events = _.extend({},this.formevents,this.events);
      this.delegateEvents();
      this.options = options;
    },

    onRender: function(){
      var self = this;
    },

    events: {

    },
    
  });

});




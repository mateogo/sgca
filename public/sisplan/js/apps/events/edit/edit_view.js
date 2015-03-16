DocManager.module("EventsApp.Edit", function(Edit, DocManager, Backbone, Marionette, $, _){
  
  Edit.Layout = Marionette.LayoutView.extend({
    className: 'row row-offcanvas row-offcanvas-left',

    getTemplate: function(){
      return utils.templates.EventEditLayout;
    },
    
    regions: {
      headerInfoRegion: '#headerinfo-region',
      mainRegion:    '#main-region'
    }
  });
  
  
  Edit.Editor = Marionette.ItemView.extend({
    tagName: 'div',
    initialize: function(opts){
      this.originalModel = _.clone(opts.model);
      Marionette.ItemView.prototype.initialize.apply(this,arguments);
    },
    getTemplate: function(){
      return _.template('<div></div>');
    },
    onRender: function(){
      this.form = new Backbone.Form({
        model: this.model,
        template: utils.templates.EventEditForm
      });
      this.form.render();
      this.$el.html(this.form.el);
      
      var $el = this.$el;
      setTimeout(function(){
        $el.find('[name=headline]').focus();  
      },10);
      
    },
    
    done: function(){
      DocManager.navigateBack();
    },
    
    events: {
      'click .js-save': 'onSave',
      'click .js-cancel': 'onCancel'
    },
    
    onSave: function(){
      var errors = this.form.commit();
      
      if(!errors){
        var self = this;
        this.model.save().done(function(){
          Message.success('Guardado');
          self.done();
        }).fail(function(e){
          Message.error('Ops! no se pudo guardar');
        });
      }
    },
    
    onCancel: function(e){
      this.done();
    }
    
  });
  
});
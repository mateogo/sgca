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
      var model = opts.model
      this.originalModel = _.clone(model);
      
      this.form = new Backbone.Form({
        model: model,
        template: utils.templates.EventEditForm
      });
      
      Marionette.ItemView.prototype.initialize.apply(this,arguments);
    },
    getTemplate: function(){
      return _.template('<div></div>');
    },
    onRender: function(){
      this.form.render();
      this.$el.html(this.form.el);
      
      var $el = this.$el;
      setTimeout(function(){
        $el.find('[name=headline]').focus();  
      },10);
      
      this.validateFechaType();
    },
    
    validateFechaType: function(){
      var type = this.$el.find('[name=ftype]').val();
      var showFHasta = (type === 'Fecha desde-hasta');
      var contFechaRep = (type === 'Repetición');
      
      if(showFHasta){
        this.$el.find('#contFechaHasta').show();
      }else{
        this.$el.find('#contFechaHasta').hide();
      } 
      
      if(contFechaRep){
        this.$el.find('#contFechaRep').show();
      }else{
        this.$el.find('#contFechaRep').hide();
      }
      
    },
    
    done: function(){
      DocManager.navigateBack();
    },
    
    events: {
      'change [name=ftype]': 'onChangeFType',
      'click .js-save': 'onSave',
      'click .js-cancel': 'onCancel'
    },
    
    onChangeFType: function(e){
      this.validateFechaType();
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
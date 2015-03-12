DocManager.module("ArtActivitiesApp.Edit", function(Edit, DocManager, Backbone, Marionette, $, _){
  
  Edit.Layout = Marionette.LayoutView.extend({
    getTemplate: function(){
      return utils.templates.ArtActivityEditLayoutView;
    },
    regions: {
      headerInfoRegion: '#headerinfo-region',
      navbarRegion: '#navbar-region',
      mainRegion: '#main-region'
    },
    events: {
      'click .js-basicedit':'onClickBaseEdit'
    },
    onClickBaseEdit: function(){
      Edit.Controller.editBasic(this.model);
    },
    onClickResumeMode: function(){
      //Edit.Controller.showResume(this.model);
    },
  });
  
  Edit.NotFoundView = Marionette.ItemView.extend({
    tagName: 'h2',
    className: 'text-danger',
    render: function(){
      this.$el.html('La actividad no existe');
    }
  });
  
  Edit.HeaderInfo = Marionette.ItemView.extend({
    tagName: 'div',
    getTemplate: function(){
      return utils.templates.ArtActivityEditHeaderInfoView;
    }
  });
  
  Edit.NavbarView = Marionette.ItemView.extend({
    events: {
      'click li': 'onClickItem'
    },
    
    onClickItem: function(){
      Message.info('Disponible proximamente');
    }
  
  });
  
  Edit.ResumeView = Marionette.ItemView.extend({
    getTemplate: function(){
      return utils.templates.ArtActivityResumeView;
    }
  });
  
  Edit.BasicEditor = Marionette.ItemView.extend({
    tagName: 'div',
    initialize: function(opts){
      this.originalModel = _.clone(opts.model);
    },
    getTemplate: function(){
      return utils.templates.ArtActivityEditBasicView;
    },
    onRender: function(){
      console.log(this.model);
      this.form = new Backbone.Form({
        model: this.model,
        template: utils.templates.ArtActivityEditBasicForm
      });
      this.form.render();
      this.$el.find('#formContainer').html(this.form.el);
      this.validateSubRubroSelect();
    },
    
    validateSubRubroSelect: function(){
      var rubroSelected = this.$el.find('[name=rubro]').val();
      var subOptions = utils.subtematicasOptionList[rubroSelected];
      if(subOptions){
        this.form.fields.subrubro.editor.setOptions(subOptions);
      }
    },
    
    done: function(){
      Edit.Controller.showResume(this.model);
    },
    
    events: {
      'click .js-save': 'onSave',
      'click .js-cancel': 'onCancel',
      'change [name=rubro]': 'onChangeRubro' 
    },
    
    onChangeRubro: function(){
      this.validateSubRubroSelect();
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
    
    onCancel: function(){
      if(this.model.isNew()){
        DocManager.navigateBack();  
      }else{
        Edit.Controller.showResume(this.model);
      }
    }
    
  });
  
});
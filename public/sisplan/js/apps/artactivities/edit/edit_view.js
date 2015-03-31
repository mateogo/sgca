DocManager.module("ArtActivitiesApp.Edit", function(Edit, DocManager, Backbone, Marionette, $, _){
  
  Edit.Layout = Marionette.LayoutView.extend({
    getTemplate: function(){
      return utils.templates.ArtActivityEditLayoutView;
    },
    regions: {
      headerInfoRegion: '#headerinfo-region',
      mainRegion: '#main-region'
    },
    events: {
      'click .js-basicedit':'onClickBaseEdit',
      
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
    initialize: function(opts){
      if(opts.tab){
        this.selectedTab = opts.tab;
      }
      Marionette.ItemView.prototype.initialize.apply(this,arguments);
    },
    getTemplate: function(){
      return utils.templates.ArtActivityEditHeaderInfoView;
    },
    onRender: function(){
      if(this.selectedTab){
        this.selectTab(this.selectedTab);
      }
    },
    events: {
      'click .js-openevent': 'openEventClicked',
      'click .js-openresume': 'openResumeClicked',
      'click .js-openresource': 'notYet',
      'click .js-opentask': 'notYet'
    },
    
    selectTab: function(str){
      var item = '.js-open'+str;
      this.$el.find('li.active').removeClass('active');
      this.$el.find(item).addClass('active');
    },
    
    notYet: function(){
      Message.info('Disponible proximamente');
    },
    
    openResumeClicked: function(e){
      e.stopPropagation();
      DocManager.trigger('artActivity:edit',this.model);
    },
    
    openEventClicked: function(e){
      e.stopPropagation();
      DocManager.trigger('events:list',this.model);
    }
  });
  
  Edit.ResumeView = Marionette.ItemView.extend({
    getTemplate: function(){
      return utils.templates.ArtActivityResumeView;
    },
    templateHelpers: function(){
      var self = this;
      return {
        formatDate: function(date){
          return moment(date).format('dddd LL');
        },
        getFieldLabel: function(fieldName){
          return self.model.getFieldLabel(fieldName);
        }
      };
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
      this.validateLocacion();
    },
    
    validateSubRubroSelect: function(){
      var rubroSelected = this.$el.find('[name=rubro]').val();
      var subOptions = utils.subtematicasOptionList[rubroSelected];
      if(subOptions){
        this.form.fields.subrubro.editor.setOptions(subOptions);
      }
    },
    
    validateLocacion: function(){
      var locacionSelected = this.$el.find('[name=locacion]').val();
      var subOptions = _.where(utils.localList,{locacion:locacionSelected});
      if(subOptions){
        this.form.fields.local.editor.setOptions(subOptions);
      }
    },
    
    done: function(){
      Edit.Controller.showResume(this.model);
    },
    
    events: {
      'click .js-save': 'onSave',
      'click .js-cancel': 'onCancel',
      'change [name=rubro]': 'onChangeRubro',
      'change [name=locacion]': 'onChangeLocacion' 
    },
    
    onChangeRubro: function(){
      this.validateSubRubroSelect();
    },
    
    onChangeLocacion: function(){
      this.validateLocacion();
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
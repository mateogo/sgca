DocManager.module('ArtActivitiesApp.Edit', function(Edit, DocManager, Backbone, Marionette, $, _){
  
  var App = DocManager.module('App');
  
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
      if(this.model.isNew()){
        this.disabledSubTabs = true;
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
      if(this.disabledSubTabs){
        this.$el.find('#navbar-region li').addClass('disabled');
      }else{
        this.$el.find('#navbar-region li').removeClass('disabled');
      }
    },
    events: {
      'click .js-openevent': 'openEventClicked',
      'click .js-openresume': 'openResumeClicked',
      'click .js-openasset': 'openAssetsClicked',
      'click .js-openresource': 'notYet',
      'click .js-opentask': 'notYet'
    },
    
    selectTab: function(str){
      var item = '.js-open'+str;
      this.$el.find('li.active').removeClass('active');
      this.$el.find(item).addClass('active');
    },
    
    notYet: function(){
      if(this.disabledSubTabs) return;
      
      Message.info('Disponible proximamente');
    },
    
    openResumeClicked: function(e){
      e.stopPropagation();
      if(this.disabledSubTabs) return;
      
      DocManager.trigger('artActivity:edit',this.model);
    },
    
    openEventClicked: function(e){
      e.stopPropagation();
      if(this.disabledSubTabs) return;
      
      DocManager.trigger('events:list',this.model);
    },
    
    openAssetsClicked: function(e){
      e.stopPropagation();
      if(this.disabledSubTabs) return;
      
      DocManager.trigger('artActivity:assets',this.model);
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
      this.autoFillLocalLeyenda = !(opts.model.get('localleyenda'));
    },
    getTemplate: function(){
      return utils.templates.ArtActivityEditBasicView;
    },
    
    onBeforeDestroy: function(){
      if(this.autoCompleteLocation){
        this.autoCompleteLocation.destroy();
        this.autoCompleteLocation =  null;
      }
    },
    
    onRender: function(){
      console.log(this.model);
      this.form = new Backbone.Form({
        model: this.model,
        template: utils.templates.ArtActivityEditBasicForm
      });
      this.$el.find('#formContainer').html(this.form.render().el);
      
      this.attachView = new App.AttachmentView({el:this.$el.find('#attachmentContainer'),model:this.model});
      this.attachView.render();
      //this.$el.find('#attachmentContainer').html(this.attachView.render().el);
      
      this.validateSubRubroSelect();
      this.validateLocacion();
      this.initAutoComplete();
    },
    
    initAutoComplete: function(){
      var $input = this.$el.find('[name=locacion]');
      //this.autoCompleteLocation = new App.View.AutoCompleteActionLocationField({el:$input});
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
      'change [name=locacion]': 'onChangeLocacion',
      'change [name=local]': 'onChangeLocal',
      'keyup [name=localleyenda]': 'onKeyUpLocalLeyenda'
    },
    
    onChangeRubro: function(){
      this.validateSubRubroSelect();
    },
    
    onChangeLocacion: function(){
      this.validateLocacion();
    },
    
    onChangeLocal: function(e){
      var value = this.$el.find('[name=local] option:selected').text();
      var fieldBind = this.$el.find('[name=localleyenda]');
      if(this.autoFillLocalLeyenda){
        fieldBind.val(value);
      }
    },
    
    onKeyUpLocalLeyenda: function(e){
      var value = $(e.currentTarget).val();
      this.autoFillLocalLeyenda = value == '';
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
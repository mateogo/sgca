DocManager.module('ArtActivitiesApp.Edit', function(Edit, DocManager, Backbone, Marionette, $, _){

  var AppCommon = DocManager.module('App.Common');

  Edit.Layout = Marionette.LayoutView.extend({
    className: 'wrapper',
    getTemplate: function(){
      return utils.templates.ArtActivityEditLayoutView;
    },
    regions: {
      headerInfoRegion: '#headerinfo-region',
      mainRegion: '.main-region'
    },

    events: {
      'click .js-basicedit': 'onClickBaseEdit'
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
      'click .js-openresults':  'openResultsClicked',
      'click .js-opentask': 'notYet',
      'click .js-artactivites': 'goBackToList'
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
    },

    openResultsClicked: function(e){
      e.stopPropagation();
      if(this.disabledSubTabs) return;

      DocManager.trigger('artActivity:results',this.model);
    },

    goBackToList: function(){
      DocManager.trigger('artactivities:list');
    },
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
        },
        getField: function(fieldName){
          return self.model.getField(fieldName);
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

    onBeforeDestroy: function(){
      if(this.autoCompleteLocation){
        this.autoCompleteLocation.destroy();
        this.autoCompleteLocation =  null;
      }
    },

    onRender: function(){
      this.form = new Backbone.Form({
        model: this.model,
        template: utils.templates.ArtActivityEditBasicForm
      });

      this.$el.find('#formContainer').html(this.form.render().el);

      this.attachView = new AppCommon.AttachmentView({el:this.$el.find('#attachmentContainer'),model:this.model});
      this.attachView.render();

      this.validateSubRubroSelect();
      this.validateLocacion();
      this.initAutoComplete();
    },

    initAutoComplete: function(){
      var $input = this.$el.find('[name=locacion]');
    },

    validateSubRubroSelect: function(){
      var rubroSelected = this.$el.find('[name=rubro]').val();
      var subOptions = utils.subtematicasOptionList[rubroSelected];
      //var subOptions = templates.subtematicasOptionList[rubroSelected];
      if(subOptions){
        this.form.fields.subrubro.editor.setOptions(subOptions);
      }
    },

    validateLocacion: function(){
      var locacionSelected = this.$el.find('[name=locacion]').val();
      var form = this.form;
      new DocManager.Entities.Location({ _id: locacionSelected }).fetch({success:function(data){
        if(!(data.spaces.length==0)){
          form.fields.espacios.editor.setOptions(data.spaces);
        }
        else{
          form.fields.espacios.editor.setOptions([]);
        }
      }})
    },

    done: function(){
      Edit.Controller.showResume(this.model);
    },

    events: {
      'click .js-save': 'onSave',
      'click .js-cancel': 'onCancel',
      'change [name=rubro]': 'onChangeRubro',
      'change [name=locacion]': 'onChangeLocacion',
      'click button.js-locationmodalnew': 'modalNewClicked'
    },

    modalNewClicked: function(e){
      DocManager.trigger('location:modalnew',this);
    },

    onLocacionAgregada: function(){
      this.form.fields.locacion.editor.setOptions(new DocManager.Entities.LocationCollection());
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

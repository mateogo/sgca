DocManager.module("ObrasApp.Edit", function(Edit, DocManager, Backbone, Marionette, $, _){
    
  var AppCommon = DocManager.module('App.Common');
  var ObrasCommon = DocManager.module('ObrasApp.Common');
  var AutorAppEdit = DocManager.module('AutorApp.Edit');
  var Entities = DocManager.module('Entities');
  
  Edit.ObrasWizardView =  ObrasCommon.WizardView.extend({
    initialize: function(){
      this.steps = [DescriptionEditor,PhotoEditor,AutorAppEdit.AutorEditorView,PartsEditor,ConfirmStep];
    },
    getTemplate: function(){
      return utils.templates.ObrasWizard
    },
    
    save: function(){
      var self = this;
      var p = DocManager.request('obra:save',this.model);
      p.done(function(){
        self.trigger('obra:saved',self.model);
      }).fail(function(){
        Message.error('ocurrio un error');
      })
    }
  });
  
  
  Edit.ObrasEditorView = Marionette.ItemView.extend({
    initialize: function(){
      this.tabs = [DescriptionEditor,PhotoEditor,AutorAppEdit.AutorEditorView,PartsEditor];
      this.listenTo(this.model,'change',this.onChangeModel.bind(this));
    },
    getTemplate: function(){
      return utils.templates.ObrasEditor
    },
    
    onRender: function(){
      this.selectTab(0);
    },
    
    onDestroy: function(){
      this.tabs = null;
      this.currentTab = null;
    },
    
    selectTab: function(index){
      if(index < 0 || index >= this.tabs.length ) return;
       if(this.currentTab){
         this.currentTab.commit();
         this.currentTab.destroy();
       }
       var clazz = this.tabs[index];
       var div = $('<div></div>');
       this.$el.find('.tab-content').append(div);
       var tab = new clazz({el:div,model:this.model});
       tab.render();
       this.currentTab = tab;
       this.$el.find('.nav-tabs li.active').removeClass('active');
       this.$el.find('.nav-tabs li:eq('+index+')').addClass('active');
    },
    
    events:{
      'click .nav-tabs li': 'onSelectTab',
      'click .js-save': 'onSave'
    },
    
    onSelectTab: function(e){
      var pos = this.$el.find('.nav-tabs li').index(e.currentTarget);
      this.selectTab(pos);
      
    },
    
    onChangeModel: function(){
      if(this.model.changed){
        this.$el.find('.js-save').fadeIn().removeClass('disabled');
      }else{
        this.$el.find('.js-save').addClass('disabled');
      }
    },
    
    onSave: function(e){
      e.stopPropagation();e.preventDefault();
      var btn = $(e.currentTarget);
      btn.button('loading');
      DocManager.request('obra:save',this.model).done(function(){
        btn.button('reset');  
        Message.success('Guardado');
        DocManager.trigger('obras:list');
      }).fail(function(e){
        btn.button('reset');
        Message.error('No se pudo guardar');
      })
    }
   
    
      
  }) 
  
  
  var DescriptionEditor = Marionette.ItemView.extend({
    tagName: 'div',
    getTemplate: function(){
      return utils.templates.ObrasDescriptionEditor;
    },
    onRender: function(){
      Backbone.Validation.bind(this,{model:this.model});
    },
    
    onDestroy: function(){
      Backbone.Validation.unbind(this);
    },
    
    validate: function(){
      this.commit();
      
       var valid = this.model.isValid(true);
       return valid;
    },
    
    commit: function(){
      var p = {
          slug: this.$el.find('[name=slug]').val(),
          procedure: this.$el.find('[name=procedure]').val(),
          material: this.$el.find('[name=material]').val(),
          dimensions: this.$el.find('[name=dimensions]').val(),
          value: this.$el.find('[name=value]').val(),
          madeyear: this.$el.find('[name=madeyear]').val()
       }
       this.model.set(p);
    },
    
    events:{
      'change input': 'commit',
      'change select': 'commit'
    }
  });
  
  var PhotoEditor = Marionette.ItemView.extend({
    tagName: 'div',
    template: false,
    onRender: function(){
      this.attachView = new AppCommon.AttachmentView({
            el:this.$el,
            model:this.model,
            collection: this.model.get('photos'),
            templates: {
              list: utils.templates.PhotosLayoutView,
              itemRender: utils.templates.PhotoItem,
              itemEditor: utils.templates.PhotoItemEditorView
            }
            
      });
      this.attachView.render();
      
      var self = this;
      this.listenTo(this.attachView,'change',function(){
        self.$el.find('#empty-region').removeClass('alert alert-danger');
        self.commit();
      });
    },
    onDestroy: function(){
      if(this.attachView){
        this.attachView.destroy();
        this.attachView = null;
      }
    },
    validate: function(){
      return true;
      
      var files = this.attachView.getFiles();
      var ok = true;
      
      if(files.length < 2){
        ok = false;
        this.$el.find('#empty-region').addClass('alert alert-danger');
      }else{
        this.$el.find('#empty-region').removeClass('alert alert-danger');
      }
      
      return ok;
    },
    commit: function(){
      var files = this.attachView.getFiles();
      this.model.set('photos',files.toJSON());
    }
  });
  
  var PartEditor = Marionette.ItemView.extend({
    getTemplate: function(){
      return utils.templates.ObrasPartEditor
    },
    /** metodos de 'interface' para paso de wizard **/
    validate: function(){
      return true;
    },
    commit: function(){
      var params = {
          slug: this.$el.find('[name=slug]').val(),
          description: this.$el.find('[name=description]').val()
      }
      this.model.set(params);
    }
  }); 
  
  var PartsEditor = Marionette.CompositeView.extend({
    initialize: function(opts){
      if(opts.model){
        this.collection = opts.model.get('parts');
        if(!(this.collection instanceof Backbone.Collection)){
          this.collection = new Backbone.Collection(this.collection);
        }
      }
    },
    childView: PartEditor,
    childViewContainer: '#stepsContainer',
    getTemplate: function(){
      return utils.templates.ObrasPartStep;
    },
    
    onRender: function(){
      if(!this.model.isNew()){
        var hasParts = (this.collection.length > 0);
        if(hasParts){
          this.$el.find('[name=partsenabled]').prop('checked',true);
          this.partsEnabledChange();
          this.$el.find('[name=partcant]').val(this.collection.length);
        }else{
          this.$el.find('[name=partcant]').val(2);
        }
          
      }else{
        this.$el.find('[name=partcant]').val(2);
      }
      
    },
    
    validateCountChildren: function(){
      var count = parseInt(this.$el.find('[name=partcant]').val());
      var currentCount = this.collection.length;
      if(count === currentCount) return;
      
      if(count < currentCount){
        this.collection.reset(this.collection.toArray().splice(0,currentCount-count));
      }else{
        for(var i=currentCount;i<count;i++){
          this.collection.push(new Entities.ObraPart());
        }
      }
    },
    
    
    validate: function(){
      return true;
    },
    
    commit: function(){
      var childrenView = this.children;
      this.children.each(function(child){
        child.commit();
      })
      this.model.set('parts',this.collection.toJSON());
    },
    
    events: {
      'change [name=partsenabled]': 'partsEnabledChange',
      'change [name=partcant]': 'onCountPartChange'  
    },
    
    partsEnabledChange: function(e){
      var enabled = this.$el.find('[name=partsenabled]').prop('checked');
      if(enabled){
        this.$el.find('#mainStepContainer').show();
      }else{
        this.$el.find('#mainStepContainer').hide();
      }
      this.validateCountChildren();
    },
    onCountPartChange: function(){
      this.validateCountChildren();
    }
    
  });
  
  
  var ConfirmStep = Marionette.ItemView.extend({
    getTemplate: function(){
      return utils.templates.ObrasResume;
    },
    
    templateHelpers: function(){
        return {
              getUrlAssets: function(photo){
                var urlpath = photo.urlpath;
                return  location.origin + '/'+ urlpath;
              }
          }
    },
    
    
    
    /** metodos de 'interface' para paso de wizard **/
    validate: function(){
      return true;
    },
    commit: function(){
      
    }
  });
  
  
  Edit.ObraGraciasView = Marionette.ItemView.extend({
    getTemplate: function(){
      return utils.templates.ObrasGracias
    },
    events: {
      'click .js-obras': function(){
        DocManager.trigger("obras:list");
      },
      'click .js-obrasnew': function(){
        DocManager.trigger("obras:new");
      },
      'click .js-solicitudnew': function(){
        DocManager.trigger("solicitud:new");
      }
    }
  });
  
  
  
  _.extend(Backbone.Validation.callbacks, {
      valid: function (view, attr, selector) {
          var $el = view.$('[name=' + attr + ']'), 
              $group = $el.closest('.form-group');
          
          $group.removeClass('has-error');
          $group.find('.help-block').html('').addClass('hidden');
      },
      invalid: function (view, attr, error, selector) {
          var $el = view.$el.find('[name=' + attr + ']'), 
              $group = $el.closest('.form-group');
          
          $group.addClass('has-error');
          $group.find('.help-block').html(error).removeClass('hidden');
      }
  });
  
});
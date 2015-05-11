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
         if(!this.currentTab.validate()){
           return;
         }
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
      'click .js-save': 'onSave',
      'click .js-cancel': 'onCancel'
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
      if(this.currentTab){
        if(!this.currentTab.validate()){
          return;
        }
        this.currentTab.commit();
        this.currentTab.destroy();
      }
      
      var self = this;
      var btn = $(e.currentTarget);
      btn.button('loading');
      DocManager.request('obra:save',this.model).done(function(){
        btn.button('reset');  
        Message.success('La obra '+self.model.get('cnumber')+'<br/>A sido guardada');
        self.trigger('obra:saved',self.model);
      }).fail(function(e){
        btn.button('reset');
        Message.error('No se pudo guardar');
      })
    },
    
    onCancel: function(){
      this.trigger('obra:editCancel',this.model);
    }
  }); 
  
  
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
            },
            minImageWidth: 2100,
            minImageHeight: 1500
            
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
    initialize: function(opts){
      this.childIndex = opts.childIndex;
    },
    getTemplate: function(){
      return utils.templates.ObrasPartEditor
    },
    onRender: function(){
      this.photoView = new ObrasCommon.AttachmentImageBox({
        el:this.$el.find('#photoCont'),
        model:this.model.get('photo'),
        width: 140,
        height: 90,
        templates: {
          list: utils.templates.ImageBoxLayoutView,
          itemRender: utils.templates.ImageBoxItem
        },
        minImageWidth: 2100,
        minImageHeight: 1500  
      });
      this.photoView.render();
      this.$el.find('#labelIndex').html((this.childIndex+1));
    },
    
    onDestroy: function(){
      if(this.photoView){
        this.photoView.destroy();
        this.photoView = null;
      }
    },
    
    /** metodos de 'interface' para paso de wizard **/
    validate: function(){
      return true;
    },
    commit: function(){
      var file = null;
      var files = this.photoView.getFiles();
      if(files.length > 0){
        file = files.at(0);
      }
      
      var params = {
          photo: file,
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
      this.removed = [];
    },
    getTemplate: function(){
      return utils.templates.ObrasPartStep;
    },
    childView: PartEditor,
    childViewContainer: '#stepsContainer',
    childViewOptions: function(model, index) {
      return {
        childIndex: index
      }
    },
    onRender: function(){
      if(!this.model.isNew()){
        var hasParts = (this.collection.length > 0);
        if(hasParts){
          var $checkbox = this.$el.find('[name=partsenabled]');
          if(!$checkbox.prop('checked')){
            $checkbox.prop('checked',true);
          }
          this.$el.find('#mainStepContainer').show();
          this.$el.find('[name=partcant]').val(this.collection.length);
        }else{
          this.$el.find('[name=partcant]').val(0);
        }
          
      }else{
        this.$el.find('[name=partcant]').val(0);
      }
      var self = this;
      setTimeout(function(){
        self.validateCountChildren();  
      },10)
      
      
    },
    
    validateCountChildren: function(){
      var count = parseInt(this.$el.find('[name=partcant]').val());
      if(count < 0){
        this.$el.find('[name=partcant]').val(0);
        return;
      }else if(count > 10){
        this.$el.find('[name=partcant]').val(10);
        Message.info('Máximo 10 partes');
        count = 10;
      }
      var currentCount = this.collection.length;
      if(count === currentCount) return;
      
      this.commit();
      if(count < currentCount){
        var all = this.collection.toArray();
        var removed = all.splice(count,currentCount-count);
        this.collection.reset(all);
        this.removed = removed.concat(this.removed);
      }else{
        for(var i=currentCount;i<count;i++){
          var obra = (this.removed.length > 0)? this.removed.shift() : new Entities.ObraPart();
          this.collection.add(obra);
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
        if(this.$el.find('[name=partcant]').val() === '0'){
          this.$el.find('[name=partcant]').val(2);
        }
        this.$el.find('#mainStepContainer').show();
      }else{
        this.$el.find('#mainStepContainer').hide();
      }
      this.validateCountChildren();
    },
    onCountPartChange: function(e){
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
});
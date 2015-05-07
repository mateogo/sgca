DocManager.module("SolicitudApp.Edit", function(Edit, DocManager, Backbone, Marionette, $, _){
    
  var AppCommon = DocManager.module('App.Common');
  var ObrasCommon = DocManager.module('ObrasApp.Common'); 
  var ObrasList = DocManager.module('ObrasApp.List');
  var Entities = DocManager.module('Entities');
  
  
  
  Edit.SolicitudWizardView =  ObrasCommon.WizardView.extend({
    initialize: function(){
      this.steps = [DescriptionEditor,ExportadoresStep,ObrasStep,DocsStep,ConfirmStep];
    },
    getTemplate: function(){
      return utils.templates.SolicitudWizard;
    },
    
    save: function(){
      var self = this;
      var $btn = this.$el.find('.js-submit');
      $btn.button('loading');
      DocManager.request('solicitud:save',this.model).done(function(response){
        $btn.button('reset');
        self.trigger('solicitud:saved',self.model);
      }).fail(function(e){
        $btn.button('reset');
        Message.error('No se pudo registrar');
        console.error(e);
      })
    }
  });
  
  Edit.SolicitudEditorView = Marionette.ItemView.extend({
    initialize: function(){
      this.tabs = [DescriptionEditor,ExportadoresStep,ObrasStep,DocsStep];
    },
    getTemplate: function(){
      return utils.templates.SolEditor
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
           Message.error('Por favor, Revise el formulario');
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
    
    onSave: function(e){
      e.stopPropagation();e.preventDefault();
      
      if(this.currentTab){
        if(!this.currentTab.validate()){
          Message.error('Por favor, Revise el formulario');
          return;
        }
        this.currentTab.commit();
      }
      
      
      var self = this;
      var btn = $(e.currentTarget);
      btn.button('loading');
      DocManager.request('solicitud:save',this.model).done(function(){
        btn.button('reset');  
        Message.success('La Solicitud '+self.model.get('cnumber') + '<br/>A sido guardada');
        self.trigger('solicitud:saved',self.model);
      }).fail(function(e){
        btn.button('reset');
        Message.error('No se pudo guardar');
      })
    },
    
    onCancel: function(){
      this.trigger('licnecia:editCanceled',this.model);
    }
  });
  
  
  var DescriptionEditor = Marionette.ItemView.extend({
    getTemplate: function(){
      return utils.templates.SolDescriptionEditor;
    },
    onRender: function(){
      Backbone.Validation.bind(this,{model:this.model});
      this.validateTypeForm();
    },
    onDestroy: function(){
      Backbone.Validation.unbind(this);
    },
    getData: function(){
      var schema = this.model.validation;
      var data = {};
      for(var key in schema){
        data[key] = this.$el.find('[name='+key+']').val();
      }
      return data;
    },
    
    validateTypeForm: function(){
      var type = this.$el.find('[name=type]').val();
      if(type === 'temporaria'){
        this.$el.find('#durationoutCont').show();
      }else{
        this.$el.find('#durationoutCont').hide();
      }
    },
    
    
    validate: function(){
      this.commit();
      var valid = this.model.isValid(true); 
      return valid;
    },
    commit: function(){
      var data = this.getData();
      this.model.set(data);
    },
    
    events: {
      'change input': 'commit',
      'change select': 'commit',
      'change textarea': 'commit',
      'change [name=type]': 'onChangeType'
    },
    
    onChangeType: function(){
      this.validateTypeForm();
    }
    
  })
  
  var ExportadorEditor = Marionette.ItemView.extend({
    getTemplate: function(){
      return utils.templates.SolExportadorEditor;
    },
    onRender: function(){
      Backbone.Validation.bind(this,{model:this.model});
      this.initChildren();
    },
    onDestroy: function(){
      Backbone.Validation.unbind(this);
      this.destroyChildren();
    },
    
    initChildren: function(){
      this.photo1View = new ObrasCommon.AttachmentImageBox({
        el:this.$el.find('#photoDoc1Cont'),
        model: this.model.get('docPhoto1'),
        templates: {
          list: utils.templates.ImageBoxLayoutView,
          itemRender: utils.templates.ImageBoxItem
        }
      });
      this.photo1View.render();
      
      this.photo2View = new ObrasCommon.AttachmentImageBox({
        el:this.$el.find('#photoDoc2Cont'),
        model: this.model.get('docPhoto2'),
        templates: {
          list: utils.templates.ImageBoxLayoutView,
          itemRender: utils.templates.ImageBoxItem
        }  
      });
      this.photo2View.render();
    },
    
    destroyChildren: function(){
      var children = ['photo1View','photo2View'];
      for (var i = 0; i < children.length; i++) {
        var key = children[i];
        if(this[key]){
          this[key].destroy();
          this[key] = null;
        }
      }
    },
    
    getPhotoDoc: function(name){
      var files = this[name].getFiles();
      if(files.length > 0 ){
        return files.at(0);
      }else{
        return null;
      }
    },
    
    getData: function(){
      var schema = this.model.validation;
      var data = {};
      for(var key in schema){
        data[key] = this.$el.find('[name='+key+']').val();
      }
      if(data.province === 'no_definido') data.province = '';
      data.ditype = this.$el.find('#typeDocCont').html();
     
      data.docPhoto1 = this.getPhotoDoc('photo1View');
      data.docPhoto2 = this.getPhotoDoc('photo2View');
      
      return data;
    },
    validate: function(){
      this.commit()
      return this.model.isValid(true);
    },
    commit: function(){
      var data = this.getData();
      this.model.set(data);
    },
    
    events:{
      'click #dropDownTypeDoc li': 'onChangeTypeDoc'
    },
    onChangeTypeDoc: function(e){
      var value = $(e.currentTarget).find('a').html();
      this.$el.find('#typeDocCont').html(value);
    }
  })
  
  var ExportadoresStep = Marionette.ItemView.extend({
    initialize: function(opts){
      this.collection = new Backbone.Collection();
      if(opts.model && opts.model.get('exporters') && opts.model.get('exporters').length > 0 ){
        this.collection.push(opts.model.get('exporters'));
      }else{
        this.collection.push(new Entities.Exportador());
      }
    },
    getTemplate: function(){
      return utils.templates.SolExportadoresStep;
    },
    
    onRender: function(){
      this.validateMenu();
      this.setTab(0);
    },
    
    validateMenu: function(){
      var $list =  this.$el.find('#tabList');
      var $li = this.$el.find('#linkExport2');
      if(this.collection.length > 1){
        $li.removeClass('js-addexporter').find('a').html('Exportador 2');
        var $liRemove  = $('<li></li>',{'class':'js-removeexporter btn-link'});
        $liRemove.html('<a class="text-danger">- borrar exportador 2</a>');
        $list.append($liRemove);
      }else{
        $li.addClass('js-addexporter').find('a').html('+ agregar un segundo exportador');
        this.$el.find('#tabList li:nth-child(3)').remove();
      }
    },
    
    setTab: function(index){
      if(index >=0 && index < this.collection.length && this.currentIndex != index){
        var exporter = this.collection.at(index);
        if(this.child){
          if(! this.validate()) return;
          this.child.commit();
          this.child.remove();
        }
        var cont = $('<div></div>');
        this.$el.find('#exporters-container').append(cont);
        this.child = new ExportadorEditor({el:cont,model:exporter});
        this.child.render();
        this.$el.find('#tabList li.active').removeClass('active');
        this.$el.find('#tabList li:nth-child('+(index+1)+')').addClass('active');
        this.currentIndex = index;
      }
    },
    
    addExportador: function(){
      var exp = (this.exporterRemoved)? this.exporterRemoved : new Entities.Exportador();
      this.collection.push(exp);
      this.validateMenu();
      this.setTab(1);
    },
    
    removeExportador: function(){
      if(this.collection.length > 1){
        this.exporterRemoved = this.collection.pop();
        this.validateMenu();
        this.setTab(0);
      }
    },
    
    
    /** metodos para "interface" de step de wizard o editor **/
    validate: function(){
      var ok = this.child.validate();
      var $tabLink = this.$el.find('#tabList li:nth-child('+(this.currentIndex+1)+') a');
      $tabLink.find('i').remove();
      this.$el.find('#msgAlert').hide();
      if(!ok){
        $tabLink.append(' <i class="glyphicon glyphicon-alert"></i>');
        this.$el.find('#msgAlert').show();
      }
      return ok;
    },
    commit: function(){
      this.child.commit();
      this.model.set('exporters',this.collection.toJSON());
    },
    
    events: {
      'click .js-addexporter': 'onAddExporter',
      'click .js-removeexporter': 'onRemoveExporter',
      'click .js-tabSelect': 'onTabSelect'
    },
    
    onAddExporter: function(){
      this.addExportador();
    },
    
    onRemoveExporter: function(){
      var self = this;
      DocManager.confirm('¿Quiere borrar al segundo exportador?',{okText:'si',cancelText:'no'}).done(function(){
        self.removeExportador();  
      })
      
    },
    
    onTabSelect: function(e){
      var index = this.$el.find('#tabList li').index($(e.currentTarget));
      this.setTab(index);
    }
  });
  
  var ObrasStep = Marionette.CompositeView.extend({
    initialize: function(){
      var obras = this.model.get('obras');
      if(obras){
        this.collection = obras;
        if(!(this.collection instanceof Backbone.Collection)){
          this.collection = new Backbone.Collection(obras);  
        }
      }else{
        this.collection = new Backbone.Collection();  
      }
    },
    getTemplate: function(){
      return utils.templates.SolObrasStep;
    },
    childView: ObrasList.ObraItem,
    childViewContainer: '#obras-container',
    
    onRender: function(){
      var self = this;
      this.autoComplete = new ObrasList.AutoCompleteObrasField({el:this.$el.find('#inputSearch'),filterField:['cnumber','slug']});
      this.autoComplete.on('obra:selected',function(obra){
        self.collection.push(obra);
        self.validateTotal();
      });
      this.validateTotal();
    },
    
    onDestroy: function(){
      this.autoComplete.unbind('obra:selected');
      this.autoComplete.destroy();
      this.autoComplete = null;
    },
    
    validateTotal: function(){
      var total = 0;
      this.collection.each(function(obra){
        total += parseFloat(obra.get('value'));
      })
      this.$el.find('#totalContainer').html('$'+accounting.format(total));
      this.totalValue = total;
    },
    
    validate: function(){
      var ok = this.collection.length > 0;
      if(!ok){
        Message.error('Debe seleccionar al menos una obra');
      }
      return ok;
    },
    commit: function(){
      this.model.set('obras',this.collection);
      this.model.set('totalValue',this.totalValue);
    },
    
    openSelector: function(){
      DocManager.request('obra:selector',function(obras){
        Message.success('selecciono obras');
        console.log('obras seleccionaas',obras);
      })
    },
    
    events: {
      'click .js-obrasselector': 'onClickSelector',
    },
    
    onClickSelector: function(e){
      Message.info('Listado disponible proximamente.<br/>Utilice el buscador para agregar');
      //this.openSelector();
    }
    
  });
  
  var DocsStep = Marionette.ItemView.extend({
    getTemplate: function(){
      return utils.templates.SolDocsStep;
    },
    onRender: function(){
      var hasDocs = this.model.get('docs').length > 0;
      if(hasDocs){
        this.$el.find('[name=docsenabled]').prop('checked',true);
        this.initAttacher();
      }
    },
    onDestroy: function(){
      this.destroyAttacher();
    },
    
    initAttacher: function(){
      var container = $('<div></div>');
      this.$el.find('#docsContainer').append(container);
      this.attachView = new AppCommon.AttachmentView({
            el:container,
            collection: this.model.get('docs')
      });
      this.attachView.render();
      
      var self = this;
      this.listenTo(this.attachView,'change',function(){
        //self.$el.find('#empty-region').removeClass('alert alert-danger');
        //self.commit();
      });
    },
    
    destroyAttacher: function(){
      if(this.attachView){
        this.attachView.destroy();
        this.attachView = null;
      }
    },
    
    validate: function(){
      return true;
    },
    commit: function(){
      if(this.attachView){
        var files = this.attachView.getFiles();
        this.model.set('docs',files.toJSON());
      }
    },
    
    events: {
      'click [name=docsenabled]': 'onChangeEnabled'
    },
    onChangeEnabled: function(e){
      var enabled = $(e.currentTarget).prop('checked');
      if(enabled){
        this.initAttacher();
      }else{
        this.destroyAttacher();
      }
    }
  });
  
  var ConfirmStep = Marionette.ItemView.extend({
    getTemplate: function(){
      return utils.templates.SolConfirmStep;
    },
    validate: function(){
      return true;
    },
    commit: function(){
      
    }
  });
  
 
  Edit.SolicitudGraciasView = Marionette.ItemView.extend({
    getTemplate: function(){
      return utils.templates.SolGracias
    },
    events: {
      'click .js-solicitudes': function(){
        DocManager.trigger("solicitud:list");
      },
      'click .js-solicitudnew': function(){
        DocManager.trigger("solicitud:new");
      }
    }
  });
  
  
});
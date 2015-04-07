
/**
 * Vista para adjuntar assets (archivos) a un modelo, como Actividad, evento, etc... 
 * 
 * Ejemplo de uso:
 * 
 * var attachView = new App.AttachmentView({el:this.$el.find('#attachmentContainer'),model:this.model});
 * attachView.render();
 * 
 * 
 */
DocManager.module("App", function(App, DocManager, Backbone, Marionette, $, _){
  
  
  var AttachmentItemView = Backbone.Marionette.ItemView.extend({
    initialize: function(){
      this.editMode = false;
    },
    getTemplate: function(){
      return (this.editMode) 
                ? utils.templates.AttachmentItemEditorView 
                : utils.templates.AttachmentItem;
    },
    
    templateHelpers: function(){
      var self = this;
      return {
        sizeLabel: function(amount){
          if(!amount) return '';
          
          var unit = 'bytes';
          if(amount > 1000){
            amount = Math.ceil(amount/1024);
            unit = 'KB';
          }
          if(amount > 1000){
            amount = Math.ceil(amount/1024);
            unit = 'MB';
          }
          return amount + ' ' + unit;
        },
        getUrl: function(){
          var urlpath = self.model.get('urlpath');
          return  location.origin + '/'+ urlpath;
        }
        
      };
    },
    onRender: function(){
      console.log('render file item',this.model);
      this.upload();
    },
    upload: function(){
      var file = this.model.get('file');
      if(!(file instanceof File)) return;
      
      var parentModel = this.model.get('parentModel');
      
      var progressbar = this.$el.find('.progress-bar');
      var self = this;
      dao.uploadFile(file,progressbar,function(srvresponse, asset){
        var filelink = '<a href="'+srvresponse.urlpath+'" >'+srvresponse.name+'</a>';
        
        $(progressbar).css({'width':'100%;'}).hide();
        $(progressbar).parent().hide();
        Message.success('Subido');
        
        self.model.set(asset.attributes);
        self.model.unset('file');
        self.render();
         
        if(parentModel){
          asset.linkChildsToAncestor(asset, parentModel,'es_asset_de',function(){
              console.log('ASSET linked to ancestor');
          });  
        }   
      });
    },
    
    setEditMode: function(yes){
      this.editMode = (yes !== false);
      this.render();
    },
    
    events: {
      'click .js-edit':'onEdit',
      'click .js-remove':'onRemove',
      'click .js-save': 'onSave',
      'click .js-cancelEdit': 'onCancelEdit'
    },
    
    onEdit: function(e){
      e.stopPropagation();
      this.setEditMode();
    },
    
    onSave: function(e){
      e.stopPropagation();
      
      var $btn = this.$el.find('.js-save');
      $btn.button('loading');
      this.model.set('slug',this.$el.find('[name=slug]').val());
      this.model.set('name',this.$el.find('[name=name]').val());
      
      
      var self = this;
      this.model.save().done(function(){
        $btn.button('reset');
        self.setEditMode(false);
        
      }).fail(function(){
        $btn.button('reset');
        self.setEditMode(false);
      });
      
    },
    
    onCancelEdit: function(e){
      e.stopPropagation();
      this.setEditMode(false);
    },
    
    onRemove: function(e){
      e.stopPropagation();
      var self = this;
      DocManager.confirm('¿Está seguro de borrar el archivo?').done(function(){
        self.model.destroy();
      });
    }
  });
  
  
  AttachmentItemEditor =  Backbone.Marionette.ItemView.extend({
    getTemplate: function(){
      return utils.templates.AttachmentItemEditor;
    },
    events: {
      'click .js-save': 'onSave',
      'click .js-cancel': 'onCancel'
    },
    
    onSave: function(e){
      e.stopPropagation();
    },
    
    onCancel: function(e){
      e.stopPropagation();
    }
  });
  
  App.AttachmentView = Marionette.CompositeView.extend({
     
     childView:  AttachmentItemView,
     childViewContainer: '#list-region',
     getTemplate: function(){
       return utils.templates.AttachmentLayoutView;
     },
     
     initialize: function(opts){
       if(opts.model && opts.model.assets){
         this.collection = opts.model.assets;
       }else{
         this.collection = new Backbone.Collection();  
       }
       
     },
     
     addFile: function(file){
       if(!file) return;
       var maxSize = 50 * 1024 * 1024;
         
       if(file.size > maxSize){
         Message.warning('Tamaño máximo permitido ' +Math.round(maxSize/1024/1024) + ' MB');
         return;
       }
       this.collection.push({file:file,parentModel:this.model});
     },
     
     events: {
       'click .js-newattachment': 'onNewAttach',
       'change [type=file]': 'onSelectFile',
       'dragover .rootContainer': 'dragHandler',
       'dragleave #messageDrop': 'dragLeaveHandler',
       'drop .rootContainer': 'dropHandler',
       
     },
     
     onNewAttach: function(e){
       //this.collection.push({});
       this.$el.find('[type=file]').click();
     },
     
     onSelectFile: function(){
       var file =  this.$el.find('[type=file]').prop("files")[0];
       this.addFile(file);
     },
     
     dragHandler: function(e){
       e.preventDefault();
       $(e.currentTarget).parent().css('border','2px solid #CCC');
       this.$el.find('#messageDrop').show();
     },
     
     dragLeaveHandler: function(e){
       $(e.currentTarget).parent().parent().css('border','1px solid #CCC');
       this.$el.find('#messageDrop').hide();
     },
     
     dropHandler: function(event){
       var e = event.originalEvent;
       e.stopPropagation();
       e.preventDefault();
       this.$el.find('#messageDrop').hide();
       
       e.dataTransfer.dropEffect = 'copy';
       var files = e.dataTransfer.files;
       for (var i = 0; i < files.length; i++) {
          this.addFile(files[i]);
        }
       
     }
     
     
  });
  
 
  
  
});
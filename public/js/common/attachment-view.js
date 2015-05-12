/**
 * Vista para adjuntar assets (archivos) a un modelo, como Actividad, evento, etc... 
 * 
 * Ejemplo de uso:
 * 
 * var attachView = new App.Common.AttachmentView({el:this.$el.find('#attachmentContainer'),model:this.model});
 * attachView.render();
 * 
 * 
 * templates customizados
 * -----------------------
 * opcion en construccion
 * templates: {
 *    list: 'AttachmentLayoutView',
 *    itemRender: 'AttachmentItem',
 *    itemEditor: 'AttachmentItemEditorView'
 * }
 * 
 * requierimientos:
 *  - boostrap.js
 *  - /js/models/models.js usa Asset y AssetCollection
 * 
 * 
 */
DocManager.module("App.Common", function(Common, DocManager, Backbone, Marionette, $, _){
  
  
  var AttachmentItemView = Backbone.Marionette.ItemView.extend({
    
    initialize: function(opts){
     
      this.templates = {
          itemRender: utils.templates.AttachmentItem,
          itemEditor: utils.templates.AttachmentItemEditorView,
        };
        
        if(opts && opts.templates){
            if(opts.templates.itemRender) this.templates.itemRender = opts.templates.itemRender;
            if(opts.templates.itemEditor) this.templates.itemEditor = opts.templates.itemEditor;
        }
      
      this.editMode = false;
    },

    getTemplate: function(){
      return (this.editMode) 
                ? this.templates.itemEditor 
                : this.templates.itemRender;
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
        
        
        self.model.set(asset.attributes);
        self.model.unset('file');
        self.render();
        
        self.triggerMethod('uploaded',self.model);
         
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
        
        self.triggerMethod('assets:save',self.model);
        
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
      DocManager.confirm('¿Quiere borrar el archivo?').done(function(){
        self.triggerMethod('assets:removed',self.model);
        self.model.destroy();
      });
    }
  });
  
  Common.AttachmentView = Marionette.CompositeView.extend({
     
     childView:  AttachmentItemView,
     childViewContainer: '#list-region',
     
     childViewOptions: function(model,index){
        return {
          templates: this.templates
        }
     }, 
     
     initialize: function(opts){
       if(opts.model && opts.model.assets){
         this.collection = opts.model.assets;
       }else if(opts.collection){
         this.collection = opts.collection;
         if(!(this.collection instanceof AssetCollection)){
           this.collection = new AssetCollection(this.collection);
         }
       }else{
         this.collection = new AssetCollection();  
       } 
       
       if(opts.model instanceof Asset){
         this.collection.push(opts.model);
       }else if(opts.model && opts.model.urlpath){
         this.model = new Asset(opts.model);
         this.collection.push(this.model);
       }
       
       if(opts.maxCountFiles){
         var tmp = parseInt(opts.maxCountFiles);
         if(!isNaN(tmp)) this.maxCountFiles = tmp;
       }
       
       if(opts.minImageWidth){
         var tmp = parseInt(opts.minImageWidth);
         if(!isNaN(tmp)) this.minImageWidth = tmp;
       }
       
       if(opts.minImageHeight){
         var tmp = parseInt(opts.minImageHeight);
         if(!isNaN(tmp)) this.minImageHeight = tmp;
       }
       
       this.templates = {
         list: utils.templates.AttachmentLayoutView,
         itemRender: utils.templates.AttachmentItem,
         itemEditor: utils.templates.AttachmentItemEditorView,
       };
       
       if(opts && opts.templates){
           if(opts.templates.list) this.templates.list = opts.templates.list;
           if(opts.templates.itemRender) this.templates.itemRender = opts.templates.itemRender;
           if(opts.templates.itemEditor) this.templates.itemEditor = opts.templates.itemEditor;
       }
     },
     
     getTemplate: function(){
       return this.templates.list;
     },
     
     getFiles: function(){
       this.collection.each(function(file){
         file.unset('parentModel');
       });
       return this.collection;
     },
     
     /** valida cantidad maxima de adjuntos **/
     allowCount: function(){
       var allow = true;
       if(this.maxCountFiles){
         allow = this.maxCountFiles > this.collection.length;
       }
         
       return allow;
     },
     
     allowDimension: function(file){
       var self = this;
       
       var $def = $.Deferred();
       
       if(this.minImageWidth || this.minImageHeight){
         var fObj = new Image();
         fObj.src = URL.createObjectURL(file);
         
         fObj.onload = function(){
           var width = this.width;
           var height = this.height;
           if(width < height){
             height = this.width;
             width = this.height;
           }
           
           if(self.minImageWidth && self.minImageHeight){
              if(self.minImageWidth > width || self.minImageHeight > height){
                 $def.reject('La imagen debe tener al menos '+self.minImageWidth + ' x '+ self.minImageHeight + ' px');
              }else{
                $def.resolve();
              }
  
           }else if(self.minImageWidth && self.minImageWidth > this.width){
              $def.reject('La imagen debe ser al menos de '+self.minImageWidth + ' px de ancho');
             
           }else if(self.minImageHeight && self.minImageHeight > this.height){
              $def.reject('La imagen debe ser al menos de '+self.minImageWidth + ' px de alto');
           }else{
              $def.resolve();
           }
         }  
       }else{
         $def.resolve();
       }
       
       return $def.promise();
     },
     
     validationNewFile: function(file){
       var error = '';
       var $def = $.Deferred();
       
       if(!file){
         $def.reject();
         return $def.promise();
       }
       
       if(!this.allowCount()){
         error = 'Cantidad máxima de archivos ' + this.maxCountFiles;
       }
       
       var maxSize = 50 * 1024 * 1024;         
       if(file.size > maxSize){
         error = 'Tamaño máximo permitido ' +Math.round(maxSize/1024/1024) + ' MB';
       }
       
       if(error){
         $def.reject(error);
         return $def.promise();
       }else{
         this.allowDimension(file).then($def.resolve,$def.reject);  
       }
       
       return $def.promise();
     },
     
     addFile: function(file){
       var self = this;
       var p = this.validationNewFile(file);
       p.done(function(){
         self.collection.push({file:file,parentModel:self.model});
       }).fail(function(msg){
         Message.error(msg);
       });
     },
     
     events: {
       'click .js-newattachment': 'onNewAttach',
       'change [type=file]': 'onSelectFile',
       'dragover .rootContainer': 'dragHandler',
       'dragleave #messageDrop': 'dragLeaveHandler',
       'drop .rootContainer': 'dropHandler'
     },
     
     childEvents: {
       'assets:save': 'onAssetsChange',
       'uploaded': 'onAssetsChange',
       'assets:removed':'onAssetsRemoved'
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
       if(!this.allowCount()) return;
       $(e.currentTarget).parent().css('border','2px solid #CCC');
       this.$el.find('#messageDrop').show();
     },
     
     dragLeaveHandler: function(e){
       if(!this.allowCount()) return;
       $(e.currentTarget).parent().parent().css('border','1px solid #CCC');
       this.$el.find('#messageDrop').hide();
     },
     
     dropHandler: function(event){
       var e = event.originalEvent;
       e.stopPropagation();
       e.preventDefault();
       
       if(!this.allowCount()) return;
       this.$el.find('#messageDrop').hide();
       
       e.dataTransfer.dropEffect = 'copy';
       var files = e.dataTransfer.files;
       for (var i = 0; i < files.length; i++) {
          this.addFile(files[i]);
        }
       
     },
     
     onAssetsChange: function(){
       this.triggerMethod('change');
       this.$el.find('[type=file]').val('');
     },
     
     onAssetsRemoved: function(){
      var self = this;
      setTimeout(function(){
       self.triggerMethod('change'); 
      },10)
     }

  });
});
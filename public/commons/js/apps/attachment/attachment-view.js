
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
 *  - /js/models/models.js usa Asset y DocManager.Entities.AssetCollection
 * 
 * 
 */
DocManager.module("App.Common", function(Common, DocManager, Backbone, Marionette, $, _){
  
  
  var AttachmentItemView = Backbone.Marionette.ItemView.extend({
    
    initialize: function(opts){
      console.log('****************************************')
      console.log('AttachmentItemView INIT: [%s]', this.model.whoami);
     
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
      var self = this,
          file = self.model.get('file'),
          parentModel = self.model.get('parentModel'),
          progressbar = self.$el.find('.progress-bar');
      
      if(!(file instanceof File)) return;

      console.log('upload: [%s]', self.model.whoami)
      
      uploadFile(file, progressbar, function(srvresponse, asset){
        var filelink = '<a href="'+srvresponse.urlpath+'" >'+srvresponse.name+'</a>';
        
        $(progressbar).css({'width':'100%;'}).hide();
        $(progressbar).parent().hide();
        
        
        self.model.set(asset.attributes);
        self.model.unset('file');
        self.render();
        
        self.triggerMethod('uploaded',self.model);
        /**
        * parentModel = {id: ancestor.id, code: ancestor.get('cnumber') || 'ASSET', slug: ancestor.get('slug'), predicate: predicate}
        *
        *
        */         
        if(parentModel){
          asset.linkChildsToAncestor(asset, parentModel,parentModel.get('predicate'),function(){
              console.log('ASSET linked to ancestor');
          });  
        }
        console.dir(self.model.attributes);
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


  // ***************
  // COMPOSITE
  // **************
  Common.AttachmentView = Marionette.CompositeView.extend({
    whoami: 'Common.AttachmenView:attachment-view.js',
     
     childView:  AttachmentItemView,
     childViewContainer: '#list-region',
     
     childViewOptions: function(model,index){
        return {
          templates: this.templates
        }
     }, 
     
     initialize: function(opts){
      var self = this;
      console.log('AttachmentView INIT: opts:[%s] model:[%s] same:[%s]', opts.model.whoami, this.model.whoami, this.model === opts.model)

       if(self.model && self.model.assets){
        console.log('Caso-1');
         this.collection = self.model.assets;
       }else if(self.collection){
        console.log('Caso-2');
         this.collection = self.collection;
         if(!(this.collection instanceof DocManager.Entities.AssetCollection)){
           this.collection = new DocManager.Entities.AssetCollection(this.collection);
         }
       }else{
        console.log('Caso-3');
         this.collection = new DocManager.Entities.AssetCollection();  
        console.log('Caso-3: [%s]', this.collection.length);
         
       } 
       
       // model puede ser un Asset en sí mismo, con lo cual se trata de él mismo
       // model puede ser un hash, que representa un Asset, en ese caso instancio el Asset.
       if(self.model instanceof DocManager.Entities.Asset){
          console.log('Caso-4');
         this.collection.push(self.model);
       }else if(self.model && self.model.urlpath){
          console.log('Caso-5: un pseudo asset');
         this.model = new DocManager.Entities.Asset(self.model);
         this.collection.push(this.model);
       }
       
       if(opts.maxCountFiles){
         var tmp = parseInt(opts.maxCountFiles);
         if(!isNaN(tmp)) this.maxCountFiles = tmp;
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
     
     addFile: function(file){
      console.log('addFile parentModel:[%s]', this.model.whoami);
      console.dir(file);
       if(!file) return;
       var maxSize = 50 * 1024 * 1024;
         
       if(file.size > maxSize){
         Message.warning('Tamaño máximo permitido ' +Math.round(maxSize/1024/1024) + ' MB');
         return;
       }
       this.collection.push({file:file,parentModel:this.model});
       
     },
     
     allowCount: function(){
       var allow = true;
       if(this.maxCountFiles){
         allow = this.maxCountFiles > this.collection.length;
       }
         
       return allow;
     },
     
     events: {
       'click .js-newattachment': 'onNewAttach',
       'change [type=file]': 'onSelectFile',
       'dragover .rootContainer': 'dragHandler',
       'dragleave #messageDrop': 'dragLeaveHandler',
       'drop .rootContainer': 'dropHandler',
       
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
       if(!this.allowCount()) return;
       
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
      // la cosa arranca acá
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
     
     onAssetsChange: function(asset){
       console.log('asset:changed    model: [%s]  asset: [%s]', this.model.whoami, asset.whoami );

       this.trigger('asset:changed', this.model.whoami, asset.whoami )
       this.triggerMethod('change');
       this.$el.find('[type=file]').val('');
     },
     
     onAssetsRemoved: function(asset){
      var self = this;
      setTimeout(function(){
       self.triggerMethod('change'); 
      },100)
     }
     
  });
  
///////////////////////////////////////////////////
  Common.AttachmentImageBox = Common.AttachmentView.extend({
    maxCountFiles: 1,
    
    initialize: function(opts){
      var self = this;
      this.listenTo(this,'change',function(){
        self.validateSize();
        self.validateButtonAdd();
      });
      
      if(opts.width){
        this.width = opts.width;
      }
      
      if(opts.height){
        this.height = opts.height;
      }
      
      Common.AttachmentView.prototype.initialize.apply(this,[opts]);
    },

    onRender: function(){
      this.validateSize();
      this.validateButtonAdd();
    },

    validateSize: function(){
      var $listBox = this.$el.find('#list-region');
      var $img = this.$el.find('.thumbnail');
      if(this.width){
        $listBox.css('width',this.width).css('min-width',this.width);
        $img.css('width',this.width)
        $img.find('img').css('width',this.width);
      }
      
      if(this.height){
        $listBox.css('height',this.height);
        $img.css('height',this.height);
      }
    },

    validateButtonAdd: function(){
      var listContainer = this.$el.find('#list-region');
      var has = this.collection.length > 0;
      if(has){
        this.$el.find('.js-newattachment').hide();
        listContainer.css('display','inline-block');
      }else{
        this.$el.find('.js-newattachment').show();
        listContainer.css('display','table-cell');
      }
    }

  }); 


  var uploadFile = function(uploadingfile, progressbar, cb){
        var formData = new FormData();
        var folder = 'files';
        console.log(' uploadFiles BEGINS folder:[%s]', folder);
        
        if(!uploadingfile) return false;

        formData.append('loadfiles', uploadingfile);
        formData.append('folder',folder);

        var xhr = new XMLHttpRequest();

        xhr.open('POST', '/files');

        xhr.onload = function() {
            var srvresponse = JSON.parse(xhr.responseText);
            var asset = new DocManager.Entities.Asset();
            asset.saveAssetData(srvresponse, function(asset){
                //console.log('asset CREATED!: [%s]',srvresponse.name);
                cb(srvresponse, asset);
            });
        };

        xhr.upload.onprogress = function(event) {
            if (event.lengthComputable) {
                var complete = (event.loaded / event.total * 100 | 0);
                $(progressbar).css({'width':complete+'%'});
            }
        };

        xhr.send(formData);    
    };

 


  
  
});
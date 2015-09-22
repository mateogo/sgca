DocManager.module("FondoBackendApp.List", function(List, DocManager, Backbone, Marionette, $, _){

  var backendApp = DocManager.module('FondoBackendApp');
  var AppCommon = DocManager.module('App.Common');
  
  List.FondoRequestView = Marionette.ItemView.extend({
    getTemplate: function(){
      return utils.templates.FondorequestsView;
    },
    initialize: function(opts){
      this.adjuntos = opts.adjuntos;

    },

    onRender: function(){
      buildAttachments(this, this.model);

    },
    
    templateHelpers: function(){
      var self = this;
      return {
        formatDate: function(date){
          //return 'mingaLaFecha'
          return moment(date).format('dddd LL');
        },
        getFieldLabel: function(fieldName){
          return self.model.get(fieldName);
        },
        isVendedor: function(){
          return self.model.isVendedor();
        },
        isComprador: function(){
          return self.model.isComprador();
        },
        hasVendorProfiles: function(){
          return self.model.hasVendorProfiles();
        },
        hasCompradorProfiles: function(){
          return self.model.hasCompradorProfiles();
        },
      };
    }
  });


  List.FondoRepairAssetView = Marionette.CompositeView.extend({
    getTemplate: function(){
      return utils.templates.FondorequestsView;
    },
    initialize: function(opts){
      console.log('RepairAssetVIEW');
      this.adjuntos = opts.adjuntos;

    },

    onRender: function(){
      buildRepairAssets(this, this.model);

    },
    
    templateHelpers: function(){
      var self = this;
      return {
        formatDate: function(date){
          //return 'mingaLaFecha'
          return moment(date).format('dddd LL');
        },
        getFieldLabel: function(fieldName){
          return self.model.get(fieldName);
        },
        isVendedor: function(){
          return self.model.isVendedor();
        },
        isComprador: function(){
          return self.model.isComprador();
        },
        hasVendorProfiles: function(){
          return self.model.hasVendorProfiles();
        },
        hasCompradorProfiles: function(){
          return self.model.hasCompradorProfiles();
        },
      };
    }
  });


  
  var AttachmentItemView = Backbone.Marionette.ItemView.extend({
    whoami: 'AttachmentItemView',
    
    initialize: function(opts){
      console.log('AttachmentItemView INIT [%s]', this.whoami, this.model.get('name'));

     
      this.templates = {
          itemRender: utils.templates.RepairAssetItem,
          itemEditor: utils.templates.RepairAssetItemEditor,
        };
              
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
        },
        collectionView: function(){
          var strData = JSON.stringify(self.model.get('es_asset_de'));
          return strData;

        },
        
      };
    },
    onRender: function(){
      //this.upload();
    },

    upload: function(){
      var self = this,
          file = self.model.get('file'),
          parentModel = self.model.get('parentModel'),
          progressbar = self.$el.find('.progress-bar');
      
      if(!(file instanceof File)) return;

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
              //console.log('ASSET linked to ancestor');
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




  var buildRepairAssets = function(view, model){
    var assetsCol = view.adjuntos,
        tsolicitud = model.get('requerimiento').tsolicitud,
        assetView,
        attachTypes;

    if(tsolicitud === 'movilidad_mica'){
      attachTypes = ['cartaministra',  'docidentidad', 'constanciacuit', 'resenia'];
    }else{
      attachTypes = ['especifico', 'cartaministra', 'invitacion',  'docidentidad', 'constanciacuit', 'resenia'];

    }

    // if(adjuntos && adjuntos.length){
    //   assetsCol = new DocManager.Entities.AssetCollection(adjuntos); 
    // }else{
    //   assetsCol = new DocManager.Entities.AssetCollection(); 
    // }

    console.log('buildReapirAssets item view [%s] whoami:[%s] ', assetsCol.length, assetsCol.whoami);

    assetsCol.each(function(asset){
      console.log('Iterando AssetsCol [%s]', asset.get('name'));
      assetView = new AttachmentItemView({model:asset});

      view.$('#orphan').append(assetView.render().el);
    });






  };



  var buildAttachments = function(view, model){
    var adjuntos = view.adjuntos,
        tsolicitud = model.get('requerimiento').tsolicitud,
        attachTypes;

    if(tsolicitud === 'movilidad_mica'){
      attachTypes = ['cartaministra',  'docidentidad', 'constanciacuit', 'resenia'];
    }else{
      attachTypes = ['especifico', 'cartaministra', 'invitacion',  'docidentidad', 'constanciacuit', 'resenia'];

    }


    _.each(attachTypes, function(attchType){
      var data = {
        _id: model.get('_id'),
        cnumber: model.get('cnumber'),
        predicate: attchType,
        slug: model.get('slug'),
      }
      var token = new DocManager.Entities.AssetToken(data);
      token.id = model.get('_id');

      if(adjuntos[attchType] && adjuntos[attchType].length){
        token.assets = new DocManager.Entities.AssetCollection(adjuntos[attchType]); 
      }else{
        token.assets = new DocManager.Entities.AssetCollection(); 
      }

      view[attchType] = new AppCommon.AttachmentView({el:view.$el.find('#'+attchType), model:token});
      view[attchType].render();

    });

  };



  


});
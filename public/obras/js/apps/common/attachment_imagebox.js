DocManager.module('ObrasApp.Common', function(Common, DocManager, Backbone, Marionette, $, _){

  var AppCommon = DocManager.module('App.Common');
  
  
  Common.AttachmentImageBox = AppCommon.AttachmentView.extend({
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
        
        AppCommon.AttachmentView.prototype.initialize.apply(this,[opts]);
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

});
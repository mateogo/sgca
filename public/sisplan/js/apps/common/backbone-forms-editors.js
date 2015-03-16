(function(){
  
  Backbone.Form.editors.RichText = Backbone.Form.editors.Text.extend({
    
    render: function(){
      Backbone.Form.editors.Text.prototype.render.call(this);
      
      this.editor = CKEDITOR.replace(this.el);
      if(this.value){
        this.editor.setData(this.value);
      }
      return this;
    },
    
    getValue: function(){
      var val = this.editor.getData();
      return val;
    },
    
    setValue: function(value){
      if(this.editor){
        this.editor.setData(value);  
      }else{
        this.value = value;
      }
    }
  });
  
  
  Backbone.Form.editors.DatePicker = Backbone.Form.editors.Text.extend({
    
    render: function(){
      Backbone.Form.editors.Text.prototype.render.call(this);
      
      this.$el.datepicker();
      if(this.value){
        this.$el.datepicker('setDate',this.value);
      }
      
      return this;
    },
    
    getValue: function(){
      var val = this.$el.datepicker('getDate');
      return val;
    },
    
    setValue: function(value){
      if(this.$el.datepicker){
        this.$el.datepicker('setDate',this.value);
      }else{
        this.value = value;
      }
    }
    
  });
  
})();
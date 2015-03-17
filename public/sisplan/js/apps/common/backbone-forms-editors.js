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
      this.inited = true;
      
      return this;
    },
    
    getValue: function(){
      var val = this.$el.datepicker('getDate');
      return val;
    },
    
    setValue: function(value){
      if(!(value instanceof Date)){
        value = new Date(value);
      }
      if(this.inited){
        this.$el.datepicker('setDate',this.value);
      }else{
        this.value = value;
      }
    }
  });
  
Backbone.Form.editors.TimePicker = Backbone.Form.editors.Text.extend({
    
    render: function(){
      Backbone.Form.editors.Text.prototype.render.call(this);
      
      this.$el.timepicker({'timeFormat': 'H:i'});
      if(this.value){
        this.$el.timepicker('setTime',this.value);
      }
      this.inited = true;
      
      return this;
    },
    
    getValue: function(){
      var val = this.$el.timepicker('getTime');
      return val;
    },
    
    setValue: function(value){
      if(!(value instanceof Date)){
        value = new Date(value);
      }
      if(this.inited){
        this.$el.timepicker('setTime',this.value);
      }else{
        this.value = value;
      }
    }
  });
  
})();
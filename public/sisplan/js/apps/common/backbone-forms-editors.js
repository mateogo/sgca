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


/**
 * Select con opciones tomadas de un request. Ejemplo de uso:
 * 
 * schema: {
 *  location: {type:'SelectRequest',title:'Locación',request:'action:fetch:location',fieldLabel:'name',fieldVal:'code'}
 * }
 * 
 * donde request:'action:fetch:location' se resuleve con 
 * 
 * DocManager.reqres.setHandler('action:fetch:location',function(model,cb){
 *  var promise = $.Deferred().promise();
 *  return promise; 
 * });
 * 
 */
Backbone.Form.editors.SelectRequest = Backbone.Form.editors.Select.extend({
  initialize: function(options){
    if(!options.schema.options){
      options.schema.options = [];
    }
    Backbone.Form.editors.Select.prototype.initialize.call(this,options);
  },
  render: function(){
    
    Backbone.Form.editors.Select.prototype.render.call(this);
    console.log('dibujndo selectrequest',this);
    
    if(this.schema.request){
      var fieldLabel = this.schema.fieldLabel;
      var fieldVal = this.schema.fieldVal;
      var self = this;
      
      var params = this.model;
      
      if(this.schema.mapQuery && typeof(this.schema.mapQuery) === 'function'){
        params = this.schema.mapQuery(this.model);
      }
      
      DocManager.request(this.schema.request,params).done(function(response){
        var opts = _.map(response,function(item){
          return {
            label: item[fieldLabel],
            val: item[fieldVal]
          };
        });
        opts.unshift({val:'',label:''});
        self.setOptions(opts);
        
        self.$el.trigger('change');
      });  
    }
    
    
    return this;
  }
  
  
});

  
})();
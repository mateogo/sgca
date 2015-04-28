DocManager.module('AutorApp.Edit', function(Edit, DocManager, Backbone, Marionette, $, _){
  
  var Entities = DocManager.module('Entities');
  
  Edit.AutorEditorView =  Marionette.ItemView.extend({
    
    getTemplate: function(){
      return utils.templates.AutorEditor;
    },
    
    initialize: function(opts){
      if(opts.model && opts.model instanceof Entities.Obra){
        this.obra = opts.model;
        if(!opts.model.get('autor')){
          opts.model.set('autor',new Entities.Autor());
        }
        this.model = opts.model.get('autor');
      }
      
    },
    
    onRender: function(){
      this.fillFormData();
    },
    
    fillFormData: function(){
      var schema = this.model.validation;
      for(var key in schema){
        var value = this.model.get(key);
        if(key == 'alive'){
          this.$el.find('[name='+key+'][value='+value+']').prop('checked',true);
        }else{
          this.$el.find('[name='+key+']').val(value);  
        }
        
      }
    },
    
    getData: function(){
      var schema = this.model.validation;
      var data = {};
      for(var key in schema){
        if(key === 'alive'){
          data[key] = this.$el.find('[name='+key+']:checked').val();
        }else{
          data[key] = this.$el.find('[name='+key+']').val();  
        }
        
      }
      return data;
    },
    
    /** metodos para 'interface' de paso de wizard o editor con tabs **/
    validate: function(){
      return true;
    },
    
    
    commit: function(){
      var data = this.getData();
      this.model.set(data);
      if(this.obra){
        this.obra.set('autor',null);
        this.obra.set('autor',this.model);
      }
    },
    
    events: {
      'change input': 'commit',
      'change textarea': 'commit',
    }
    
  });
  
});
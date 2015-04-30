DocManager.module("Entities", function(Entities, DocManager, Backbone, Marionette, $, _){
  
  //https://github.com/thedersen/backbone.validation
  
  Entities.Obra = Backbone.Model.extend({
    whoami: 'Obras:obras.js',
    urlRoot: "/obraarte",
    idAttribute: "_id",
    
    initialize: function(){
      
      var autor = this.get('autor');
      if(autor){
        if(autor.toJSON){
          autor = autor.toJSON();
        }
        this.set('autor',new Entities.Autor(autor));
      }
    },
    
    defaults:{
      slug: '',
      madeyear: '',
      procedure: '',
      dimensions: '',
      material: '',
      value: '',
      thumbnail: '',
      photos_ids: [],
      photos: [],
      parts: []
    },
    
    validation: {
      slug: {required: true,msg:'Es necesario'},
      procedure: {required:true,msg:'Es necesario'},
      dimensions: {required:true,msg:'Es necesario'},
      material: {required:true,msg:'Es necesario'},
      value: {required:true,pattern:'number',msg:'Ingrese un importe en pesos argentinos'},
      madeyear: {required:false}
    },
    
    parse: function(raw,opts){
      if(raw.autor){
        raw.autor = new Entities.Autor(raw.autor);
      }
      
      return raw;
    },
    
    sync: function(method,model,opts){
      if(method === 'create' || method === 'update'){
        var copy = model.clone();
        
        var photos = copy.get('photos');
        var photos_ids = _.map(photos,function(item){ return item._id});
        copy.set('photos_ids',photos_ids);
        copy.unset('photos');
        if(photos.length > 0){
          copy.set('thumbnail',photos[0].urlpath);
        }
        model = copy;
      }
      return Backbone.Model.prototype.sync.apply(this,[method,model,opts]);
    }
  });
  
  Entities.ObraPart = Backbone.Model.extend({
      defaults:{
        slug: '',
        description: '',
        assets: []
      }
  });
  
  
  Entities.ObrasCollection = Backbone.Collection.extend({
    model: Entities.Obra,
    url: "/obraarte"
  })
  
  var API = {
    /**
     * load para editar
     * @param {obra} stringId o Entities.Obra
     * @return promise
     */
    load: function(obra){
      var def = $.Deferred();
      if((obra instanceof Entities.Obra)){
        
        if(obra.get('photos_ids').length === obra.get('photos').length){
          def.resolve(obra);  
        }else{
          obra.fetch().then(function(){
            def.resolve(obra);
          },def.reject);
        }
        
      }else{
         obra = new Entities.Obra({_id:obra});
         p = obra.fetch().then(function(){
           def.resolve(obra);
         },def.reject);
      }
      return def.promise();
      
    },
    
    save: function(obra){
      
      var xhr = obra.save();
      if(xhr){
        return xhr;
      }else{
        var def = $.Deferred();
        def.reject();
        return def.promise();
      }
    },
    
    search: function(params){
      var obras = new Entities.ObrasCollection();
      
      return obras.fetch({data: params});
    }
  }
  
  DocManager.reqres.setHandler("obra:load", function(obra){
    return API.load(obra);
  });
  
  DocManager.reqres.setHandler("obra:save", function(obra){
    return API.save(obra);
  });
  
  DocManager.reqres.setHandler("obra:filteredLike", function(params){
    return API.search(params);
  });
  
  
    
});
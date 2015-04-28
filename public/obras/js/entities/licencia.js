DocManager.module("Entities", function(Entities, DocManager, Backbone, Marionette, $, _){
  
  //https://github.com/thedersen/backbone.validation
  
  Entities.Licencia = Backbone.Model.extend({
    whoami: 'Licencia:licencia.js',
    urlRoot: "/obraartelicencia",
    idAttribute: "_id",
    
    defaults:{
      type: '',
      reason: '',
      destination: '',
      dateout: '',
      durationout: '',
      customs: '',
      obs: '',
      totalValue: '',
      exporters: [],
      obras: []
    },
    
    validation: {
      type: {required: true,msg:'Es necesario'}, //tipo de tramite, definitiva o temporaria
      reason: {required: true,msg:'Es necesario'},
      destination: {required: true,msg:'Es necesario'},
      dateout: {required: true,msg:'Es necesario'},
      durationout: {required: false,msg:'Es necesario'}, // compromiso de retorno, en meses
      customs: {required: false,msg:'Es necesario'}, // aduana
      obs: {required: false}
    },
    
    parse: function(raw,opts){
      
      
      return raw;
    },
    
    sync: function(method,model,opts){
      if(method === 'create' || method === 'update'){
        var copy = model.clone();
        
        var docs = copy.get('docs');
        var docs_ids = _.map(docs,function(item){ return item._id});
        copy.set('docs_ids',docs_ids);
        copy.unset('docs');
        
        var obras = copy.get('obras');
        var obras_ids = _.map(obras,function(item){ return item._id});
        copy.set('obras_ids',obras_ids);
        copy.unset('obras');
        
        model = copy;
      }
      return Backbone.Model.prototype.sync.apply(this,[method,model,opts]);
    }
  });
  
  
  Entities.LicenciasCollection = Backbone.Collection.extend({
    model: Entities.Licencia,
    url: "/obraartelicencia"
  })
  
  var API = {
    /**
     * load para editar
     * @param {obra} stringId o Entities.Licencia
     * @return promise
     */
    load: function(licencia){
      var def = $.Deferred();
      if((obra instanceof Entities.Licencia)){
        def.resolve(licencia);

      }else{
         obra = new Entities.Licencia({_id:licencia});
         p = obra.fetch().then(function(){
           def.resolve(licencia);
         },def.reject);
      }
      return def.promise();
      
    },
    
    save: function(model){
      var xhr = model.save();
      if(xhr){
        return xhr;
      }else{
        var def = $.Deferred();
        def.reject();
        return def.promise();
      }
    }
  }
  
  DocManager.reqres.setHandler("licencia:load", function(model){
    return API.load(model);
  });
  
  DocManager.reqres.setHandler("licencia:save", function(model){
    return API.save(model);
  });
    
});
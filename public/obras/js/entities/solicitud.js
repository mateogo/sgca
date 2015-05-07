DocManager.module("Entities", function(Entities, DocManager, Backbone, Marionette, $, _){
  
  //https://github.com/thedersen/backbone.validation
  
  Entities.Solicitud = Backbone.Model.extend({
    whoami: 'Solicitud:solicitud.js',
    urlRoot: "/obraartesolicitud",
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
      email: '',
      exporters: new Backbone.Collection(),
      obras: new Backbone.Collection(),
      docs: new Backbone.Collection()
    },
    
    validation: {
      type: {required: true}, //tipo de tramite, definitiva o temporaria
      reason: {required: true},
      destination: {required: true},
      dateout: {required: true},
      durationout: [{required: function(value,attr,computedState){
                      // compromiso de retorno, en meses
                      return computedState.type === 'temporaria';
                    }},
                    {pattern:'number',msg:'Ingrese de 1 a 12 meses'},
                    {max:12,msg:'Ingrese de 1 a 12 meses'},
                    {min:1,msg:'Ingrese de 1 a 12 meses'}
                    ], 
      customs: {required: false,msg:'Es necesario'}, // aduana
      email: {required:true,pattern:'email'},
      obs: {required: false}
    },
    
    parse: function(raw,opts){
      
      if(raw.exporters){
        for (var i = 0; i < raw.exporters.length; i++) {
          raw.exporters[i] = new Entities.Exportador(raw.exporters[i]); 
        }
      }
      
      if(raw.obras){
        raw.obras = new Entities.ObrasCollection(raw.obras);
        /*
        for (var i = 0; i < raw.obras.length; i++) {
          raw.obras[i] = new Entities.Obra(raw.obras[i]); 
        }*/
      }
      
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
        var obras_ids = obras.map(function(item){ return item.id});
        copy.set('obras_ids',obras_ids);
        copy.unset('obras');
        
        model = copy;
      }
      return Backbone.Model.prototype.sync.apply(this,[method,model,opts]);
    }
  });
  
  
  Entities.SolicitudCollection = Backbone.Collection.extend({
    model: Entities.Solicitud,
    url: "/obraartesolicitud"
  })
  
  var API = {
    /**
     * load para editar
     * @param {solicitud} stringId o Entities.Solicitud
     * @return promise
     */
    load: function(solicitud){
      var def = $.Deferred();
      if((solicitud instanceof Entities.Solicitud)){
        
        var obras = solicitud.get('obras'); 
        
        if(obras  && obras.length > 0){
          def.resolve(solicitud);  
        }else{
          solicitud.fetch().then(function(){
            def.resolve(solicitud);
          },def.reject);
        }

      }else{
        solicitud = new Entities.Solicitud({_id:solicitud});
         p = solicitud.fetch().then(function(){
           def.resolve(solicitud);
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
  
  DocManager.reqres.setHandler("solicitud:load", function(model){
    return API.load(model);
  });
  
  DocManager.reqres.setHandler("solicitud:save", function(model){
    return API.save(model);
  });
    
});
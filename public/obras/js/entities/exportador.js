DocManager.module("Entities", function(Entities, DocManager, Backbone, Marionette, $, _){
  
  //https://github.com/thedersen/backbone.validation
  
  Entities.Exportador = Backbone.Model.extend({
    whoami: 'Exportador:exportador.js',
    idAttribute: "_id",
    
    initialize: function(opts){
      if(opts){
        if(opts.docPhoto1){
          this.set('docPhoto1',new Asset(opts.docPhoto1));
        }
        if(opts.docPhoto2){
          this.set('docPhoto2',new Asset(opts.docPhoto2));
        }
      }
    },
    
    defaults:{
      name: '',
      lastname: '',
      province: '',
      localidad: '',
      address:'',
      di: '',
      ditype: 'DNI',
      nationality: '',
      birthday: '',
      phone: '',
      mobile: '',
      docPhoto1: null,
      docPhoto2: null
    },
    
    validation: {
      name: {required: true,msg:'Es necesario'},
      lastname: {required:true,msg:'Es necesario'},
      address: {required:true,msg:'Es necesario'},
      province: {required:true,msg:'Es necesario'},
      localidad: {required:true,msg:'Es necesario'},
      di: {required:true,msg:'Es necesario'},
      nationality: {required:true,msg:'Es necesario'},
      birthday: {required:true,msg:'Es necesario'},
      phone: {required:false},
      mobile: {required:false},
    }
  });
    
});
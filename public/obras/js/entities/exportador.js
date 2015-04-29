DocManager.module("Entities", function(Entities, DocManager, Backbone, Marionette, $, _){
  
  //https://github.com/thedersen/backbone.validation
  
  Entities.Exportador = Backbone.Model.extend({
    whoami: 'Exportador:exportador.js',
    idAttribute: "_id",
    
    defaults:{
      name: '',
      lastname: '',
      province: '',
      localidad: '',
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
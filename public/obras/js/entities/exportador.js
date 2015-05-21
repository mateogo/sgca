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
      cpostal: '',
      di: '',
      ditype: 'DNI',
      nationality: '',
      birthday: '',
      phone1: '',
      phone2: '',
      docPhoto1: null,
      docPhoto2: null
    },

    validation: {
      name: {required: true},
      lastname: {required:true},
      address: {required:true},
      province: {required:true},
      localidad: {required:true},
      cpostal:{required:true},
      di: {required:true},
      nationality: {required:true},
      birthday: {required:true},
      phone1: {required:true},
      phone2: {required:false},
      mobile: {required:false}
    }
  });

});

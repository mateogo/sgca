DocManager.module("FondoBackendApp.List", function(List, DocManager, Backbone, Marionette, $, _){

  var backendApp = DocManager.module('FondoBackendApp');
  var AppCommon = DocManager.module('App.Common');
  
  List.FondoRequestView = Marionette.ItemView.extend({
    getTemplate: function(){
      return utils.templates.FondorequestsView;
    },
    initialize: function(opts){
      this.adjuntos = opts.adjuntos;

    },

    onRender: function(){
      buildAttachments(this, this.model);

    },
    
    templateHelpers: function(){
      var self = this;
      return {
        formatDate: function(date){
          //return 'mingaLaFecha'
          return moment(date).format('dddd LL');
        },
        getFieldLabel: function(fieldName){
          return self.model.get(fieldName);
        },
        isVendedor: function(){
          return self.model.isVendedor();
        },
        isComprador: function(){
          return self.model.isComprador();
        },
        hasVendorProfiles: function(){
          return self.model.hasVendorProfiles();
        },
        hasCompradorProfiles: function(){
          return self.model.hasCompradorProfiles();
        },
      };
    }
  });

  var buildAttachments = function(view, model){
    var adjuntos = view.adjuntos,
        tsolicitud = model.get('requerimiento').tsolicitud,
        attachTypes;

    if(tsolicitud === 'movilidad_mica'){
      attachTypes = ['cartaministra',  'docidentidad', 'constanciacuit', 'resenia'];
    }else{
      attachTypes = ['especifico', 'cartaministra', 'invitacion',  'docidentidad', 'constanciacuit', 'resenia'];

    }


    _.each(attachTypes, function(attchType){
      var data = {
        _id: model.get('_id'),
        cnumber: model.get('cnumber'),
        predicate: attchType,
        slug: model.get('slug'),
      }
      var token = new DocManager.Entities.AssetToken(data);
      token.id = model.get('_id');

      if(adjuntos[attchType] && adjuntos[attchType].length){
        token.assets = new DocManager.Entities.AssetCollection(adjuntos[attchType]); 
      }else{
        token.assets = new DocManager.Entities.AssetCollection(); 
      }

      view[attchType] = new AppCommon.AttachmentView({el:view.$el.find('#'+attchType), model:token});
      view[attchType].render();

    });

  };



  


});
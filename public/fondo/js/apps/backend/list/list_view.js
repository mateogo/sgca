DocManager.module("FondoBackendApp.List", function(List, DocManager, Backbone, Marionette, $, _){

  var backendApp = DocManager.module('FondoBackendApp');

  List.FondoRequestView = Marionette.ItemView.extend({
    getTemplate: function(){
      return utils.templates.FondorequestsView;
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

  


});
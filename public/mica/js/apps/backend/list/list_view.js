DocManager.module("BackendApp.List", function(List, DocManager, Backbone, Marionette, $, _){

  var backendApp = DocManager.module('BackendApp');

  List.MicaRequestView = Marionette.ItemView.extend({
    getTemplate: function(){
      return utils.templates.MicarequestsView;
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
          return self.model.get('vendedor').rolePlaying.vendedor;
        },
        isComprador: function(){
          return self.model.get('comprador').rolePlaying.comprador;
        },
        hasVendorProfiles: function(){
          return self.model.get('vendedor').vporfolios.length;
        },
        hasCompradorProfiles: function(){
          return self.model.get('comprador').cporfolios.length;
        },
        
        vendorSubActivities: function(){
          var subact = self.model.get('vendedor')['sub_' + self.model.get('vendedor').vactividades];
          var memo = "";
          var render = _.reduce(subact, function(memo, item, index){
              console.log('reduce: [%s] [%s]: [%s]', item, index, memo);
              if(item) memo = memo + index + '/ ' ;
              return memo;

          },memo);
          console.log('returning: [%s]', render)
          return render;
        },

        compradorSubActivities: function(){
          var subact = self.model.get('comprador')['sub_' + self.model.get('comprador').cactividades];
          var memo = "";
          var render = _.reduce(subact, function(memo, item, index){
              console.log('reduce: [%s] [%s]: [%s]', item, index, memo);
              if(item) memo = memo + index + '/ ' ;
              return memo;

          },memo);
          console.log('returning: [%s]', render)
          return render;
        },
      };
    }
  });

  


});
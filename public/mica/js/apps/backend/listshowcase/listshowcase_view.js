DocManager.module("BackendApp.ListShowcase", function(ListShowcase, DocManager, Backbone, Marionette, $, _){

  var backendApp = DocManager.module('BackendApp');

  ListShowcase.MicaShowcaseItemView = Marionette.ItemView.extend({
    getTemplate: function(){
      return utils.templates.MicaShowcaseItemView;
    },
    
    templateHelpers: function(){
      var self = this;
      return {
        formatDate: function(date){
          //return 'mingaLaFecha'
          return moment(date).format('dddd LL');
        },
        getFieldLabel: function(fieldName){
          return self.model.getFieldLabel(fieldName);
        },
        getIntegrantes: function(){
          return self.model.getIntegrantes();
        },
        getMusicReferences: function(){
          return self.model.getMusicReferences();
        },
        getAEscenicReferences: function(){
          return self.model.getAEscenicReferences();
        },
        getGeneros: function(){
          return self.model.getGeneros();

        },
        isMusica: function(){
          return self.model.isMusica();
        },
        isAEscenicas: function(){
          return self.model.isAEscenicas();
        },



        hasVendorProfiles: function(){
          return self.model.hasVendorProfiles();
        },
        hasCompradorProfiles: function(){
          return self.model.hasCompradorProfiles();
        },
        
        vendorSubActivities: function(){
          var subact = self.model.get('vendedor')['sub_' + self.model.get('vendedor').vactividades];
          var memo = "";
          var render = _.reduce(subact, function(memo, item, index){
              //console.log('reduce: [%s] [%s]: [%s]', item, index, memo);
              if(item) memo = memo + index + '/ ' ;
              return memo;

          },memo);
          //console.log('returning: [%s]', render)
          return render;
        },

        compradorSubActivities: function(){
          var subact = self.model.get('comprador')['sub_' + self.model.get('comprador').cactividades];
          var memo = "";
          var render = _.reduce(subact, function(memo, item, index){
              //console.log('reduce: [%s] [%s]: [%s]', item, index, memo);
              if(item) memo = memo + index + '/ ' ;
              return memo;

          },memo);
          //console.log('returning: [%s]', render)
          return render;
        },
      };
    }
  });

  


});
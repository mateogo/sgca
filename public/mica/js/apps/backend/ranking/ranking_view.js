DocManager.module("BackendApp.RankingMica", function(RankingMica, DocManager, Backbone, Marionette, $, _){

  var backendApp = DocManager.module('BackendApp');

  RankingMica.MicaRankingItemView = Marionette.LayoutView.extend({
    getTemplate: function(){
      return utils.templates.MicaRankingItemView;
    },

    regions: {
      //navbarRegion:  '#navbar-region',
      receptorRegion:  '#js-receptor-region',
      emisorRegion:    '#js-emisor-region',

    },

    onRender: function(){
      var self = this;

      $.when(DocManager.request("micainteractions:query:emisorlist", self.model)).done(function(list){

        var emisorList = new RankingMica.MicaRankingEmisorCollectionView({collection: list});
        self.emisorRegion.show(emisorList);

      });

      $.when(DocManager.request("micainteractions:query:receptorlist", self.model)).done(function(list){

        var receptorList = new RankingMica.MicaRankingEmisorCollectionView({collection: list});
        self.receptorRegion.show(receptorList);

      });



    },

    templateHelpers: function(){
      var self = this;
      return {
        formatDate: function(date){
          return moment(date).format('dddd LL');
        },
        getFieldLabel: function(fieldName){
          return self.model.getFieldLabel(fieldName);
        },
        rolMica: function(){
          return self.model.rolLabel();
        },
        getActividad: function(){
          return self.model.getActividadLabel();
        },
        getTdataLabel: function(list, field){
          return tdata.fetchLabel(tdata[list], field)
        },
      };
    }
  });



  RankingMica.MicaRankingActorView = Marionette.ItemView.extend({
    getTemplate: function(){
      return utils.templates.MicaRankingActorListItem;
    },
    initialize: function(opts){

    },

    templateHelpers: function(){
      var self = this;
      return {
        formatDate: function(date){
          return moment(date).format('dddd LL');
        },
        getFieldLabel: function(fieldName){
          return self.model.getFieldLabel(fieldName);
        },
        rolMica: function(){
          return self.model.rolLabel();
        },
        getActividad: function(){
          return self.model.getActividadLabel();
        },
        getTdataLabel: function(list, field){
          return tdata.fetchLabel(tdata[list], field)
        },
      };
    }    
  });

  RankingMica.MicaRankingEmisorCollectionView = Marionette.CollectionView.extend({

    childView: RankingMica.MicaRankingActorView,

    initialize: function(opts){
      this.options = opts;


    },
 
    events: {
    },

    onRender: function(){
      //console.log('[%s] RENDER ',this.whoami)      
    },

    childEvents: {

    },


    childViewOptions: function(model, index) {
    },
  });


});


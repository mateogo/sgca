DocManager.module("BackendApp.RankingMica", function(RankingMica, DocManager, Backbone, Marionette, $, _){

  var backendApp = DocManager.module('BackendApp');

  RankingMica.MicaRankingLayoutView = Marionette.LayoutView.extend({
    getTemplate: function(){
      return utils.templates.MicaRankingItemLayout;
    },

    regions: {

      interactionRegion: '#interaction-region',
      showRegion: '#show-region',
      editRegion: '#edit-region',

    },

    onRender: function(){
      var self = this;
    },

    events: {
      'click button.js-close': 'closeView',
      'click button.js-aceptar-micaranking': 'aceptarMicaranking',
      'click .js-openagenda': 'openAgenda',
    },

    aceptarMicaranking: function(e){
      this.trigger('accept:micaranking');
    },

    closeView: function(e){
      this.trigger('close:view');
    },

    openAgenda: function(e){
      e.stopPropagation();
      var rol = $(e.currentTarget).data('rol');
      DocManager.trigger('micaagenda:agendaone:show:popup',this.model.get('profileid'),rol);
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
          var comprador = self.model.isCompradorLabel();
          var vendedor = self.model.isVendedorLabel();
          if(comprador){
            comprador = ' <a class="btn-link js-openagenda" style="cursor:pointer" data-rol="comprador" data-tooltip="ver agenda como comprador">'+comprador+'</a> ';
          }
          if(vendedor){
            vendedor = ' <a class="btn-link js-openagenda" style="cursor:pointer" data-rol="vendedor" data-tooltip="ver agenda como vendedor">'+vendedor+'</a> ';
          }
          return comprador + vendedor;
        },
        getActividad: function(){
          return self.model.getActividadLabel();
        },
        getSubActividad: function(){
          if(self.model.get('iscomprador')){
            return self.model.buildCSubSectorList();
          }else{
            return self.model.buildVSubSectorList();
          }
        },
        getTdataLabel: function(list, field){
          return tdata.fetchLabel(tdata[list], field)
        },
      };
    }
  });


  RankingMica.MicaProfileViewLayout = Marionette.LayoutView.extend({
    getTemplate: function(){
      return utils.templates.MicaRankingProfileLayout;
    },

    regions: {
      //navbarRegion:  '#navbar-region',
      viewRegion:      '#view-region',

    },

    onRender: function(){
    },

    templateHelpers: function(){
      var self = this;
      return {
        formatDate: function(date){
          return moment(date).format('dddd LL');
        },
      };
    },

    events: {
      'click button.js-close': 'closeView',
    },

    closeView: function(e){
      this.trigger('close:view');
    }

  });



  RankingMica.MicaRankingActorView = Marionette.ItemView.extend({
    getTemplate: function(){
      return utils.templates.MicaRankingActorListItem;
    },
    initialize: function(opts){

    },

    events: {

      'click .js-emisor-profile-view' : 'viewEmisorProfile',
      'click .js-receptor-profile-view' : 'viewReceptorProfile',
      'click .js-asignar': 'doAsign'

    },
    viewEmisorProfile: function(e){
      e.preventDefault();
      e.stopPropagation();
      console.log('Click CollectionView');
      this.trigger('view:profile', this.model, this.model.get('emisor_inscriptionid'));

    },

    viewReceptorProfile: function(e){
      e.preventDefault();
      e.stopPropagation();
      console.log('Click CollectionView');
      this.trigger('view:profile', this.model, this.model.get('receptor_inscriptionid'));

    },

    doAsign: function(e){
      e.preventDefault();
      e.stopPropagation();
      //TODO: trigger y delegar al controller
      var p = DocManager.request('micaagenda:assign', this.model);
      p.done(function(response){
        var num = response.num_reunion;
        Message.success('Asignado a #'+num);
      }).fail(function(){
        Message.error('No se pudo asignar');
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
      'view:profile': function(view, model, profileId){
        console.log('Bubbled event [%s]',  model.get('slug'));
        this.trigger('view:profile', model, profileId);
      }

    },


    childViewOptions: function(model, index) {
    },
  });

// Deprecated ====================
  RankingMica.MicaRankingItemViewAnt = Marionette.LayoutView.extend({
    getTemplate: function(){
      return utils.templates.MicaRankingItemView;
    },

    regions: {
      //navbarRegion:  '#navbar-region',
      asignadaRegion:  '#js-asignada-region',
      profileRegion:   '#js-profile-region',
      receptorRegion:  '#js-receptor-region',
      emisorRegion:    '#js-emisor-region',

    },

    onRender: function(){
      var self = this;

      $.when(DocManager.request("micainteractions:query:emisorlist", self.model)).done(function(list){

        var emisorList = new RankingMica.MicaRankingEmisorCollectionView({collection: list});
        emisorList.on('view:profile', function(model, profileId){
          console.log('Bubbled at emisor MicaRankingItemView')
          self.trigger('profile:view', model, profileId);
        });
        self.emisorRegion.show(emisorList);

      });

      $.when(DocManager.request("micainteractions:query:receptorlist", self.model)).done(function(list){

        var receptorList = new RankingMica.MicaRankingEmisorCollectionView({collection: list});
        receptorList.on('view:profile', function(model, profileId){
          console.log('Bubbled at receptor MicaRankingItemView')
          self.trigger('profile:view', model, profileId);
        });
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




});

DocManager.module("RondasApp.Browse", function(Browse, DocManager, Backbone, Marionette, $, _){

  var backendApp = DocManager.module('RondasApp');
  var getSession = function(){
    if(!Browse.Session){
      Browse.Session = {views:{},model:null};
    }
    return Browse.Session;
  }

  Browse.BrowseProfileView = Marionette.ItemView.extend({
    getTemplate: function(){
      return utils.templates.BrowseProfileView;
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

  Browse.BrowseProfilesFilterEditor = Marionette.ItemView.extend({
    whoami: 'BrowseProfilesFilterEditor:browse_views.js',
    tagName: "div",
    attributes: {
      id: 'browse-filter'
    },

    getTemplate: function(){
      return utils.templates.FilterProfilesLayout;
    },

    templateHelpers: function(){
      var self = this;
    },

    initialize: function(opts){
      this.options = opts;
    },
    
    onRender: function(){
      this.initForm();
      
    },

    templateHelpers: function(){
      var self = this;

      return {
        isFavorito: function(){
          if(this.model.get('favorito') === true){
            return true;
          }else{
            return false;
          }
        },
      }
    },
 
      
    initForm: function(){
      console.log('Filter FORM: [%s] [%s]', this.model.whoami, this.model.get('favorito'))
      var form = new Backbone.Form({
        model: this.model,
        template: utils.templates.FilterProfilesEditor,
      });
      
      form.render();
      this.$el.find('#fieldsContainer').html(form.el);
      this.form = form;
      

      form.on('sector:change', function(form, editorContent) {
          var contenido = editorContent.getValue(),
              newOptions = tdata.subSectorOL[contenido];
          form.fields.subsector.editor.setOptions(newOptions);
      });

      if(this.model.get('favorito')){
        this.form.$('.js-filter-favorito').toggleClass('active');

      }
      // this.form.$('.js-filter-favorito').click(function(){
      //   console.log('SSSSSIIIIIII');
      //   this.model.set('favorito', !this.model.get('favorito'));
      //   this.$("js-filter-favorito").toggleClass('active');
      // });
      
    },
        
    _updateUI: function(){ 
      //actualiza Backbone.Form
      var fieldsForms = this.form.fields;
      for(var field in fieldsForms){
        var value = this.model.get(field);
        if(value){
          fieldsForms[field].editor.setValue(value);
        }
      }
      
      this.mapHandler._updateUI();
    },
    
    events: {
      'click .js-browse': 'browseData',
      'click .js-previous-page': 'previousPage',
      'click .js-next-page': 'nextPage',
      'click .js-filter-favorito': 'toggleFavoritos',
      'click .js-reuniones-recibidas':  'filterReunionesRecibidas',
      'click .js-reuniones-solicitadas': 'filterReunionesSolicitadas',
    },

    filterReunionesRecibidas: function(e){
      e.preventDefault();
      e.stopPropagation();
      this.form.commit();
      this.model.set('reurecibida', 1);
      this.model.set('reusolicitada', 0);
      this.triggerRecordsFetching();
      console.log('Recibidas [%s]',this.model.get('reurecibida'));

    },

    filterReunionesSolicitadas: function(e){
      e.preventDefault();
      e.stopPropagation();
      this.form.commit();
      this.model.set('reurecibida', 0);
      this.model.set('reusolicitada', 1);
      this.triggerRecordsFetching();
      console.log('toggleSolicitadas [%s]',this.model.get('reusolicitada'))

    },

    triggerRecordsFetching: function(){
      DocManager.trigger(this.options.filterEventName, this.model, 'reset');
    },

    toggleFavoritos: function(e){
      e.preventDefault();
      e.stopPropagation();
      console.log('toggleFavoritos [%s]',this.model.get('favorito'))
      this.model.set('favorito', !this.model.get('favorito'));
      this.form.$(".js-filter-favorito").toggleClass('active');
    },

    nextPage: function(e){
      this.form.commit();
      DocManager.trigger(this.options.filterEventName, this.model, 'next');

    },
    previousPage: function(e){
      this.form.commit();
      DocManager.trigger(this.options.filterEventName, this.model, 'previous');

    },

    browseData: function(e){
      this.form.commit();
      this.model.set('reurecibida', 0);
      this.model.set('reusolicitada', 0);
      DocManager.trigger(this.options.filterEventName, this.model, 'reset');
    },
    
    doneEdition: function(){
      DocManager.trigger('location:list',this.action);
    },
    
  });


//aca1
  Browse.ProfileItem = Marionette.ItemView.extend({
    tagName: "li",

    getTemplate: function(){
      return utils.templates.ProfileItemView;
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
        getAvatar: function(){
          return self.model.getAvatar();
        },
        isFavorito: function(){
          var userid = getSession().currentUser.id
          if(userid && self.model.get(userid) && self.model.get(userid).favorito === true){
            return true;
          }else{
            return false;
          }
        },
        hasMeeting: function(){
          var userid = getSession().currentUser.id,
              myprofile = getSession().micarqst;

          if(myprofile.hasReunionSolicitada(userid, self.model)){
            return '¡Reunión Solicitada!';
          }else if(myprofile.hasReunionRecibida(userid, self.model)){
            return '¡Pedido de Reunión Recibida!';
          }else if(myprofile.isReunionPermited(self.model)){
            return 'Solicitar Reunión';
          }else{
            return '';
          }
        },
      }
    },
 
    initialize: function(){

      //console.log('ProfileItem ITEM View: INIT')
    },

    events: {
      "click .js-productbrowse": "viewProduct",
      "click .js-profile-view": "viewProfile",
      "click .js-add-to-favorite": "addToFavorite",
      "click .js-interact-reunion": "addMeeting",
    },

    addMeeting: function(e){
      e.preventDefault();
      e.stopPropagation();
      var self = this,
          userid = getSession().currentUser.id,
          myprofile = getSession().micarqst;

      if(myprofile.hasReunionSolicitada(userid, self.model)){
        modificoReunionSolicitada(self, self.model, myprofile, userid);
      }else if(myprofile.hasReunionRecibida(userid, self.model)){
        contestoReunionRecibida(self, self.model, myprofile, userid);
      }else if(myprofile.isReunionPermited(self.model)){
        solicitoReunion(self, self.model, myprofile, userid);
      }else{
        return '';
      }

    },

    addToFavorite: function(e){
      e.preventDefault();
      e.stopPropagation();
      console.log('addToFavorite CLICK!!!');
      getSession().views.mainlayout.trigger('toggle:profile:favorite',this.model);
      this.$(".js-add-to-favorite").toggleClass('active');

    },

    viewProfile: function(e){
      e.preventDefault();
      e.stopPropagation();
      console.log('ViewProfile CLICK!!!');
      // this.trigger('grid:model:edit',this.model, function(){
      //     //no hay callbacl. futuros usos
      // });
      getSession().views.mainlayout.trigger('grid:model:edit',this.model);

    },

    viewProduct: function(){

      this.trigger('view:related:product',this.model, function(){
          //no hay callbacl. futuros usos
      });


    },

    remove: function(){
      var self = this;
      this.$el.fadeOut(function(){
        Marionette.ItemView.prototype.remove.call(self);
      });
    }
  });

  Browse.ProfileCollection = Marionette.CollectionView.extend({
    whoami: 'ProfileCollection:browse_views.js',
    tagName: "ul",
    className: "list-unstyled",
    attributes: {
      id: 'profiles-collection-hook'
    },

    childView: Browse.ProfileItem,

    initialize: function(){
      //console.log('ProfileItem View: INIT')
    },

  });

  // ************************************************
  // ***********  Controler Functions ***************
  // ************************************************
  var solicitoReunion = function(view, otherprofile, myprofile, userid){
    console.log('Solicitar Reunión  CLICK!!!');
    getSession().views.mainlayout.trigger('add:meeting:rondas',otherprofile);
    view.$(".js-interact-reunion").toggleClass('active');
    view.$(".js-interact-reunion").html('¡Reunión Solicitada!');
  };
  var modificoReunionSolicitada = function(view, otherprofile, myprofile, userid){
    console.log('TODO Modificar Reunión  CLICK!!!');
    getSession().views.mainlayout.trigger('answer:meeting:rondas',otherprofile);
  };
  var contestoReunionRecibida = function(view, otherprofile, myprofile, userid){
    console.log('Contesto Reunión  CLICK!!!');
    getSession().views.mainlayout.trigger('answer:meeting:rondas',otherprofile);
  };

});
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
        
        vendorSubActivities: function(){
          var subact = self.model.get('vendedor')['sub_' + self.model.get('vendedor').vactividades];
          var memo = "";
          var render = _.reduce(subact, function(memo, item, index){
              if(item) memo = memo + '<span class="label label-tag">' + tdata.getSubactLabel(self.model.get('vendedor').vactividades, index) + '</span> '  ;
              return memo;

          },memo);
          return render;
        },

        compradorSubActivities: function(){
          var subact = self.model.get('comprador')['sub_' + self.model.get('comprador').cactividades];
          var memo = "";
          var render = _.reduce(subact, function(memo, item, index){
              if(item) memo = memo + '<span class="label label-tag">' + tdata.getSubactLabel(self.model.get('comprador').cactividades, index) + '</span> '  ;
              return memo;

          },memo);
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
      if(this.model.get('receptor')){
        this.form.$('.js-reuniones-recibidas').addClass('active');
      }
      if(this.model.get('emisor')){
        this.form.$('.js-reuniones-solicitadas').addClass('active');
      }
      
    },
        
    _updateUI: function(){ 
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

    browseData: function(e){
      e.preventDefault();
      e.stopPropagation();
      this.formCommit();

      this.model.set('receptor', 0);
      this.model.set('emisor', 0);
      this.triggerRecordsFetching();
    },
    
    filterReunionesRecibidas: function(e){
      e.preventDefault();
      e.stopPropagation();
      this.form.commit();
      
      this.model.set('receptor', 1);
      this.model.set('emisor', 0);
      this.triggerRecordsFetching();
    },

    filterReunionesSolicitadas: function(e){
      e.preventDefault();
      e.stopPropagation();
      this.formCommit();
      
      this.model.set('receptor', 0);
      this.model.set('emisor', 1);
      this.triggerRecordsFetching();
    },

    toggleFavoritos: function(e){
      e.preventDefault();
      e.stopPropagation();
      this.formCommit();

      this.model.set('favorito', !this.model.get('favorito'));
      this.form.$(".js-filter-favorito").toggleClass('active');
      this.triggerRecordsFetching();
    },

    triggerRecordsFetching: function(){
      DocManager.trigger(this.options.filterEventName, this.model, 'reset');
    },
    nextPage: function(e){
      this.formCommit();
      DocManager.trigger(this.options.filterEventName, this.model, 'next');
    },
    previousPage: function(e){
      this.formCommit();
      DocManager.trigger(this.options.filterEventName, this.model, 'previous');
    },

    formCommit: function(){
      this.form.commit();
      this.model.set({estado_alta:'activo', nivel_ejecucion:'no_definido'});
    },

    doneEdition: function(){
      //DocManager.trigger('location:list',this.action);
    },
    
  });


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
        fetchLabel: function(list, key){
          tdata.fetchLabel(list, key)

        },
        getAvatar: function(){
          return self.model.getAvatar();
        },
        isFavorito: function(){
          return self.model.isFavorito(getSession().currentUser.id)
        },
        isComprador: function(){
          return self.model.isComprador();
        },
        isVendedor: function(){
          return self.model.isVendedor();
        },


        hasMeeting: function(){
          var userid = getSession().currentUser.id;

          if(self.model.hasReunionSolicitada(userid)){
            return '¡Reunión Solicitada!';
          }else if(self.model.hasReunionRecibida(userid)){
            return '¡Pedido de Reunión Recibida!';
          }else if(self.model.isReunionPermited(getSession().micarqst)) {
            return 'Solicitar Reunión';
          }else{
            return 'Ver perfil';
          }
        },
        hasResponse: function(){
          var userid = getSession().currentUser.id;
          if(self.model.hasResponse(userid))
            return 'active';
          else
            return '';


        },
        hasMeetingClassAttr: function(){
          var userid = getSession().currentUser.id;

          if(self.model.hasReunionSolicitada(userid)){
            return 'solicitada';
          }else if(self.model.hasReunionRecibida(userid)){
            return 'recibida';
          }else{
            return '';
          }

        },
      }
    },
 
    initialize: function(){

    },

    events: {
      "click .js-productbrowse": "viewProduct",
      "click .js-profile-view": "viewProfile",
      "click .js-interactions-view": "viewInteractions",
      "click .js-drop-interaction": "dropInteraction",
      "click .js-add-to-favorite": "addToFavorite",
      "click .js-interact-reunion": "addMeeting",
    },

    addMeeting: function(e){
      e.preventDefault();
      e.stopPropagation();
      var self = this,
          userid = getSession().currentUser.id,
          myprofile = getSession().micarqst;

      if(self.model.hasReunionSolicitada(userid)){
        modificoReunionSolicitada(self, self.model, myprofile, userid);
      }else if(self.model.hasReunionRecibida(userid)){
        contestoReunionRecibida(self, self.model, myprofile, userid);
      }else if(self.model.isReunionPermited(myprofile)){
        solicitoReunion(self, self.model, myprofile, userid);
      }else{
        //va a vista detalle
        getSession().views.mainlayout.trigger('grid:model:edit',self.model);
      }

    },

    addToFavorite: function(e){
      e.preventDefault();
      e.stopPropagation();
      getSession().views.mainlayout.trigger('toggle:profile:favorite',this.model);
      this.$(".js-add-to-favorite").toggleClass('active');

    },

    dropInteraction: function(e){
      e.preventDefault();
      e.stopPropagation();
      var self = this;
      DocManager.confirm(utils.templates.InteractionResumeView(),{okText: 'Aceptar', cancelText: 'cancelar'}).done(function(){
        DocManager.request('micainteractions:drop:interaction', getSession().currentUser, getSession().micarqst,    self.model);
      });

    },

    viewInteractions: function(e){
      e.preventDefault();
      e.stopPropagation();
      DocManager.confirm(utils.templates.InteractionResumeView(),{okText: 'Aceptar', cancelText: 'cancelar'}).done(function(){
         self.$('#legal').prop('checked', true);
      });
    },

    viewProfile: function(e){
      e.preventDefault();
      e.stopPropagation();
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
    },

  });

  // ************************************************
  // ***********  Controler Functions ***************
  // ************************************************
  var solicitoReunion = function(view, otherprofile, myprofile, userid){
    getSession().views.mainlayout.trigger('add:meeting:rondas',otherprofile, view);
  };

  var modificoReunionSolicitada = function(view, otherprofile, myprofile, userid){
    getSession().views.mainlayout.trigger('add:meeting:rondas',otherprofile, view);
  };

  var contestoReunionRecibida = function(view, otherprofile, myprofile, userid){
    getSession().views.mainlayout.trigger('answer:meeting:rondas',otherprofile, view);
  };

});
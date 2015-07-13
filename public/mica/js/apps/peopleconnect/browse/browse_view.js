DocManager.module("RondasApp.Browse", function(Browse, DocManager, Backbone, Marionette, $, _){

  var backendApp = DocManager.module('RondasApp');

  Browse.MicaRequestView = Marionette.ItemView.extend({
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
    
    initForm: function(){
      var form = new Backbone.Form({
        model: this.model,
        template: utils.templates.FilterProfilesEditor,
      });
      
      form.render();
      this.$el.find('#fieldsContainer').html(form.el);
      this.form = form;
      

      form.on('sector:change', function(form, editorContent) {
          console.log('onchange:key');
          var contenido = editorContent.getValue(),
              newOptions = tdata.subSectorOL[contenido];
          form.fields.subsector.editor.setOptions(newOptions);
      });
      
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
    },
    nextPage: function(e){
      console.log('NExt DATA!!!!!!: [%s]', this.options.filterEventName)
      this.form.commit();
      DocManager.trigger(this.options.filterEventName, this.model, 'next');

    },
    previousPage: function(e){
      console.log('Previous DATA!!!!!!: [%s]', this.options.filterEventName)
      this.form.commit();
      DocManager.trigger(this.options.filterEventName, this.model, 'previous');

    },

    browseData: function(e){
      console.log('Browse DATA!!!!!!: [%s]', this.options.filterEventName)
      this.form.commit();
      DocManager.trigger(this.options.filterEventName, this.model, 'reset');
    },
    
    doneEdition: function(){
      DocManager.trigger('location:list',this.action);
    },
    
  });

  Browse.ProfileItem = Marionette.ItemView.extend({
    tagName: "div",

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
      }
    },
 
    initialize: function(){
      console.log('ProfileItem ITEM View: INIT')
    },

    events: {
      "click .js-productbrowse": "viewProduct",
      "click .js-productedit": "editProduct",
    },

    editProduct: function(){
      console.log('clie Edit PRODUCT!')

      this.trigger('edit:related:product',this.model, function(){
          //no hay callbacl. futuros usos
      });


    },

    viewProduct: function(){
      console.log('clie View PRODUCT!')

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
    tagName: "div",
    className: "list",
    attributes: {
      id: 'profiles-collection-hook'
    },

    childView: Browse.ProfileItem,

    initialize: function(){
      console.log('ProfileItem View: INIT')
    },

  });


 
});
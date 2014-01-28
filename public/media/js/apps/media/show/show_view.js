MediaManager.module("MediaApp.Show", function(Show, MediaManager, Backbone, Marionette, $, _){
  Show.MissingMedia = Marionette.ItemView.extend({
    template: _.template('<div class="alert alert-error">Esta media no fue encontrada</div>'),
  });

  Show.Layout = Marionette.Layout.extend({
    //className: 'row row-offcanvas row-offcanvas-left',

    getTemplate: function(){
      return utils.templates.MediaShowLayout;
    },

    events: {
      "click a.js-ciclo": "editCiclo",
      "click a.js-capitulo": "editCapitulo",

      "click a.js-realization": "realization",
      "click a.js-clasification": "clasification",
    },

    editCiclo: function(e){
      e.preventDefault();
      console.log('Ciclo Clicked');
      this.$('.js-ciclo').closest('li').toggleClass('active',true);
      this.$('.js-capitulo').closest('li').toggleClass('active',false);
      this.trigger('chapter:serie:toggle', 'ciclo');

      return false;

    },

    editCapitulo: function(e){
      e.preventDefault();
      console.log('Capitulo Clicked');
      this.$('.js-ciclo').closest('li').toggleClass('active',false);
      this.$('.js-capitulo').closest('li').toggleClass('active',true);
      this.trigger('chapter:serie:toggle', 'capitulo');
      return false;
    },

    realization: function(e){
      e.preventDefault();
      var target = e.target;
      console.log('Realization [%s]', this.$(target).data('key'));
      this.$(target).button();
      this.$(target).button('toggle');
      this.trigger('token:selected', this.$(target).data('key'));

      return false;
    },

    clasification: function(e){
      e.preventDefault();
      var target = e.target;
      console.log('Realization [%s]', this.$(target).data('key'));
      this.$(target).button();
      this.$(target).button('toggle');
      this.trigger('token:selected', this.$(target).data('key'));

      return false;
    },

    
    regions: {
      selectorRegion:   '#selector-region',
      brandingRegion:   '#branding-region',
      productRegion:    '#product-region',
      playerRegion:     '#player-region'
    }
  });



  Show.Media = Marionette.ItemView.extend({

   getTemplate: function(){
      return utils.templates.MediaDataView;
    },

    initialize: function(options){
      this.options = options;

    },
 
    events: {
      "click a.js-edit": "editClicked"
    },

    editClicked: function(e){
      e.preventDefault();
      this.trigger("media:edit", this.model);
    },

    onRender: function(){
      var self = this;
      console.log('onRender [%s]',$('#player-region'));

      self.$('#bform').html(self.options.form.el);

    },

    getFile: function(){
      var chapters = this.model.get('chapters');
      var chapter = chapters[this.model.get('selectedChapter')];
      var url = chapter.branding[0].url;
      console.log('getFIle: [%s]',url);
      return url;
    },
  });

  Show.editProduct = function(product, token){
        console.log('EditProduct [%s] [%s]',product.get('slug'),token);
        var self = this,
            //facet = new MediaManager.Entities.ProductTextFacet(),
            facet = product.getFacet(token),
            form = new Backbone.Form({
                model: facet
            }).render();


        form.on('change', function(form, editorContent) {
            console.log('change');
            var errors = form.commit();
            return false;
        });

        form.on('blur', function(form, editorContent) {
            var errors = form.commit();
            console.log('FORM BLUR [%s]', facet.get('datafield'));
            product.setFacet(token, facet);
            return false;
        });
        
        var mediaView = new Show.Media({
          model:facet,
          form: form
        });
        return mediaView;

  };

  Show.Search = MediaManager.MediaApp.Common.Views.SearchPanel.extend({
    initialize: function(options){
      this.optiones = options;
      var self = this;
    }, 
  });


  // ventana modal
  Show.modalSearchEntities = function(type, query, cb){
        var options = {
          documents: {
            title:'buscar comprobantes',
            collection: new MediaManager.Entities.ComprobanteCollection(),
            model: new Backbone.Model({query:query}),
            searchtrigger:"document:filtered:entities",
            itemViewOptions:{
              itemtype:'documentos'
            }
          },

          persons: {
            title:'buscar personas',
            collection: new MediaManager.Entities.PersonCollection(),
            model: new Backbone.Model({query:query}),
            searchtrigger:"person:filtered:entities",
            itemViewOptions:{
              itemtype:'persons'
            }  
          },

          products: {
            title:'buscar productos',
            collection: new MediaManager.Entities.ProductCollection(),
            model: new Backbone.Model({query:query}),
            searchtrigger:"product:filtered:entities",
            itemViewOptions:{
              itemtype:'products'
            }  
          }

        }
        var form = new Show.Search(options[type]);

        form.on('itemview:item:found',function(form,model){
          if(cb) cb(model);
          modal.close();
        });
            
        var modal = new Backbone.BootstrapModal({
            content: form,
            title: options[type].title,
            okText: 'aceptar',
            cancelText: 'cancelar',
            animate: false
        });

        modal.open(function(){
            console.log('ME CERRARON [%s]');
        });
  };



  Show.HeaderForm = MediaManager.MediaApp.Common.Views.Form.extend({
    
    tagName:'div',
    className: 'panel panel-default',

    getTemplate: function(){
      return utils.templates.MediaShowHeadForm;
    },

    initialize: function(options){
      var self = this;
      this.events = _.extend({},this.formevents,this.events);
      this.delegateEvents();
   },

    events: {
      "click .js-personsch": "personsearch",
    },

    personsearch: function(){
      var self = this,
          query = this.$('#personsch').val();

      console.log('personsearch [%s]',query);
      this.trigger('person:select', query, function(entity){
        self.model.set({persona:entity.get('nickName')});
        self.model.set({personaid:entity.id});
        self.render();
      });
    },
  });

});

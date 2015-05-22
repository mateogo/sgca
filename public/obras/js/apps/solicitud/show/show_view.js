DocManager.module('SolicitudApp.Show', function(Show, DocManager, Backbone, Marionette, $, _){

  var ObrasAppList = DocManager.module('ObrasApp.List');
  var AutorAppShow = DocManager.module('AutorApp.Show');

  var Entities = DocManager.module('Entities');

  Show.ShowLayoutView = Marionette.LayoutView.extend({
    getTemplate: function(){
      return utils.templates.ShowSol;
    },

    regions: {
      descriptionRegion: '#description-region',
      exportadoresRegion: '#exportadores-region',
      obrasRegion : '#obras-region',
      autoresRegion: '#autores-region'
    },

    onRender: function(){
      this.descriptionRegion.show(new Show.DescriptionView({model:this.model}));

      var exporters = this.model.get('exporters');
      var obras = this.model.get('obras');

      var autores = new Entities.AutorCollection();

      obras.each(function(obra){
        autores.addAutor(obra.get('autor'));
      });


      this.exportadoresRegion.show(new ExporadoresView({collection:new Backbone.Collection(exporters)}));
      this.obrasRegion.show(new ShowGenericoView({title:'Obras',ListView:ObrasList,model:obras}));
      this.autoresRegion.show(new ShowGenericoView({title:'Autores',ListView:AutoresList,model:autores}));
    }

  });


  Show.DescriptionView = Marionette.ItemView.extend({
    getTemplate: function(){
      return utils.templates.ShowSolDescription;
    }

  });

  Show.ExportadorView = Marionette.ItemView.extend({
    initialize: function(opts){
      this.childIndex = opts.childIndex;
    },
    getTemplate: function(){
      return utils.templates.ShowExportador;
    },

    templateHelpers: function(){
      return {
        getUrl: function(assets){
          if(assets){
            return '/'+ assets.get('urlpath');
          }
          return '';
        }
      };
    },

    onRender: function(){
      if(this.childIndex > 0){
        var $title = this.$el.find('h3');
        $title.html($title.html() + ' '+ (this.childIndex + 1));
      }
    },


  });

  var ExporadoresView = Marionette.CollectionView.extend({
      childView: Show.ExportadorView,
      childViewOptions: function(model, index) {
        return {
          childIndex: index
        };
      },
  });


  var ObrasList = Marionette.CollectionView.extend({
    childView:ObrasAppList.ObraItem
  });


  var AutoresList = Marionette.CollectionView.extend({
    className: 'list-decorator',
    childView: AutorAppShow.ShowAutorView
  });

  var ShowGenericoView = Marionette.ItemView.extend({
      initialize: function(opts){
        this.ListView = opts.ListView;
        this.collection = opts.model;
        this.model = new Backbone.Model({title:opts.title});
      },
      getTemplate: function(){
        return utils.templates.ShowGenerico;
      },
      onRender: function(){
        var list = new this.ListView({collection:this.collection});
        this.$el.find('#list-region').html(list.render().el);
      }
  });

});

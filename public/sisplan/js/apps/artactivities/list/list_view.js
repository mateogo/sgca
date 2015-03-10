DocManager.module("ArtActivitiesApp.List", function(List, DocManager, Backbone, Marionette, $, _){
  
  var Entities =  DocManager.module('Entities');
  
  List.Layout = Marionette.LayoutView.extend({
    className: 'row row-offcanvas row-offcanvas-left',

    getTemplate: function(){
      return utils.templates.ArtActivityListLayoutView;
    },
    
    regions: {
      navbarRegion:  '#navbar-region',
      filterRegion:    '#filter-region',
      mainRegion:    '#main-region'
    },
    
    events: {
      'click .js-filter': 'filterClicked',
      'click .js-filterclear': 'filterClearClicked',
    },
    
    setFilter: function(filter){
      this.filter = filter;
      var container = this.$el.find('#filterTags');
      container.empty();
      if(filter){
        _.each(filter.toJSON(),function(value,key){
          var $tag = $('<span></span>',{'class':'label label-info',text:value,style:'margin-right:5px'});
          container.append($tag);
        });
        container.append('<a class="btn-link js-filterclear">borrar filtro</a>');
      }
    },
    
    filterClicked: function(e){
      List.FilterPopup(this.filter);
    },
    
    filterClearClicked: function(e){
      DocManager.trigger('artactivities:filter',null);
    }
  });
  
  
  Backgrid.ActionsArtactivityCell = Backgrid.Cell.extend({
    // Cell default class names are the lower-cased and dasherized
    // form of the the cell class names by convention.
    className: "actions-artactivity-cell",
    render: function(){
        if(!this.rendered){
           var btnEdit = $('<button class="btn-link js-edit" title="editar"><span class="glyphicon glyphicon-edit"></span></button>');
           var btnRemove = $('<button class="btn-link js-trash" title="borrar"><span class="glyphicon glyphicon-remove"></span></button>');
           this.$el.append(btnEdit).append(btnRemove);
           this.rendered = true;
        }
       return this;
    },
    events: {
        'click button.js-edit': 'editClicked',
        'click button.js-trash': 'trashClicked',
        'click .js-filter': 'filterClicked'
    },
      
    editClicked: function(e){
        e.stopPropagation();e.preventDefault();
        DocManager.trigger('artActivity:edit',this.model);
    },
      
    trashClicked: function(e){
        e.stopPropagation();e.preventDefault();
        DocManager.trigger('artActivity:remove',this.model);
    }
  });
  

  List.GridCreator = function(collection){
    return new Backgrid.Grid({
        className: 'table table-condensed table-bordered table-hover',
        collection: collection,
        columns: [{name: 'cnumber',label: 'Actividad',cell: 'string',editable:false},
                  {name: 'action.cnumber',label: 'Acción',editable:false,
                    cell: Backgrid.Cell.extend({
                        render:function(){
                          //console.log('render',this);
                          var action = this.model.get('action');
                          var actionStr = (action)?action.cnumber: ''; 
                          this.$el.html(actionStr);
                          return this;
                        }
                    })
                  },
                  {name: 'fealta',label: 'Fecha Alta',cell: 'string',editable:false},
                  {name: 'slug',label: 'Asunto-Descripción',cell: 'string',editable:false},
                  {name: '',label: 'Acciones',cell: 'actionsArtactivity',editable:false}
                 ]
      });
  }; 
  
  List.FilterCreator = function(collection){
    return new Backgrid.Extension.ClientSideFilter({
        collection: collection,
        fields: ['cnumber','slug']
      });
  };
  
  
  List.FilterPopup = function(filter){
    if(!filter){
      filter=   new Entities.ArtActivityFilterFacet();
    }
    var form = new Backbone.Form({model:filter});
    
    var modal = new Backbone.BootstrapModal({
      content: form,
      title: 'Filtrar Actividades Artísticas',
      okText: 'aceptar',
      cancelText: 'cancelar',
      enterTriggersOk: false,
    });
    
    modal.on('ok',function(){
        form.commit();
        DocManager.trigger('artactivities:filter',filter);
    });
    
    modal.open();
  };

});
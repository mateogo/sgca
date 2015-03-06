DocManager.module("ArtActivitiesApp.List", function(List, DocManager, Backbone, Marionette, $, _){
  
  
  List.Layout = Marionette.LayoutView.extend({
    className: 'row row-offcanvas row-offcanvas-left',

    getTemplate: function(){
      return utils.templates.ArtActivityListLayoutView;
    },
    
    regions: {
      navbarRegion:  '#navbar-region',
      mainRegion:    '#main-region'
    }
  });
  
  
  Backgrid.ActionArtactivityCell = Backgrid.Cell.extend({
    // Cell default class names are the lower-cased and dasherized
    // form of the the cell class names by convention.
    className: "action-artactivity-cell",
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
    },
      
    editClicked: function(e){
        e.stopPropagation();e.preventDefault();
       //DocManager.trigger('location:edit',locationsApp.Model.selectedAction,this.model);
        DocManager.trigger('artActivity:edit',this.model);
    },
      
    trashClicked: function(e){
        e.stopPropagation();e.preventDefault();
        //DocManager.trigger('location:remove',locationsApp.Model.selectedAction,this.model);
    }
  });

  List.GridCreator = function(collection){
    return new Backgrid.Grid({
        className: 'table table-condensed table-bordered table-hover',
        collection: collection,
        columns: [{name: 'cnumber',label: 'Actividad',cell: 'string',editable:false},
                  {name: 'fealta',label: 'Fecha Alta',cell: 'string',editable:false},
                  {name: 'slug',label: 'Asunto-Descripción',cell: 'string',editable:false},
                  {name: '',label: 'Acciones',cell: 'actionArtactivity',editable:false}
                 ]
      });
  }; 

});
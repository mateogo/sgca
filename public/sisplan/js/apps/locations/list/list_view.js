DocManager.module("LocationsApp.List", function(List, DocManager, Backbone, Marionette, $, _){

  var locationsApp = DocManager.module('LocationsApp');
  
  List.Layout = Marionette.LayoutView.extend({
    className: 'row row-offcanvas row-offcanvas-left',

    getTemplate: function(){
      return utils.templates.LocationListLayoutView;
    },
    
    regions: {
      navbarRegion:  '#navbar-region',
      sidebarRegion: '#sidebar-region',
      linksRegion:   '#panel-region',
      mainRegion:    '#main-region',
      tableRegion: '#table-region',
      filterRegion : '#filter-region'    
    },
    
    events: {
      'click button.js-locationnew': 'newClicked'
    },
    
    newClicked: function(e){
      this.trigger('location:new');
    }
  });
  
  List.ActionNotFound = Marionette.ItemView.extend({
    getTemplate: function(){
      return utils.templates.ActionNotFound;
    }
  });
  
  Backgrid.ActionLocationCell = Backgrid.Cell.extend({
      // Cell default class names are the lower-cased and dasherized
      // form of the the cell class names by convention.
      className: "action-location-cell",
      render: function(){
          if(!this.rendered){
             var btnEdit = $('<button class="btn-link js-edit" title="editar"><span class="glyphicon glyphicon-edit"></span></button>');
             //var btnRemove = $('<button class="btn-link js-trash" title="borrar"><span class="glyphicon glyphicon-remove"></span></button>');
             this.$el.append(btnEdit)//.append(btnRemove);
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
          DocManager.trigger('location:edit', this.model);
      }
        
      /*trashClicked: function(e){
          e.stopPropagation();e.preventDefault();
          DocManager.trigger('location:remove',locationsApp.Model.selectedAction,this.model);
      }*/
    });
  
  
  List.GridCreator = function(collection){
      return new Backgrid.Grid({
          className: 'table table-condensed table-bordered table-hover',
          collection: collection,
          columns: [{name: 'displayName',label: 'Nombre',cell: 'string',editable:false},
                    {name: 'nickName',label: 'Alias',cell: 'string',editable:false},
                    {name: 'direccion',label: 'Dirección',cell: 'string',editable:false},
                    {label: 'Acciones',cell: 'actionLocation',editable:false,sortable:false}
                   ]
        });
  }; 
  
  
  List.FilterCreator = function(collection){
      return new Backgrid.Extension.ClientSideFilter({
          collection: collection,
          fields: ['name','displayName','direccion']
        });
  };
});
DocManager.module("EventsApp.List", function(List, DocManager, Backbone, Marionette, $, _){
  
  var Entities =  DocManager.module('Entities');
  
  List.Layout = Marionette.LayoutView.extend({
    className: 'row row-offcanvas row-offcanvas-left',

    getTemplate: function(){
      return utils.templates.EventListLayoutView;
    },
    
    regions: {
      headerInfoRegion: '#headerinfo-region',
      navbarRegion:  '#navbar-region',
      filterRegion:    '#filter-region',
      mainRegion:    '#main-region'
    },
    
    events: {
      'click .js-newevent': 'newEventClicked',
      'click .js-filter': 'filterClicked',
      'click .js-filterclear': 'filterClearClicked',
    },
    
    newEventClicked: function(){
      DocManager.trigger('event:new',this.model);
    },
    
    setFilter: function(filter){
      this.filter = filter;
      var container = this.$el.find('#filterTags');
      container.empty();
      if(filter){
        _.each(filter.toJSON(),function(value,key){
          var $tag = $('<span></span>',{'class':'label label-info',text:value,style:'margin-right:5px;font-size:0.8em'});
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
  
  
  var actionsCell = Backgrid.Cell.extend({
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
        DocManager.trigger('event:edit',this.model);
    },
      
    trashClicked: function(e){
        e.stopPropagation();e.preventDefault();
        DocManager.trigger('event:remove',this.model);
    }
  });
  
  var cnumberCell = Backgrid.Cell.extend({
    render:function(){
      var cnumber = this.model.get('cnumber');
      var link = $('<a></a>',{text:cnumber,'class':'js-open'});
      this.$el.html(link);
      return this;
    },
    events: {
      'click .js-open': 'open'
    },
    open: function(){
      DocManager.trigger('event:edit',this.model);
    }
  });  
  
  var fechaCell = Backgrid.Cell.extend({
    render:function(){
      var field = this.column.get('name');
      var value = this.model.get(field);
      var str = '';
      str = moment(value).format('D MMMM YYYY - H:mm');
      this.$el.html(str);
      return this;
    }
  });  
  

  List.GridCreator = function(collection){
    return new Backgrid.Grid({
        className: 'table table-condensed table-bordered table-hover',
        collection: collection,
        columns: [{name: 'cnumber',label: 'Evento',cell: cnumberCell,editable:false},
                  {name: 'headline',label: 'Titulo',editable:false, cell: 'string'},
                  {name: 'fdesde',label: 'Fecha desde',cell: fechaCell,editable:false},
                  {name: 'fhasta',label: 'Fecha hasta',cell: fechaCell,editable:false},
                  {name: 'estado_alta',label: 'Estado alta',cell: 'string',editable:false},
                  {name: '',label: 'Acciones',cell: actionsCell,editable:false}
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
      title: 'Filtrar Eventos',
      okText: 'aceptar',
      cancelText: 'cancelar',
      enterTriggersOk: false,
    });
    
    modal.on('ok',function(){
        form.commit();
        DocManager.trigger('events:filter',filter);
    });
    
    modal.open();
  };

});
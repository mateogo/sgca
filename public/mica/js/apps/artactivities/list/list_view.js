DocManager.module("ArtActivitiesApp.List", function(List, DocManager, Backbone, Marionette, $, _){

  var Entities =  DocManager.module('Entities');

  List.Layout = Marionette.LayoutView.extend({
    className: 'row row-offcanvas row-offcanvas-left wrapper',

    getTemplate: function(){
      return utils.templates.ArtActivityListLayoutView;
    },

    regions: {
      navbarRegion:  '#navbar-region',
      filterRegion:    '#filter-region',
      mainRegion:    '.main-region'
    },

    events: {
      'click .js-filter': 'filterClicked',
      'click .js-filterclear': 'filterClearClicked',
      'click .js-agenda': 'agendaClicked',
      'click .js-new': 'newClicked'
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
    },

    agendaClicked: function(e){
      DocManager.trigger('agenda:list',null);
    },
    
    newClicked: function(e){
      DocManager.trigger('artactivity:new',{});
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

  var activityCell = Backgrid.Cell.extend({
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
      DocManager.trigger('artActivity:edit',this.model);
    }
  });

  var actionCell = Backgrid.Cell.extend({
    render:function(){
      var action = this.model.get('action');
      var actionStr = (action)?action.cnumber: '';
      var link = $('<a></a>',{text:actionStr,'class':'js-openaction'});
      this.$el.html(link);
      return this;
    },
    events: {
      'click .js-openaction': 'openAction'
    },
    openAction: function(){
      DocManager.trigger('action:show',this.model.get('action_id'));
    }
  });

  var fieldLabelCell = Backgrid.Cell.extend({
    render:function(){
      var value = this.model.getFieldLabel(this.column.get('name'));
      this.$el.html(value);
      return this;
    }
  });



  List.GridCreator = function(collection){
    return new Backgrid.Grid({
        className: 'table table-condensed table-bordered table-hover',
        collection: collection,
        columns: [{name: 'cnumber',label: 'Actividad',cell: activityCell,editable:false},
                  {name: 'action.cnumber',label: 'Acción',editable:false, cell: actionCell},
                  {name: 'fealta',label: 'Fecha Alta',cell: 'string',editable:false},
                  {name: 'slug',label: 'Asunto-Descripción',cell: 'string',editable:false},
                  {name: 'estado_alta',label: 'Estado de alta',cell: fieldLabelCell,editable:false},
                  {name: 'nivel_ejecucion',label: 'Nivel de ejecución',cell: fieldLabelCell,editable:false},
                  {name: 'nivel_importancia',label: 'Importancia',cell: fieldLabelCell,editable:false},
                  {name: '',label: 'Acciones',cell: 'actionsArtactivity',editable:false}
                 ]
      });
  };

  List.FilterCreator = function(collection){
    return new Backgrid.Extension.ClientSideFilter({
        collection: collection,
        fields: ['cnumber','slug','tags']
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

DocManager.module("ParticipantsApp.List", function(List, DocManager, Backbone, Marionette, $, _){

  var participantsApp = DocManager.module('ParticipantsApp');
  
  List.Layout = Marionette.LayoutView.extend({
    className: 'row row-offcanvas row-offcanvas-left',

    getTemplate: function(){
      return utils.templates.ParticipantListLayoutView;
    },
    
    regions: {
      navbarRegion:  '#navbar-region',
      sidebarRegion: '#sidebar-region',
      linksRegion:   '#panel-region',
      mainRegion:    '#main-region',
      tableRegion: '#table-region'
    },
    
    events: {
      'click button.js-participantnew': 'newClicked'
    },
    
    newClicked: function(e){
      this.trigger('participant:new');
    },
    
    
  });

  List.ActionNotFound = Marionette.ItemView.extend({
    getTemplate: function(){
      return utils.templates.ActionNotFound;
    }
  })
  
  Backgrid.VipCell = Backgrid.Cell.extend({
      // Cell default class names are the lower-cased and dasherized
      // form of the the cell class names by convention.
      className: "vip-cell",
      render:function(){
          var isVip = this.model.get('vip');
          if(isVip){
              this.$el.html('<span class="glyphicon glyphicon-star vip-star"></span>');
          }else{
              this.$el.empty();
          }
          this.$el.css('width','25px');
          return this;
      }
  })
  
  Backgrid.ActionCell = Backgrid.Cell.extend({
      // Cell default class names are the lower-cased and dasherized
      // form of the the cell class names by convention.
      className: "action-cell",
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
          //this.trigger('participant:edit',this.model);
          DocManager.trigger('participant:edit',participantsApp.Model.selectedAction,this.model);
      },
        
      trashClicked: function(e){
          e.stopPropagation();e.preventDefault();
          //this.trigger('participant:remove',this.model);
          DocManager.trigger('participant:remove',participantsApp.Model.selectedAction,this.model);
      }
    });
  
  List.GridCreator = function(collection){
      var table = new Backgrid.Grid({
          className: 'table table-condensed table-bordered table-hover',
          collection: collection,
          columns: [{ name: 'vip',label: 'VIP',cell: 'vip',editable:false},
                    { name: 'displayName',label: 'Nombre',cell: 'string',editable:false},
                    {name: 'nickName',label: 'Alias',cell: 'string',editable:false},
                    {name: 'email',label: 'email',cell: 'string',editable:false},
                    {name: 'nickName',label: 'Acciones',cell: 'action',editable:false,sortable:false},
                   ]
        })
      
     return table;
  }  
});
DocManager.module("WorkflowApp.List", function(List, DocManager, Backbone, Marionette, $, _){

  List.LayoutView = Marionette.LayoutView.extend({
    getTemplate: function(){
      return utils.templates.WorkflowLayout;
    },
    regions: {
      tableRegion: '#tableRegion'
    }
  });


  var UserCell = Backgrid.StringCell.extend({
    render: function(){
      var fieldName = this.column.get('name');
      var user = this.model.get(fieldName);
      var txt = '';
      if(user){
        txt = user.name;
        txt += '<div class="text-muted">'+user.mail+'</div>';
      }
      this.$el.html(txt);
      return this;
    }
  });

  var ActionCell = Backgrid.StringCell.extend({
    render: function(){
      this.$el.append('<button class="btn btn-xs btn-default js-open">ver</button> ');
      this.$el.append(' <button class="btn btn-xs btn-default js-history" title="hoja de ruta"><i class="glyphicon glyphicon-road"></i></button>');
      return this;
    },
    events: {
      'click .js-open': function(e){
        DocManager.trigger('token:open',this.model);
      },
      'click .js-history': function(e){
        DocManager.trigger('action:history',this.model.get('obj_id'));
      }
    }
  });


  List.GridCreator = function(collection){
    return new Backgrid.Grid({
        className: 'table table-condensed table-bordered table-hover',
        collection: collection,
        columns: [{name: 'obj_type',label: 'Tipo',cell:'string',editable:false},
                  {name: 'obj_slug',label: 'Denominación', cell:'string',editable:false},
                  {name: 'fealta',label: 'Fecha', cell:'string',editable:false},
                  {name: 'from',label: 'De', cell:UserCell,editable:false},
                  {name: 'to',label: 'Para', cell:UserCell,editable:false},
                  {name: 'global_type',label: 'Paso Actual', cell:'string',editable:false},
                  {name: '',label: 'Acciones',cell:ActionCell,editable:false}
                 ]
      });
  };




});

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
      var user = utils.getDeepAttr(this.model,fieldName);
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
        e.stopPropagation();
        DocManager.trigger('token:open',this.model);
      },
      'click .js-history': function(e){
        e.stopPropagation();
        DocManager.trigger('action:history',this.model.get('obj').id);
      }
    }
  });

  var TypeStatusCell = Backgrid.StringCell.extend({
    render: function(){
      var fieldName = this.column.get('name');
      var token = this.model;
      var value = token.get(fieldName);
      var deco = DocManager.request('token:getDeco',value);
      if(deco){
        var $label = $('<label></label>',{'class':'label'});
        $label.css('background-color',deco.color);
        $label.html(deco.label);
        this.$el.append($label);
      }else{
        this.$el.append(value);
      }
      return this;
    }
  });

  var StringDeepCell = Backgrid.StringCell.extend({
    render: function(){
      var fieldName = this.column.get('name');
      var str = utils.getDeepAttr(this.model,fieldName);
      this.$el.html(str);
      return this;
    }
  });



  var ClickableRow = Backgrid.Row.extend({
    events: {
      "click": "onClick"
    },
    onClick: function (e) {
      DocManager.trigger('token:open',this.model);
    }
  });

  List.GridCreator = function(collection){
    return new Backgrid.Grid({
        row: ClickableRow,
        className: 'table table-condensed table-bordered table-hover',
        collection: collection,
        columns: [{name: 'obj.typeModel',label: 'Tipo',cell:StringDeepCell,editable:false},
                  {name: 'obj.slug',label: 'Denominación', cell:StringDeepCell,editable:false},
                  {name: 'obj.owner',label: 'Solicitante', cell:UserCell,editable:false},
                  {name: 'fealta',label: 'Fecha', cell:'string',editable:false},
                  {name: 'from',label: 'De', cell:UserCell,editable:false},
                  {name: 'to',label: 'Para', cell:UserCell,editable:false},
                  {name: 'global_type',label: 'Paso Actual', cell:TypeStatusCell,editable:false},
                  {name: '',label: 'Acciones',cell:ActionCell,editable:false}
                 ]
      });
  };




});

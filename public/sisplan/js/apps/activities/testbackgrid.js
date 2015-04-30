  var buildActionCell = Backgrid.Cell.extend({
      // Cell default class names are the lower-cased and dasherized
      // form of the the cell class names by convention.
      className: "action-cell",
      render: function(){
          if(!this.rendered){
             var btnEdit = $('<button class="btn-link js-requestedit" title="editar"><span class="glyphicon glyphicon-edit"></span></button>');
             var btnRemove = $('<button class="btn-link js-requesttrash" title="borrar"><span class="glyphicon glyphicon-remove"></span></button>');
             this.$el.append(btnEdit).append(btnRemove);
             this.rendered = true;
          }
         return this;
      },
      events: {
          'click button.js-requestedit': 'itemEditClicked',
          'click button.js-requesttrash': 'itemTrashClicked',
      },
        
      itemEditClicked: function(e){
          e.stopPropagation();e.preventDefault();
          console.log('item EDIT [%s] ', this.model.get('description'));


      },
        
      itemTrashClicked: function(e){
          e.stopPropagation();e.preventDefault();
          //this.trigger('participant:remove',this.model);
          //DocManager.trigger('participant:remove',participantsApp.Model.selectedAction,this.model);
      }
    });

  var fechaCell = Backgrid.Cell.extend({
    render:function(){
      var field = this.column.get('name');
      var value = this.model.get(field);
      var str = '';
      str = moment(value).format('dd LL');
      //return moment(date).format('dddd LL');
      this.$el.html(str);

      return this;
    }
  });  
  

  Backgrid.ImporteFormateadoCell = Backgrid.Cell.extend({
      // Cell default class names are the lower-cased and dasherized
      // form of the the cell class names by convention.
      className: "js-importe",
      render: function(){

          var cell = $('<span  class="pull-right">' + accounting.formatNumber(this.model.get(this.column.get('name'))) +  '</span>');
        //<%=  %>

          this.$el.html(cell);
         return this;
      },

    });


  var renderable = function(col, model){
    console.log('callme!!!!!!!!!!![%s] [%s]', arguments.length, col.whoami);
    return true;

  };

  var filterCreator = function(collection){
      return new Backgrid.Extension.ClientSideFilter({
          collection: collection,
          fields: ['slug', 'person']
        });
  };


  var data = new Backbone.Collection([
      {
        person:'maria',
        slug:'productora delegada',
        mail:'maria@gmail.com',
        tel:'444 2233',
        skype:'mariaxx',
        importe: 10000
      },
      {
        person:'jose',
        slug:'productora adjunta',
        mail:'jose@gmail.com',
        tel:'5555 1234',
        skype:'jose.cualquiera',
        importe: 20000
      },
      {
        person:'mariela',
        slug:'asistente de producción',
        mail:'mariela@gmail.com',
        tel:'6666 7890',
        skype:'marielalista',
        importe: 30000
      },


    ]);


  /**
   *   name
   *   label
   *   cell
   *   editable
   *   renderable
   *   headerCell
   *

      {name: '',        label: 'Seleccione',   cell: 'select-row', headerCell: 'select-all'},


    cell types: [datetime; date; tiem; number; integer; percent; string; uri; email; boolean; select; cellEditor; inputCellEditor; SelectCellEditor]
    BackboneViews:
    BackboneModel: Column
    HelperClasses:

    Columns: collection of Column
    Column: model
  */


  var ColumnOne = Backgrid.Column.extend({
    defaults: _.defaults({label: 'iajuu', editable: false}, Backgrid.Column.prototype.defaults)
  });
  var columnOne = new ColumnOne({name: 'skype',  label: 'Skype', cell: 'string', editable:true});

  var ColumnCol = Backgrid.Columns.extend({
    initialize: function(){
      console.log('ColumnCol init:[%s]', arguments.length);
    }
    //url: 'htt:.....'

  });

  var columnCol = new ColumnCol([
        {name: 'person',  label: 'Beneficiario', cell: 'string', editable:true},
        {name: 'slug',    label: 'Descripción',  cell: 'string', editable:false, renderable: false},
        {name: 'mail',    label: 'Mail', cell: 'email', editable:false},
        {name: 'importe', label: 'Importe' ,     cell: 'string', editable:false},
  ]);
  columnCol.add(columnOne);

  columnCol.on('change:renderable',function(col, colAttr){
    console.log('change renderable EVENT: [%s] [%s]', col,colAttr);

  });
  
  var itemsGridCreator = function(collection){
      // Backbone view
      return new Backgrid.Grid({
          className: 'table table-condensed table-bordered table-hover',
          collection: collection,
          columns: columnCol,
          model: ColumnOne,
        });
  }; 
  
  var showTable = function(itemlist){
    var table = itemsGridCreator(itemlist);

    table.on('request:item:edit', function(item){
      console.log('request:item:edit  FIRED');
    });
  
    table.on('backgrid:next', function(item){
      console.log('backgrid:next  FIRED');
    });

    table.on('backgrid:rendered', function(view){
      console.log('backgrid:rendered  FIRED', arguments.length)
    });

    table.collection.listenTo(table,'backgrid:next', function(i,j,outOfBound){
      //console.log('backgrid:next Col FIRED: [%s][%s][%s]', i,j,outOfBound)
    });

    $('#main-region').html(table.render().el);

    // Selecting even numbered rows
    table.collection.each(function (model, i) {
      //if (i % 2 == 0) model.trigger("backgrid:select", model, true);
      console.log('iterating: [%s]:[%s]', i, model.get('person'))
    });

    return table;
  };


  var insertRow = function(table){
    table.insertRow([
          {
            person:'Mirta',
            slug:'productora adjunta',
            mail:'mirtamilagros@gmail.com',
            importe: 11100
          },
       ]);
  };

  var removeRow = function(table){
    console.log('removeRow after TiemOut[%s]', table)
    var maria = table.collection.where({person: 'maria'});
    table.removeRow(maria);
  };

  var insertColumn = function(table){
    table.insertColumn([
        {name: 'tel',    label: 'Telefono',  cell: 'string', editable:false},
      ]);
  };

  var removeColumn = function(table){
    console.log('removeColumn after TiemOut[%s]', table)
    var descrip = table.columns.where({name: 'slug'});
    table.removeColumn(descrip);
  };



$(function(){
  var tbl = showTable(data);

  //setTimeout(insertRow,800,tbl);

  //setTimeout(removeRow,1000,tbl);

  //setTimeout(insertColumn,2000,tbl);

  //setTimeout(removeColumn,3000,tbl);

})


/****
events:
   backgrid:select


*/
// var MyColumn = Column.extend({
//   defaults: _.defaults({
//     editable: false
//   }, Column.prototype.defaults)
// });

// var grid = new Backgrid.Grid(
//     columns: new Columns([{...}, {...}], {
//   model: MyColumn
// }));





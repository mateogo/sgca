DocManager.module('BackendApp.AgendaMica',function(AgendaMica, DocManager, Backbone, Marionette, $, _){

  var CommonsViews = DocManager.module('BackendApp.Common.Views');

  AgendaMica.ReunionEdit = Marionette.ItemView.extend({
    template: _.template('vista edicion de reunion'),
  });

  AgendaMica.SuscriptorCell = Backgrid.Cell.extend({
      className: "string-cell",
      render: function(){
        var fieldName = this.column.get('name');
        var suscriptor = this.model.get(fieldName);
        this.$el.html(renderSuscriptor(suscriptor));
        return this;
      },
      events: {
        'click': function(){
          var rol = this.column.get('name');
          var suscriptor = this.model.get(rol);
          DocManager.trigger('micaagenda:agendaone:show',suscriptor._id,rol);
        }
      }
  });

  AgendaMica.EstadoReunionCell = Backgrid.Cell.extend({
      className: "string-cell",
      render: function(){
        var fieldName = this.column.get('name');
        var estado = this.model.get('estado');
        var $span = $('<div class="text-center"></span>');
        $span.html(this.model.get(fieldName));
        if(estado === 'unavailable'){
          $span.addClass('text-danger');
          $span.html('<i class="glyphicon glyphicon-alert" style="font-size:18px"></i><br/> Sin disponibilidad');
        }
        this.$el.html($span);
        return this;
      }
  });

  AgendaMica.ActividadCell = Backgrid.Cell.extend({
      className: "string-cell",
      render: function(){
        var fieldName = this.column.get('name');
        var field = this.model.get(fieldName);
        var value = (field)?field.actividades:'';
        this.$el.html(CommonsViews.renderLabelActividad(value));
        return this;
      }
  });


  AgendaMica.AgendaListItem = Marionette.ItemView.extend({
    tagName: 'li',
    className: 'list-group-item',
    getTemplate: function(){
      return utils.templates.AgendaListItem;
    },
    templateHelpers: function(){
      var self = this;
      return {
        getContraparte: function(){
          var field = self.options.contraparte_rol;
          var model = self.model;
          var ret = '';
          if(self.model.has(field)){
            ret = renderSuscriptor(self.model.get(field),true);
          }

          return ret;
        }
      };
    },
    onRender: function(){
      var clazz = 'list-item-agenda-'+this.model.get('estado');
      this.$el.addClass(clazz);
    },
    events: {
      'click .js-openagenda': function(){
        var rol = this.options.contraparte_rol;
        var suscriptor = this.model.get(rol);
        DocManager.trigger('micaagenda:agendaone:show',suscriptor._id,rol);
      }
    }
  });

  AgendaMica.AgendaList = Marionette.CompositeView.extend({
    initialize: function(opts){
      this.rol = opts.rol;
      this.contraparte_rol = (opts.rol === 'comprador') ? 'vendedor' : 'comprador';
      var self = this;
      console.log('cambio',opts.collection);
      // opts.collection.on('change',function(){
      //   self.renderOwner();
      // });
    },
    className: 'wrapper',
    template: _.template('<div class="text-muted">La agenda de <div class="owner-container"></div></div><ul class="list-group"></ul>'),
    childViewContainer: 'ul',
    childView: AgendaMica.AgendaListItem,
    childViewOptions: function(model,index){
      var self = this;
      return {
        contraparte_rol:  self.contraparte_rol
      };
    },

    onRender: function(){
      var self = this;
      this.renderOwner();
      this.collection.once('change',function(){
        self.renderOwner();

        var $children = self.$el.find('.list-item-agenda-unavailable');
        if($children.length > 0){
          $($children[$children.length-1])
            .css('border-bottom','1px solid #FF4136')
            .css('margin-bottom','10px');
        }
      });
    },

    renderOwner: function(){
      var field = this.options.rol;
      var ret = '';
      if(this.collection.length > 0){
        var tmp = this.collection.at(0);
        ret = renderSuscriptor(tmp.get(field),true);
      }
      this.$el.find('.owner-container').html(ret)
        .css('padding-bottom','20px')
        .css('margin-bottom','10px').css('font-size','16px');
    }
  });


  AgendaMica.AgendaGroupList = Marionette.CompositeView.extend({

  });



  // doc ref: https://github.com/nicolaskruchten/pivottable
  AgendaMica.EstadisticView = Marionette.ItemView.extend({
    className: 'wrapper',
    template: _.template('<h1>Estadisticas</h1><div style="margin-bottom: 10px"><button class="btn btn-default btn-sm js-back"><span class="fa fa-angle-left"></span> Volver</button></div><div class="pivot"></div>'),
    //childView: RecountItem,
    //childViewContainer: '.body-container',
    initialize: function(opts){
      var self = this;
      opts.collection.once('change',function(){
          self.renderPivot();
      });
    },
    onRender: function(){
      if(this.collection && this.collection.length > 0){
        this.renderPivot();
      }
    },

    renderPivot: function(){
      var dataSource = this.collection.toJSON();
      var $pivot = this.$el.find('.pivot').pivot(dataSource,{
              localeStrings: $.pivotUtilities.locales.es.localeStrings,
              rows: ["number"],
              cols: ["actividad"],
              aggregator: function(data,rowKey,colKey){
                return {
                  count: 0,
                  push: function(record) { this.count += record.subtotal_count; },
                  value: function() { return this.count; },
                  format: function(x) { return x; },
                  label: "Cantidad"
                }
              }
      });
    },

    events: {
      'click .js-back': function(){
        DocManager.navigateBack();
      }
    }
  });



  // es un suscriptor serializado para micaagenda
  var renderSuscriptor = function(suscriptor,showActividad){
    if(!suscriptor || !suscriptor.responsable) return '';
    var responsable = suscriptor.responsable;
    var solicitante = suscriptor.solicitante;
    var str = '<strong class="text-primary">'+solicitante.edisplayName +'</strong> '+
              '<div>'+responsable.rname + ' ('+responsable.rcargo+')' +'</div> '+
              '<div>'+  responsable.rmail + '</div> ';
    if(showActividad){
      var $span = CommonsViews.renderLabelActividad(suscriptor.actividades);
      str += $span.prop('outerHTML');
    }
    return str;
  };

});

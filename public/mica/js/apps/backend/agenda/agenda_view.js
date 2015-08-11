DocManager.module('BackendApp.AgendaMica',function(AgendaMica, DocManager, Backbone, Marionette, $, _){


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


  AgendaMica.AgendaListItem = Marionette.ItemView.extend({
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
            ret = renderSuscriptor(self.model.get(field));
          }

          return ret;
        }
      };
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
    template: _.template('<div class="text-muted">La agenda de <span class="owner-container"></span></div><ul class="list-group"></ul>'),
    childViewContainer: 'ul',
    childView: AgendaMica.AgendaListItem,
    childViewOptions: function(model,index){
      var self = this;
      return {
        contraparte_rol:  self.contraparte_rol
      };
    },

    onRender: function(){
      this.renderOwner();
      var self = this;
      this.collection.once('change',function(){
        self.renderOwner();
      });
    },

    renderOwner: function(){
      var field = this.options.rol;
      var ret = '';
      if(this.collection.length > 0){
        var tmp = this.collection.at(0);
        ret = renderSuscriptor(tmp.get(field));
      }
      this.$el.find('.owner-container').html(ret);
    }
  });

  var renderSuscriptor = function(suscriptor){
    if(!suscriptor || !suscriptor.responsable) return '';
    var responsable  = suscriptor.responsable;
    var str = '<div class="text-primary">'+responsable.rname + ' ('+responsable.rcargo+')' +'</div> '+
              '<div>'+  responsable.rmail + '</div> '
    return str;
  }

});

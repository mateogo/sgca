DocManager.module('BackendApp.ToolsMica',function(ToolsMica, DocManager, Backbone, Marionette, $, _){

  ToolsMica.ToolsView = Marionette.ItemView.extend({
    className: 'wrapper',
    getTemplate: function(){
      return utils.templates.ToolsView;
    },
    events: {
      'click .js-back':function(e){
        DocManager.navigateBack();
      },
      'click .js-run': 'runTool'
    },

    runTool: function(e){
      e.stopPropagation();
      var name = $(e.currentTarget).attr('name');
      var method = ToolsMica.Handler[name];
      method($(e.currentTarget).closest('.tool'));
    }
  });


  ToolsMica.RepetidosItem = Marionette.ItemView.extend({
    className: 'list-group-item',
    template: _.template('<%=cnumber%> <%=rol%> <%if(typeof(number) !== "undefined"){ %>reunión #<%=number%> <%}%> (repeticiones: <%=count%>)'),
    events: {
      'click': function(e){
        e.stopPropagation();
        DocManager.trigger('micaagenda:agendaone:show:popup',this.model.get('cnumber'),this.model.get('rol'));
      }
    },
    onRender: function(){
      this.$el.css('cursor','pointer');
    }
  });

  ToolsMica.RepetidosView = Marionette.CollectionView.extend({
    className: 'list-group',
    childView:ToolsMica.RepetidosItem
  });

  ToolsMica.CrossItem = Marionette.ItemView.extend({
    className: 'list-group-item',
    template: _.template('<h4><%=cnumber%> <%=solicitante.edisplayName%> </h4> '+
                         '<span class="text-danger">"falso rol" <%=rolDirty%></span> '+
                         '  <a class="js-perfil btn btn-default btn-xs">ver perfil</a> '+
                         '  <a class="js-agendacomprador btn btn-default btn-xs">agenda comprador</a> ' +
                         '  <a class="js-agendavendedor  btn btn-default btn-xs">agenda vendedor</a> ' +
                        ''),
    events: {
      'click .js-perfil': 'perfil',
      'click .js-agendacomprador': 'agendaComprador',
      'click .js-agendavendedor': 'agendaVendedor'
    },

    perfil: function(e){
      e.stopPropagation();
      DocManager.trigger('micaagenda:profile:show:popup',this.model.get('_id'));
    },

    agendaComprador: function(e){
      e.stopPropagation();
      DocManager.trigger('micaagenda:agendaone:show:popup',this.model.get('cnumber'),'comprador');
    },
    agendaVendedor: function(e){
      e.stopPropagation();
      DocManager.trigger('micaagenda:agendaone:show:popup',this.model.get('cnumber'),'vendedor');
    },

  });

  ToolsMica.CrossView = Marionette.CollectionView.extend({
    className: 'list-group',
    childView:ToolsMica.CrossItem
  });


});

DocManager.module("WorkflowApp.Actions", function(Actions, DocManager, Backbone, Marionette, $, _){

  Actions.DefaultAction = Marionette.ItemView.extend({
      getTemplate: function(){
        return utils.templates.DefaultActionView;
      },
      getData: function(){
        var data = {
          body: this.$el.find('[name=body]').val()
        };

        return data;
      },
      onRender: function(){
        var self = this;
        setTimeout(function(){
          self.$el.find('[name=body]').focus();
        },10);
      }
  });


  Actions.openPopup = function(View,action){
    var view = new View({model:action});
    view.render();

    var modal = new Backbone.BootstrapModal({
      content: view,
      okText: 'Guardar',
      cancelText: 'cancelar',
      enterTriggersOk: false,
    });

    modal.on('ok',function(){
      DocManager.trigger('action:proceed',action,view.getData());
    });

    modal.open();

    return modal;
  };


  Actions.ItemToken = Marionette.ItemView.extend({
    tagName: 'div',
    getTemplate: function(){
      return utils.templates.ItemTokenView;
    },
    templateHelpers: function () {
      return {
        dateFormat: function(date){
          return moment(date).format('dddd, D MMMM YYYY, HH:mm');
        }
      };
    }

  });


  Actions.ListHistory = Marionette.CollectionView.extend({
    childView: Actions.ItemToken

  });


  Actions.showHistory = function(collection){
    var view = new Actions.ListHistory({collection:collection});
    view.render();

    var modal = new Backbone.BootstrapModal({
      content: view,
      title: 'Hoja de Ruta',
      okText: 'Cerrar',
      cancelText: '',
      enterTriggersOk: false
    });

    modal.open();

    return modal;
  };

});

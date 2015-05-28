DocManager.module("ObrasApp.Common", function(Common, DocManager, Backbone, Marionette, $, _){


  Common.SaveAndNoti = Marionette.ItemView.extend({
    getTemplate: function(){
      return utils.templates.SaveAndNoti;
    },
    onRender: function(){
      var self = this;
      setTimeout(function(){
        self.$el.find('[name=body]').focus();
      });
    },
    getData: function(){
      var data = {
        allFixed: this.$el.find('[name=allFixed]').prop('checked'),
        body: this.$el.find('[name=body]').val()
      };
      return data;
    }
  });

  Common.popupSaveAndNoti = function(callback){
    var view = new Common.SaveAndNoti();
    view.render();

    var modal = new Backbone.BootstrapModal({
      content: view,
      title: '',
      okText: 'Guardar',
      cancelText: 'seguir editando',
      enterTriggersOk: false,
    });

    modal.on('ok',function(){
      callback(view.getData());
    });

    modal.open();
  };

});

DocManager.module('BackendApp.Places',function(Places, DocManager, Backbone, Marionette, $, _){

  var CommonsViews = DocManager.module('BackendApp.Common.Views');

  Places.SettingView = Marionette.ItemView.extend({
    getTemplate: function(){
      return utils.templates.PlaceEdit;
    },

    onDestroy: function(){
      if(this.modal){
        this.modal = null;
      }
    },

    onRender: function(){
      var content = CommonsViews.renderSuscriptor(this.model.toJSON(),{showToolbar:true,showActividad:true});
      this.$el.find('.region-suscriptor-detail').html(content);
    },

    getData: function(){
      var data = {
        _id: this.model.id,
        place: {
          sala: this.$el.find('[name=sala]').val(),
          mesa: this.$el.find('[name=mesa]').val()
        }
      };
      return data;
    },

    validate: function(){
      return true;
    },

    setModal: function(modal){
      this.modal = modal;
      this.listenTo(modal,'ok',this.onSavePopup.bind(this));
    },

    save: function(){
      if(!this.validate()){
        return;
      }
      var self = this;
      var data = this.getData();
      var p = DocManager.request('micarqst:partial:update',this.model,data);
      p.done(function(){
        if(self.modal){
          self.modal.close();
          self.destroy();
        }
        Message.success('Ubicación registrada');
      }).fail(function(){
        Message.error('No se pudo asignar la ubicación',self.$el.find('.alert'));
      });
    },

    onSavePopup: function(modal){
      this.modal.preventClose();
      this.save();
    }

  });

  Places.showSettingView = function(suscription){
    var view = new Places.SettingView({model:suscription});

    var modal = new Backbone.BootstrapModal({
      content: view,
      okText: 'Guardar',
      cancelText: 'cancelar',
      enterTriggersOk: false,
    });

    //BOTONES POR DEFECTO
    modal.listenTo(modal,'cancel',function(){
      modal.close();
      view.destroy();
    });

    if(view.setModal){
      view.setModal(modal);
    }
    modal.open();

    setTimeout(function(){
      modal.$el.find('input[type=text]').first().focus();
    });

    return modal;
  };


});

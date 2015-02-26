DocManager.module("LocationsApp.Edit", function(Edit, DocManager, Backbone, Marionette, $, _){
  
    
  Edit.modaledit  = function(action,location){
    
    var form = new Backbone.Form({
      model: location
      //template: utils.templates.LocationEdit,
    });
    
    var modal = new Backbone.BootstrapModal({
      content: form,
      title: 'Edición de Locación',
      okText: 'guardar',
      cancelText: 'cancelar',
      enterTriggersOk: false,
    });
    
    modal.on('ok',function(){
      modal.preventClose();
      var self = this;
      var oldValue = location.toJSON();
      
      var errors = form.commit();
      if(errors){
          Message.warning('Revis&aacute; el formulario');
          return; 
      }
      
      var $btn = modal.$el.find('.btn.ok').attr('data-loading-text','guardando...');
      $btn.button('loading');
      
      location.save().done(function(){
         modal.close();
         $btn.button('reset');
         
      }).fail(function(e){
          $btn.button('reset');
          
          location.set(oldValue);
        
          if(e && e.code){
              
          }else{
            Message.error('Ops! No se pudo guardar '+e);
            console.error(e);
          }
      });     
      
    });
    
    modal.open();
  };  
});
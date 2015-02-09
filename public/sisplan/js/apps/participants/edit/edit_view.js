DocManager.module("ParticipantsApp.Edit", function(Edit, DocManager, Backbone, Marionette, $, _){
  
  
  Edit.modaledit  = function(action,participant){
    
    var form = new Backbone.Form({
      model: participant,
      template: utils.templates.ParticipantEdit
    })
    
    var modal = new Backbone.BootstrapModal({
      content: form,
      title: 'Edición de Participante',
      okText: 'guardar',
      cancelText: 'cancelar',
      enterTriggersOk: false,
    })
    
    modal.on('ok',function(){
      modal.preventClose();
      
      var errors = form.commit();
      if(errors){
        alert('revisa el formulario');
        return;
      }
      
      var $btn = modal.$el.find('.btn.ok').attr('data-loading-text','guardando...');
      $btn.button('loading');
      
      //TDOO gurdar participante:
      console.log('Guardondo participante ',participant);
      action.get('participants').push(participant); 
      
      action.save().done(function(){
          modal.close();
          $btn.button('reset');
      });
      
    })
    
    
    modal.$el.addClass('modal-participant');
    
    modal.open(function(){
      console.log('Guardondo participante ');
    })
    
    
    
  }
  
  
});
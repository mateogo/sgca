DocManager.module("ParticipantsApp.Edit", function(Edit, DocManager, Backbone, Marionette, $, _){
  
  Edit.modaledit  = function(action,participant){
    
      var FormPP = Marionette.ItemView.extend({
        events: {
          'click .js-add': 'addContactInfo'
        },
        
        getValue: function(){
          var data = form.getValue();
          data.vip = $(this.el).find('#checkboxVip').prop('checked');
          return data;
        },
        
        setValue: function(model){
          $(this.el).find('#checkboxVip').prop('checked',model.get('vip'));
        },
          
        addContactInfo: function(){
          var contactInfo = new Edit.ContactInfo({
            model: new Backbone.Model({contactdata: 'vacio',subcontenido: 'personal'})
          });
          contactInfo.mode = 'editor';
          contactInfo.render();
          $(this.el).find('#datosContainer').append(contactInfo.el);
        }
      })
    
    var form = new Backbone.Form({
      model: participant,
      template: utils.templates.ParticipantEdit,
    })
    var formPP;
    
    function init(){
      formPP =  new FormPP({el:form.el});
      formPP.setValue(participant);
    }
    
    
    setTimeout(function(){
        init();
    },10);
    
    var modal = new Backbone.BootstrapModal({
      content: form,
      title: 'Edición de Participante',
      okText: 'guardar',
      cancelText: 'cancelar',
      enterTriggersOk: false,
    })
    
    modal.on('ok',function(){
      modal.preventClose();
      
      console.log(formPP.getValue());
      return;
      
      var errors = form.commit();
      if(errors){
        alert('revisa el formulario');
        return;
      }
      
      var $btn = modal.$el.find('.btn.ok').attr('data-loading-text','guardando...');
      $btn.button('loading');
      
      if(participant.isNew()){
        action.participants.push(participant);
      }
      
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
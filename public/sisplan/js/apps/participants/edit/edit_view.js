DocManager.module("ParticipantsApp.Edit", function(Edit, DocManager, Backbone, Marionette, $, _){
  
  
  var FormPP = Marionette.ItemView.extend({
    
    initialize: function(opts){
      this.form = opts.form;
      this.model = opts.model;
      this.infos = [];
    },
    
    onDestroy: function(){
      
    },
    
    events: {
      'click .js-add': 'addClicked',
      'click #checkboxVip': 'vipChanged',   
    },
    
    _getCheckValues: function(name){
      var data = {};
      var radios = $(this.el).find('[name='+name+']');
      _.each(radios,function(radio,i){
          var $radio = $(radio);
          var key = $radio.attr('value');
          var value = $radio.prop('checked');
          data[key] = value;
      });
      return data;
    },
    
    _setCheckValues: function(name,data){
      var radios = $(this.el).find('[name='+name+']');
      _.each(data,function(value,key){
          radios.filter('[value='+key+']').prop('checked',data[key]);
          console.log(radios.filter('[value='+key+']'));
      });
    },
    
    getValue: function(){
      var data = this.form.getValue();
      data.vip = $(this.el).find('#checkboxVip').prop('checked');
      data.tipojuridico = this._getCheckValues('tipojuridico');
      data.roles = this._getCheckValues('roles');
      
      var contactinfo = [];
      _.each(this.infos,function(info){
        contactinfo.push(info.commit());
      });
      data.contactinfo = contactinfo;
      
      return data;
    },
    
    setValue: function(model){
      $(this.el).find('#checkboxVip').prop('checked',model.get('vip'));
      this._setCheckValues('tipojuridico', model.get('tipojuridico'));
      this._setCheckValues('roles', model.get('roles'));
      this.vipChanged();
      
      var self = this;
      _.each(model.get('contactinfo'),function(info){
        self.addContactInfo(info);
      });
    },
    
    commit: function(){
      var data = this.getValue();
      this.model.set('vip',data.vip);
      this.model.set('tipojuridico',data.tipojuridico);
      this.model.set('roles',data.roles);
      this.model.set('contactinfo',data.contactinfo);
    },
      
    addContactInfo: function(model){
      var mode = 'view';
      if(!model){
        model = new Backbone.Model({contactdata: 'vacio',subcontenido: 'principal'});
        mode = 'editor';
      }else if(!(model instanceof Backbone.Model)){
        model = new Backbone.Model(model);
      }
      var contactInfo = new Edit.ContactInfo({model: model,mode:mode});
      this.listenTo(contactInfo,'removed',this.contactInfoRemoved.bind(this));
      contactInfo.render();
      $(this.el).find('#datosContainer').append(contactInfo.el);
      this.infos.push(contactInfo);
    },
    
    addClicked: function(){
      this.addContactInfo();
    },
    
    vipChanged: function(){
      var value = this.getValue();
      if(value.vip){
        $(this.el).find('#starMark').fadeIn();
      }else{
        $(this.el).find('#starMark').fadeOut();
      }
    },
    
    contactInfoRemoved: function(contactInfo){
      var pos = this.infos.indexOf(contactInfo);
      if(pos > -1){
        this.infos.splice(pos,1);
        contactInfo.remove();
      }
    }
  });
  
  
  Edit.modaledit  = function(action,participant){
    
    var form = new Backbone.Form({
      model: participant,
      template: utils.templates.ParticipantEdit,
    });
    
    var formPP;
    
    function init(){
      formPP =  new FormPP({
          el:form.el,
          form:form,
          model: participant
      });
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
    });
    
    modal.on('ok',function(){
      modal.preventClose();
      
      var errors = form.commit();
      if(errors){
        alert('revisa el formulario');
        return;
      }
      formPP.commit();
      
      var $btn = modal.$el.find('.btn.ok').attr('data-loading-text','guardando...');
      $btn.button('loading');
      
      if(participant.isNew()){
        action.participants.push(participant);
      }
      
      action.save().done(function(){
          modal.close();
          $btn.button('reset');
      });
      
    });
    
    
    modal.$el.addClass('modal-participant');
    
    modal.open(function(){
      console.log('Guardondo participante ');
    });
    
  };  
});
DocManager.module("ParticipantsApp.Edit", function(Edit, DocManager, Backbone, Marionette, $, _){
  
  
  var FormPP = Marionette.ItemView.extend({
    
    initialize: function(opts){
      this.form = opts.form;  //Backbone.Form
      this.model = opts.model; //Entities.ActionParticipants
      this.infos = [];
      this.autoDisplayNameEnabled = !(this.model.get('displayName'));
      this.autoNickNameEnabled = !(this.model.get('nickName'));
      
      if(this.model.isNew()){
        this.initAutocomplete();
      }
      
      this.$el.find('[name=name]').focus();
    },
    
    // Inicializa autocomplete de person en campo nombre
    initAutocomplete: function(){
      var $nombreField = this.$el.find('[name=name]');
      
      this.autoName = new AutoCompletePersonField({el:$nombreField,filterField:['name','displayName','nickName']});
      
      var self = this;
      this.listenTo(this.autoName,'person:selected',function(person){
        setTimeout(self._userPerson.bind(self),10,person);
      });
    },
    
    onDestroy: function(){
      this.autoName = null;
    },
    
    events: {
      'click .js-add': 'addClicked',
      'click #checkboxVip': 'vipChanged',
      'keyup [name=name]': 'onNameChanged',
      'keyup [name=lastName]': 'onNameChanged',
      'keyup [name=nickName]': 'onNickNameChanged',
      'keyup [name=displayName]': 'onDisplayNameChanged',
    },
    
    _updateUI: function(){
      
      this.autoDisplayNameEnabled = !(this.model.get('displayName'));
      this.autoNickNameEnabled = !(this.model.get('nickName'));
      
      //actualiza Backbone.Form
      var fieldsForms = this.form.fields;
      for(var field in fieldsForms){
        var value = this.model.get(field);
        console.log('actualizando campo',field,value,fieldsForms[field]);
        //fieldsForms[field].setValue(value);
        if(field == 'birthDate'){
          value = new Date(value);
        }
        fieldsForms[field].editor.setValue(value);
      }
      
      //actualiza otros campos
      this.setValue(this.model);
    },
    
    _userPerson: function(person){
      this.model.usePerson(person);
      this._updateUI();
    },
    
    /**
     * @return {Object} con options como key y true o false. Ej: {pjuridico: true, pfisica:false}
     */
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
    
    /**
     * Setea los valores de checkbox con un objeto map con booleano Ej: {pjuridico: true, pfisica:false}
     * @param {String} name - nombre de checkbox o radios
     * @param {Object} data -  Ej: {pjuridico: true, pfisica:false} {<value-checkbox>: boolean}
     */
    _setCheckValues: function(name,data){
      var radios = $(this.el).find('[name='+name+']');
      _.each(data,function(value,key){
          radios.filter('[value='+key+']').prop('checked',data[key]);
      });
    },
    
    /**
     * @param {String} name - nombre del select
     * @return {Object} con options como key y true o false. Ej: {pjuridico: true, pfisica:false}
     */
    _getSelectValues: function(name){
      var data = {};
      var $select = this.$el.find('[name='+name+']');
      var selectedValue = $select.val();
      var options = $select.children();
      
      _.each(options,function(option,key){
        var value = $(option).attr('value');
        data[value] = (value == selectedValue);
      });
      
      return data;
    },
    
    /**
     * Setea el valor del select con la estructura de map
     * @param {String} name - nombre del select
     * @param {Object} map  {option: boolean}. Ej: {pjuridico: true, pfisica:false}
     */ 
    _setSelectValue: function(name,data){
      var value;
      for(var key in data){
        if(data[key] === true){
          value = key;
        }
      }
      if(value){
        this.$el.find('[name='+name+']').val(value);
      }
    },
    
    getValue: function(){
      var data = this.form.getValue();
      data.vip = $(this.el).find('#checkboxVip').prop('checked');
      data.tipojuridico = this._getSelectValues('tipojuridico');
      
      var contactinfo = [];
      _.each(this.infos,function(info){
        contactinfo.push(info.commit());
      });
      data.contactinfo = contactinfo;
      
      return data;
    },
    
    setValue: function(model){
      $(this.el).find('#checkboxVip').prop('checked',model.get('vip'));
      this._setSelectValue('tipojuridico', model.get('tipojuridico'));
      this.vipChanged();
      
      this.clearContactInfo();
      var self = this;
      _.each(model.get('contactinfo'),function(info){
        self.addContactInfo(info);
      });
    },
    
    commit: function(){
      var data = this.getValue();
      this.model.set('vip',data.vip);
      this.model.set('tipojuridico',data.tipojuridico);
      this.model.set('contactinfo',data.contactinfo);
      this.model.set('tipopersona','persona');
    },
    
    autoNickName: function(){
      var $field = this.$el.find('[name=nickName]');
      var filter = new RegExp('[^A-Z0-9]','gi');
      var name = this.$el.find('[name=name]').val();
      var lastName = this.$el.find('[name=lastName]').val();
      name = name.replaceLatinChar().replace(filter,'');
      lastName = lastName.replaceLatinChar().replace(filter,'');
      var value =  name + '.' + lastName;
      value = $.trim(value).toLowerCase();
      $field.val(value);
    },
    
    autoDisplayName: function(){
      var $field = this.$el.find('[name=displayName]');
      var value = this.$el.find('[name=name]').val() + ' ' + this.$el.find('[name=lastName]').val();
      $field.val(value);
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
    
    clearContactInfo: function(){
      this.infos = [];
      $(this.el).find('#datosContainer').empty();
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
      var infos = this.infos;
      DocManager.confirm('¿Estás seguro de borrar el dato de contacto?').then(function(){
        var pos = infos.indexOf(contactInfo);
        if(pos > -1){
          infos.splice(pos,1);
          contactInfo.remove();
        }
       });
    },
    
    onNameChanged: function(){
      if(this.autoNickNameEnabled) this.autoNickName();
      if(this.autoDisplayNameEnabled) this.autoDisplayName();
    },
    
    onNickNameChanged: function(e){
      var value = $(e.currentTarget).val();
      this.autoNickNameEnabled = $.trim(value) === '';
    },
    
    onDisplayNameChanged: function(e){
      var value = $(e.currentTarget).val();
      this.autoDisplayNameEnabled = $.trim(value) === '';
    }
  });
  
  
  var AutoCompletePersonField = Marionette.ItemView.extend({
      initialize: function(opts){
        var self = this;
        
        this.$el.autocomplete({
          source: function(request,response){
            
            // preparando parametros de consulta
            var params = {'tipopersona':'persona'};
            var ors = [];
            if(opts.filterField){
              if(_.isArray(opts.filterField)){
                _.each(opts.filterField,function(item){
                  var tmp = {};
                  tmp[item] = request.term;
                  ors.push(tmp);
                });
              }else if(typeof(opts.filterField) === 'string'){
                var tmp = {};
                tmp[opts.filterField] = request.term;
                ors.push(tmp);
              }
            }
            if(ors.length > 0){
              params.$or = ors;
            }
            
            // generando consulta
            var p = DocManager.request('person:filteredLike:entities',params);
            
            p.done(function(data){
              response(data);
            });
          },
          select: function(event,ui){
            var personSelected = ui.item;
            self.trigger('person:selected',personSelected);
            console.log('selecciono person',personSelected);
          }
        }).autocomplete( "instance" )._renderItem = function( ul, item ) {
          var $li = $('<li></li>');
          var displayName = $('<span></span>',{text:item.displayName,'class':'text-primary'});
          var nickName = $('<span></span>',{text:item.nickName,'class':'text-muted',style:'padding-left:5px'});
          $li.append(displayName).append(nickName);
          ul.append($li);
          return $li;
        };
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
      
      participant.save().done(function(){
         modal.close();
         $btn.button('reset');
         
      }).fail(function(e){
         alert('No se pudo guardar ' +e);
         $btn.button('reset');
      });     
      
    });
    
    
    modal.$el.addClass('modal-participant');
    modal.open();
  };  
});
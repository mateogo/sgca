DocManager.module("LocationsApp.Edit", function(Edit, DocManager, Backbone, Marionette, $, _){
  
  var PersonsApp = DocManager.module('PersonsApp');
  
  var FormPP = Marionette.ItemView.extend({
    
    initialize: function(opts){
      this.form = opts.form;  //Backbone.Form
      this.model = opts.model; //Entities.ActionLocation
      
      if(this.model.isNew()){
        this.initAutoComplete();
      }
      
      this.$el.find('[name=name]').focus();
    },
    
    initAutoComplete:function(){
      var $nombreField = this.$el.find('[name=name]');
      
      this.autoName = new PersonsApp.View.AutoCompletePersonField({el:$nombreField,tipoPersona:'municipio',filterField:['name','displayName','nickName']});
      
      var self = this;
      this.listenTo(this.autoName,'person:selected',function(person){
        setTimeout(self._userPerson.bind(self),10,person);
      });
    },
    
    _userPerson: function(person){
      this.model.usePerson(person);
      this._updateUI();
    },
    
    _updateUI: function(){
      
      //actualiza Backbone.Form
      var fieldsForms = this.form.fields;
      for(var field in fieldsForms){
        var value = this.model.get(field);
        fieldsForms[field].editor.setValue(value);
      }
    },
    
    showMap: function(visible){
      if(typeof(visible) === 'undefined') visible = true;
      
      if(visible){
        this.$el.find('#fieldsContainer').removeClass('col-xs-12').hide();
        this.$el.find('#mapContainer').addClass('col-xs-12').show();
        
        if(!this.map){
          var coord = this.model.get('coordinate');
          
          var map = L.map('map').setView(coord, 10);
          
          L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          }).addTo(map);

          // add a marker in the given location, attach some popup content to it and open the popup
          L.marker(coord).addTo(map)
            .bindPopup(this.model.get('displayName'))
            .openPopup();
        
          this.map = map;
        }
        
        
      }else{
        this.$el.find('#fieldsContainer').addClass('col-xs-12').show();
        this.$el.find('#mapContainer').removeClass('col-xs-12').hide();
      }
    },
    
    events: {
      'click .js-showmap': 'onShowMapClick',
      'click .js-hidemap': 'onHideMapClick'
    },
    
    onShowMapClick: function(e){
      this.showMap();
    },
    
    onHideMapClick: function(e){
      this.showMap(false);
    }

  });
  
  
    
  Edit.modaledit  = function(action,location){
    
    var form = new Backbone.Form({
      model: location,
      template: utils.templates.LocationEdit
    });
    
    var formPP;
    
    function init(){
      formPP =  new FormPP({
          el:form.el,
          form:form,
          model: location
      });
    }
    
    setTimeout(function(){ init();},10);
    
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
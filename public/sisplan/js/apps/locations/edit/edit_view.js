DocManager.module("LocationsApp.Edit", function(Edit, DocManager, Backbone, Marionette, $, _){
  
 var PersonsApp = DocManager.module('PersonsApp');
 var Entities = DocManager.module('Entities');
 var App = DocManager.module('App');
  
 Edit.View = Marionette.ItemView.extend({
    
    getTemplate: function(){
      return utils.templates.LocationEditView;
    }, 
    
    initialize: function(opts){
      this.action = opts.action;
      this.model = opts.model; //Entities.ActionLocation
      
      this.autoDisplayNameEnabled = !(this.model.get('displayName'));
      this.autoNickNameEnabled = !(this.model.get('nickName'));
    },
    
    onRender: function(){
      this.initForm();
      if(this.model.isNew()){
        this.initAutoComplete();
      }
      
      this.initGeocode();
      
      var self = this;
      setTimeout(function(){
        self.$el.find('[name=name]').focus();
      },10);
      
    },
    
    initForm: function(){
      var isLocation = this.model instanceof Entities.ActionLocation;
      console.log('render el formulario',this.model,(isLocation)?'si':'no');
      var form = new Backbone.Form({
        model: this.model,
        //template: _.template(this.$el.find('#fieldsContainer').html())
      });
      
      form.render();
      this.$el.find('#fieldsContainer').html(form.el);
      this.form = form;
      
      
      this.mapHandler = new Edit.MapHandler({el:this.el,model:this.model});
    },
    
    initAutoComplete:function(){
      var $nombreField = this.$el.find('[name=name]');
      
      this.autoName = new PersonsApp.View.AutoCompletePersonField({el:$nombreField,tipoPersona:'municipio',filterField:['name','displayName','nickName']});
      
      var self = this;
      this.listenTo(this.autoName,'person:selected',function(person){
        setTimeout(self._usePerson.bind(self),10,person);
      });
    },
    
    initGeocode: function(){
      var self = this;
      var $direccionField = this.$el.find('[name=direccion]');
      
      this.autoGeocode = new App.View.AutoCompleteGeocodeField({el:$direccionField});
      
      this.listenTo(this.autoGeocode,'item:selected',function(geoplace){
        setTimeout(self._useGeoplace.bind(self),10,geoplace);
      });
    },
    
    _usePerson: function(person){
      this.model.usePerson(person);
      this._updateUI();
    },
    
    _useGeoplace: function(geoplace){
      this.model.useGeoplace(geoplace);
      this._updateUI();
    },
    
    _updateUI: function(){ 
      //actualiza Backbone.Form
      var fieldsForms = this.form.fields;
      for(var field in fieldsForms){
        var value = this.model.get(field);
        if(value){
          fieldsForms[field].editor.setValue(value);
        }
      }
      
      this.mapHandler._updateUI();
    },
    
    autoNickName: function(){
      var filter = new RegExp('[^A-Z0-9]','gi');
      var name = this.$el.find('[name=name]').val();
      name = name.replaceLatinChar().replace(filter,'');
      var value =  $.trim(name).toLowerCase();
      this.$el.find('[name=nickName]').val(value);
    },
    
    autoDisplayName: function(){
      var value = this.$el.find('[name=name]').val();
      var $field = this.$el.find('[name=displayName]').val(value);
    },
    
    events: {
      'click .js-save': 'onSaveClick',
      'click .js-cancel': 'onCancelClick',
      'keyup [name=name]': 'onNameChanged',
      'keyup [name=nickName]': 'onNickNameChanged',
      'keyup [name=displayName]': 'onDisplayNameChanged',
    },
    
    doneEdition: function(){
      DocManager.trigger('location:list');
    },
    
    onSaveClick: function(){
      var self = this;
      var location = this.model;
      var oldValue = location.toJSON();
      
      var errors = this.form.commit();
      if(errors){
          Message.warning('Revis&aacute; el formulario');
          return; 
      }
      
      var $btn = this.$el.find('.js-save').attr('data-loading-text','guardando...');
      $btn.button('loading');
      
      location.save().done(function(){
         $btn.button('reset');
         Message.success('Guardado');
         self.doneEdition();
         
      }).fail(function(e){
          $btn.button('reset');
          
          location.set(oldValue);
        
          Message.error('Ops! No se pudo guardar '+e);
          console.error(e);
      });     
    },
    
    onCancelClick: function(){
      this.doneEdition();
    }, 
    
    onNameChanged: function(e){
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
 
 
  Edit.MapHandler = Marionette.ItemView.extend({
   
    initialize: function(opts){
      Marionette.ItemView.prototype.initialize.apply(this,opts);
      
      if(opts.el){
        setTimeout(this.initMap.bind(this),10);
      }
    },
    
    onRender: function(){
      setTimeout(this.initMap.bind(this),10);
    },
    
    initMap: function(visible){
      
      if(!this.map){
        var coord = this.model.get('coordinate');
        
        if(!coord || coord.length !== 2){
          coord = [-34.6098,-58.4720]; // buenos aires
        }
        
        var map = L.map('map').setView(coord, 12);
        this.map = map;

        // agregando layer OpenStreet
        L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        
        
        // agregando control de edicion del market
        var drawnItems = new L.FeatureGroup();
        map.addLayer(drawnItems);
        var drawControl = new L.Control.Draw({
            draw: {polyline: false,polygon:false, circle: false,rectangle:false},
            edit: {
                featureGroup: drawnItems,
                edit: false,
                remove: false
            }
            
        });
        map.addControl(drawControl);
        
          // agregando layer para mark
        this.markerLayer = L.layerGroup().addTo(map);
        
        //agregando marker
        this._updateUI();
        
        //agregando listeners
        this.listenTo(map,'draw:created',this.onMarkCreated.bind(this));
      }
    },
    
    _updateUI: function(){
      var coord = this.model.get('coordinate');
      if((coord.length > 0) && this.map){
        
        this.map.panTo(coord);
        
        this.markerLayer.clearLayers();
        this.marker = L.marker(coord,{draggable:true});
        this.marker.addTo(this.markerLayer);
        this.$el.find('#coordContainer').html(coord.join(','));              
        this.listenTo(this.marker,'dragend',this.onMarkDragEnd.bind(this));
      }
    }, 
    
    centerMap: function(){
      var coord = this.model.get('coordinate');
      this.map.panTo(coord);
    },
    
    events: {
      'click .js-centermap': 'centerMap',
    },
    
    onMarkCreated: function(e){
      if(e.layerType === 'marker'){
        this.marker = e.layer;
        this.map.addLayer(e.layer);
        
        var latlng = e.layer.getLatLng();
        var coord = [latlng.lat,latlng.lng];
        this.model.set('coordinate',coord);
        this._updateUI();
      }
    },
    
    onMarkDragEnd: function(e){
      var marker = e.target;
      var pointer = marker.getLatLng();
      var coord = [pointer.lat,pointer.lng];
      this.model.set('coordinate',coord);
      this._updateUI();
    },
  });
  
  
});
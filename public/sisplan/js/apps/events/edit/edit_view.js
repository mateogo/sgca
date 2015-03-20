DocManager.module("EventsApp.Edit", function(Edit, DocManager, Backbone, Marionette, $, _){
  
  var CommonViews = DocManager.module('Common.views');
  
  Edit.Layout = Marionette.LayoutView.extend({
    className: 'row row-offcanvas row-offcanvas-left',

    getTemplate: function(){
      return utils.templates.EventEditLayout;
    },
    
    regions: {
      headerInfoRegion: '#headerinfo-region',
      mainRegion:    '#main-region'
    }
  });
  
  
  Edit.Editor = Marionette.ItemView.extend({
    tagName: 'div',
    initialize: function(opts){
      var model = opts.model;
      this.originalModel = _.clone(model);
      this.model = opts.model;
      this.form = new Backbone.Form({
        model: model,
        template: utils.templates.EventEditForm
      });
      
      Marionette.ItemView.prototype.initialize.apply(this,arguments);
    },
    getTemplate: function(){
      return _.template('<div></div>');
    },
    onRender: function(){
      console.log('ON RENDER EDITOR');
      this.form.render();
      this.$el.html(this.form.el);
      
      var $el = this.$el;
      setTimeout(function(){
        $el.find('[name=headline]').focus();  
      },10);
      
      this.validateFechaType();
      this.validateDates();
    },
    
    validateFechaType: function(){
      var type = this.$el.find('[name=ftype]').val();
      var showFHasta = (type === 'Fecha desde-hasta');
      var contFechaRep = (type === 'Repetición');
      
      if(showFHasta || contFechaRep){
        this.$el.find('#contFechaHasta').show();
      }else{
        this.$el.find('#contFechaHasta').hide();
      } 
      
      if(contFechaRep){
        this.$el.find('#contFechaRep').show();
        this.$el.find('#singleDate').hide();
        var dates = this.model.get('dates'); 
        if(dates && dates.length <2){
          this.openDatesGenerators();
        }
      }else{
        this.$el.find('#contFechaRep').hide();
        this.$el.find('#singleDate').show();
      }
    },
    
    validateDates: function(){
      console.log('validando fechas');
      
      var dates = this.model.get('dates');
      this.datesCollection = new Backbone.Collection(dates);
      this.datesCollection.comparator = function(a,b){
        var d1 = a.get('dfecha');
        var d2 = b.get('dfecha');
        if(!(d1 instanceof Date)) d1 = new Date(d1);
        if(!(d2 instanceof Date)) d2 = new Date(d2);
        
        if(d1 < d2) return -1;
        if(d1 > d2) return 1;
        return 0;
      };
      this.datesView = new Edit.CollectionDateView({collection: this.datesCollection});
      var self = this;
      this.listenTo(this.datesCollection,'change',function(eName,item){
        self.datesCollection.sort();
        //self.setDates(self.datesCollection.toJSON());
      });
      
      this.$el.find('#datesContainer').html(this.datesView.render().el);
    },
    
    getFDesde: function(){
      var fecha = this.$el.find('[name=fdesde]').datepicker('getDate');
      var hora = this.$el.find('[name=hdesde]').timepicker('getTime');
      if(fecha && hora){
        var date = utils.mergeDateTime(fecha,hora);
      }
      return fecha;
    },
    
    commitDates: function(){
      var dates = this.datesCollection.toJSON();
      console.log('seteando fechas',dates);
      this.model.set('dates',dates);
      if(dates.length > 0){
        var first = dates[0].dfecha;
        if(!(first instanceof Date)) first = new Date(first);
        
        var last = dates[dates.length-1].dfecha;
        if(!(last instanceof Date)) last = new Date(last);
        
        this.$el.find('[name=fdesde]').datepicker('setDate',first);
        this.$el.find('[name=hdesde]').timepicker('setTime',first);
        this.$el.find('[name=fhasta]').datepicker('setDate',last);
        this.$el.find('[name=hhasta]').timepicker('setTime',last);
      }
    },
    
    done: function(){
      DocManager.navigateBack();
    },
    
    openDatesGenerators: function(){
        var self = this;
        var datePatternForm = new CommonViews.DatePatternForm({model:this.model});
        
        
       var modal = new Backbone.BootstrapModal({
         content: datePatternForm,
         title: '',
         okText: 'Generar',
         cancelText: 'cancelar',
         enterTriggersOk: false,
       });
       
       modal.on('ok',function(){
           var dates = datePatternForm.getAllDates();
           var otherFields = datePatternForm.getOtherFields();
           for (var i = 0; i < dates.length; i++) {
             dates[i] = _.extend({dfecha: dates[i]},otherFields);
             
           }
           self.datesCollection.add(dates);
           //self.setDates(dates);
       });
       
       modal.open();
    },
    
    events: {
       'change [name=ftype]': 'onChangeFType',
       'click .js-newdate': 'onNewDate',
       'click .js-makerdates': 'openDatesGenerators',
       'click .js-cleardates': 'onClearDates',
       'click .js-save': 'onSave',
       'click .js-cancel': 'onCancel',
       'click .js-removedate': 'onRemoveDate'
    },
    
    onChangeFType: function(e){
      this.validateFechaType();
    },
    
    onNewDate: function(e){
      var date = {fdesde:null,hinicio:null,hfin:null};
      this.datesCollection.push(date);
    },
    
    onClearDates: function(e){
      e.stopPropagation();
      if(!this.model.get('dates')) return;
      
      var self = this;
      DocManager.confirm('¿Está seguro de borrar todas las fechas?').done(function(){
        self.datesCollection.reset([]);
        self.model.set('dates',[]);
      });
    },
    
    onSave: function(){
      this.commitDates();
      var errors = this.form.commit();
      
      if(errors){
        Message.warning('Por favor revise el formulario');
        return;
      }
      
      var dateTime = utils.mergeDateTime(this.model.get('fdesde'),this.model.get('hdesde'));
      if(dateTime){
        this.model.set('fdesde',dateTime);
      }
      dateTime = utils.mergeDateTime(this.model.get('fhasta'),this.model.get('hhasta'));
      if(dateTime){
        this.model.set('fhasta',dateTime);
      }
      
      var self = this;
      this.model.save().done(function(){
        Message.success('Guardado');
        self.done();
      }).fail(function(e){
        Message.error('Ops! no se pudo guardar');
      });
    },
    
    onCancel: function(e){
      this.done();
    }
  });
  
  
  //EDITOR ITEM DATE
  
  Edit.ItemDate = Marionette.ItemView.extend({
    tagName: 'div',
    initialize: function(){
      Marionette.ItemView.prototype.initialize.apply(this,arguments);
      var dfecha = this.model.get('dfecha');
      this.modeEdit = (typeof(dfecha) === 'undefined' || dfecha === null);
    },
    getTemplate: function(){
      if(this.modeEdit){
        return utils.templates.EventDateItemEditor;
      }else{
        return utils.templates.EventDateItemRender; 
      }
    },
    
    onRender: function(){
      var date = this.model.get('dfecha');
      var hinicio = this.model.get('hinicio');
      var hfin = this.model.get('hfin');
      
      if(!(date instanceof Date)) date = new Date(date);
      if(hinicio && !(hinicio instanceof Date)) hinicio = new Date(hinicio);
      if(hfin && !(hfin instanceof Date)) hfin = new Date(hfin);
      
      
      if(this.modeEdit){
        var timeParams = {timeFormat:'H:i'};
        
        this.$el.find('[name=date]').datepicker({format:'dd/mm/YYYY'}).datepicker('setDate',date);
        this.$el.find('[name=hinicio]').timepicker(timeParams).timepicker('setTime',hinicio);
        this.$el.find('[name=hfin]').timepicker(timeParams).timepicker('setTime',hfin);
        this.$el.find('[name=duration]').val(this.model.get('duration'));
        this.$el.find('[name=leyenda]').val(this.model.get('leyenda'));
      }else{
        var str = moment(date).format('dddd, LL');
        if(hinicio && hfin){
          str += '<span class="text-muted">';
          str += ' de ' + moment(hinicio).format('LT');
          str += ' a ' + moment(hfin).format('LT');
          str += '</span>';
        }else if(hinicio){
          str += '<span class="text-muted">' + moment(hinicio).format('LT') + '</span>';
        }
        if(this.model.get('duration')) str += ' '+ this.model.get('duration');
        if(this.model.get('leyenda')) str += ' - '+ this.model.get('leyenda');  
        this.$el.find('#label').html(str);
      }
    },
    editMode: function(hide){
      this.modeEdit = (typeof(hide) === 'undefined') || (hide !== false);
      this.render();
    },
    
    commit: function(){
      var date = this.$el.find('[name=date]').datepicker('getDate');
      var hinicio = this.$el.find('[name=hinicio]').timepicker('getTime');
      var hfin = this.$el.find('[name=hfin]').timepicker('getTime');
      var duration = this.$el.find('[name=duration]').val();
      var leyenda = this.$el.find('[name=leyenda]').val();
      
      this.model.set('dfecha',date);
      this.model.set('hinicio',hinicio);
      this.model.set('hfin',hfin);
      this.model.set('hinicio',hinicio);
      this.model.set('duration',duration);
      this.model.set('leyenda',leyenda);
    },
    
    events: {
      'click .js-edit': 'onEdit',
      'click .js-save': 'onSave',
      'click .js-cancel': 'onCancel',
      'click .js-removedate': 'onRemoveDate'
    },
    
    onEdit: function(e){
      e.stopPropagation();
      this.editMode();
    },
    onSave: function(e){
      e.stopPropagation();
      this.commit();
      this.editMode(false);
    },
    onCancel: function(e){
      e.stopPropagation();
      this.editMode(false);
    },
    onRemoveDate: function(e){
      e.stopPropagation();
      this.model.collection.remove(this.model);
    }
    
  });
  
  Edit.CollectionDateView = Marionette.CollectionView.extend({
    childView: Edit.ItemDate
  });
  
});
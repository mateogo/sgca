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
      }else{
        this.$el.find('#contFechaRep').hide();
      }
      
    },
    
    validateDates: function(){
      console.log('validando fechas');
      
      var dates = this.model.get('dates');
      this.datesCollection = new Backbone.Collection(dates);
      this.datesCollection .comparator = function(a,b){
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
        self.setDates(self.datesCollection.toJSON());
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
    
    setDates: function(dates){
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
        var datePatternForm = new CommonViews.DatePatternForm();
        var fdesde = this.getFDesde();
        if(fdesde){
          datePatternForm.setStartDate(fdesde);
        }
        
        
       var modal = new Backbone.BootstrapModal({
         content: datePatternForm,
         title: '',
         okText: 'Generar',
         cancelText: 'cancelar',
         enterTriggersOk: false,
       });
       
       modal.on('ok',function(){
           var dates = datePatternForm.getAllDates();
           for (var i = 0; i < dates.length; i++) {
             dates[i] = {dfecha: dates[i]};
           }
           self.datesCollection.reset(dates);
           self.setDates(dates);
           //self.validateDates();  
       });
       
       modal.open();
    },
    
    events: {
       'change [name=ftype]': 'onChangeFType',
       'click .js-makerdates': 'openDatesGenerators',
       'click .js-save': 'onSave',
       'click .js-cancel': 'onCancel'
    },
    
    onChangeFType: function(e){
      this.validateFechaType();
    },
    
    onSave: function(){
      var errors = this.form.commit();
      
      if(!errors){
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
      }
    },
    
    onCancel: function(e){
      this.done();
    }
  });
  
  
  Edit.ItemDate = Marionette.ItemView.extend({
    tagName: 'div',
    initialize: function(){
      this.modeEdit = false;
      Marionette.ItemView.prototype.initialize.apply(this,arguments);
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
      if(!(date instanceof Date)){
        date = new Date(date);
      }
      if(this.modeEdit){
        this.$el.find('[name=date]').datepicker({format:'dd/mm/YYYY'}).datepicker('setDate',date);
        this.$el.find('[name=time]').timepicker({timeFormat:'H:i'}).timepicker('setTime',date);
      }else{
        var str = moment(date).format('LLLL'); 
        this.$el.find('#label').html(str);
      }
    },
    editMode: function(hide){
      this.modeEdit = (typeof(hide) === 'undefined') || (hide !== false);
      this.render();
    },
    
    commit: function(){
      var date = this.$el.find('[name=date]').datepicker('getDate');
      var time = this.$el.find('[name=time]').timepicker('getTime');
      var dateTime = utils.mergeDateTime(date,time);
      if(dateTime){
        this.model.set('dfecha',dateTime);
      }
    },
    
    events: {
      'click .js-edit': 'onEdit',
      'click .js-save': 'onSave',
      'click .js-cancel': 'onCancel',
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
    }
    
  });
  
  Edit.CollectionDateView = Marionette.CollectionView.extend({
    childView: Edit.ItemDate
  });
  
});
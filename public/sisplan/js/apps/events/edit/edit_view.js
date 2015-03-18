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
      
      //this.datePatternForm = new CommonViews.DatePatternForm();

      Marionette.ItemView.prototype.initialize.apply(this,arguments);
    },
    getTemplate: function(){
      return _.template('<div></div>');
    },
    onRender: function(){
      this.form.render();
      this.$el.html(this.form.el);
      
      //this.datePatternForm.render();
      //this.$el.find('#contFechaRep').html(this.datePatternForm.el);
      
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
        this.validateDates();
        
      }else{
        this.$el.find('#contFechaRep').hide();
      }
      
    },
    
    validateDates: function(){
      var dates = this.model.get('dates');
      var collection = new Backbone.Collection(dates);
      
      this.collectionDates = new Edit.CollectionDateView({collection: collection});
      this.$el.find('#datesContainer').html(this.collectionDates.render().el);
      
    },
    
    getFDesde: function(){
      var fecha = this.$el.find('[name=fdesde]').datepicker('getDate');
      var hora = this.$el.find('[name=hdesde]').timepicker('getTime');
      if(fecha && hora){
        var date = DocManager.mergeDateTime(fecha,hora);
      }
      return fecha;
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
           self.model.set('dates',dates);
           if(dates.length > 0){
             self.$el.find('[name=fdesde]').datepicker('setDate',dates[0].dfecha);
             self.$el.find('[name=hdesde]').timepicker('setTime',dates[0].dfecha);
             self.$el.find('[name=fhasta]').datepicker('setDate',dates[dates.length-1].dfecha);
             self.$el.find('[name=hhasta]').timepicker('setTime',dates[dates.length-1].dfecha);
           }
           self.validateDates();  
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
        var dateTime = DocManager.mergeDateTime(this.model.get('fdesde'),this.model.get('hdesde'));
        if(dateTime){
          this.model.set('fdesde',dateTime);
        }
        dateTime = DocManager.mergeDateTime(this.model.get('fhasta'),this.model.get('hhasta'));
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
    render: function(){
      var str = moment(this.model.get('dfecha')).format('LLLL');
      var el = $('<div></div>',{text:str,style:'padding:5px;background-color:white;border:1px solid #CCC;border-radius:5px;margin-bottom:5px'});
      //el.attr('style','padding:5px;background-color:white;border:1px solid #CCC');
      this.$el.html(el);
      return this;
    }
  });
  
  Edit.CollectionDateView = Marionette.CollectionView.extend({
    childView: Edit.ItemDate
  });
  
});
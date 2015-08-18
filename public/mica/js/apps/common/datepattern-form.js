DocManager.module("Common.views", function(views, DocManager, Backbone, Marionette, $, _){
  
  views.DatePatternForm = Marionette.ItemView.extend({
    
    initialize: function(opts){
      if(opts.model){
        this.initObj = opts.model;
      }
      
      this.rule = new RRule({});
    },
    
    onRender: function(){
      this.validateFreq();
      
      var optsPicker = {format:'dd/mm/YYYY'};
      this.$el.find('[name=dstart]').datepicker(optsPicker);
      this.$el.find('.time-picker').timepicker({'timeFormat': 'H:i'});
      this.$el.find('[name=until]').datepicker(optsPicker);
      this.rendered = true;
      
      if(this.initObj){
        var fdesde = this.initObj.get('fdesde');
        var fhasta = this.initObj.get('fhasta');
        var hinicio = this.initObj.get('hinicio');
        var hfin = this.initObj.get('hfin');
        var leyenda = this.initObj.get('leyendafecha');
        var duration = this.initObj.get('duration');
        
        if(fdesde &&  !(fdesde instanceof Date)) fdesde = new Date(fdesde);
        if(fhasta &&  !(fhasta instanceof Date)) fhasta = new Date(fhasta);
        if(hinicio &&  !(hinicio instanceof Date)) hinicio = new Date(hinicio);
        if(hfin &&  !(hfin instanceof Date)) hfin = new Date(hfin);
        
        if(fdesde) this.$el.find('[name=dstart]').datepicker('setDate',fdesde);
        if(fhasta) this.$el.find('[name=until]').datepicker('setDate',fhasta);
        if(hinicio) this.$el.find('[name=hinicio]').timepicker('setTime',hinicio);
        if(hfin){
          this.$el.find('[name=hfin]').timepicker('setTime',hfin);
          this.$el.find('[name=endType][value=endDate]').prop('checked',true);
        }
        
        if(leyenda) this.$el.find('[name=leyenda]').val(leyenda);
        if(duration) this.$el.find('[name=duration]').val(duration);
        
      }
    },
    getTemplate: function(){
      return utils.templates.DatePatternForm;
    },
    
    getOpts: function(){
      var opts = {};
      
      opts.freq = parseInt(this.$el.find('[name=freq]').val());
      opts.interval = parseInt(this.$el.find('[name=interval]').val());
      opts.dtstart = this.getStartDate();
      
      if(opts.freq === RRule.WEEKLY){
        var weekdays = this.$el.find('[name=weekday]:checked');
        if(weekdays && weekdays.length){
          opts.byweekday = [];
          _.each(weekdays,function(item){
            opts.byweekday.push(RRule[$(item).val()]);
          });
        }
      }
      
      var endType = this.$el.find('[name=endType]:checked').val();
      if(endType === 'endRepeat'){
        opts.count = this.$el.find('[name=count]').val();
      }else{
        opts.until = this.getUntilDate();
      }
      
      return opts;
    },
    
    validateRule: function(){
      var opts = this.getOpts();
      
      this.rule = new RRule(opts);
      
      this.$el.find('#ruleText').html(this.getRuleString());
      this.$el.find('#ruleDescription').html(this.getDescription());
    },
    
    validateFreq: function(){
      var freq = parseInt(this.$el.find('[name=freq]').val());
      var freqLabel = this.$el.find('[name=freq] option:selected').text();
      
      var isWeek = (freq === RRule.WEEKLY);
      if(isWeek){
        this.$el.find('#weekRepeat').show();
      }else{
        this.$el.find('#weekRepeat').hide();
      }
      
      this.$el.find('#lblRepeat').html(freqLabel);
      
      this.validateRule();
    },
    
    getStartDate: function(){
      var dstart = this.$el.find('[name=dstart]').datepicker('getDate');
      var tstart = this.$el.find('[name=hinicio]').timepicker('getTime');
      var date = utils.mergeDateTime(dstart,tstart);
      return date;
    },
   
    getUntilDate: function(){
      return this.$el.find('[name=until]').datepicker('getDate');
    },
    
    getRuleString: function(){
      return this.rule.toString();
    },
    
    getAllDates: function(){
      var opts = this.getOpts();
      var dates = [];
      if(opts.count || opts.until){
        dates = this.rule.all();
        for (var i = 0; i < dates.length; i++) {
          dates[i] = new Date(dates[i]);
        }
      }
      return dates;
    },
    
    getOtherFields: function(){
      var obj = {};
      obj.hinicio =  this.$el.find('[name=hinicio]').timepicker('getTime');
      obj.hfin = this.$el.find('[name=hfin]').timepicker('getTime');
      obj.duration = this.$el.find('[name=duration]').val();
      obj.leyenda = this.$el.find('[name=leyenda]').val();
      
      return obj;
    },
    
    getDescription: function(){
      return this.rule.toText();
    },
    
    
    
    events: {
      'change [name=freq]': 'onChangeFreq',
      'change [name=interval]': 'onChangeForm',
      'change [name=dtstart]': 'onChangeForm',
      'change [name=until]': 'onChangeUntil',
      'change [name=count]': 'onChangeCount',
      'change [name=endType]': 'onChangeForm',
      'change [name=weekday]': 'onChangeForm'
    },
    
    onChangeForm: function(e){
      this.validateRule();
    },
    
    onChangeFreq: function(e){
      this.validateFreq();
    },
    
    onChangeUntil: function(){
      this.$el.find('[name=endType][value=endDate]').prop('checked',true);
      this.validateRule();
    },
    
    onChangeCount: function(){
      this.$el.find('[name=endType][value=endRepeat]').prop('checked',true);
      this.validateRule();
    },
    
    
  });
  
  
});
DocManager.module("ObrasApp.Common", function(Common, DocManager, Backbone, Marionette, $, _){


  Common.WizardView =  Marionette.ItemView.extend({
      steps: [],
      onRender: function(){
        this.$el.find('#wizard').wizard();
        
        var steps = this.steps;
        
        for (var i = 0; i < steps.length; i++) {
          var clazzView = steps[i];
          
          var container = this.$el.find('[data-step='+(i+1)+'] .step-body');
          steps[i] = new clazzView({el:container,model:this.model});
          steps[i].render();
        }
      },

      onDestroy: function(){
        for (var i = 0; i < this.steps.length; i++) {
          if(this.steps[i]){
            this.steps[i].destroy();
            this.steps[i] = null;
          }
        }
      },
      
      wizard: function(str,value){
        return this.$el.find('#wizard').wizard(str,value);
      },
      
      events: {
        'actionclicked.fu.wizard': 'clickNext',
        'click .js-next': 'next',
        'click .js-submit': 'save'
      },
      
      save: function(){
      },
      
      validateLastStep: function(){
        var currentItem = this.wizard('selectedItem');
        var isLastStep = currentItem.step === this.steps.length;
        if(isLastStep){
          this.$el.find('.btn-next').addClass('disabled');
        }else{
          this.$el.find('.btn-next').removeClass('disabled');
        }
      },
      
      validationStep: function(incPos){
        var currentItem = this.wizard('selectedItem');
        var step = currentItem.step;
        if(step > this.steps.length || incPos === -1 || this.steps[step-1].validate()){
          this.steps[step-1].commit();
          var next = step+incPos;
          this.wizard('selectedItem',{step:next});
          if(next === this.steps.length){
            this.steps[next-1].render();
          }
          $('body').scrollTop(0);
          this.validateLastStep();
        }
      },
      
      prev: function(){
        this.validationStep(-1);
      },
      
      next: function(){
        this.validationStep(1);
      },
      
      clickNext: function(e,data){
        e.stopPropagation(); e.preventDefault();
        if(data.direction === 'next'){
          this.next();
        }else{
          this.prev();
        }
      }
  });

});
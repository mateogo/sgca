DocManager.module("MicaRequestApp.Common.Views", function(Views, DocManager, Backbone, Marionette, $, _){

  Views.Form = Marionette.ItemView.extend({

    formevents: {
      "click button.js-submit": "submitClicked",
      "click button.js-cancel": "cancelClicked",
      "change": "change"
    },

    onRender: function(){
      var self = this;
          /*      this.$(".js-datepicker").datepicker({
                        format: "dd/mm/yyyy"
                    }).on('changeDate',function(ev){
                        console.log('change DATEPICKER');
                        self.change(ev);

                    });
          */      
    },
/*
    buildTags: function(target){
      console.log('buildtags [%s]', target.selectedOptions)
      if(target.multiple){
        var list = [];
        _.each(target.selectedOptions, function(elem){
          console.log('Selected: [%s]  [%s]', elem.label, elem.value)
          list.push(elem.value)
        })
        this.model.set(target.name, list);        
      }
    },
*/
    change: function (event) {
        var target = event.target,
            change = {};
        
        if(!target.name) return;
				
        switch (target.type){
						case 'checkbox':
              //console.log('checked:[%s]: name:[%s] value:[%s]',target.checked, target.name, target.value);
							this.model.get(target.name)[target.value] = target.checked;
              //{
              //  name: {something: true, elsesomething: false, etc: true}
              //}
							//console.log('checked:[%s]: name:[%s] value:[%s]',target.checked, target.name, target.value);
							break;
						case 'radio':
              //console.log('[%s]:[%s]   checked:[%s]: name:[%s] value:[%s] ',this.model.whoami,this.model.get(target.name),target.checked, target.name, target.value);
              if(this.model.get(target.name)[target.value]){
                this.model.get(target.name)[target.value] = target.checked;
              }else{
                change[target.name] = target.value;
                this.model.set(change); 
              }
              //{
              //  name: {something: fase, elsesomething: true, etc: false}
              //  or
              //  name: elsesomething
              //}
              //$('#ccoperativa').radio('check');
						 	//console.log('checked:[%s]: name:[%s] value:[%s] [%s]',target.checked, target.name, target.value, this.model.get(target.name)[target.value]);
							break;
						
						case 'select-multiple':
              //console.log('CHANGE MULTIPLE: name:[%s] id[%s] value:[%s] tags:[%s]', target.name, target.id, target.value, this.$('#'+target.id).tagsinput('items'));
              this.model.set(target.name, this.$('#'+target.id).tagsinput('items'));  
						  break;
						
						default:
							change[target.name] = target.value;
							this.model.set(change);
							//console.log('CHANGE DEFAULT: [%s]: [%s] [%s]',target.name, target.value, target['multiple']);
              //console.dir(this.model.attributes)
              break;
				}
			
//        if(target.type==='checkbox'){
//          this.model.get(target.name)[target.value] = target.checked;
//          //console.log('CHANGE: checked:[%s]: name:[%s] value:[%s]',target.checked, target.name, target.value);
//        }else{
//          change[target.name] = target.value;
//          this.model.set(change);          
//          console.log('[%s] CHANGE: [%s]: [%s] [%s]',this.model.whoami, target.name, target.value, target['multiple']);
//        }
//        if(target['dataset']){
//          if(target['dataset'].role === 'tagsinput'){
//            this.buildTags(target)
//						 this.model.set(change);  
//          }
//        }

        var err = this.model.validate(change);
        this.onFormDataInvalid((err||{}));
    },

    submitClicked: function(e){
      e.preventDefault();
      var err = this.model.validate(this.model.attributes);
			
      if(err){
        this.onFormDataInvalid((err||{}));
      }else{
        //var data = Backbone.Syphon.serialize(this);
        //console.log('FORM SUBMITTED');
        this.trigger("form:submit", this.model);        
      }

    },

    cancelClicked: function(e){
      e.preventDefault();
      this.close()
    },

    showAlert: function(title, text, klass){
      this.$('.alert').removeClass("alert-error alert-warning alert-success alert-info");
      this.$('.alert').addClass(klass);
      this.$('.alert').html('<strong>' + title + '</strong> ' + text);
      this.$('.alert').show();

    },

    onFormNotifications: function(msgs, tstyle){
      var $view = this.$el,
          selector;

      if(!tstyle){
        tstyle = 'warning';
      }
      if(['warning','succes','error'].indexOf(tstyle) === -1){
        tstyle = 'warning';
      }
      
      tstyle = 'has-' + tstyle;
      selector = "." + tstyle;

      //console.log('onForm Notifications [%s][%s]', tstyle, selector);

      var clearFormErrors = function(){
        $view.find(selector).each(function(){
          $(this).removeClass(tstyle);
          $('.help-block', $(this)).html("");
        });
      }

      var markErrors = function(value, key){
        var $controlGroup = $view.find("#" + key).closest('.form-group');
        $controlGroup.addClass(tstyle);
        $('.help-block', $controlGroup).html(value);
      }

      clearFormErrors();
      _.each(msgs, markErrors);
    },

    onFormDataInvalid: function(errors){
      //console.log('FORM ON RENDER')
      var $view = this.$el;

      var clearFormErrors = function(){
        //var $view = $view.find("form");
        var $form = $view;
        $form.find(".has-error").each(function(){
          $(this).removeClass("has-error");
          $('.help-block', $(this)).html("");
        });
      }

      var markErrors = function(value, key){
        //console.log('Mark Erross: value: [%s]  key:[%s]', value, key)
        var $controlGroup = $view.find("#" + key).closest('.form-group');
        $controlGroup.addClass("has-error");
        $('.help-block', $controlGroup).html(value);
      }

      clearFormErrors();
      _.each(errors, markErrors);
    }
  });


});

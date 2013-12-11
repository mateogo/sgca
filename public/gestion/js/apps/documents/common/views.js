DocManager.module("DocsApp.Common.Views", function(Views, DocManager, Backbone, Marionette, $, _){

  Views.Form = Marionette.ItemView.extend({

    events: {
      "click button.js-submit": "submitClicked",
      "change": "change"
    },

    change: function (event) {
        //utils.hideAlert();
        var target = event.target;
        var change = {};
        change[target.name] = target.value;
        this.model.set(change);
        var err = this.model.validate(change);
        this.onFormDataInvalid((err||{}));
    },
/*        if(this.model.isValid()){
           console.log('validación ok')
        }else{
           console.log('validación failed [%s]',this.model.validationError)
        }
*/ 
    submitClicked: function(e){
      e.preventDefault();
      //var data = Backbone.Syphon.serialize(this);
      this.trigger("form:submit", this.model);
    },

    onFormDataInvalid: function(errors){
      var $view = this.$el;

      var clearFormErrors = function(){
        //var $form = $view.find("form");
        var $form = $view;
        $form.find(".has-error").each(function(){
          $(this).removeClass("has-error");
          $('.help-block', $(this)).html("");
        });
      }

      var markErrors = function(value, key){
        var $controlGroup = $view.find("#" + key).closest('.form-group');
        $controlGroup.addClass("has-error");
        $('.help-block', $controlGroup).html(value);
      }

      clearFormErrors();
      _.each(errors, markErrors);
    }
  });

});

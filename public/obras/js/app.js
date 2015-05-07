var DocManager = new Marionette.Application();

DocManager.addRegions({
  headerRegion: "#header-region",
  mainRegion: 	"#main-region",
  footerRegion: "#footer-region",
	
	dialogRegion: Marionette.Region.Dialog.extend({
    el: "#dialog-region"
  }) 
});

DocManager.navigate = function(route,  options){
  console.log('DocManager.navigate: app.js')
  options || (options = {});
  Backbone.history.navigate(route, options);
};

DocManager.getCurrentRoute = function(){
  console.log('DoCManager.getCurretnRoute: app.js')
  return Backbone.history.fragment
};

DocManager.on("start", function(){
  console.log('DocManager History start: start');
  if(Backbone.history){
    Backbone.history.start();

    if(this.getCurrentRoute() === ""){
			DocManager.trigger("obras:home");
    }
  }
});

/**
 * @return {promise}
 */
DocManager.confirm = function(txt,opts){
  var def = $.Deferred();
  
  var okText = (opts && opts.okText) ? opts.okText : 'ok';
  var cancelText = (opts && opts.cancelText) ? opts.cancelText : 'cancel';
  
  var modal = new Backbone.BootstrapModal({ content: '<h4>'+ txt +'</h4>',okText:okText,cancelText:cancelText});
  
  modal.open();
  modal.once('ok',def.resolve);
  modal.once('cancel',def.reject);
  return def.promise();
};


_.extend(Backbone.Validation.callbacks, {
  valid: function (view, attr, selector) {
      var $el = view.$('[name=' + attr + ']'), 
          $group = $el.closest('.form-group');
      
      $group.removeClass('has-error');
      $group.find('.help-block').html('');
  },
  invalid: function (view, attr, error, selector) {
      var $el = view.$el.find('[name=' + attr + ']'), 
          $group = $el.closest('.form-group');
      
      $group.addClass('has-error');
      $group.find('.help-block').html(error);
  }
});

_.extend(Backbone.Validation.messages, {
  required: 'Es necesario',
  number: 'Deber ser un número',
  email: 'Debe ser un email valido'
});

_.extend(Backbone.Validation.validators, {});

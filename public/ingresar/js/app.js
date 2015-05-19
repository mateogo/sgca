var DocManager = new Marionette.Application();

DocManager.addRegions({
  headerRegion: "#header-region",
  mainRegion: "#main-region",
  footerRegion: "#footer-region",

  
});

DocManager.navigate = function(route,  options){
  options || (options = {});
  Backbone.history.navigate(route, options);
};

DocManager.navigateNew = function(route){
  var url = window.location.origin + window.location.pathname +'#'+ route;
  window.open(url);
};

DocManager.navigateBack = function(){
  window.history.back();
};



DocManager.getCurrentRoute = function(){
  console.log('DoCManager.getCurretnRoute: app.js');
  return Backbone.history.fragment;
};

DocManager.on("start", function(){
  if(Backbone.history){
    Backbone.history.start();

    if(this.getCurrentRoute() === ""){
      DocManager.trigger("login:user");
    }
  }
});

/**
 * @return {promise}
 */
DocManager.confirm = function(txt, opts){
  var def = $.Deferred();
  
  var okText = (opts && opts.okText) ? opts.okText : 'ok';
  var cancelText = (opts && opts.cancelText) ? opts.cancelText : 'cancel';
  
  var modal = new Backbone.BootstrapModal({ content: '<h4>'+ txt +'</h4>',okText:okText,cancelText:cancelText});
  
  modal.open();
  modal.once('ok',def.resolve);
  modal.once('cancel',def.reject);
  return def.promise();
};

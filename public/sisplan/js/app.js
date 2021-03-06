var DocManager = new Marionette.Application();

DocManager.addRegions({
  headerRegion: "#header-region",
  mainRegion: "#main-region",
  footerRegion: "#footer-region",
  dialogRegion: Marionette.Region.Dialog.extend({
    el: "#dialog-region"
  })
  
});

DocManager.navigate = function(route,  options){
  console.log('DocManager.navigate: app.js');
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
  console.log('DocManager History start: start');
  if(Backbone.history){
    Backbone.history.start();
  }
});

/**
 * @return {promise}
 */
DocManager.confirm = function(txt){
  var def = $.Deferred();
  
  var modal = new Backbone.BootstrapModal({ content: '<h4>'+ txt +'</h4>' });
  
  modal.open();
  modal.once('ok',def.resolve);
  modal.once('cancel',def.reject);
  return def.promise();
};
var DocManager = new Marionette.Application();

DocManager.addRegions({
  headerRegion: "#header-region",
  bucketSidebarRegion: "#main-side-menu",
  mainRegion: 	"#main-region",
  footerRegion: "#footer-region",
});

DocManager.navigate = function(route,  options){
  console.log('DocManager.navigate: app.js')
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
  console.log('DocManager.getCurretnRoute: app.js')
  return Backbone.history.fragment
};


DocManager.getCurrentDomain = function(){
  if (!window.location.origin) {
    window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port: '');
  }

  return location.origin;
};


/**
 * @return {promise}
 */
DocManager.confirm = function(txt,opts){
  var def = $.Deferred();
  
  var okText = (opts && opts.okText) ? opts.okText : 'ok';
  var cancelText = (opts && opts.cancelText) ? opts.cancelText : 'cancel';
  
  var modal = new Backbone.BootstrapModal({ content:  txt ,okText:okText,cancelText:cancelText});
  
  modal.open();
  modal.once('ok',def.resolve);
  modal.once('cancel',def.reject);
  return def.promise();
};

DocManager.on("start", function(){
  console.log('DocManager History start: start [%s]',this.getCurrentRoute());
  if(Backbone.history){
    Backbone.history.start();

    if(this.getCurrentRoute() === ""){
      DocManager.trigger("home:show");
    }
  }
});

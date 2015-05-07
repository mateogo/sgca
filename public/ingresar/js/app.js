var DocManager = new Marionette.Application();

DocManager.addRegions({
  headerRegion: "#header-region",
  mainRegion: "#main-region",
  footerRegion: "#footer-region",

  
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

    if(this.getCurrentRoute() === ""){
      console.log('default route')
      DocManager.trigger("login:user");
    }


  }
});

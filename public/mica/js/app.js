var DocManager = new Marionette.Application();

DocManager.addRegions({
  headerRegion: "#header-region",
  bucketSidebarRegion: "#main-side-menu",
  mainRegion: 	"#main-region",
  footerRegion: "#footer-region",
  rightRegion: '.right-sidebar'
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

DocManager.openRightPanel = function($content){
  setTimeout(function(){
    $('.right-sidebar').toggleClass('open-right-bar');
    $('#container').toggleClass('open-right-panel');
  });

  DocManager.rightRegion.show($content);
};

DocManager.openPopup = function($content){
  return DocManager.module('BackendApp.Common.Views').slimPopup($content);
};


/**
 * @return {promise}
 */
DocManager.confirm = function(txt,opts){
  var def = $.Deferred();

  var okText = (opts && opts.okText) ? opts.okText : 's';
  var cancelText = (opts && opts.cancelText) ? opts.cancelText : 'cancelar';

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


(function(){

  var session = {
    user: null,
    micaisncr: null,
    isMicaAdmin: false
  };

  var load = function(callback){
    dao.gestionUser.getUser(DocManager, function (user){
      session.user = user;
      if(user.id ){// && dao.gestionUser.hasPermissionTo('mica:user', 'mica', {} ) ){

        //Verificación: el usuario YA TIENE una inscripción en MICA
        fetchingMicaRequest = DocManager.request("micarqst:fetchby:user", user, "mica");
        $.when(fetchingMicaRequest).done(function(micarqst){
          session.micarqst = micarqst;
          session.isMicaAdmin =  dao.gestionUser.hasPermissionTo('mica:manager', 'mica', {} );
          callback(session);
        });

      }else{
        Message.warning('Debe iniciar sesión y estar inscripto en MICA 2015');
        window.open('/ingresar/#mica', '_self');
      }
    });
  };



  DocManager.reqres.setHandler('userlogged:load',function(callback){
    if(!session.user){
      load(function(){
        callback(session.user);
      });
    }else{
      callback(session.user);
    }
  });

  DocManager.reqres.setHandler('userlogged:getMicaProfile',function(callback){
    return session.micarqst;
  });

  DocManager.reqres.setHandler('userlogged:isMicaAdmin',function(callback){
    if(!session.user){
      load(function(){
        callback(session.isMicaAdmin);
      });
    }else{
      callback(session.isMicaAdmin);
    }
  });

})();

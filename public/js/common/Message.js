DocManager.module("Message", function(Messages, DocManager, Backbone, Marionette, $, _){

  //Doc: http://bootstrap-growl.remabledesigns.com/


  function notify(str,type,icon){
      return $.notify({
          message: str,
          icon: icon
        },{
          type: type,
          placement:{
              from: 'top',
              align: 'center'
          },
          delay: 5000,
          offset: 10,
          z_index: 1041,
          template: '<div data-notify="container" class="col-xs-10 col-sm-4 alert alert-sgc alert-{0} text-center" role="alert"> '+
                    '   <span data-notify="icon" class=""></span>'+
                    '   <span data-notify="message">{2}</span>'+
                    '</div>'
      });
  }


    var NotifyImpl = {
      success: function(str){
          return notify(str,'success','glyphicon glyphicon-ok');
          console.log(this);
      },
      info: function(str){
          return notify(str,'info','glyphicon glyphicon-info-sign');
      },
      warning: function(str){
          return notify(str,'warning','glyphicon glyphicon-warning-sign');
      },
      error: function(str){
          return notify(str,'danger','glyphicon glyphicon-warning-sign');
      },
      clear: function(){
        $.notifyClose();
      }
    }

   var InlineImpl = {
      success: function(str){
        this.notify(str,'success','glyphicon glyphicon-ok');
      },
      info: function(str){
        this.notify(str,'info','glyphicon glyphicon-info-sign');
      },
      warning: function(str){
        this.notify(str,'warning','glyphicon glyphicon-warning-sign');
      },
      error: function(str){
          this.notify(str,'danger','glyphicon glyphicon-warning-sign');
      },
      notify: function(str,type,icon){
        var $alert = (InlineImpl.el) ? $(InlineImpl.el) : $('.alert').first();
        $alert.first().removeClass("alert-error alert-warning alert-success alert-info");
        $alert.first().addClass('alert-'+type);
        $alert.html('<i class="'+icon+'"></i> ' + str);
        $alert.show();
        this.autoHide();
        return this;
      },
      update: function(){
        //dummy function
      },
      hide: function(){
        var $alert = (InlineImpl.el) ? $(InlineImpl.el) : $('.alert').first();
        $alert.slideUp();
      },
      autoHide: function(){
        var self = this;
        setTimeout(function(){
          self.hide();
        },5000);
      },
      clear: function(){
        this.hide();
      }
    }

  Message = {
      success: function(str,cont){
        return this.getHandler(cont).success(str);
      },
      info: function(str,cont){
        return this.getHandler(cont).info(str);
      },
      warning: function(str,cont){
        return this.getHandler(cont).warning(str);
      },
      error: function(str,cont){
        return this.getHandler(cont).error(str);
      },
      clear: function(){
        InlineImpl.clear();
        NotifyImpl.clear();
      },
      getHandler: function(cont){
        if(cont){
          InlineImpl.el = cont;
          return InlineImpl;
        }
        return NotifyImpl;
      }
  };

  window.Message = Message;

});

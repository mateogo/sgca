DocManager.module("Message", function(Messages, DocManager, Backbone, Marionette, $, _){
    
  //Doc: http://bootstrap-growl.remabledesigns.com/  
    
  function notify(str,type,icon){
      $.notify({
          message: str,
          icon: icon
        },{
          type: type,
          placement:{
              from: 'top',
              align: 'center'
          },
          delay: 3000,
          offset: 10,
          z_index: 1041,
          template: '<div data-notify="container" class="col-xs-10 col-sm-2 alert alert-sgc alert-{0} text-center" role="alert"> '+
                    '   <span data-notify="icon" class="pull-left"></span>'+
                    '   <span data-notify="message">{2}</span>'+
                    '</div>'      
      })
  }  
    
    
  Message = {
      success: function(str){
          notify(str,'success','glyphicon glyphicon-ok');
      },
      info: function(str){
          notify(str,'info','glyphicon glyphicon-info-sign');
      },
      warning: function(str){
          notify(str,'warning','glyphicon glyphicon-warning-sign');
      },
      error: function(str){
          notify(str,'danger','glyphicon glyphicon-warning-sign');
      }
  }  
  
  window.Message = Message;
    
})
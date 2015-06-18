/**
 * "Clase estatica" para mostrar notitifaciones al usuario. 
 * 
 * El mensaje se oculta automaticamente después de un tiempe predeterminado
 * 
 * Tiene dos modalidades de uso, como mensaje Growl (global) o en el algún contenedor DOM especifico
 *
 * Se declara en forma global.
 * 
 * 
 * Ejemplo de uso growl:
 * ---------------------
 * Message.success('Todo bien');
 * 
 * 
 * Metodos:
 * ---------------------
 * - success(string,container=)
 * - info(string,container=)
 * - warning(string,container=)
 * - error(string,container=)
 * - confirm(string,buttons=,callback)
 * - clear() - borra todos los mensajes mostrados en pantalla 
 * 
 * 
 * El parametro container es opcional, puede ser un DOM o un JQuery DOM, si no se pasa el mensaje se considera Growl
 * 
 * 
 * Ejemplo de uso "inline"
 * -----------------------
 * 
 * <div class="alert"> </div>
 * 
 * Message.error('Ops! un error',$('.alert'));
 *  
 *  
 * Ejemplo de uso confirm
 * ----------------------
 *   Message.confirm('Para competar esta operación debe aceptar',function(response){ if(response === 'Otra') whoKnowsWhatToDo() })
 *
 *   Message.confirm('Para competar esta operación debe aceptar', ['Aceptar', 'Cancelar', 'Otra'], function(response){ if(response === 'Otra') whoKnowsWhatToDo() })
 *
 *    Message.confirm('Para competar esta operación debe aceptar', [{label:'Aceptar',class:'btn-success'}, 'Cancelar', 'Otra'], function(response){ if(response === 'Otra') whoKnowsWhatToDo() })
 *  
 *  
 *  
 *  dependencias:
 *  ---------------
 *    jquery, 
 *    boostrap
 *    http://bootstrap-growl.remabledesigns.com/
 *    backbone
 *    Backbone.BootstrapModal
 *  
 */

DocManager.module("Message", function(Messages, DocManager, Backbone, Marionette, $, _){

  //Doc: http://bootstrap-growl.remabledesigns.com/

  var delayAutoHideMs = 5000; 

  var notify = function(str,type,icon){
      $.notify({
          message: str,
          icon: icon
        },{
          type: type,
          placement:{
              from: 'top',
              align: 'center'
          },
          delay: delayAutoHideMs,
          offset: 10,
          z_index: 1041,
          template: '<div data-notify="container" class="col-xs-10 col-sm-4 alert alert-sgc alert-{0} text-center" role="alert"> '+
                    '   <span data-notify="icon" class=""></span>'+
                    '   <span data-notify="message">{2}</span>'+
                    '</div>'
      });
  }


    var notifyImpl = {
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
      },
      clear: function(){
        $.notifyClose();
      }
    }

   var inlineImpl = {
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
        var $alert = (inlineImpl.el) ? $(inlineImpl.el) : $('.alert').first();
        $alert.first().removeClass("alert-error alert-warning alert-success alert-info");
        $alert.first().addClass('alert-'+type);
        $alert.html('<i class="'+icon+'"></i> ' + str);
        $alert.show();
        this.autoHide();
      },
      hide: function(){
        var $alert = (inlineImpl.el) ? $(inlineImpl.el) : $('.alert').first();
        $alert.slideUp();
      },
      autoHide: function(){
        var self = this;
        setTimeout(function(){
          self.hide();
        },delayAutoHideMs);
      },
      clear: function(){
        this.hide();
      }
    }
    
    var confirmImpl = function(str,buttons,callback){
      if(!callback){
        callback = buttons;
        buttons = undefined;
      }
      
      var modal = new Backbone.BootstrapModal({
        content: str,
        okText: 'Ok',
        cancelText: 'cancelar',
        enterTriggersOk: false,
      });

      //BOTONES CUSTOMIZADOS
      if(buttons && _.isArray(buttons)){
        var btns = [];
        _.each(buttons,function(item){
          var $btn = $('<button></button>');
          $btn.addClass('btn btn-default');
          if(typeof(item) === 'string'){
            $btn.html(item);
          }else{
            if(item.label){
              $btn.html(item.label);
            }
            
            if('class' in item){
              $btn.addClass(item['class']);
            }
          }
          btns.push($btn);
        });
        
        setTimeout(function(){
          modal.$el.find('.modal-footer').empty().append(btns);
        });
        
        modal.$el.delegate('.modal-footer button','click',function(e){
          callback($(e.currentTarget).html());
          modal.$el.undelegate('click');
          modal.close();
        })

      }else{
        //BOTONES POR DEFECTO
        modal.listenTo(modal,'ok',function(){
          callback('ok');
          modal.close();
        });
        
        modal.listenTo(modal,'cancel',function(){
          callback('cancel');
          modal.close();
        })
      }

      modal.$el.find('.modal-dialog').addClass('modal-confirm');
      modal.open();

      return modal;
    }

  Message = {
      success: function(str,container){
        this.getHandler(container).success(str);
      },
      info: function(str,container){
        this.getHandler(container).info(str);
      },
      warning: function(str,container){
        this.getHandler(container).warning(str);
      },
      error: function(str,container){
        this.getHandler(container).error(str);
      },
      confirm: function(str,buttons,callback){
        return confirmImpl(str, buttons, callback);
      },
      clear: function(){
        inlineImpl.clear();
        notifyImpl.clear();
      },
      getHandler: function(container){
        if(container){
          inlineImpl.el = container;
          return inlineImpl;
        }
        return notifyImpl;
      }
  };

  window.Message = Message;

});

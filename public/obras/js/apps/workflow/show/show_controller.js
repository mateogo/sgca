DocManager.module("WorkflowApp.Show", function(Show, DocManager, Backbone, Marionette, $, _){

  var Common = DocManager.module('WorkflowApp.Common');

  var Entities = DocManager.module('Entities');

  Show.Controller = {
      open: function(token){
        var type = token.get('obj_type');
        if(type === 'solicitud'){

          this.display(token);

        }else if(type === 'obra'){
          Message.info('Abriendo obra pendiente');
        }else{
          Message.warning('Objeto desconocido. No puede abrirse');
        }
      },

      display: function(token){
        var self = this;
        var p = DocManager.request('token:loadObj',token);

        p.done(function(obj){
          token.set('obj',obj);
          var view = new Show.DisplayTokenView({model:token});

          self.session = {token:token};

          var actionCollection = new Entities.ActionCollection();
          if(token.get('is_open')){
            actionCollection.fetch({data:{tokenType:token.get('type')}});
          }


          view.on('show',function(){
            var list = new Show.ActionsListView({collection:actionCollection});
            view.actionList.show(list);

            list.on('action:run',handler.actionRun);
            list.on('onDestroy',function(){
              console.log('DESTRUYENO LIST DE ACCIONES');
              list.unbind('action:run');
              list.unbind('onDestroy');
            });
          });

          var layout = Common.Controller.showMain(view);

          DocManager.mainRegion.show(layout);
        }).fail(function(e){
          Message.error('No se encontro el objeto relacionado');
        });



      }
  };

  var handler = {
    actionRun: function(action){
      var token  = Show.Controller.session.token;
      var obj = token.get('obj');
      var obj_id = token.get('obj_id');
      action.set('obj',obj);
      action.set('obj_id',obj_id);
      action.set('currentToken',token);
      DocManager.trigger('action:run',action);
    }
  };


  DocManager.on('token:open',function(token){
      Show.Controller.open(token);
  });

});

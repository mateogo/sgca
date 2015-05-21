DocManager.module("WorkflowApp.Actions", function(Actions, DocManager, Backbone, Marionette, $, _){

  var Entities = DocManager.module('Entities');

  Actions.Controller = {
    runAction: function(action){
      Actions.openPopup(Actions.DefaultAction,action);
    },
    showHistory: function(objId){

      var collection = new Entities.TokenCollection();
      collection.fetchHistory(objId);
      Actions.showHistory(collection);
    }
  };


  var handler = {
    createToken: function(action,data){
      var currentToken = action.get('currentToken');
      var token = new Entities.Token();
      token.set('type',action.get('tokenType'));
      token.set('obj_id',currentToken.get('obj_id'));
      token.set('obj_type',currentToken.get('obj_type'));
      token.set('obj_slug',currentToken.get('obj_slug'));
      token.set(data);
      token.save().done(function(){
        DocManager.trigger('token:open',token);
        Message.success('Acción concretada');
      }).fail(function(err){
        if(err.responseJSON){
          err = err.responseJSON;
        }
        var msg = 'No se pudo realizar la acción';
        if(err && err.userMessage){
          msg = err.userMessage;
          console.error(err.internalMessage);
        }
        Message.error(msg);
      });
    }
  };


  DocManager.on('action:run',function(action){
    Actions.Controller.runAction(action);
  });

  DocManager.on('action:history',function(objId){
    Actions.Controller.showHistory(objId);
  });


  DocManager.on('action:proceed',function(action,data){
    handler.createToken(action,data);
  });


});

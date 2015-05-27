
/**
 * acción para cuando un Usuario solicitante realiza una modificacion en
 * una solicitud o en una obra
 *
 *
 */
var types = require('../models/tokentypes.js');

var registroCambio = {
  beforeAdd: function(token,userLogged,currentToken,callback){
      //se manda a la persona actual

      if(!currentToken) return callback();

      var currentType = currentToken.get('type');

      if(currentType){
        //registra el cambio pero no cambia el estado global del tramite o hilo

        var nextType = currentType;
        if(currentType === types.PEDIDO_CORRECCION){
          nextType = types.REVISAR_MODIFICACION;
        }

        token.set('global_type',nextType);

      }

      var responsable = currentToken.get('responsable');

      if(!responsable){
        responsable = currentToken.get('from');
      }

      token.set('to',responsable);
      token.set('responsable',responsable);
      callback();
  }
};


module.exports = registroCambio;

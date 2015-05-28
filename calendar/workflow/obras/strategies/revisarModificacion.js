
/**
 * acción para cuando un Usuario solicitante avisa que ya corrigio todos los errores
 *
 */
var types = require('../models/tokentypes.js');

var revisarModificacion = {
  beforeAdd: function(token,userLogged,currentToken,callback){
      if(!currentToken) return callback();

      // es el responsable asignado que esta tratando el tramite
      // se setea en pedidoCorreccion.js
      var responsable = currentToken.get('responsable');

      if(!responsable){
        responsable = currentToken.get('from');
      }

      token.set('to',responsable);
      token.set('responsable',responsable);
      callback();
  }
};


module.exports = revisarModificacion;

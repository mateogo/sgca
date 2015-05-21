
/**
 * acción para cuando un Usuario solicitante realiza un cambio
 *
 *
 */

var registroCambio = {
  beforeAdd: function(token,userLogged,currentToken,callback){
      //se manda a la persona actual

      token.set('to',currentToken.get('to'));
      callback();
  }
};


module.exports = registroCambio;


/**
* Clase para estandarizar envio de errores al front end
*/

function AppError(userMessage,internalMessage,code){
  this.userMessage = userMessage;
  this.internalMessage = internalMessage;
  this.code = code;
}

module.exports = AppError;

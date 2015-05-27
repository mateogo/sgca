

var objLoader = require('../utils/objLoader.js');

var pedidoCorreccion = {
    beforeAdd: function(token,userLogged,currentToken,callback){

      // setea destinatario al dueño del objeto relacionado
      objLoader.loadRelated(token,function(err,obj){
        if(err) return callback(err);

        token.set('to',obj.get('owner'));
        token.set('responsable',userLogged);
        callback();
      });
    }
};


module.exports = pedidoCorreccion;

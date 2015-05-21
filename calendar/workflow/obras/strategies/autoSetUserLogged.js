

var autoSetUserLogged = {
    beforeAdd: function(token,user,currentToken,callback){
      // si no está especificado a quien se asigna,
      // se autoasigna el usuario logueado
      if(!token.get('to')){
        token.set('to',user);
      }
      callback();
    }
};


module.exports = autoSetUserLogged;

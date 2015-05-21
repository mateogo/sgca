

var objLoader = require('../utils/objLoader.js');

var tokenTypes = require('../models/tokentypes.js');

var updateObjState = {
    afterAdd: function(token,userLogged,currentToken,callback){


      var newStatus = this._getStatusPerType(token.get('type'));
      if(!newStatus) return callback();

      objLoader.loadRelated(token,function(err,obj){
          if(err) return callback(err);

          obj.set('nivel_ejecucion',newStatus);
          obj.save(callback);
      });
    },


    _getStatusPerType: function(type){
      var status = '';
      if(type === tokenTypes.PEDIDO_CORRECCION){
          status = 'para corregir';
      }else if(type !== tokenTypes.ASIGNAR_FORMA && type !== tokenTypes.AUTORIZADO){
          status = 'en revisión';
      }else if(type === tokenTypes.AUTORIZADO){
          status = 'autorizado';
      }
      return status;
    }
};



module.exports = updateObjState;

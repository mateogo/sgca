
/**
 * Se encarga de buscar el objeto relacionado a un token
 * Se usa el atributo "obj.typeModel" para saber de que tipo es el objeto
 *
 *
 * Ejemplo de uso:
 *
 * objLoader.loadRelated(token,function(err,obj){
 * 		if(err) return console.log('Ops! no se encontro');
 *
 * 		console.log('El objeto relacionado',obj);
 * });
 */


var root = '../../../';
var SolicitudModel = require(root + 'models/obraartesolicitud.js').getModel();
var ObraModel = require(root + 'models/obraarte.js').getModel();
var UserModel = require(root + 'models/user.js').getModel();

var objLoader = {
  /**obraartesolicitud
  * carga objeto relacionado al token
  */
  loadRelated: function(token,callback){
    var Model = this._getModel(token);
    if(!Model){
      return callback('Tipo de objeto no reconocido');
    }

    Model.findById(token.get('obj').id,function(err,obj){
      if(err) return callback(err);

      UserModel.findById(obj.get('owner_id'),function(err,user){
        if(err) return callback(err);

        obj.set('owner',user);
        callback(null,obj);
      });
    });
  },

  _getModel: function(token){
    var objType = token.get('obj').typeModel;
    var Model = null;
    if(objType === 'solicitud'){
      Model = SolicitudModel;
    }else if(objType === 'obra'){
      Model = ObraModel;
    }

    return Model;
  }
};

module.exports = objLoader;

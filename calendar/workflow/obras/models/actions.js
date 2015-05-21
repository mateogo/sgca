

var Backbone = require('backbone');
var _ = require('underscore');

var types = require('./tokentypes.js');
var groups = require('./groups.js');

var ALL = '**todos**';

var Action = Backbone.Model.extend({
  hasGroup: function(groups){
    var hasGroup = false;
    var queryGroups = this.get('groups');
    var count = queryGroups.length;
    for (var i = 0; i < groups.length && !hasGroup; i++) {
      var group = groups[i];
      for (var j = 0; j < count && !hasGroup;j++) {
        if(queryGroups[j] == group){
          hasGroup = true;
        }
      }
    }
    return hasGroup;
  },
  toJSON: function(){
    return _.pick(this.attributes,'title','tokenType');
  }
});


var ActionCollection = Backbone.Collection.extend({
  model: Action,

  getByToken: function(tokenType,groups){
    var actions = [];
    for (var i = 0; i < this.length; i++) {
      var action = this.at(i);
      if( (action.get('fromToken') === ALL || action.get('fromToken') === tokenType) && action.hasGroup(groups)){
          actions.push(action);
      }
    }
    return actions;
  }
});



var actions = new ActionCollection([
  {title: 'Asignarme solicitud',
   tokenType: types.FORMALIZANDO,fromToken: types.ASIGNAR_FORMA,
   groups: [groups.FALICITADORES]
  },
  {title: 'Pedido de corrección',
    tokenType: types.PEDIDO_CORRECCION,fromToken: types.FORMALIZANDO,
    groups: [groups.FALICITADORES]
  },
  {title: 'Cancelar la correción',
    tokenType: types.FORMALIZANDO,fromToken: types.PEDIDO_CORRECCION,
    groups: [groups.FALICITADORES]
  },
  {title: 'Forma OK',
   tokenType: types.FORMALIZADO, fromToken: types.FORMALIZANDO,
   groups: [groups.FALICITADORES]
  },
  {title: 'Cancelar solicitud',
   tokenType: types.CANCELADO, fromToken: ALL,
   groups: [groups.FALICITADORES]
  },


  {title: 'Asignar',
   tokenType: types.REVISANDO, fromToken: types.FORMALIZADO,
   groups: [groups.REVISORES]
  },
  {title: 'Pedido de corrección',
    tokenType: types.PEDIDO_CORRECCION,fromToken: types.REVISANDO,
    groups: [groups.REVISORES]
  },
  {title: 'Registrar mi revisión',
    tokenType: types.REVISADO, fromToken: types.REVISANDO,
    groups: [groups.REVISORES]
  },
  {title: 'Asignar a otro revisor',
   tokenType: types.REVISANDO, fromToken: types.FORMALIZADO,
   groups: [groups.REVISORES]
  },
  {title: 'Asignar a Autorizar',
    tokenType: types.ASIGNAR_AUTORIZADOR, fromToken: types.REVISADO,
    groups: [groups.REVISORES]
  },

  {title: 'Autorizar',
    tokenType: types.AUTORIZADO, fromToken: types.ASIGNAR_AUTORIZADOR,
    groups: [groups.AUTORIZADORES]
  }

]);


module.exports = actions;

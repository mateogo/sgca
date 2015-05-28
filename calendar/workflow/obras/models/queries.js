

var Backbone = require('backbone');
var _ = require('underscore');
var groups = require('./groups.js');
var types = require('./tokentypes.js');

var ALL = '**todos**';

var Query = Backbone.Model.extend({
  hasGroup: function(groups){
    var hasGroup = false;
    var queryGroups = this.get('groups');
    if(queryGroups === ALL){
      return true;
    }
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
    return _.pick(this.attributes,'title','code');
  }
});


var QueriesCollection = Backbone.Collection.extend({
  model: Query,
  getByCode: function(code){
    for (var i = 0; i < this.length; i++) {
      var query = this.at(i);
      if(query.get('code') == code) return query;
     }
    return null;
  },

  getByGroup: function(group){
    var queries = [];
    for (var i = 0; i < this.length; i++) {
     var query = this.at(i);
     var hasGroup = false;
     var groups = query.get('groups');
     var countGroups = groups.length;
     for (var j = 0; j < countGroups && !hasGroup;j++) {
       if(groups[j] == group){
         hasGroup = true;
       }
     }
     if(hasGroup){
       queries.push(query);
     }
    }
    return queries;
  }
});


var queries = new QueriesCollection([
    // SOLICITANTES
    {title:'Notificaciones/Pedidos',
      code: 'toFix',
      groups:ALL,
      query:{type:types.PEDIDO_CORRECCION,is_open:true,toMe:true}
    },
    // FALICITADORES
    {title:'Nuevas solicitudes',
      code: 'sol_news',
      groups:[groups.FALICITADORES],
      query:{type:types.ASIGNAR_FORMA,is_open:true}
    },
    {title:'Mis solicitudes',
      code: 'sol_process',
      groups:[groups.FALICITADORES],
      query:{is_open:true, $or:[{toMe:true},{fromMe:true}]}
    },
    {title:'Solicitudes en evaluación',
      code: 'sol_process',
      groups:[groups.FALICITADORES],
      query:{ global_type: {$in: types.getInProgress()},is_open:true}
    },
    {title:'Últimas formalizadas',
      code: 'lastform',
      groups:[groups.FALICITADORES],
      query:{type:types.FORMALIZADO}
    },
    {title:'Todas',
      code: 'all',
      groups:[groups.FALICITADORES],
      query:{is_open:true}
    },

    // REVISORES
    {title:'Nuevas para revisar',
      code: 'sol_newreview',
      groups:[groups.REVISORES],
      query:{ type: types.FORMALIZADO,is_open: true }

    },
    {title:'Mis pendiente',
      code: 'sol_review',
      groups:[groups.REVISORES],
      query:{is_open:true, $or:[{toMe:true},{fromMe:true}]}
    },
    {title:'Últimas revisadas',
      code: 'sol_lastreview',
      groups:[groups.REVISORES],
      query:{ type: types.REVISADO }
    },

    //AUTORIZADORES
    {title:'Para autorizar',
      code: 'sol_toauth',
      groups:[groups.AUTORIZADORES],
      query:{ type: types.ASIGNAR_AUTORIZADOR,is_open: true }
    },
    {title:'Autorizado',
      code: 'sol_authok',
      groups:[groups.AUTORIZADORES],
      query:{ type: types.AUTORIZADO,is_open: true }
    }
]);


module.exports  = queries;

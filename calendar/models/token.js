var config = require('config');


var async = require('async');
var _ = require('underscore');

var BaseModel = require('./basemodel.js');
var Assets = require('./assets.js').getModel();

var dbi;

var entityCol = config.get('Calendar.collections.token_obras');


var Token = BaseModel.extend({
  idAttribute: "_id",
  constructor: function() {
    this.entityCol = entityCol;
    BaseModel.apply(this,arguments);
  },

  defaults: {
    from: null, //owner del token, debe corresponder con el usuario logueado
    to: null,// grupo o user a quien está dirigido
    subject: '',
    body: '',
    type: '', // tipo de token
    assets: null,
    is_open: true,
    obj_id: null,
    obj_type: '',
    obj_slug: '',
    global_type: '', // tipo de token, paso actual del tramite, un hilo de tramite se define por el obj_id

    fealta: null,
    feultmod: null

  },

  validation: function(cb){
    cb(null);
  },

  _beforeSave: function(callback){
    var self = this;
    async.series([
       //setear fechas
       function(cb){
         if(self.isNew()){
           self.set('fealta',new Date());
         }
         self.set('feultmod',new Date());

         cb();
       },

       //serealizando usuario
       function(cb){
         var from = self.get('from');
         if(from){
           if(from.attributes){
             from = from.attributes;
           }
           from = _.pick(from,'_id','name','username','mail');
           self.set('from',from);
         }

         var to = self.get('to');
         if(to){
           if(to.attributes){
             to = to.attributes;
           }
           to = _.pick(to,'_id','name','username','mail');
           self.set('to',to);
         }

         cb();
       },

       //verificando que el obj_id sea un ObjectID
       function(cb){
         var obj_id = self.get('obj_id');
         if(!(obj_id instanceof BaseModel.ObjectID)){
           self.set('obj_id',new BaseModel.ObjectID(obj_id));
         }
         cb();
       }
    ],
    //done
    function(err,results){
      callback(err);
    });
  },

  _update: function(callback){
    callback('Token no pueden ser actualizados');
  },

  closeToken: function(callback){
    Token.closeToken(this,callback);
  }

},{
  entityCol: entityCol,
  defaultSort: {fealta:1},
  // cierra tokens anteriores y actualiza a nuevo estado
  closePreviousTokens: function(token,callback){
    var obj_id = token.get('obj_id');

    if(!(obj_id instanceof BaseModel.ObjectID)){
      obj_id = new BaseModel.ObjectID(obj_id);
    }

    var raw = {
      global_type: token.get('type'),
      is_open: false,
      feultmod: new Date()
    };

    BaseModel.dbi.collection(this.entityCol).update({'obj_id':obj_id}, {$set: raw}, {multi:true}, callback);
  },

  /**
   * retorna por callback el ultimo token
   * @param {ObjectID}   obj_id
   * @callback {Function} callback
   */
  getLastToken: function(obj_id,callback){

    if(!(obj_id instanceof BaseModel.ObjectID)){
      obj_id = new BaseModel.ObjectID(obj_id);
    }

    console.log('BUSCANDO ULTIMO TOKEN de',obj_id);

    BaseModel.dbi.collection(this.entityCol).findOne({'obj_id':obj_id,is_open:true}, {sort:{fealta:-1}}, function(err, token) {
      
      callback(err,new Token(token));
    });
  },
  // cierra un token
  closeToken: function(token,callback){

    var self = this;
    var raw = {is_open:false,feultmod:new Date()};
    var _id = (token.id)? token.id : token.get('_id');
    var id =  new BaseModel.ObjectID(_id);
    BaseModel.dbi.collection(this.entityCol).update({'_id':id}, {$set: raw}, {}, function(err, count) {

      if(err) return callback(err);

      if(count === 0){
        return callback('No se cerro');
      }

      self.findById(id,callback);
    });
  }
});


module.exports.getModel = function(){
  return Token;
};

module.exports.createNew = function(){
  return new Token();
};

module.exports.setDb = function(db){
  dbi = db;
  return this;
};

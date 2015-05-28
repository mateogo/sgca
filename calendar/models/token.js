

var async = require('async');
var _ = require('underscore');

var BaseModel = require('./basemodel.js');
var Assets = require('./assets.js').getModel();

var dbi;

var entityCol = 'token_obras';


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
    global_type: '', // tipo de token, paso actual del tramite, un hilo de tramite se define por el obj.id
    assets: null,
    is_open: true,
    obj: null,

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

       //serealizando atributos de usuario
       function(cb){
          function serializeUser(user){
            var raw = user;
            if(user){
              if(user.attributes) user = user.attributes;
              raw = _.pick(user,'_id','name','username','mail');
              if(!(raw._id instanceof BaseModel.ObjectID)){
                  raw._id = new BaseModel.ObjectID(raw._id);
              }
            }
            return raw;
          }

          var toCheck = ['from','to','responsable'];
          for (var i = 0; i < toCheck.length; i++) {
            var field = toCheck[i];
            if(self.has(field)){
              self.set(field,serializeUser(self.get(field)));
            }
          }

         cb();
       },

       //verificando que el obj.id sea un ObjectID
       function(cb){
         var obj =  self.get('obj');
         if(!(obj.id instanceof BaseModel.ObjectID)){
           obj.id = new BaseModel.ObjectID(obj.id);
           self.set('obj',obj);
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
    var objId = token.get('obj').id;

    if(!(objId instanceof BaseModel.ObjectID)){
      objId = new BaseModel.ObjectID(objId);
    }

    var raw = {
      global_type: token.get('type'),
      is_open: false,
      feultmod: new Date()
    };

    BaseModel.dbi.collection(this.entityCol).update({'obj.id':objId}, {$set: raw}, {multi:true}, callback);
  },

  /**
   * retorna por callback el ultimo token
   * @param {ObjectID}   objId
   * @callback {Function} callback
   */
  getLastToken: function(objId,callback){

    if(!(objId instanceof BaseModel.ObjectID)){
      objId = new BaseModel.ObjectID(objId);
    }

    BaseModel.dbi.collection(this.entityCol).findOne({'obj.id':objId,is_open:true}, {sort:{fealta:-1}}, function(err, token) {

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

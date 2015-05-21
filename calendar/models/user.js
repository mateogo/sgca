

var BaseModel = require('./basemodel.js');

var dbi;

var entityCol = 'users';


var User = BaseModel.extend({
  idAttribute: "_id",
  constructor: function() {
    this.entityCol = entityCol;
    BaseModel.apply(this,arguments);
  },

  defaults: {

  },

  validation: function(cb){
    cb(null);
  },
},{
  entityCol: entityCol,
  defaultSort: {cnumber:1}
});


module.exports.getModel = function(){
  return User;
};

module.exports.createNew = function(){
  return new User();
};

module.exports.setDb = function(db){
  dbi = db;
  return this;
};

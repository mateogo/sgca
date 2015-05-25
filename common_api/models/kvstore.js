var rootPath = '../../calendar/models/';

var _ = require('underscore');

var config = require('config');
var BaseModel = require(rootPath + 'basemodel.js');


var entityCol = config.get('CommonAPI.collections.keyvalues');

var KVItem = BaseModel.extend({
  defaults: {
    __tag: '',
    values: [],
  },
  entityCol: entityCol,
});


module.exports.getModel = function(){
  return KVItem;
};

module.exports.createNew = function(){
  return new KVItem();
};

module.exports.setDb = function(db){
  return this;
};

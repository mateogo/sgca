process.env.SUPPRESS_NO_CONFIG_WARNING = 'y';
var config = require('config');

var _ = require('underscore');

defaults = {
  collections: {
    keyvalues:    'keyvalues',
  },
  prefixes: {

  },
};

config.util.setModuleDefaults('CommonAPI', defaults);

var CommonAPI = config.get('CommonAPI');
var collections = CommonAPI['collections'];

_.each(CommonAPI['prefixes'], function(prefix, coll) {
  collections[coll] = prefix + '_' + collections[coll];
});

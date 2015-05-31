process.env.SUPPRESS_NO_CONFIG_WARNING = 'y';
var config = require('config');

var _ = require('underscore');

defaults = {
  collections: {
    recurso_familias: 'recurso_familias',
    recursos:         'recursos',
    recurso_tipos:    'recurso_tipos',
  },
  prefixes: {

  },
};

config.util.setModuleDefaults('Sisplan', defaults);

var Sisplan = config.get('Sisplan');
var collections = Sisplan['collections'];

_.each(Sisplan['prefixes'], function(prefix, coll) {
  collections[coll] = prefix + '_' + collections[coll];
});

process.env.SUPPRESS_NO_CONFIG_WARNING = 'y';
var config = require('config');

var _ = require('underscore');

defaults = {
  collections: {
    artactivities:      'artactivities',
    assets:             'assets',
    events:             'events',
    obrasarte:          'obrasarte',
    obrasartesolicitud: 'obrasartesolicitud',
    seriales:           'seriales',
    users:              'users',
    reports:            'reports',
    receipts:           'receipts',
    requests:           'requests',
    resources:          'resources',
    quotations:         'quotations',
    projects:           'projects',
    products:           'products',
    persons:            'persons',
    micasuscriptions:   'micasuscriptions',
    fondosuscriptions:  'fondosuscriptions',
    budgets:            'budgets',
    assets:             'assets',
    articles:           'articles',
    anywproductions:    'anywproductions',
    admrqsts:           'admrqsts',
    activities:         'activities',
    actions:            'actions',
  },
  prefixes: {

  },
};

config.util.setModuleDefaults('Calendar', defaults);

var Calendar = config.get('Calendar');
var collections = Calendar['collections'];

_.each(Calendar['prefixes'], function(prefix, coll) {
  collections[coll] = prefix + '_' + collections[coll];
});

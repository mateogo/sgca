# Configuración del sistema:

Ahora estamos usando https://github.com/lorenwest/node-config

Los archivos viven dentro de /config
Las variables predeterminadas globales estan en config/default.js
Para poder sobreescribir una utilizando variables de entorno editar config/custom-environment-variables.js

Esto está mejor explicado en https://github.com/lorenwest/node-config/wiki/Configuration-Files#file-load-order pero acá
va igual:

Las variables *NODE_ENV* y '*NODE_APP_INSTANCE* determinan qué archivos se cargan según este orden:

- default.js
- default-NODE_INSTANCE.js
- NODE_ENV.js
- NODE_ENV-NODE_INSTANCE.js
- local.js
- local-NODE_INSTANCE.js
- local-NODE_ENV.js
- local-NODE_ENV-NODE_INSTANCE.js

...modificando cada uno lo establecido en el anterior.

A su vez cada módulo / aplicación tiene su configuración particular que vive dentro del namespace global bajo su nombre
en CamelCase.

Por ejemplo:

/config/local.js

```javascript
{
    [...]
    Calendar: {
        'magia': 'xyzzy',
    },
    [...]
}
```

Dentro de cada aplicacion debe existir config/init.js encargado de cargar defaults sanos para cada variable.
Por ejemplo en calendar/config/init.js:

```javascript
process.env.SUPPRESS_NO_CONFIG_WARNING = 'y';
var config = require('config');

var _ = require('underscore');

defaults = {
  collections: {
    artactivities:      'artactivities',
    admrqsts:           'admrqsts',
    actions:            'actions',
    [... sigue ...]
  },
  prefixes: {

  },
};

/* XXX ESTO ES IMPORTANTE:
 * Actualiza la configuración con los valores predeterminados nuestros.
 */
config.util.setModuleDefaults('Calendar', defaults);

// el resto son cosas propias del modulo. no importan ahora.
```

Después en cualquier lado:

```javascript
var config = require('config');

var actionsCol = config.get('Calendar.collections.actions');
```

etc.

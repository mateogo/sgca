# Moviendo la configuracion en utils.js

Hasta ahora varias cosas están definidas en *utils.js*.

La idea es mover todo eso a *utils_defaults.js* y luego por cada instalación poder sobreescribir
segun sea necesario con datos traidos de mongo.

La mayoría de los elementos siguen la estructura

```javascript
{
    unElementoEnUtils: [
        {val: 'el valor0', label: 'el label0'},
        {val: 'el valor1', label: 'el label1'},
        {val: 'el valor2', label: 'el label2'},
    ]
}
```

Y la aplicación en *commons/js/apps/keyvalues* apunta a eso.
En el caso de que una en particular sea distinta en *commons/js/entities/keyvalues.js* el objeto `schemaOverrides` permite
definir cómo debe ser esta (según schema de BackboneForms).

La aplicación define las siguientes rutas:

- keyvalues/ : listado de todas las opciones en utils.js
- keyvalues/edit/*elemento* : vista para editar ese elemento

La aplicación define los siguientes handlers:

```javascript
DocManager.request('keyvalues:loadFromServer');
```

Devuelve un promise que resuelve cuando se trajo la configuración desde el servidor.
Actualiza `window.utils`.

```javascript
DocManager.request('keyvalues:get', nombreElemento);
```

Devuelve un `Backbone.Model` representando a ese elemento de configuración. Los valores del mismo se encuentran en el
attribute *values*.

La aplicación emite los siguientes eventos:

- keyvalues:change:**nombreElemento**  (valores_nuevos, elemento)
- keyvalues:change (elemento)

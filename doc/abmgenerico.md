# ABM Genérico.

Vistas, Controllers y Handlers para operar sobre Models y Collections (algo) simples.

## Consideraciones generales:

Es deseable que los `Model` definan *schema* y las `Collection` *columns* para poder construir las tablas y forms.
Si no están presentes se construyen a partir de los *defaults* del `Model` pero no es lo correcto en todos los casos.

La prioridad para *schema* es la siguiente: *options.schema*, luego *model.schema*.

La prioridad para *columns* es la siguiente: *options.columns*, luego *collection.columns*.

## Urls:

- * genericabm/list/**Collection** * : Vista genérica para listar items de `DocManager.Entities.Collection`. Instancia
    esta Collection y hace un fetch().

- * genericabm/edit/**Model**/**id** * : Vista genérica para editar el *Model* `DocManager.Entities.Model` con *id*
    especificado. Instancia este *Model* y hace un fetch().

## Listado:

```javascript
DocManager.request('abm:list', options);
```

**options** es un object con las siguientes propiedades:

- collection: `Backbone.Collection` a listar. Puede o no estar instanciada. Obligatorio.
- model: `Backbone.Model` utilizado al agregar items. Si no está presente se usa collection.model. Opcional.
- columns: Definición de las columnas a mostrar siguiendo el formato de *Backgrid*. Opcional.
- listTitle: Ttulo del listado. Opcional.
- title: Titulo de los dialogos para Editar y Crear items. Opcional.
- canAdd: Boolean. Si verdadero la vista permite agregar items. Valor predeterminado: true.
- canEdit: Boolean. Si verdadero la vista permite editar items. Valor predeterminado: true.
- canRemove: Boolean. Si verdadero la vista permite eliminar items. Valor predeterminado: true.

## Edición / Creación:

```javascript
var controller = DocManager.request('abm:edit', options);
var controller = DocManager.request('abm:new', options);
```

**options** es un object con las siguientes propiedades:

- collection: `Backbone.Collection` (instanciada). Opcional.
- model: `Backbone.Model`. Puede o no estar instanciado. Obligatorio.
- title: Titulo del diálogo. Opcional.
- schema: Schema usado para construir el form siguiendo el formato de *backbone-forms*. Opcional.

Abre un modal para editar el `model` pasado dentro de options, que puede o no estar instanciado.
Si se especifica `collection` el modelo se agrega a la misma luego de crearse.

`controller` (el resultado del request) emite los siguientes eventos, pasando `model` como parámetro:

- *created*: cuando el modelo es nuevo y se persistió satisfactoriamente.
- *saved*: cuando el modelo se persistió satisfactoriamente.
- *closed*: el usuario cerró el modal.

## Eliminación:

```javascript
var controller = DocManager.request('abm:remove', options);
```

**options** es un object con las siguientes propiedades:

- model: `Backbone.Model` Instanciado. Obligatorio.

Abre un modal para pedir confirmación antes de eliminar el modelo.

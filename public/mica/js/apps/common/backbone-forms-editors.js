(function(){
  
  Backbone.Form.editors.RichText = Backbone.Form.editors.Text.extend({
    
    render: function(){
      Backbone.Form.editors.Text.prototype.render.call(this);
      
      this.editor = CKEDITOR.replace(this.el);
      if(this.value){
        this.editor.setData(this.value);
      }
      return this;
    },
    
    getValue: function(){
      var val = this.editor.getData();
      return val;
    },
    
    setValue: function(value){
      if(this.editor){
        this.editor.setData(value);  
      }else{
        this.value = value;
      }
    }
  });
  
  
  Backbone.Form.editors.DatePicker = Backbone.Form.editors.Text.extend({
    
    render: function(){
      Backbone.Form.editors.Text.prototype.render.call(this);
      
      this.$el.datepicker();
      if(this.value){
        this.$el.datepicker('setDate',this.value);
      }
      this.inited = true;
      
      return this;
    },
    
    getValue: function(){
      var val = this.$el.datepicker('getDate');
      return val;
    },
    
    setValue: function(value){
      if(!(value instanceof Date)){
        value = new Date(value);
      }
      if(this.inited){
        this.$el.datepicker('setDate',this.value);
      }else{
        this.value = value;
      }
    }
  });
  
Backbone.Form.editors.TimePicker = Backbone.Form.editors.Text.extend({
    
    render: function(){
      Backbone.Form.editors.Text.prototype.render.call(this);
      
      this.$el.timepicker({'timeFormat': 'H:i'});
      if(this.value){
        this.$el.timepicker('setTime',this.value);
      }
      this.inited = true;
      
      return this;
    },
    
    getValue: function(){
      var val = this.$el.timepicker('getTime');
      return val;
    },
    
    setValue: function(value){
      if(!(value instanceof Date)){
        value = new Date(value);
      }
      if(this.inited){
        this.$el.timepicker('setTime',this.value);
      }else{
        this.value = value;
      }
    }
});


Backbone.Form.editors.DateTimePicker = Backbone.Form.editors.Text.extend({

  initialize: function(options){
    this.defaultValue = options.schema.defaultValue;

    _.bindAll(this, 'onChangeDateTime');

    Backbone.Form.editors.Text.prototype.initialize.apply(this, arguments);

    if (this.defaultValue && !this.value) {
      this.value = this.defaultValue;
    }
  },

  render: function(){
    Backbone.Form.editors.Text.prototype.render.apply(this, arguments);

    var value = this.value || new Date();

    this.$el.datetimepicker({
      lang:                 'es',
      format:               'd/m/Y H:i',
      startDate:            value,
      value:                value,
      todayButton:          true,
      closeOnWithoutClick:  true,
      onChangeDateTime:     this.onChangeDateTime,
    });

    this.inited = true;

    return this;
  },

  onChangeDateTime: function(newdate, ev) {
    this.value = newdate;
    this.determineChange();
  },

  getValue: function(){
    return this.value;
  },

  setValue: function(value){
    if (!value) {
      value = new Date();
    }

    if(!(value instanceof Date)){
      value = new Date(value);
    }

    if(this.inited){
      this.$el.datetimepicker({
        value: value,
      });
    }else{
      this.value = value;
    }
  },

  determineChange: function(event) {
    var currentValue = this.getValue();
    var changed = (currentValue !== this.previousValue);

    if (changed) {
      this.previousValue = currentValue;

      this.trigger('change', this);
    }
  },
});



/**
 * Select con opciones tomadas de un request. Ejemplo de uso:
 * 
 * schema: {
 *  location: {type:'SelectRequest',title:'Locación',request:'action:fetch:location',fieldLabel:'name',fieldVal:'code'}
 * }
 * 
 * donde request:'action:fetch:location' se resuleve con 
 * 
 * DocManager.reqres.setHandler('action:fetch:location',function(model,cb){
 *  var promise = $.Deferred().promise();
 *  return promise; 
 * });
 * 
 */
Backbone.Form.editors.SelectRequest = Backbone.Form.editors.Select.extend({
  initialize: function(options){
    if(!options.schema.options){
      options.schema.options = [];
    }
    Backbone.Form.editors.Select.prototype.initialize.call(this,options);
  },
  render: function(){
    
    Backbone.Form.editors.Select.prototype.render.call(this);
    console.log('dibujndo selectrequest',this);
    
    if(this.schema.request){
      var fieldLabel = this.schema.fieldLabel;
      var fieldVal = this.schema.fieldVal;
      var self = this;
      
      var params = this.model;
      
      if(this.schema.mapQuery && typeof(this.schema.mapQuery) === 'function'){
        params = this.schema.mapQuery(this.model);
      }
      
      DocManager.request(this.schema.request,params).done(function(response){
        var opts = _.map(response,function(item){
          return {
            label: item[fieldLabel],
            val: item[fieldVal]
          };
        });
        opts.unshift({val:'',label:''});
        self.setOptions(opts);
        
        self.$el.trigger('change');
      });  
    }
    
    
    return this;
  }
  
  
});

Backbone.Form.editors.Typeahead = Backbone.Form.editors.Text.extend({
  initialize: function (options) {
    Backbone.Form.editors.Base.prototype.initialize.call(this, options);

    this.$el.attr('type', 'text');
    this.$el.attr('data-provide', 'typeahead');

    if (!this.schema || !this.schema.options) throw "Missing required 'schema.options'";
  },

  render: function () {
    this.setValue(this.value);
    this.setOptions(this.schema.options);

    return this;
  },

  setOptions: function (options) {
    var self = this;

    if (options instanceof Backbone.Collection) {
      var collection = options;

      if (collection.length > 0) {
        this.renderOptions(options);
      } else {
        collection.fetch({
          success: function (collection) {
            self.renderOptions(options);
          }
        });
      }
    }

    else if (_.isFunction(options)) {
      options(function (result) {
        self.renderOptions(result);
      }, self);
    }

    else {
      this.renderOptions(options);
    }
  },

  renderOptions: function (options) {
    var $input = this.$el,
        source;

    if (_.isArray(options)) {
      source = options;
    }

    else if (options instanceof Backbone.Collection) {
      source = options.reduce(function (memo, row) {
        memo.push(row.toString());
        return memo;
      }, []);
    }

    $input.attr('data-items', source.length);
    $input.attr('data-source', '[' + _.map(source, function (row) {
          return '"' + row + '"';
        }).toString() + ']');

    this.setValue(this.value);
  }
});


Backbone.Form.editors.Request = Backbone.Form.editors.Text.extend({
  defaultValue: '[Elegir]',

  events: {
    'click':    'doRequest',
    'keypress': 'doRequest',
    'select':   'doRequest',
  },

  initialize: function(options) {
    Backbone.Form.editors.Text.prototype.initialize.call(this, options);

    if (_.isUndefined(this.schema.request)) {
      throw new Error("'request' es obligatorio");
    }

    this._onRequest = false;
  },

  getValue: function(){
    return this.value;
  },

  setValue: function(value){
    this.value = value;
    if (this.schema.itemToString) {
      this.$el.val(this.schema.itemToString(value));
    } else {
      if (_.isUndefined(value) || _.isNull(value)) {
        this.$el.val(this.defaultValue);
      } else {
        this.$el.val(value);
      }
    }
    this.determineChange();
  },

  determineChange: function(event) {
    var currentValue = this.getValue();
    var changed = (currentValue !== this.previousValue);

    if (changed) {
      this.previousValue = currentValue;

      this.trigger('change', this);
    }
  },

  doRequest: function(event){
    event.preventDefault();

    var self = this;
    var cb = this.schema.request;
    var promise;


    if (this._onRequest) {
      return;
    }
    this._onRequest = true;

    if (typeof(cb) == 'string') {
      promise = DocManager.request(cb);
    } else {
      promise = cb();
    }

    promise.done(function(value) {
      self.setValue(value);
    });

    promise.always(function(value) {
      self._onRequest = false;
    });
  },

});

Backbone.Form.editors.Select2 = Backbone.Form.editors.Select.extend({
  attributes: {
    multiple: 'multiple',
  },

  render: function() {
    var _this = this,
        config = this.schema.config || {};
    this.setOptions(this.schema.options);
    setTimeout(function() {
      _this.$el.select2(config);
      if(config["valores"]) {
        if(config["valores"][0]) {
          _this.$el.val(config["valores"]).change();
        }
      }
    }, 0);
    return this;
  },
  setValue : function (values) {
    if (!_.isArray(values)) values = [values];
    if (this.schema.tagger) {
      var tags = [];
      for (var i = 0; i < values.length; i++) {
        if(values[i]) {
          tags.push({id: values[i], text: values[i]});
        }
      }
      this.schema.config["tags"] = tags;
      this.schema.config["valores"] = values;
    }
    this.$el.val(values).change();
  }
});

Backbone.Form.editors.SelectModelRequest = Backbone.Form.editors.Select.extend({
  tagName: 'div',
  className: '',

  events: {
    'click .js-bbforms-edit': 'doEdit',
    'click .js-bbforms-add':  'doAdd',
  },

  initialize: function(options){
    if (_.isUndefined(options.schema.options)) {
      options.schema.options = [];
    }

    Backbone.Form.editors.Select.prototype.initialize.call(this,options);

    if (_.isUndefined(this.schema.request)) {
      throw new Error("'request' es obligatorio");
    }

    self._collection = undefined;
  },

  render: function(){
    Backbone.Form.editors.Base.prototype.render.call(this);

    var self = this;

    var template = _.template('\
      <% if (canEdit || canAdd) { %>\
        \
        <div class="col col-sm-9"> \
          <select class="form-control"> </select>\
        </div>\
        \
        <div class="col">\
          <div class="btn-group">\
            <% if (canEdit) { %> <button class="btn btn-default btn-sm js-bbforms-edit glyphicon glyphicon-pencil"> </button> <% } %>\
            <% if (canAdd) { %>  <button class="btn btn-default btn-sm js-bbforms-add  glyphicon glyphicon-plus">   </button> <% } %>\
          </div>\
        </div>\
      \
      <% } else { %>\
        <select class="form-control"> </select>\
      <% } %>\
    ');

    var options = {
      canAdd:  self.schema.canAdd,
      canEdit: self.schema.canEdit,
    };

    if (options.canAdd || options.canEdit) {
      this.$el.addClass('row');
    }

    this.$el.html(template(options));

    var cb = this.schema.request;
    var promise;

    if (typeof(cb) == 'string') {
      promise = DocManager.request(cb);
    } else {
      promise = cb();
    }

    promise.done(function(response){
      var collection;

      if (response instanceof Backbone.Collection) {
        collection = response;
      } else {
        collection = new Backbone.Collection(response);
      }

      self._collection = collection;
      self.setOptions(collection);
      self.$el.trigger('change');
    });

    return this;
  },

  doEdit: function(e) {
    e.preventDefault();
    e.stopPropagation();

    var self = this;
    var collection = self._collection;

    if (!collection) {
      return;
    }

    var model = self.getValue();
    if (!model) {
      return;
    }

    var controller = DocManager.request('abm:edit', {
      model: model,
    });

    controller.once('saved', function() {
      self.setOptions(collection);
      self.setValue(model.id);
    });
  },

  doAdd: function(e) {
    e.preventDefault();
    e.stopPropagation();

    var self = this;
    var collection = self._collection;

    if (!collection) {
      return;
    }

    if (!collection.url) {
      throw new Error('Error: SelectModelRequest: doAdd() en Collection sin url');
    }

    if (!collection.model) {
      throw new Error('Error: SelectModelRequest: doAdd() en Collection sin model');
    }

    var model = new collection.model();

    var controller = DocManager.request('abm:edit', {
      model: model,
      collection: collection,
    });

    controller.once('saved created', function() {
      self.setOptions(collection);
      self.setValue(model.id);
    });
  },

  /**
   * Adds the <option> html to the DOM
   * @param {Mixed}   Options as a simple array e.g. ['option1', 'option2']
   *                      or as an array of objects e.g. [{val: 543, label: 'Title for object 543'}]
   *                      or as a string of <option> HTML to insert into the <select>
   *                      or any object
   */
  renderOptions: function(options) {
    var $select = this.$('select');
    var html;

    html = this._getOptionsHtml(options);

    //Insert options
    $select.html(html);

    //Select correct option
    this.setValue(this.value);
  },


  /**
   * Transforms a collection into HTML ready to use in the renderOptions method
   * @param {Backbone.Collection}
   * @return {String}
   */
  _collectionToHtml: function(collection) {
    //Convert collection to array first
    var array = [];
    if (this.schema.itemToString) {
      collection.each(function(model) {
        array.push({ val: model.id, label: this.schema.itemToString(model) });
      });
    } else {
      collection.each(function(model) {
        array.push({ val: model.id, label: model.toString() });
      });
    }

    //Now convert to HTML
    var html = this._arrayToHtml(array);

    return html;
  },

  determineChange: function(event) {
    var currentValue = this.getValue();
    var changed = (currentValue !== this.previousValue);

    if (changed) {
      this.previousValue = currentValue;

      this.trigger('change', this);
    }
  },

  getValue: function() {
    var value = this.$('select').val();
    if (this._collection instanceof Backbone.Collection) {
      return this._collection.get(value);
    } else {
      return value;
    }
  },

  setValue: function(value) {
    if (value instanceof Backbone.Model) {
      value = value.attributes._id;
    }
    this.$('select').val(value);
  },

});

})();

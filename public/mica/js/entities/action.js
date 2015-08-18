DocManager.module("Entities", function(Entities, DocManager, Backbone, Marionette, $, _){
  
  var App = DocManager.module('App');
  
  Entities.Action = Backbone.Model.extend({
    urlRoot: "/acciones",
    whoami: 'Entities.Action:action.js ',

    idAttribute: "_id",

    defaults: {
      _id: null,
      cnumber: "",
      slug: "",
      tregistro:"",
      taccion: "",
      feaccion: utils.dateToStr(new Date()),
      lugarfecha:"",
      fechagestion: "",
      tipomov:"",

      description: "",
      descriptores: "",

      fecomp:"",

      objetivo:"",
      metafisica: "",
      metafisicaume:"",
      planprod:"",
      lineaaccion:"",
      nodo:"",
      area:"",
      requirente:"",
      expediente:"",
      contraparte:"",
      estado_alta:'activo',
      nivel_ejecucion: 'enpreparacion',
      nivel_importancia: 'media',
      aprovals:[],
      participants: [],
      locations: []
    },

    toString: function(){
      return this.get('cnumber') + ' - ' + this.get('slug');
    },

    enabled_predicates:['es_relacion_de'],
    
    parse: function(data, options){
      if(!this.participants){
        this.participants = new Backbone.Collection(data.participants);
      }
      
      if(!this.locations){
        this.locations = new Backbone.Collection(data.locations);
      }
      
      // inicializando objetos Participante y Locaciones
      this._initSubCollection(data, 'participants', Entities.ActionParticipant);
      this._initSubCollection(data, 'locations', Entities.ActionLocation);
      
      return data;
    },
    
    _initSubCollection: function(data, collectionKey, Entity){
      var collection = data[collectionKey];
      if(collection){
        for ( var i = 0; i < collection.length; i++) {
          var raw = collection[i];
          if(!(raw instanceof Entity)){
            if(!raw.id){
              raw.id = (i+1);  
            }
            raw.action = this;
            collection[i] = new Entity(raw);
          }
        }
        this[collectionKey].reset(collection);
        
        delete data[collectionKey];
      }
    },
    
    sync: function (method, model, options) {
      if(method == 'update'){
        if(model.participants){
          model.set('participants',model.participants.toJSON());
          model.set('locations',model.locations.toJSON());
        }
      }
      return Backbone.Model.prototype.sync.apply(this,[method, model, options]);
    },
    
    initBeforeCreate: function(cb){
      var self = this,
          fecomp = self.get('fecomp') || utils.dateToStr(new Date()),
          fealta = utils.parseDateStr(fecomp);

      self.set({fealta:fealta.getTime(), fecomp: fecomp});
      console.log('InitBeforeCreate!!!!!!!!!!!!!!!!!!!!! [%s][%s]', self.get('taccion'),self.get('slug'));

      dao.gestionUser.getUser(DocManager, function (user){
        self.set({useralta: user.id, userultmod: user.id});
        var person;
        var related = user.get('es_usuario_de');
        if(related){
          person = related[0];
          if(person){
            console.log('Persona FOUNDed [%s]', person.code);
            self.set({persona: person.code,personaid: person.id })
          }
        } 
        if(cb) cb(self);
      });
    },

    beforeSave: function(cb){
      var self = this;
      console.log('initBefore SAVE')
      var feultmod = new Date();
      self.set({feultmod:feultmod.getTime()})
     
      dao.gestionUser.getUser(DocManager, function (user){
        if (! self.get('useralta')) self.set({useralta: user.id});
        self.set({userultmod: user.id});
        if(cb) cb(self);
      });

    },
    
    
    update: function(cb){
      console.log('[%s] UPDATE MODEL',this.whoami);
      var self = this;
      self.beforeSave(function(docum){
        var errors ;
        console.log('ready to SAVE');
        if(!self.save(null,{
          success: function(model){
            //console.log('callback SUCCESS')
            
            // log Activity
            //logActivity(model);
            // log Activity

            //Change Product State
            //changeProductState(model);
            //Change Product State

            cb(null,model);

           }
          })) {
            console.log('validation error[%s]', self.validationError);
            cb(self.validationError,null);
        }            
      });

    },

    partialUpdate: function(token, facet){
      //facet: es un model o un hash de claves
      //token: 'content': toma las keys directamente de facet
      //       'estado_alta': solo actualiza esta key en base a facet
      //
      var self = this;
      var query = {};
      var list = [];

      //var key = facet.get('key');
      //var data = self.get(key) || {};

      list.push(self.id );
      query.nodes = list;
      query.newdata = {};

      if(token==='content'){
        query.newdata = facet;

      }else if(token ==='estado_alta'){
        query.newdata['estado_alta'] = facet;

      }else{
        // no se qué hacer... mejor me voy
        return;
      }

  
      console.log('partial UPDATE: [%s] [%s]', token, facet);
      var update = new Entities.ActionUpdate(query);
      update.save({
        success: function() {
        }
      });
      //log ACTIVITY
      //logActivity(token, self, data);
      //
    },


    validate: function(attrs, options) {
      //if(!attrs) return;
      var errors = {}
      //console.log('validate [%s] [%s] [%s]',attrs, _.has(attrs,'taccion'), attrs.taccion);

      if (_.has(attrs,'taccion') && (!attrs.taccion|| attrs.taccion.length==0)) {
        errors.taccion = "No puede ser nulo";
      }
      if (_.has(attrs,'slug') && ! attrs.slug) {
        errors.slug = "No puede ser nulo";
      }
      if (_.has(attrs,'fecomp')){
        var fecomp_tc = utils.buildDateNum(attrs['fecomp']);
        if(Math.abs(fecomp_tc-(new Date().getTime()))>(1000*60*60*24*30*6) ){
          //errors.fecomp = 'fecha no valida';
        }
        this.set('fecomp_tc',fecomp_tc);
      }

      if( ! _.isEmpty(errors)){
        return errors;
      }
    },

    insertItemCollection: function(itemCol) {
        var self = this;
        self.set({items: itemCol.toJSON()});
    },

    initNewItem: function(item){
      var self = this;
      var itemModel = self.itemTypes[item.get('tipoitem')].initNew(self, item.attributes);
      return itemModel;
    },

    mainHeaderFacet: function(){
      return new Entities.ActionHeaderFacet(this.attributes);
    },
    
    createNewParticipant: function(){
      return new Entities.ActionParticipant({action:this});
    },
    
    removeParticipant: function(participant){
      var def = $.Deferred();
      var parts = this.participants;
      var item = parts.findWhere({id:participant.id});
      if(item){
        parts.remove(item);
        this.save().done(function(o){
          def.resolve(o);
        }).fail(function(e){
          def.reject(e);
        });
      }else{
        def.reject('Participant not found');
      }
      return def.promise();
    },
    
    removeLocation: function(location){
      var def = $.Deferred();
      var locs = this.locations;
      var item = locs.findWhere({id:location.id});
      if(item){
          locs.remove(item);
          this.save().done(function(o){
             def.resolve(o);
          }).fail(function(e){
             def.reject(e);
          });
      }else{
        def.reject('Location not found');
      }
      return def.promise();
    }
  });
  
  Entities.ActionParticipant = Backbone.Model.extend({
    whoami: 'ActionParticipant:action.js ',
    urlRoot: '/acciones/:idAction/participantes',
    url: function(){
      return this.urlRoot.replace(':idAction',this.action.id);
    },
    
    constructor: function(params){
      
      //mantiene la referencia a la accion pero no en attributes
      if(params.action){
        this.action = params.action;
        delete params.action;
      }
      params = this.fromServer(params);
      
      Backbone.Model.apply(this,arguments);
    },
    
    defaults: {
      vip: false,
      nickName: '',
      name:'',
      tipopersona: 'persona',
      tipojuridico: {pfisica:false,pjuridica:false,pideal:false,porganismo:false},
      roles: {},
      contactinfo: [],
      notas: ''
    },
  
    schema: function() {
      return {
        vip: {type:'Checkbox'},
        name: {validators: ['required'], type: 'Text',title:'Nombre'},
        lastName: {validators: ['required'], type: 'Text',title:'Apellido'},
        nickName: {validators: ['required'], type: 'Text',title:'Alias'},
        displayName : {validators: ['required'], type: 'Text',title:'Nombre visible'},
        email : {validators: ['email'], type: 'Text',title:'Email'},
        dni : {validators: ['dni'], type: 'Text',title:'DNI',help:'Sin puntos'},
        cuit : {validators: ['cuit'], type: 'Text',title:'CUIT',help:'Sin puntos ni guiones'},
        birthDate : {validators: [], type: 'Date',title:'Fecha nacimiento'},
        tipopersona: {type: 'Select', options: ['persona','organismo','grupo','locacion','municipio'],title:''},
        tipojuridico: {type: 'Select', title:'Tipo Juridico', options: {pfisica:'Persona Fisica',pjuridica:'Persona juridica',pideal:'Persona Ideal',porganismo:'Organismo o Institución oficial'}},
        notas: 'TextArea'
      };
    },
    
    /**
     * Utiliza los datos de person para el Participante
     */
    usePerson: function(person){
      var raw = this.fromServer(person);
      if(raw.toJSON){
        raw = raw.toJSON();
      }
      //var keys = _.keys(this.schema);
      //keys = _.union(keys,['contactinfo','person_id']);
      //raw = _.pick(raw,keys);
      this.clear({silent:true});
      this.set(raw);
      
      
      
      
      var id = (person._id)? person._id : person.id;
      this.set('person_id',id);
    },
    
    fromServer: function(params){
    //saca de los contactinfo los mail 
      //copia el mail principal al attributo email
      if(params.contactinfo){
        var newInfos = [];
        //  es la informacion que no se edita
        // se mantienen fuera de los attributes para no perderlos
        var hideInfos = []; 
        var emailPrincipal;
        _.each(params.contactinfo,function(info){
          if(info.tipocontacto !== 'mail'){
            newInfos.push(info);
          }else if(info.subcontenido === 'principal'){
            emailPrincipal = info.contactdata;
          }else{
            hideInfos.push(info);
          }
          //se setea los contactinfo filtrados, sin mails
          params.contactinfo = newInfos;
        });
        this.hideInfos = hideInfos;
      
        //traspasa el main principal a email, si es que el email no existe
        if(!params.email && emailPrincipal){
          params.email = emailPrincipal;
        }
      }
      
      
      //verica que el vip sea boolean
      if(params.vip){
          params.vip = ((typeof(params.vip) === 'string' && params.vip === 'true') || params.vip === true);
      }
      
      return params;
    },
    
    toServer: function(){
      var obj = this.toJSON();
      
      var contactinfo = obj.contactinfo;
      
      for ( var i = 0; i < contactinfo.length && !info; i++) {
        var item = contactinfo[i];
        if(item.toJSON){
          contactinfo[i] = item.toJSON();
        }
      }
      
      //Copiar email a contactinfo
      var email = this.get('email');
      if(email){
        var info = _.findWhere(contactinfo,{tipocontacto: 'mail',subcontenido: 'principal'});
        if(info){
          info.contactdata = email;
        }else{
          info = {tipocontacto: 'mail',subcontenido: 'principal',contactdata: email};
          contactinfo.push(info);
        }
      }
      
      //si existen informas no manejadas se agregan
      if(this.hideInfos){
        contactinfo = _.union(contactinfo,this.hideInfos);
      }
      
      obj.contactinfo = contactinfo;
      return obj;
    },
    
    
    /**
     * recibe participante guardado de servidor
     * actualiza los datos en el cliente
     */
    _receiveParticipant: function(p){
      var pos = -1;
      
      var collection = this.collection || this.action.participants;
      
      p = this.fromServer(p);
      
      for ( var i = 0; i < collection.length && pos === -1; i++) {
        var item = collection.at(i);
        if(item.get('person_id') === p.person_id){
          pos = i;
        }
      }
      
      if(pos >-1){
        collection.at(pos).set(p);
      }else{
        if(!(p instanceof Entities.ActionParticipant)){
          p.action = this.action;
          p = new Entities.ActionParticipant(p);
        }
        collection.push(p);
      }
    },
    
    save: function(){
        var self = this;
        var $def = $.Deferred();
        var obj = this.toServer();
        var promise = $.ajax({
                url: this.url(),
                type: 'post',
                dataType: 'json',
                data: obj
              });     
        promise.done(function(r){
          if(r  && r.error){
            $def.reject(r.error);
            return;
          }
          
          self._receiveParticipant(r);
          $def.resolve(r);
          
        }).fail(function(e){
          $def.reject(e);
        });
        return $def.promise();
    }
  });
  
  
  Entities.ActionLocation = Backbone.Model.extend({
      whoami: 'ActionLocation:action.js ',
      urlRoot: '/acciones/:idAction/locaciones',
      url: function(){
        return this.urlRoot.replace(':idAction',this.action.id);
      },
      
      constructor: function(params){
        //mantiene la referencia a la accion pero no en attributes
        if(params.action){
          this.action = params.action;
          delete params.action;
        }
        params = this.fromServer(params);
        
        Backbone.Model.apply(this,arguments);
      },
      
      defaults: {
        nickName: '',
        name:'',
        tipopersona: 'municipio',
        tipojuridico: {pfisica:false,pjuridica:false,pideal:false,porganismo:true},
        roles: {},
        contactinfo: [],
        notas: '',
        coordinate: []
      },
    
      schema: {
        name: {validators: ['required'], type: 'Text',title:'Nombre'},
        nickName: {validators: ['required'], type: 'Text',title:'Alias'},
        displayName : {validators: ['required'], type: 'Text',title:'Nombre visible'},
        direccion: {validators: [], type: 'Text',title:'Dirección'},
        provincia: {validators: [], type: 'Text',title:'Provincia'},
        departamento: {validators: [], type: 'Text',title:'Departamento'},
        localidad: {validators: [], type: 'Text',title:'Localidad'},
        notas: 'TextArea'
      },   
      
      fromServer: function(params){
          
          //separando direccion de contactinfo
          if(params.contactinfo){
            _.each(params.contactinfo,function(info){
              if(info.tipocontacto === 'direccion'){
                params.direccion = info.contactdata;
                if(info.provincia) params.provincia = info.provincia;
                if(info.departamento) params.departamento = info.departamento;
                if(info.localidad) params.localidad = info.localidad;
                if(info.glat && info.glng){
                  params.coordinate = [info.glat,info.glng];
                }
              }
            });
          }
          
          
          return params;
      },
      
      toServer: function(){
        var obj = this.toJSON();
        obj.tipojuridico = {pfisica:false,pjuridica:false,pideal:false,porganismo:true};
        return obj;
      },
      
      usePerson: function(person){
        var raw = this.fromServer(person);
        if(raw.toJSON){
          raw = raw.toJSON();
        }

        this.clear({silent:true});
        this.set(raw);
        var id = (person._id)? person._id : person.id;
        this.set('person_id',id);
      },
      
      _receiveLocation: function(p){
        var pos = -1;
        
        var collection = this.action.locations;
        
        p = this.fromServer(p);
        
        for ( var i = 0; i < collection.length && pos === -1; i++) {
          var item = collection.at(i);
          if(item.get('id') === p.id){
            pos = i;
          }
        }
        
        if(pos >-1){
          collection.at(pos).set(p);
        }else{
          if(!(p instanceof Entities.ActionLocation)){
            p.action = this.action;
            p = new Entities.ActionLocation(p);
          }
          collection.push(p);
        }
      },

      save: function(){
        var self = this;
        var $def = $.Deferred();
        var obj = this.toServer();
        var promise = $.ajax({
                url: this.url(),
                type: 'post',
                dataType: 'json',
                data: obj
              });     
        promise.done(function(r){
            if(r  && r.error){
              $def.reject(r.error);
              return;
            }
              
            self._receiveLocation(r);
            $def.resolve(r);
              
        }).fail(function(e){
             $def.reject(e);
        });
        return $def.promise();
      }
    });

  Entities.ActionCoreFacet = Backbone.Model.extend({
    //urlRoot: "/comprobantes",
    whoami: 'ActionCoreFacet:action.js ',

    schema: function() {
      return {
          tregistro: {type: 'Select',options: utils.tipoActionEntityList, title:'Tipo de entidad' },
          taccion:   {type: 'Select',options: utils.tipoActionIniciativeList, title:'Tipo de iniciativa' },
          area:   {type: 'Select',options: utils.actionAreasOptionList, title:'Area ' },
          fecomp:  {type: 'DatePicker', title: 'Fecha solicitud', placeholder:'dd/mm/aaaa fecha solicitud de la acción'},
          slug:      {type: 'Text', title: 'Denominación'},
          description: {type: 'TextArea', title: 'Descripción'},
      };
    },
    //idAttribute: "_id",

    createNewAction: function(cb){
      var self = this;
      var action = new Entities.Action(self.attributes);

      console.log('[%s]: createNewAction',self.whoami);

      action.initBeforeCreate(function(action){
        action.save(null, {
          success: function(model){
            cb(null,model);
          }
        });
      });
    },

    updateModel: function(model){
      model.set(this.attributes)
      return model;
    },

    defaults: {
      _id: null,
      cnumber: "",
      tregistro:"",
      taccion: "",
      feaccion: utils.dateToStr(new Date()),
      area: "",
      slug: "",
      estado_alta:'activo',
      nivel_ejecucion: 'enpreparacion',
      nivel_importancia: 'media',
      description: "",

    },

   });

  Entities.ActionHeaderFacet = Backbone.Model.extend({
    //urlRoot: "/comprobantes",
    whoami: 'ActionHeaderFacet:action.js ',

    schema: function() {
      return {
          tregistro: {type: 'Select',options: utils.tipoActionEntityList, title:'Tipo de entidad' },
          taccion:   {type: 'Select',options: utils.tipoActionIniciativeList, title:'Tipo de iniciativa' },
          slug:      {type: 'Text', title: 'Denominación'},
          feaccion:      {type: 'Text', title: 'Fecha acción'},
          lugarfecha: {type: 'Text', title: 'Detalle lugar/fecha'},
          description: {type: 'TextArea', title: 'Descripción'},
          lineaaccion: {type: 'Text', title: 'Línea estratégica'},
          objetivo: {type: 'TextArea', title: 'Objetivos'},
          metafisica: {type: 'Text', title: 'Meta física/ Resultado', editorAttrs:{placeholder:'Cantidad del producto esperado'}},
          metafisicaume: {type: 'Text', title: 'Unidad de medida', editorAttrs:{placeholder:'Unidad de medida meta física'}},
          area:   {type: 'Select',options: utils.actionAreasOptionList, title:'Area ' },
          estado_alta:   {type: 'Select',options: utils.actionAltaOptionList, title:'Estado alta ' },
          nivel_ejecucion: {type: 'Select',options: utils.actionEjecucionOptionList, title:'Nivel ejecución' },
          nivel_importancia: {type: 'Select',options: utils.actionPrioridadOptionList, title:'Importancia' },
          descriptores: {type: 'Text', title: 'Descriptores'},
      };
    },
    //idAttribute: "_id",

    updateModel: function(model){
      var self = this.
          area;

      model.set(this.attributes)
      area = model.get('area')
      if(area){
        model.set('nodo', utils.fetchNode(utils.actionAreasOptionList, area));
      }
      return model;
    },

    defaults: {
      _id: null,
      cnumber: "",
      tregistro:"",
      taccion: "",
      slug: "",
      feaccion: utils.dateToStr(new Date()),
      lugarfecha:"",
      description: "",
      lineaaccion: "",
      objetivo:"",
      metafisica: "",
      metafisicaume:"",
      area:"",
      estado_alta:'activo',
      nivel_ejecucion: 'enpreparacion',
      nivel_importancia: 'media',
      descriptores: ""
    },

   });

  //Accion Collection
  Entities.ActionCollection = Backbone.Collection.extend({
    whoami: 'Entities.ActionCollection:action.js ',
    url: "/acciones",
    model: Entities.Action,
    sortfield: 'cnumber',
    sortorder: -1,

    comparator: function(left, right) {
      var order = this.sortorder;
      var l = left.get(this.sortfield);
      var r = right.get(this.sortfield);

      if (l === void 0) return -1 * order;
      if (r === void 0) return 1 * order;

      return l < r ? (1*order) : l > r ? (-1*order) : 0;
    },
  });


  Entities.ActionUpdate = Backbone.Model.extend({
    whoami: 'Entities.ActionUpdate:action.js ',

    urlRoot: "/actualizar/acciones",

  });




  Entities.ActionNavCollection = Backbone.Collection.extend({
    whoami: 'Entities.ActionCollection:action.js ',
    url: "/navegar/acciones",
    model: Entities.Action,
    sortfield: 'cnumber',
    sortorder: -1,

    comparator: function(left, right) {
      var order = this.sortorder;
      var l = left.get(this.sortfield);
      var r = right.get(this.sortfield);

      if (l === void 0) return -1 * order;
      if (r === void 0) return 1 * order;

      return l < r ? (1*order) : l > r ? (-1*order) : 0;
    },
  });
  
  Entities.ActionsFindOne = Backbone.Collection.extend({
    whoami: 'Entities.ActionsFindOne:action.js ',
    url: "/action/fetch",
    model: Entities.Action,
    comparator: "cnumber",
  });

  Entities.ActionsUpdate = Backbone.Collection.extend({
    whoami: 'Entities.ActionsUpdate:action.js ',
    url: "/actualizar/accions",
    model: Entities.Action,
    comparator: "cnumber",
  });

  /*
   * ******* FACETA PARA CREAR UNA NUEVA ACCION +**********
   */
  Entities.ActionNewFacet = Backbone.Model.extend({
    whoami: 'ActionNewFacet:action.js ',

    validate: function(attrs, options) {
      //if(!attrs) return;
      var errors = {}
      //console.log('validate [%s] [%s] [%s]',attrs, _.has(attrs,'tipoitem'), attrs.tipoitem);

      if (_.has(attrs,'tipoitem') && (!attrs.tipitem )) {
        errors.taccion = "No puede ser nulo";
      }
      if (_.has(attrs,'eusuario') && (!attrs.eusuario )) {
        errors.eusuario = "No puede ser nulo";
      }
      if (_.has(attrs,'slug') && ! attrs.slug) {
        errors.slug = "No puede ser nulo";
      }

      if( ! _.isEmpty(errors)){
        return errors;
      }
    },

    addItemCollection: function(model){
      var self = this,
          itemCol = self.getItems();

      console.log('AddItem [%s] items before Insert:[%s]', model.get('description'), itemCol.length);

      itemCol.add(model);
      console.log('AddItem [%s] items after Insert:[%s]', model.get('description'), itemCol.length);
      self.insertItemCollection(itemCol);
      return itemCol;
    },

    insertItemCollection: function(itemCol) {
        var self = this;
        console.log('INSERT ITEM COLLECTION!!!!!!!!!!! [%s]', itemCol.length);
        self.set({items: itemCol.toJSON()});
        //console.dir(itemCol.toJSON());
    },

    getItems: function(){
      var itemCol = new Entities.MovimSOItems(this.get('items'));
      return itemCol;

    },

    beforeUpdate: function(){

    },

    update: function(model, cb){
      var self = this,
          attrs = self.attributes,
          items = [];
      console.log('Facet Update: model:[%s]', model.whoami);
      self.beforeUpdate();
      model.set('items', items);
      model.update(cb);

    },


    defaults: {
      _id: null,
      cnumber: "",
      tregistro:"",
      taccion: "",
      feaccion: utils.dateToStr(new Date()),
      slug: "actiono nuevoO",
      estado_alta:'media',
      nivel_ejecucion: 'enproceso',
      nivel_importancia: 'alta',
      description: "",
      items:[]
    },


  });


  Entities.ActionQueryFacet = Backbone.Model.extend({
    //urlRoot: "/comprobantes",
    whoami: 'ActionQueryFacet:comprobante.js ',

    initialize: function(opts){
        /* XXX schema se evalúa antes de cargar los datos desde la base, por lo que solo tiene los defaults.
         * Podría usar la forma de function, pero, en otros lados del sistema se sobreescribe así como así partes del mismo
         * y eso rompe todo.
         * Entonces al momento de instanciar una entidad, que pasa antes de ser usado por BBForms, lo reemplazo por el nuevo valor.
         */
        this.schema.area = {type:'Select',title:'Área',options:utils.actionAreasOptionList};
    },

    schema: {
        fedesde:   {type: 'Date',   title: 'Desde', placeholder:'dd/mm/aaaa', yearEnd:2018},
        fehasta:   {type: 'Date',   title: 'Hasta', placeholder:'dd/mm/aaaa', yearEnd:2018},
        taccion:   {type: 'Select', options: utils.tipoActionIniciativeList, title:'Tipo de Acción' },
        tregistro: {type: 'Select', options: utils.tipoActionEntityList, title:'Programa/ Acción' },
        nodo:      {type: 'Select', options: utils.actionNodosOptionList, title:'Nodo' },
        area:      {type: 'Select', options: utils.actionAreasOptionList, title:'Área' },
        slug:      {type: 'Text',   title: 'Denominación'},
        ejecucion: {type: 'Select', options: utils.actionEjecucionOptionList, title:'Nivel ejecución' },
    },

    defaults: {
      fedesde:'',
      fehasta:'',
      taccion: '',
      area: '',
      nodo: '',
      slug: '',
      ejecucion:''
    }
  });





  var filterFactory = function (actions){
    var fd = DocManager.Entities.FilteredCollection({
        collection: actions,

        filterFunction: function(filterCriterion){
          var criteria = filterCriterion.toLowerCase();
          return function(action){
            //console.log('filterfunction:[%s]vs [%s]/[%s]/[%s]',criteria,action.get("taccion"),action.get("cnumber"),action.get("slug"));
            if(action.get("taccion").toLowerCase().indexOf(criteria) !== -1
              || action.get("slug").toLowerCase().indexOf(criteria) !== -1
              || action.get("cnumber").toLowerCase().indexOf(criteria) !== -1){
              
              return action;
            }
          }
        }
    });
    return fd;
  };

  var queryFactory = function (actions){
    var fd = DocManager.Entities.FilteredCollection({
        collection: actions,

        filterFunction: function(query){
          return function(action){
            var test = true;
            //if((query.taccion.trim().indexOf(action.get('taccion'))) === -1 ) test = false;
            //console.log('filterfunction:TEST: [%s] [%s] [%s] [%s]',test, query.taccion,action.get("taccion"),action.get("cnumber"));
            if(query.taccion && query.taccion!=='no_definido') {
              if(query.taccion.trim() !== action.get('taccion')) test = false;
            }

            if(query.area && query.area !=='no_definido') {
              if(query.area.trim() !== action.get('area')) test = false;
            }

            if(query.nodo && query.nodo !=='no_definido') {
              if(query.nodo.trim() !== utils.fetchNode(utils.actionAreasOptionList, action.get('area'))){
               test = false;
             }
            }

            if(query.fedesde.getTime() > action.get('fealta')) test = false;
            if(query.fehasta.getTime() < action.get('fealta')) test = false;



            if(query.tregistro && query.tregistro !=='no_definido') {
              if(query.tregistro.trim() !== action.get('tregistro')) test = false;
            }

            if(query.ejecucion && query.ejecucion!=='no_definido') {
              if(query.ejecucion.trim() !== action.get('nivel_ejecucion')) test = false;
            }

            if(query.slug){
              if(utils.fstr(action.get("slug").toLowerCase()).indexOf(utils.fstr(query.slug)) === -1 && action.get("cnumber").toLowerCase().indexOf(query.slug.toLowerCase()) === -1) test = false;
            }

            if(test) return action;
          }
        }
    });
    return fd;
  };

  var reportQueryFactory = function (reports){
    var fd = DocManager.Entities.FilteredCollection({
        collection: reports,

        filterFunction: function(query){
          return function(report){
            var test = true;
            //if((query.taccion.trim().indexOf(report.get('taccion'))) === -1 ) test = false;
            //console.log('filterfunction:TEST: [%s] [%s] [%s] [%s]',test, query.tipoitem,report.get("tipoitem"),report.get("cnumber"));

            if(query.estado) {
              if(query.estado.trim() !== report.get('estado_alta')) test = false;
            }

            if(query.slug){
              if(utils.fstr(report.get("pslug").toLowerCase()).indexOf(utils.fstr(query.slug)) === -1 && report.get("cnumber").toLowerCase().indexOf(query.slug.toLowerCase()) === -1) test = false;
            }

            if(test) return report;
          }
        }
    });
    return fd;
  };

  var queryCollection = function(query){
      var accions = new Entities.ActionCollection();
      var defer = $.Deferred();
      accions.fetch({
        success: function(data){
          defer.resolve(data);
        }
      });
      var promise = defer.promise();
      return promise;
  };

  
  var isValidDocum = function(docum, query){
    if(query.tcompList.indexOf(docum.get('taccion')) === -1) return false;
    return true;
  };

  var isValidNota = function(docum,item, query){
    if(query.tcompList.indexOf(docum.get('taccion')) === -1) return false;
    if(query.tmovList[docum.get('taccion')].indexOf(item.tipomov) === -1) return false;
    if(query.fedesde > docum.get('fecomp_tc')) return false;
    if(query.fehasta < docum.get('fecomp_tc')) return false;
    return true;
  };
  var isValidPE = function(reportItem, query){
    if(query.tcompList.indexOf(reportItem.get('taccion')) === -1) return false;
    if(query.fedesde > reportItem.get('fechagestion_tc')) return false;
    if(query.fehasta < reportItem.get('fechagestion_tc')) return false;
    return true;
  };
  var isvalidPT = function(reportItem, query){
    if(query.tcompList.indexOf(reportItem.get('taccion')) === -1) return false;
    if(query.fedesde > reportItem.get('fechagestion_tc')) return false;
    if(query.fehasta < reportItem.get('fechagestion_tc')) return false;
    return true;
  };

  var timeDelay1 = function(array, deferred){
    setTimeout(function(){
      console.log("Execution for processFile[%s] ", array.length);
    }, 1500);
  };

  var timeDelay2 = function(array, deferred){
    setTimeout(function(){
      console.log("Execution for processFile[%s] ", array.length);
      deferred.forEach(function(elem){
        if(true){
          console.log('timeout2: Deferred stat: [%s]', elem.state());
        }

      });
    }, 5500);
  };

  var API = {

    loadActionBudgetCol: function(query, opt, cb){
      console.log('loadActionBudgetCol BEGIN')
      var self = this,
          fetchingActions = API.getActionBudgetCol(query);

      $.when(fetchingActions).done(function(actions){
        cb(actions);
      });

    },

    getActionBudgetCol: function(query){
      var defer = $.Deferred();
      console.log('ready to fetch: QUERY:[%s]', query.areas);

      $.ajax({
        data: query,
        type: 'post',
        url: "/actionbudget/fetch",

        success: function(data){
          defer.resolve(data);
        }
      });
   
      var promise = defer.promise();
      return promise;
    },

    loadActionBudgetColOld: function(query, opt, cb){
      //deprecated
      var self = this,
          deferredCol = [],
          resultCol = [],
          fetchingActions = API.getEntities();

      $.when(fetchingActions).done(function(actions){

        var filteredActions = queryFactory(actions);
        if(query){
          filteredActions.filter(query);
        }

        filteredActions.each(function(model){

          deferredCol.push(self.fetchBudget(model, opt, function(budgetCol, defer){

            budgetCol.each(function(budgetModel){
              budgetModel.set('parent_action',model.attributes);
              budgetModel.set('importe_num', parseInt(budgetModel.get('importe')))
              resultCol.push(budgetModel);

            });
            defer.resolve();
          }));

        });

        $.when.apply(null, deferredCol).then(function(){
          console.log('==============DONE 1 [%s] =============', resultCol.length);
          cb(resultCol);
        });

      });
    },

    getEntities: function(){
      var accions = new Entities.ActionCollection();
      var defer = $.Deferred();
      accions.fetch({
        success: function(data){
          defer.resolve(data);
        }
      });
      var promise = defer.promise();
      return promise;
    },

    getFilteredCol: function(criteria, cb){
      var fetchingActions = API.getEntities();

      $.when(fetchingActions).done(function(actions){
        var filteredActions = filterFactory(actions);
        console.log('getQuery')
        if(criteria){
          filteredActions.filter(criteria);
        }
        if(cb) cb(filteredActions);
      });
    },

    getFilteredByQueryCol: function(query, cb){
      var fetchingActions = queryCollection(query);

      $.when(fetchingActions).done(function(actions){
          console.log('getFiltered PROMISE OK');

        //var docitems = fetchActionItemlist(actions);
        //var filteredActions = queryFactory(actions);

        var filteredActions = queryFactory(actions);
        if(query){
          filteredActions.filter(query);
        }
        //fetchProductDuration(filteredActions,function(){
        //  if(cb) cb(filteredActions);
        //})
        if(cb) cb(filteredActions);
      });
    },

    getEntity: function(entityId){
      var accion = new Entities.Action({_id: entityId});
      var defer = $.Deferred();
      if(entityId){
        accion.fetch({
          success: function(data){
            defer.resolve(data);
          },
          error: function(data){
            defer.resolve(undefined);
          }
       });
      }else{
        defer.resolve(accion);
      }
      return defer.promise();
    },

    fetchNextPrev: function(type, model, cb){
      var query = {};
      if(type === 'fetchnext') query.cnumber = { $gt : model.get('cnumber')}
      if(type === 'fetchprev') query.cnumber = { $lt : model.get('cnumber')}

      var accions= new Entities.ActionsFindOne();
      accions.fetch({
          data: query,
          type: 'post',
          success: function() {
              if(cb) cb(accions.at(0));
          }
      });
    },
    fetchBudget: function(model, opt, cb){
      var query = {};
      var defer = $.Deferred();

      query.owner_id = model.id;

      var budgetCol = new Entities.BudgetNavCollection();
      budgetCol.fetch({
          data: query,
          type: 'post',
          success: function() {
            //defer.resolve('true');

            if(cb) cb(budgetCol, defer);
          }
      });
      return defer.promise();

    },
    fetchRequests: function(model, opt, cb){
      var query = {};
      var defer = $.Deferred();

      query.action_id = model.id;

      var requestCol = new Entities.AdminrequestNavCollection();
      requestCol.fetch({
          data: query,
          type: 'post',
          success: function() {
            //defer.resolve('true');

            if(cb) cb(requestCol, defer);
          }
      });
      return defer.promise();

    },
    fetchValidBudget: function(model, opt, cb){
      var query = {};
      var defer = $.Deferred();

      query.owner_id = model.id;
      query.estado_alta = 'activo';

      var budgetCol = new Entities.BudgetNavCollection();
      budgetCol.fetch({
          data: query,
          type: 'post',
          success: function() {
            //defer.resolve('true');

            if(cb) cb(budgetCol, defer);
          }
      });
      return defer.promise();

    },

    determinActionCost: function(col){
      //console.log('====== determinActionCost======: [%s]', col.whoami);
      return col.evaluateTotalCost();

    },

    determinActionRequest: function(col){
      console.log('====== determinActionCost======: [%s]', col.whoami);
      return col.evaluateActionRequests();

    },
    
    
    geocode: function(addressStr){
      return $.ajax({
          type: "GET",
          url: "/geocode",
          dataType: "json",
          data: {address: addressStr}
      });
    },
    
    fetchLocations: function(query,queryString){
      var defer = $.Deferred();
      
      if(query instanceof Entities.ArtActivity){
        query = {action_id: query.get('action_id')};
      }else if(query instanceof Entities.Event){
        query = {action_id: query.get('artactivity').get('action_id')};
      }
      
      if(query.toJSON){
        query = query.toJSON();
      }
      
      $.ajax({
        data: query,
        type: 'post',
        url: "/actionlocations/fetch",

        success: function(data){
          defer.resolve(data);
        }
      });
      
      return defer.promise();
    }

  };

  DocManager.reqres.setHandler("action:fetch:actionbudget:col", function(query, opt, cb){
    API.loadActionBudgetCol(query, opt, cb);
  });

  DocManager.reqres.setHandler("action:evaluate:cost", function(budgetCol, opt, cb){
    return API.determinActionCost(budgetCol);
  });

  DocManager.reqres.setHandler("action:evaluate:requests", function(requestCol, opt, cb){
    return API.determinActionRequest(requestCol);
  });

  DocManager.reqres.setHandler("action:fetch:budget", function(model, opt, cb){
    return API.fetchBudget(model, opt, cb);
  });

  DocManager.reqres.setHandler("action:fetch:adminrequests", function(model, opt, cb){
    return API.fetchRequests(model, opt, cb);
  });

  DocManager.reqres.setHandler("action:fetch:valid:budget", function(model, opt, cb){
    return API.fetchValidBudget(model, opt, cb);
  });

  DocManager.reqres.setHandler("action:entities", function(){
    return API.getEntities();
  });

  DocManager.reqres.setHandler("action:filtered:entities", function(criteria, cb){
    return API.getFilteredCol(criteria,cb);
  });

  DocManager.reqres.setHandler("action:query:entities", function(query, cb){
    return API.getFilteredByQueryCol(query,cb);
  });

  DocManager.reqres.setHandler("action:entity", function(id){
    return API.getEntity(id);
  });

  DocManager.reqres.setHandler("action:fetchprev", function(model, cb){
    return API.fetchNextPrev('fetchprev',model, cb);
  });

  DocManager.reqres.setHandler("action:fetchnext", function(model, cb){
    return API.fetchNextPrev('fetchnext',model, cb);
  });
  
  DocManager.reqres.setHandler("app:geocode", function(addressString){
    return API.geocode(addressString);
  });
  
  DocManager.reqres.setHandler("action:fetch:location", function(model, opt, cb){
    return API.fetchLocations(model, opt, cb);
  });

});

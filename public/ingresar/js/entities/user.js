DocManager.module("Entities", function(Entities, DocManager, Backbone, Marionette, $, _){
  Entities.User = Backbone.Model.extend({

    whoami: 'User:models.js ',
    urlRoot: "/usuarios",

    idAttribute: "_id",

    validate: function(attrs, options) {
      var errors = {};

      if (_.has(attrs,'username') && ! attrs.username) {
        errors.username = "Usuario: No puede ser nulo";
      }

      if (_.has(attrs,'displayName') && ! attrs.displayName) {
        errors.displayName = "Saludo: No puede ser nulo";
      }

      if( ! _.isEmpty(errors)){
        return errors;
      }
    },

    beforeUpdate: function() {
        this.set({feum:new Date().getTime()});
        this.set({username:this.get('mail')});
    },

    updateRelatedPredicate: function(per_attrs, predicate, cb){
      var self = this,
          person = self[predicate],
          data;
      //console.log('userUpdateRelatedPredicate: [%s] [%s]:[%s]', predicate, person.whoami, person.get('displayName'));

      if(!person){
        person = new Entities.Person();
        self[predicate] = person;
      }

      person.set(per_attrs);

      person.update(function(person){
        data = buildPredicateData(person, self, predicate);
        self.update(predicate, data, function(user){
          if(cb) cb(person);
        });
      });
    },

    update: function(key, data, cb){
        var self = this;
        if(!self.id){
          //console.log('NO PUEDO HACER UPDATE: Falta el ID [%s] [%s]',self.id, self.get('username'));
          return;
        }
        self.fetch({
          success: function(model){
            model.beforeUpdate();
            model.set(key, data);
            model.save(null, {
                success: function (model) {
                    //console.log('udate user:SUCCESS: [%s] ',model.get('username'));

                    if(cb) cb(model);
                },
                error: function () {
                    console.log('ERROR: Ocurrió un error al intentar actualizar este nodo: [%s]',model.get('username'));
                }
            });
          }
        });
    },

    updateProfile: function(data, cb){
        var self = this;
        if(!self.id){
          //console.log('NO PUEDO HACER UPDATE: Falta el ID [%s] [%s]',self.id, self.get('username'));
          return;
        }
        model.beforeUpdate();
        model.set(data);
        model.save(null, {
            success: function (model) {
                //console.log('udate user:SUCCESS: [%s] ',model.get('username'));
                if(cb) cb(model);
            },
            error: function () {
                console.log('ERROR: Ocurrió un error al intentar actualizar este nodo: [%s]',model.get('username'));
            }
        });
    },

    inviteUserToMica: function(){
      var self = this,
          repairkeys,
          roles = [],
          modulos = [];

      console.log('user: [%s] [%s] role:[%s] mod:[%s] [%s] grp:[%s] [%s]',
        self.get('displayName'),self.get('username'), 
        self.get('roles'), self.get('modulos'), self.get('estado_alta'), 
        self.get('grupo'), self.get('home'));

      roles = self.get('roles')|| [];
      modulos = self.get('modulos')|| [];

      if(roles.indexOf('usuario') === -1) roles.push('usuario');
      if(modulos.indexOf('mica') === -1) modulos.push('mica');

      repairkeys = {
        modulos: modulos,
        roles: roles
      }
      if(!self.get('home')) repairkeys.home = 'mica:rondas';
      if(!self.get('grupo')) repairkeys.grupo = 'adherente';
      if(self.get('estado_alta') === 'pendaprobacion') repairkeys.estado_alta = 'activo';

      self.partialUpdate(repairkeys);
    },

    inviteUserToFondo: function(){
      var self = this,
          repairkeys,
          roles = [],
          modulos = [];

      console.log('user: [%s] [%s] role:[%s] mod:[%s] [%s] grp:[%s] [%s]',
        self.get('displayName'),self.get('username'), 
        self.get('roles'), self.get('modulos'), self.get('estado_alta'), 
        self.get('grupo'), self.get('home'));

      roles = self.get('roles')|| [];
      modulos = self.get('modulos')|| [];

      if(roles.indexOf('usuario') === -1) roles.push('usuario');
      if(modulos.indexOf('fondo') === -1) modulos.push('fondo');

      repairkeys = {
        modulos: modulos,
        roles: roles
      }
      if(!self.get('home')) repairkeys.home = 'fondo:inscripcion';
      if(!self.get('grupo')) repairkeys.grupo = 'adherente';
      if(self.get('estado_alta') === 'pendaprobacion') repairkeys.estado_alta = 'activo';

      self.partialUpdate(repairkeys);
    },

    inviteManagerToFondo: function(){
      var self = this,
          repairkeys,
          roles = [],
          modulos = [];

      console.log('user: [%s] [%s] role:[%s] mod:[%s] [%s] grp:[%s] [%s]',
        self.get('displayName'),self.get('username'), 
        self.get('roles'), self.get('modulos'), self.get('estado_alta'), 
        self.get('grupo'), self.get('home'));

      roles = self.get('roles')|| [];
      modulos = self.get('modulos')|| [];

      if(modulos.indexOf('fondo') === -1) modulos.push('fondo');

      if(roles.indexOf('usuario') === -1) roles.push('usuario');
      if(roles.indexOf('admin') === -1) roles.push('admin');
      repairkeys = {
        modulos: modulos,
        roles: roles
      }
      repairkeys.grupo = 'produccion';


      if(!self.get('home')) repairkeys.home = 'fondo:inscripcion';
      if(self.get('estado_alta') === 'pendaprobacion') repairkeys.estado_alta = 'activo';

      self.partialUpdate(repairkeys);
    },


    inviteManagerToMica: function(){
      var self = this,
          repairkeys,
          roles = [],
          modulos = [];

      console.log('user: [%s] [%s] role:[%s] mod:[%s] [%s] grp:[%s] [%s]',
        self.get('displayName'),self.get('username'), 
        self.get('roles'), self.get('modulos'), self.get('estado_alta'), 
        self.get('grupo'), self.get('home'));

      roles = self.get('roles')|| [];
      modulos = self.get('modulos')|| [];

      if(modulos.indexOf('mica') === -1) modulos.push('mica');

      if(roles.indexOf('usuario') === -1) roles.push('usuario');
      if(roles.indexOf('admin') === -1) roles.push('admin');
      repairkeys = {
        modulos: modulos,
        roles: roles
      }
      repairkeys.grupo = 'produccion';


      if(!self.get('home')) repairkeys.home = 'mica:rondas';
      if(self.get('estado_alta') === 'pendaprobacion') repairkeys.estado_alta = 'activo';

      self.partialUpdate(repairkeys);
    },

    partialUpdate: function(data){
      //data: un hash de claves
      //
      var self = this,
          query = {};

      query.nodes = [self.id ];
      query.newdata = data;

      var update = new Entities.UserUpdate(query);
      return update.save({
        success: function() {
        }
      });
    },

    fetchFilteredPredicateArray: function(predicate, child, ancestor){
        var tlist = child.get(predicate);
        if(!tlist) {
            tlist = [];
        }else{
            tlist = _.filter(tlist,function(element){
                return element && (element.id!==ancestor.id);
            });
        }
        return tlist;
    },


    defaults : {
        _id: null,
        displayName:'',
        username:'',
        password:'',
        mail:'',
        roles:[],
        fealta:'',
        grupo: '',
        roles: '',
        estado_alta:'pendaprobacion',
        verificado: {
            mail:false,
            feaprobado: null,
            adminuser: '',
        },
        conduso:[]
    }
  });

  Entities.UserUpdate = Backbone.Model.extend({
    whoami: 'Entities.UserUpdate: user.js ',

    urlRoot: "/actualizar/usuarios",

  });



  Entities.UserFacet = Backbone.Model.extend({
    whoami:'UserFacet:user.js',

    idAttribute: "_id",


/*
        displayName:    {type: 'Text', title: 'Nombre saludo', editorAttrs:{placeholder : 'sera utilizado como saludo'}, validators:['required']},
        name:           {type: 'Text', title: 'Nombre completo', editorAttrs:{placeholder : 'nombre y apellido'}, validators:['required']},
        username:       {type: 'Text', title: 'Correo electrónico', editorAttrs:{placeholder : 'sera su identificación como usuario'}},
        mail:           {type: 'Text', title: 'Reingrese correo', editorAttrs:{placeholder : 'sera su correo de contacto'}},
        password:       {type: 'Password', title: 'Clave de acceso' },
        passwordcopia:  {type: 'Password', title: 'Reingrese clave'},
        termsofuse:      {type: 'Checkbox',options: ['Aceptado'] , title:'Acepto los términos de uso y las políticas de privacidad del MCN'},
   termsofuse:      {type: 'Checkbox',options: ['Aceptado'] , title:'Acepto',editorAttrs:{placeholder : 'acepta los términos de referencia'}},

person: tipojuridico: {pfisicia/pjridica/pideal/porganismo}
person.roles:{adherente/proveedor/empleado}
person.taglist: [sisplan]

user.roles:[administrador/usuario/supervisor]
user.grupo: "tecnica|"
user.home: 'sisplan:acciones:list'
user.verificado: {mail/feaprobado/adminuser}

home: dónde arranca

Roles de usuario: (es un array)
    admin:
        puede gestionar tablas de configuración / instalación

    supervisor:
        toma decisiones en su área de trabajo

    usuario:
        usuario operativo de su área de trabajo

    presugestor:
        puede gestionar presupuestos

    gestoractividades:
        puede gestionar actividades

modulos: (array)
    sisplan/asistencias/mica


atribuciones (array)
    chimenea: puede ver de su área para abajo
    nodochimenea: puede ver todo lo de su nodo
    superchimenea: puede ver todo los nodos.
    presuautorizante: autoriza presupuesto.


*/
    schema: {
        displayName:    {type: 'Text', title: 'Nombre saludo', editorAttrs:{placeholder : 'sera utilizado como saludo'}, validators:['required']},
        name:           {type: 'Text', title: 'Nombre completo', editorAttrs:{placeholder : 'nombre y apellido'}, validators:['required']},
        username:       {type: 'Text', title: 'Correo electrónico', editorAttrs:{placeholder : 'sera su identificación como usuario'},validators:['required','email']},
        mail:           {type: 'Text', title: 'Reingrese correo', editorAttrs:{placeholder : 'sera su correo de contacto'}, validators:[
                            {type:'required', message:'Favor ingrese el dato'},{type:'email', message:'no es una dirección válida'},{type:'match',field:'username',message:'Los correos no coinciden'}]},
        area:           {type: 'Select', options: utils.actionAreasOptionList, title:'Área/Nodo' },
        description:    {type: 'Text', title: 'Comentario', editorAttrs:{placeholder : 'cuéntenos brevemente sobre Usted'}},
        password:       {type: 'Password', title: 'Clave de acceso', validators:['required'] },
        passwordcopia:  {type: 'Password', title: 'Reingrese clave', validators:[
                            {type:'match', message:'Las claves no coinciden', field:'password'}]},
        //termsofuse:      {type: 'Radio',title: '¿Acepta condicones de uso?',options: [{label:'Acepto',val:'Aceptoval'},{label:'NoAcepto',val:'NoAceptoval'}] },
        termsofuse:      {type: 'Checkbox',options: [{val:'Aceptado', label:'Aceptado'}] , title:'Acepto términos y condiciones de uso del sitio', validators:['required'] },


    },

    initialize: function () {

    },

    setTarget: function(path, target){
      this.set({
        target: path || '',
        targetUser: target || ''
      });
    },

    isEmployee: function(){
      return isEmployee(this.get('targetUser'));
    },

    addNewUser: function(cb){
        var self = this,
        pf = new DocManager.Entities.Person(),
        user = new Entities.User(),
        userattrs = {};

        //console.log('addNewUser [%s] [%s]', self.get('target'), self.get('targetUser'));

        userattrs.displayName = self.get('displayName');
        userattrs.name = self.get('name');
        userattrs.username = self.get('username');
        userattrs.mail = self.get('mail');
        userattrs.description = self.get('description');
        userattrs.password = self.get('password');
        userattrs.roles =   self.get('roles');
        userattrs.area =   self.get('area');
        userattrs.home =  self.get('home');
        userattrs.grupo = self.get('grupo');
        userattrs.target = self.get('target');
        userattrs.fealta = self.get('fealta');
        userattrs.fealta = self.get('fealta');
        userattrs.apellido = self.get('apellido');

        if(self.get('targetUser')){
            self.buildDefaultsFor(self.get('targetUser'), userattrs)
        }
        user.set(userattrs);


        pf.factoryPerson(self.get('targetUser'), userattrs, function(person){
            if(person){
                person.insertuser(user, function(user){
                    if(user){
                        if(cb) cb(user);
                    }

                });

            }

        });

    },

    buildDefaultsFor: function(target, user){
        if(target === 'sisplan'){
            user.home = 'sisplan:acciones:list';

            user.roles = ['supervisor', 'presugestor'];
            user.atributos = ['nodochimenea'];

            user.modulos = ['sisplan'];
            user.estado_alta = 'activo';
        }else if(target === 'mica'){
            user.grupo = 'adherente';
            user.home = 'mica:rondas';

            user.roles = ['usuario'];
            user.atributos = [];

            user.modulos = ['mica'];
            user.estado_alta = 'activo';

        }else if(target === 'fondo'){
            user.grupo = 'adherente';
            user.home = 'fondo:inscripcion';

            user.roles = ['usuario'];
            user.atributos = [];

            user.modulos = ['fondo'];
            user.estado_alta = 'activo';

        }
    },

    loadusers: function(username, cb){
        var self = this;
        //console.log('loadusers: [%s]',self.get('username'));
        var query = {'username':username};
        var userCol= new Entities.UserFetchCollection();
        userCol.fetch({
            data: query,
            type: 'post',
            success: function() {
                if(cb) cb(userCol);
            }
        });
    },

    validusername: function(username, cb) {
        var self = this;

        //console.log('!!!UserValidation checking for:[%s]', username);
        self.loadusers(username, function(userCol){
            if(userCol){
                if(userCol.length){
                    self.set('usernameconflict',self.get('username'));
                }else {
                    self.set('usernameconflict','zNoHallado');
                }
                cb(userCol.length);
            }else cb(0);

        });

    },

    validate: function(attrs, options) {
      //console.log('UserFacet VALIDATE attrs:[%s] options:[%s]',attrs,options);
      var errors = {},
            strict = false;

      if(options){
        strict = options.strict || strict;
      }

      if(strict){
        //console.log('modo STRICT [%s] [%s]', attrs.username, attrs.mail);
          if (! attrs.username) {
            errors.username = "Usuario: dato requerido";
            //errors.otro = 'otro error no reconocido';
          }

          if (! attrs.termsofuse) {
            errors.termsofuse = "Debe aceptar los términos de uso";
            //errors.otro = 'otro error no reconocido';
          }

          if (! attrs.password) {
            errors.password = "Debe indicar una clave de acceso";
            //errors.otro = 'otro error no reconocido';
          }

          if(attrs.username !== attrs.mail){
            errors.mail = "Las direcciones de correo no coinciden";
          }

          if(attrs.password !== attrs.passwordcopia){
            errors.password = "Las claves no coinciden";
          }

      }

      if (attrs.username) {
        if(attrs.username == this.get('usernameconflict')) {
          errors.username = "Ya existe este usuario en la base de datos";
        }
      }


      if (attrs.password) {
        if(attrs.password.length < 6 ) {
          errors.password = "La clave es muy corta";
        }
        //errors.username = "Usuario: dato requerido";
        //errors.otro = 'otro error no reconocido';
      }

      if( ! _.isEmpty(errors)){
        return errors;
      }
    },

    defaults : {
        _id: null,
        displayName:'',
        name:'',
        username:'',
        mail:'',
        area:'',
        description: '', //'cuéntenos brevemente sobre Usted',
        password:'',
        passwordcopia:'',
        fealta:'',
        usernameconflict:'zNoTesteado',
        roles: [],
        home: "",
        grupo:'adherente',
        termsofuse: false,
        target: '',

        estado_alta:'pendaprobacion',
        verificado: {
            mail:true,
            feaprobado: null,
            adminuser: '',
        },
        conduso:[]
    },
/*
    defaults : {
        _id: null,
        displayName:'',
        name:'',
        username:'',
        mail:'',
        area:'',
        description: '', //'cuéntenos brevemente sobre Usted',
        password:'',
        passwordcopia:'',
        fealta:'',
        usernameconflict:'zNoTesteado',
        roles: [],
        home: "",
        grupo:'adherente',
        termsofuse: false,
        target: '',

        estado_alta:'pendaprobacion',
        verificado: {
            mail:true,
            feaprobado: null,
            adminuser: '',
        },
        conduso:[]
    }

*/
});






  // Utility Function
  var isEmployee = function(targetUser){
    if(targetUser){
      if(targetUser === 'sisplan') return true;
    }

    return false;
  };

  var buildPredicateData = function (ancestor, child, predicate) {
    var ancestordata = {
            id: ancestor.id,
            code: ancestor.get('nickName'),
            slug: ancestor.get('name'),
            order: 101,
            predicate: predicate
        },
        tlist = previousArray(predicate, child, ancestor);

    tlist.push(ancestordata);
    child.set(predicate, tlist);

    return tlist;
  };

  var previousArray = function(predicate, child, ancestor){
      var tlist = child.get(predicate);
      if(!tlist) {
          tlist = [];
      }else{
          tlist = _.filter(tlist,function(element){
              return element && (element.id!==ancestor.id);
          });
      }
      return tlist;
  };

  //Entities.configureStorage(Entities.User);

  Entities.UserCollection = Backbone.Collection.extend({

    model: Entities.User,
    url: "/usuarios",

    comparator: "nickName"
  });

  Entities.UserFetchCollection = Backbone.Collection.extend({

    model: Entities.User,
    url: "/recuperar/usuarios",

    comparator: "username",

    initialize: function (model, options) {
       if(options) this.options = options;
    },
  });



  var API = {

    getUserByUsername: function(username){
      var entity = new Entities.UserFetchCollection(),
          query = {username: username},
          defer = $.Deferred();

      entity.fetch({
        data: query,
        type: 'post',

        success: function(data){
          defer.resolve(data);
        },
        error: function(data){
          defer.resolve(undefined);
        }
      });
      return defer.promise();
    },

    getEntity: function(entityId){
      var entity = new Entities.User({_id: entityId});
      var defer = $.Deferred();

      entity.fetch({
        success: function(data){
          defer.resolve(data);
        },
        error: function(data){
          defer.resolve(undefined);
        }
      });
      return defer.promise();
    },

    fetchPersons: function(user, predicate, cb){
      //predicates = ['es_usuario_de', 'es_miembro_de', 'es_representante_de'],

      var list = [],
          aperson;

      if(user.get(predicate)){
        list = _.map(user.get(predicate),function(item){
                //console.log('iterando: enabled predicate:[%s] itemid:[%s] slug:[%s]',predicate,item.id,item.slug)
                aperson = new Entities.Person({_id:item.id},item);

                var defer = $.Deferred();

                aperson.fetch({
                    success: function(model){
                        defer.resolve(aperson);
                    }
                });
                return defer.promise();
                //return aperson;
            });
        $.when.apply(null, list).done(function(person){
          //OjO: me qedo con la primera person
          //console.log('Callback DONE: [%s] [%s]', arguments.length, person.get('displayName'))
          cb(person)
          user[predicate] = person;
        });

      }else{
        cb(null);
        user[predicate] = null;
      }

    },

    changePassword: function(user){
      var data = {
        password: user.get('password')
      };

      return user.partialUpdate(data);
    }

  };

  DocManager.reqres.setHandler("user:by:username", function(username){
    return API.getUserByUsername(username);
  });

  DocManager.reqres.setHandler("user:load:persons", function(user, predicate, cb){
    return API.fetchPersons(user, predicate, cb);
  });

  DocManager.reqres.setHandler("user:entity", function(id){
    return API.getEntity(id);
  });

  DocManager.reqres.setHandler("user:changepassword",function(user){
    return API.changePassword(user);
  });

});

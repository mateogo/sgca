DocManager.module("Entities", function(Entities, DocManager, Backbone, Marionette, $, _){
  Entities.User = Backbone.Model.extend({

    whoami: 'User:models.js ',
    urlRoot: "/usuarios",

    idAttribute: "_id",

    validate: function(attrs, options) {
      var errors = {}

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
    isSupervisor: function(){
      var supervisor = false;
      var roles = _.intersection(this.get('roles'), ['supervisor', 'admin']);
      return (roles.length > 0 ? true : false);
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
      console.dir(per_attrs)

      if(!person){
        person = new Entities.Person();
        self[predicate] = person;
      }
      
      person.set(per_attrs);

      person.update(function(person){
        console.log('personUddateCB: [%s]', person.get('displayName'));
        data = buildPredicateData(person, self, predicate);
        self.update(predicate, data, function(user){
          console.log('userUpdate CB: [%s]', user.get('username'));
          if(cb) cb(person);
        });
      });
    },

    update: function(key, data, cb){
        var self = this;
        if(!self.id){
          console.log('NO PUEDO HACER UPDATE: Falta el ID [%s] [%s]',self.id, self.get('username'));
          return;
        }
        self.fetch({
          success: function(model){
            model.beforeUpdate();
            model.set(key, data);
            model.save(null, {
                success: function (model) {
                    console.log('udate user:SUCCESS: [%s] ',model.get('username'));

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
          console.log('NO PUEDO HACER UPDATE: Falta el ID [%s] [%s]',self.id, self.get('username'));
          return;
        }
        model.beforeUpdate();
        model.set(data);
        model.save(null, {
            success: function (model) {
                console.log('udate user:SUCCESS: [%s] ',model.get('username'));
                if(cb) cb(model);
            },
            error: function () {
                console.log('ERROR: Ocurrió un error al intentar actualizar este nodo: [%s]',model.get('username'));
            }
        });
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


  // Utility Function
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

    comparator: "username"
  });

  Entities.UserFetchCollection = Backbone.Collection.extend({

    model: Entities.User,
    url: "/recuperar/usuarios",

    comparator: "username",

    initialize: function (model, options) {
       if(options) this.options = options;
    },
  });

  var loadCollection = function(){
      var entities = new Entities.UserCollection();
      var defer = $.Deferred();

      entities.fetch({
        success: function(data){
          defer.resolve(data);
        },
        error: function(data){
            defer.resolve(undefined);
        }
      });

      return defer.promise();

  };





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
      
      console.log('[%s]: loadPersons BEGINS',user.whoami);


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

    addModuleToUser: function(){
      var userpromise,
          repairkeys,
          roles = [],
          modulos = [],
          testindex = 0,
          badindex = 0;

      $.when(loadCollection()).done(function(users){
        console.log('======== loaded users: [%s]', users.length);
        users.each(function(user){
          testindex = testindex + 1;
          roles = user.get('roles')|| [];
          modulos = user.get('modulos')|| [];

 
          if( (modulos.indexOf('mica') === -1 && modulos.indexOf('fondo') !== -1) ||
              (modulos.indexOf('mica') !== -1 && modulos.indexOf('fondo') === -1) ||
              (modulos.length === 0)){
            //|| user.get('home')!== 'mica:rondas' || user.get('grupo') !== 'adherente'
            badindex += 1;

            console.log('user: [%s] [%s] role:[%s] mod:[%s] [%s] grp:[%s] [%s]',
              user.get('displayName'),user.get('username'), 
              user.get('roles'), user.get('modulos'), user.get('estado_alta'), 
              user.get('grupo'), user.get('home'));

            if(roles.indexOf('usuario') === -1) roles.push('usuario');
            if(modulos.indexOf('mica') === -1) modulos.push('mica');
            if(modulos.indexOf('fondo') === -1) modulos.push('fondo');

            repairkeys = {
              modulos: modulos,
              roles: roles
            }

            if(!user.get('grupo')) repairkeys.grupo = 'adherente';
            if(user.get('estado_alta') === 'pendaprobacion') repairkeys.estado_alta = 'activo';

            user.partialUpdate(repairkeys);
          }
        });

      });
      console.log('======= total recorods:[%s]   (al 23-07: total 2744/130 ) badindex: [%s]', testindex, badindex);
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

  DocManager.reqres.setHandler("user:repair:modules", function(){
    return API.addModuleToUser();
  });

});

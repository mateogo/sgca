DocManager.module("Entities", function(Entities, DocManager, Backbone, Marionette, $, _){
  Entities.User = Backbone.Model.extend({

    whoami: 'User:models.js ',
    urlRoot: "/usuarios",

    idAttribute: "_id",

    validate: function(attrs, options) {
      var errors = {}
      if (! attrs.username) {
        errors.username = "no puede quedar en blanco";
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
      
      console.log('[%s]: loadPersons BEGINS',user.whoami);


      if(user.get(predicate)){
        list = _.map(user.get(predicate),function(item){
                //console.log('iterando: enabled predicate:[%s] itemid:[%s] slug:[%s]',predicate,item.id,item.slug)
                aperson = new Entities.Person({_id:item.id},item);
                
                var defer = $.Deferred();

                aperson.fetch({
                    success: function(model){
                        console.log('SUCCESS: [%s]',model.id);
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


});

DocManager.module("Entities", function(Entities, DocManager, Backbone, Marionette, $, _){
  Entities.Person = Backbone.Model.extend({

    whoami: 'Person: person.js ',
    urlRoot: "/personas",

    idAttribute: "_id",

    defaults: {
        _id: null,
        tipopersona:"persona",
        name: '',
        displayName: '',
        nickName: '',
        tipojuridico:{
            pfisica: true,
            pjuridica: false,
            pideal: true,
            porganismo: false
        },
        roles:{
            adherente:false,
            proveedor:false,
            empleado:false,
        },
        estado_alta: "activo",
        descriptores: "",
        taglist:[],
        description: "",
 
        contactinfo:[],
        notas:[],
        branding:[],
    },

    initBeforeSave: function(){
      var feultmod = new Date();
      this.set({feultmod:feultmod.getTime()})
      if(! this.get('fealta')){
        this.set({fealta:feultmod.getTime()});
      }

    },

    insertuser: function(user, cb){
        //console.log('[%s] insert USER BEGINS',this.whoami);
        //utils.inspect(user.attributes,0, 'INSERT USER');
        
        var self = this,
            predicate = 'es_usuario_de',
            deferreds = [],
            defer;

        user.beforeUpdate();
        //user.set({feum:new Date().getTime()});
        //user.set({denom:user.get('slug')});

        user = self.buildPredicateData(self, user, 1, 100, predicate);
        //console.log('[%s] insertUSER READY TO SAVE',this.whoami);

        defer = user.save(null, {
            success: function (user) {
                console.log('insert user:SUCCESS: [%s] ',user.get('username'));
            },
            error: function () {
                console.log('ERROR: Ocurrió un error al intentar actualizar este nodo: [%s]',user.get('username'));
            }
        });
        deferreds.push(defer);

        $.when.apply(null, deferreds).done(function(){
            console.log('UPDATE user DONE!! id:[%s]',user.id);
            /*

            if(!notas) notas = [];
            data.id = user.id
            data.slug = user.get('slug');
            data.fecha = user.get('fecha');
            data.tiponota = user.get('tiponota');
            data.responsable = user.get('responsable');
            data.url = user.get('url');

            notas.push(data);
            self.set({notas: notas});
            */
            if(cb) cb(user);
        });
    },

    buildPredicateData: function (ancestor, child, seq, numprefix, predicate) {
        var ancestordata = {
                id: ancestor.id,
                code: ancestor.get('nickName'),
                slug: ancestor.get('name'),
                order: ancestor.buildRefNumber(seq,(numprefix||100)),
                predicate: predicate
            };
        var tlist = child.fetchFilteredPredicateArray(predicate, child,ancestor);
        tlist.push(ancestordata);
        
        if(predicate === 'es_capitulo_de')  child.set({es_capitulo_de : tlist});
        if(predicate === 'es_coleccion_de') child.set({es_coleccion_de: tlist});
        if(predicate === 'es_instancia_de') child.set({es_instancia_de: tlist});
        if(predicate === 'es_asset_de')     child.set({es_asset_de: tlist});
        if(predicate === 'es_nota_de')      child.set({es_nota_de: tlist});
        if(predicate === 'es_usuario_de')   child.set({es_usuario_de: tlist});
        if(predicate === 'es_miembro_de')   child.set({es_miembro_de: tlist});
        if(predicate === 'es_relacion_de')  child.set({es_relacion_de: tlist});

        return child;
    },

    buildRefNumber: function(iter, prefix){
        var numcap = iter;
        if(prefix){
            numcap += prefix;
        }
        return numcap;
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


    update: function(cb){
      var self = this;
      self.initBeforeSave();
      self.save(null, {
          success: function (model) {
              console.log('Exito! se insertó una nueva Person');
              if(cb) cb(model);
          },
          error: function () {
              console.log('Error! Ocurrió un error al intentar insertar una nueva Person');
              if(cb) cb(false);
          }
      });
    },

    updateProfile: function(data, cb){
        var self = this;
        if(!self.id){
          console.log('NO PUEDO HACER UPDATE: Falta el ID [%s] [%s]',self.id, self.get('name'));
          return;
        }
        self.fetch({
          success: function(model){
            model.initBeforeSave();
            model.set(data);
            model.save(null, {
                success: function (model) {
                    console.log('udate user:SUCCESS: [%s] ',model.get('name'));

                    if(cb) cb(model);
                },
                error: function () {
                    console.log('ERROR: Ocurrió un error al intentar actualizar este nodo: [%s]',model.get('username'));
                }
            });          
          }
        });
    },

    factoryPerson: function(target, attrs, cb){
        var self = this;
        if (target){
            self.buildDefaultsFor(target, attrs)
        }else{
            self.set({
                "tipopersona": "persona",
                "name": attrs.name,
                "displayName": attrs.displayName,
                "nickName": attrs.displayName,
                "tipojuridico": {
                    "pfisica": true,
                    "pjuridica": false,
                    "pideal": false,
                    "porganismo": false
                },
                "roles": {
                    "adherente": true,
                    "proveedor": false,
                    "empleado": false,
                },
                "estado_alta": "activo",
                "descriptores": "formWeb",
                "description": attrs.description,
                "contactinfo": [{
                    "tipocontacto": "mail",
                    "subcontenido": "principal",
                    "contactdata": attrs.mail
                }],
            });
        }
 
        self.initBeforeSave();
        self.save(null, {
            success: function (model) {
                console.log('Exito! se insertó una nueva Person');
                if(cb) cb(model);
            },
            error: function () {
                console.log('Error! Ocurrió un error al intentar insertar una nueva Person');
                if(cb) cb(false);
            }
        });
    },

    buildDefaultsFor: function(target, attrs){
        var self = this;
        if(target=== 'sisplan'){
            console.log('PERSON: build defaults for SISPLAN')
            self.set({
                "tipopersona": "persona",
                "name": attrs.name,
                "displayName": attrs.displayName,
                "nickName": attrs.displayName,
                "tipojuridico": {
                    "pfisica": true,
                    "pjuridica": false,
                    "pideal": false,
                    "porganismo": false
                },
                "roles": {
                    "adherente": false,
                    "proveedor": false,
                    "empleado": true,
                },
                "estado_alta": "activo",
                "descriptores": "sisplan",
                "description": attrs.description,
                "contactinfo": [{
                    "tipocontacto": "mail",
                    "subcontenido": "principal",
                    "contactdata": attrs.mail
                }],
            });
        }else if(target=== 'mica'){
            console.log('PERSON: build defaults for MICA')
            self.set({
                "tipopersona": "persona",
                "name": attrs.name,
                "displayName": attrs.displayName,
                "nickName": attrs.displayName,
                "tipojuridico": {
                    "pfisica": true,
                    "pjuridica": false,
                    "pideal": false,
                    "porganismo": false
                },
                "roles": {
                    "adherente": true,
                    "proveedor": false,
                    "empleado": false,
                },
                "estado_alta": "activo",
                "descriptores": "mica",
                "description": attrs.description,
                "contactinfo": [{
                    "tipocontacto": "mail",
                    "subcontenido": "principal",
                    "contactdata": attrs.mail
                }],
            });
        }else{
            self.set({
                "tipopersona": "persona",
                "name": attrs.name,
                "displayName": attrs.displayName,
                "nickName": attrs.displayName,
                "tipojuridico": {
                    "pfisica": true,
                    "pjuridica": false,
                    "pideal": false,
                    "porganismo": false
                },
                "roles": {
                    "adherente": true,
                    "proveedor": false,
                    "empleado": false,
                },
                "estado_alta": "activo",
                "descriptores": "formWeb",
                "description": attrs.description,
                "contactinfo": [{
                    "tipocontacto": "mail",
                    "subcontenido": "trabajo",
                    "contactdata": attrs.mail
                }],
            });
        }
    },

    validate: function(attrs, options) {
        var errors = {};
        if (! attrs.name) {
          errors.firstName = "no puede quedar en blanco";
        }
        if (! attrs.nickName) {
          errors.lastName = "no puede quedar en blanco";
        }
        else{
          if (attrs.displayName.length < 2) {
            errors.lastName = "demasiado corto";
          }
        }
        if( ! _.isEmpty(errors)){
          return errors;
        }
      }
  });

  //Entities.configureStorage(Entities.Person);

  Entities.PersonCollection = Backbone.Collection.extend({

    model: Entities.Person,
    url: "/personas",

    comparator: "nickName"
  });
  
});


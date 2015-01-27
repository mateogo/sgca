DocManager.module("Entities", function(Entities, DocManager, Backbone, Marionette, $, _){

	Entities.Micaprofile = Backbone.Model.extend({
		urlRoot: "/perfiles",
		whoami: 'Micaprofile: perfilmica.js',
		idAttribute: "_id",

		initialize: function () {
		},

		facetFactory: function(user){
      var self = this,
          data,
          fealta = new Date();

      return buildFacetData(user, self);
    },

    update: function(cb){

      console.log('PROFILE UPDATE');
      var self = this;
      //self.beforeSave();
      var errors ;

      if(!self.save(null, {
        success: function(model){

          cb(null,model);
         }
        })) {
				cb(self.validationError,null);
			}

    },




		defaults: {
			_id: null,
			tregistro:'perfil',
			evento:'mica2015',

			//inscripcion
			cnumber:'',
			documid: '',
			fealta: '',
			slug: '',
			description: '',

		}
	});

	Entities.MicaprofileCollection = Backbone.Collection.extend({

		whoami: 'MicaprofileCollection: perfilmica.js',
		model: Entities.Micaprofile,
		url: "/perfiles",

		initialize: function (model, options) {
		},

	});
	Entities.MicaprofileSearchCol = Backbone.Collection.extend({

		whoami: 'MicaprofileCollection: perfilmica.js',
		model: Entities.Micaprofile,
		url: "/navegar/perfiles",

		initialize: function (model, options) {
		},

	});


	Entities.MicaEditFacet = Backbone.Model.extend({
    whoami: 'MicaEdit:perfilmica.js ',
		
		initialize: function(){
			var self = this;
			var user = dao.gestionUser.getCurrentUser();
			var namesur = user.get('name') +' '+ user.get('apellido')
			self.set('rmail',user.get('mail'));
			self.set('rname',namesur);
		},

    validate: function(attrs, options) {
      var errors = {}

      if (_.has(attrs,'edisplayName') && (!attrs.edisplayName )) {
        errors.edisplayName = "No puede ser nulo";
      }

      if (_.has(attrs,'rname') && (!attrs.rname )) {
        errors.rname = "No puede ser nulo";
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

    saveInscripcion: function(user, comprobante, perfil, cb){
    	var self = this;
    	perfil.set(buildProfileData(user, comprobante, perfil, self));
    	perfil.update(cb);
    },

    updateRepresentantes: function(col) {
        var self = this;
        console.log('UpdateRepresentantes [%s]', col.length);
        self.set({representantes: col.toJSON()});
        //console.dir(col.toJSON());
    },

    getRepresentantes: function(){
      var itemCol = new Entities.RepresentanteCol(this.get('representantes'));
      return itemCol;

    },

    validateStep: function(step){
      var self = this,
          valid = true,
          errors = {};

      var check = [['edisplayName'],['rname']];
      if(step>2 || step<1) return null;

      _.each(check[step-1], function(fld){
          var attr = {};
          attr[fld] = self.get(fld);
          var err = self.validate(attr);
          console.log('validating: [%s] [%s]',fld, err)
          console.dir(err)
          _.extend(errors, err)
          if(err) valid = false;
      });
      if(!valid){
				 return errors;
      }else{
				 return null;
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



    initNewItem: function(){
//			console.log('inicia nuevoitem');
      var sitem = new Entities.Representante();

      sitem.set({

      });

      return sitem;
    },

    productSelected: function(pr){
      // fetching a product success. 

    },

    defaults: {
			 _id: null,
			tregistro:'perfil',
			evento:'mica2015',

			//inscripcion
			cnumber:'',
			documid: '',
			fealta: '',
			slug: '',
			description: '',

			//empresa
			edisplayName: '',
			ename: '',
			edescription: '',
			epais: '',
			eprov: '',
			elocalidad: '',
			ecuit: '',
			edomicilio: '',
			ecp: '',
			email: '',
			eweb: '',
			efundacion: '',
			enumempleados: '',
			eventas: '',


			//responsable
			userid: '',
			personid: '',
			rmail: '',
			rname: '',
			rcargo: '',
			rdni: '',
			rfenac: '',
			rtel: '',
			rcel: '',
			ridiomas: '',

			rolePlaying:{
				comprador: false,
				vendedor: false
			},

			isComprador: '',
			isVendedor: '',

			profiles:[],

			cactividades: {
				aescenicas:false,
				audivisual: false,
				disenio: false,
				editorial: false,
				musica: false,
				videojuegos: false,
			},
			cdescriptores: '',
			cproductos: '',
			cexpinternacional: '',
			cexpregional: '',
			cmercados: '',
			cferias: '',
			cobjetivo: '',
			ccomentario: '',

			vactividades: {
				aescenicas: false,
				audivisual: false,
				disenio: false,
				editorial: false,
				musica: false,
				videojuegos: false,
			},
			vdescriptores: '',
			vproductos: '',
			vexpinternacional: '',
			vexpregional: '',
			vmercados: '',
			vferias: '',
			vobjetivo: '',
			vcomentario: '',

			representantes:[],
			estado_alta: 'activo',
			nivel_ejecucion: 'entramite',
			nivel_importancia: 'media',

    },

  });



	Entities.Representante = Backbone.Model.extend({
    whoami: 'Representante: perfilmica.js ',

 
    validate: function(attrs, options) {
      var errors = {}
			console.log(attrs)
      if (_.has(attrs,'rname') && (!attrs.rname )) {
        errors.rname = "No puede ser nulo";
      }     

      if( ! _.isEmpty(errors)){
        return errors;
      }
    },

    defaults: {

    },
  }); 
	
	Entities.RepresentanteCol = Backbone.Collection.extend({
    whoami: 'Entities.MovimINItems:comprobante.js ',
    model: Entities.Representante,
    comparator: "rname",
  });

	var buildProfileData = function(user, comprobante, perfil, facet){
		var fealta = new Date(),
				comprador,
				vendedor;


		var data = {
			tregistro: facet.get('tregistro'),
			evento: facet.get('evento'),
			fealta: utils.dateToStr(fealta),
			fealta_tc: fealta.getTime(),

			dnumber: comprobante.get('cnumber'),
			documid: comprobante.id,
			slug: facet.get('slug'),
			description: facet.get('description'),

			edisplayName: facet.get('edisplayName'),
			ename: facet.get('ename'),
			edescription: facet.get('edescription'),
			epais: facet.get('epais'),
			eprov: facet.get('eprov'),
			elocalidad: facet.get('elocalidad'),
			ecuit: facet.get('ecuit'),
			edomicilio: facet.get('edomicilio'),
			ecp: facet.get('ecp'),
			email: facet.get('email'),
			eweb: facet.get('eweb'),
			efundacion: facet.get('efundacion'),
			enumempleados: facet.get('enumempleados'),
			eventas: facet.get('eventas'),


			userid: user.id,
			personid: user['es_representante_de'].id,

			rmail: facet.get('rmail'),
			rname: facet.get('rname'),
			rcargo: facet.get('rcargo'),
			rdni: facet.get('rdni'),
			rfenac: facet.get('rfenac'),
			rtel: facet.get('rtel'),
			rcel: facet.get('rcel'),
			ridiomas: facet.get('ridiomas'),

			estado_alta: 'activo',
			nivel_ejecucion: 'entramite',
			nivel_importancia: 'media',

			rolePlaying: facet.get('rolePlaying'),

			profiles: [],
			representantes:[],
		};


		if(true){
			comprador = {
				tipoperfil: 'demandante-mica',
				rol: 'demandante',
				actividades: facet.get('cactividades'),
				descriptores: facet.get('cdescriptores'),
				expeintl: facet.get('cexpinternacional'),
				experegl: facet.get('cexpregional'),
				mercados: facet.get('cmercados'),
				ferias: facet.get('cferias'),
				objetivo: facet.get('cobjetivo'),
				comentario: facet.get('ccomentario')
			};
			data.profiles.push(comprador);

		}

		if(true){
			vendedor = {
				tipoperfil: 'oferente-mica',
				rol: 'oferente',
				actividades: facet.get('vactividades'),
				descriptores: facet.get('vdescriptores'),
				expeintl: facet.get('vexpinternacional'),
				experegl: facet.get('vexpregional'),
				mercados: facet.get('vmercados'),
				ferias: facet.get('vferias'),
				objetivo: facet.get('vobjetivo'),
				comentario: facet.get('vcomentario')
			};
			data.profiles.push(vendedor);
		}
		return data;

	};

	var buildFacetData = function(user, perfil){
		var fealta = new Date(),
				comprador,
				vendedor,
				facet = new Entities.MicaEditFacet(perfil.attributes);
		console.log('buildFacetData: [%s] [%s]', facet.get('tregistro'), facet.get('evento'))

		var profiles = perfil.get('profiles');
		_.each(profiles, function(item){
			if(item.rol === 'demandante'){
				facet.set({
					ctipoperfil: 'demandante-mica',
					crol: 'demandante',
					cactividades: item.actividades,
					cdescriptores: item.descriptores,
					cexpeintl: item.expeintl,
					cexperegl: item.expergnl,
					cmercados: item.mercados,
					cferias: item.ferias,
					cobjetivo: item.objetivo,
					ccomentario: item.comentario,
				});
			}else{
				facet.set({
					vtipoperfil: 'oferente-mica',
					vrol: 'oferente',
					vactividades: item.actividades,
					vdescriptores: item.descriptores,
					vexpeintl: item.expeintl,
					vexperegl: item.expergnl,
					vmercados: item.mercados,
					vferias: item.ferias,
					vobjetivo: item.objetivo,
					vcomentario: item.comentario,
				});
			}
		});
		return facet;
	};




	var API = {

		getEntitiesByQuery: function(query){
      var entities = new Entities.MicaprofileSearchCol();
      var defer = $.Deferred();
      entities.fetch({
      	data: query,
      	type: 'post',
        success: function(data){
          defer.resolve(data);
        }
      });
      var promise = defer.promise();
      return promise;
    },

		fetchMicaByDocument: function(document, user, cb){
			console.log('fetchMicaByUser BEGIN')
			var self = this,
					query = {},
					fetchingEntities;

			query.documid = document.id;
			query.userid = user.id;
			fetchingEntities = API.getEntitiesByQuery(query);

			$.when(fetchingEntities).done(function(entities){
			  cb(entities);
			});

		},

		fetchMicaByUser: function(user, evento, cb){
			console.log('fetchMicaByUser BEGIN')
			var self = this,
					query = {},
					fetchingEntities;

			query.evento = evento;
			query.userid = user.id;
			fetchingEntities = API.getEntitiesByQuery(query);

			$.when(fetchingEntities).done(function(entities){
			  cb(entities);
			});

		},
	};


	DocManager.reqres.setHandler("mica:fetch:active:profile", function(user, evento, cb){
	    API.fetchMicaByUser(user, evento, cb);
	});

	DocManager.reqres.setHandler("mica:fetch:document:profile", function(document, user, cb){
	    API.fetchMicaByDocument(document, user, cb);
	});

});




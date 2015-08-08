DocManager.module("FondoRequestApp.Edit", function(Edit, DocManager, Backbone, Marionette, $, _){
  
  var Entities = DocManager.module('Entities');
  
  Edit.Controller = {
      
      editInscripcion: function(id){
        loadModel(id, 'edit').then(function(){
          createLayoutView();
          createWizardFormViews();
        });
        $('body').scrollTop(0);
      },
      
      addInscripcion: function(){
        // search for existing profiles
        loadModel(null, 'search').then(function(){
          createLayoutView();
          createWizardFormViews();
        });
        $('body').scrollTop(0);
      },

      newInscripcion: function(){
        // create brand-new profile
        loadModel(null, 'add').then(function(){
          createLayoutView();
          createWizardFormViews();
        });
        $('body').scrollTop(0);
      },
  };
  
  var getSession = function(){
    if(!Edit.Session){
      Edit.Session = {views:{},model:null};
    }
    return Edit.Session;
  };
  
  var loadModel = function(id, mode){

    var defer = $.Deferred(),
        fetchingRequest,
        fetchingMicaRequest,
        fetchingAssets,
        fondorqst,
        query;

    dao.gestionUser.getUser(DocManager, function (user){
      //console.log('Dao Get Current user: [%s]', user.get('username'));
      getSession().currentUser = user;
      
      fetchingRequest = DocManager.request("fondorqst:factory:new", user, "fondo");

      // if(id){
      //     fetchingRequest = DocManager.request("fondorqst:entity", id);
      // }else{
      // }
     
      $.when(fetchingRequest).done(function(fondorqsts){
        fondorqst = populateNavigationBar(fondorqsts, id, mode);
        //console.log('FondoRequestApp.Edit BEGIN [%s] [%s]', fondorqst.whoami, fondorqst.id);

        // off the record: si tiene inscripción en mica buscamos datos default

        query = {
          'es_asset_de.id': fondorqst.id
        }
        fetchingAssets = DocManager.request("assets:filtered:entities", query);
        $.when(fetchingAssets).done(function(assets){

          fetchingMicaRequest = DocManager.request("micarqst:factory:new", user, "mica");
          $.when(fetchingMicaRequest).done(function(micarqst){
            //console.log('FETCHING MicaRequest [%s] [%s]', micarqst.whoami, micarqst.id);

            fondorqst.initDataForEdit();

            getSession().model = fondorqst;
            
            getSession().adjuntos = DocManager.request('assets:groupby:predicate', assets, fondorqst.id);
            
            initData(user, fondorqst);
            
            if(micarqst && micarqst.id ){
              getSession().mica = micarqst;
              setDefaultData(user, fondorqst, micarqst);
            }
            defer.resolve(fondorqst);

          }); // mica
        });// asstes
      });//fondo
 
    });//user
    return defer.promise();
  };

  var initData = function(user, model){
    // Load Assets
    model.stepTwo.set('epais','AR');
 
    if(model.id){

    }else{
      if(user){
        model.get('responsable').rmail = user.get('mail');
        model.stepTwo.set('rmail', user.get('mail'));
        model.stepTwo.set('rmail2', user.get('mail'));
      }
    }
  };

  var setDefaultData = function(user, model, micarqst){

    if(!model.id){
      if(user){
        //console.log('yes! default data: ', micarqst.get('responsable').rname);
        model.stepTwo.set('rname', micarqst.get('responsable').rname);
        model.stepTwo.set('rdocnum', micarqst.get('responsable').rdocnum);
        model.stepTwo.set('rtel', micarqst.get('responsable').rtel);
        model.stepTwo.set('rcel', micarqst.get('responsable').rcel);
        model.stepTwo.set('rfenac', micarqst.get('responsable').rfenac);
        model.stepTwo.set('rcargo', micarqst.get('responsable').rcargo);
      }
    }
  };


  var createNotFound = function(){
    DocManager.mainRegion.show(new Edit.NotFoundView());
    
  };
  
  // ***** LAYOUT ****************
  var createLayoutView = function(){
    var session = getSession();
    
    session.views.layout = new Edit.Layout({model:session.model});
    
    registerLayoutEvents(session.views.layout);
  };

  var registerLayoutEvents = function(layout){
    layout.on('add:new:profile', function(model){
      Edit.Controller.newInscripcion();

    });


    DocManager.mainRegion.show(layout);
  };
  
  // ********** Carátula de la tramitación: Vista y edición
  var createWizardFormViews = function(){
    var session = getSession();
    var layout = Edit.Session.views.layout;
    var wizardlayout = new Edit.WizardLayout({model:session.model});
    var stepOne = new Edit.StepOneForm({model: session.model['stepOne']});

    var stepTwo = new Edit.StepTwoLayout({model: session.model['stepTwo']});
    registerStepTwoEvents(session, stepTwo);


    var stepThree = new Edit.StepThreeLayout({model: session.model['stepThree']});
    registerStepThreeEvents(session, stepThree);

    var stepFour = new Edit.StepFourLayout({model: session.model['stepFour']});
    registerStepFourEvents(session, stepFour);

    session.views.wizardlayout = wizardlayout;
    session.views.stepOne   = stepOne;
    session.views.stepTwo   = stepTwo;
    session.views.stepThree = stepThree;
    session.views.stepFour = stepFour;


    // //         this.trigger('adminrequest:cost:changed', costo_total);
    registerBasicViewEvents(session, wizardlayout);

    layout.getRegion('formRegion').show(wizardlayout);
    wizardlayout.getRegion('steponeRegion').show(stepOne);
    wizardlayout.getRegion('steptwoRegion').show(stepTwo);
    wizardlayout.getRegion('stepthreeRegion').show(stepThree);
    wizardlayout.getRegion('stepfourRegion').show(stepFour);


  };

  var registerBasicViewEvents = function(session, wizardlayout){

    wizardlayout.on("submit:form:provisorio", function(model){
      //console.log('******** provisorio SUBMIT PROVISORIO BEGINS********[%s]', model.whoami)
      
      getSession().model.update(session.currentUser, session.pasajeros, session.tramos, function(error, model){
        Message.success('Los datos han sido guardados en modo borrador.');

        enviarmail(utils.templates.MailFormGuardarProvisorio, {
          toName: getSession().currentUser.get('displayName'),
          cnumber: model.get('cnumber'),
          fecomp: model.get('fecomp'),
          nodeId: model.id,
          slug: model.get('requerimiento').emotivation,
        });

        window.open('http://fondo.cultura.gob.ar','_self');
        //DocManager.trigger('fondorequest:edit', model)

      });
    });

    wizardlayout.on("submit:form:definitivo", function(model){
      //console.log('******** definitivo SUBMIT DEFINITIVO BEGINS********[%s]', model.whoami, model.get('requerimiento').emotivation)
      getSession().model.set('nivel_ejecucion', 'submit_definitivo');
      getSession().model.update(session.currentUser, session.pasajeros, session.tramos, function(error, model){

        Message.success('Grabación exitosa. Recibirás un correo electrónico de confirmación');
        enviarmail(utils.templates.MailFormSubmitNotification, {
          toName: getSession().currentUser.get('displayName'),
          cnumber: model.get('cnumber'),
          fecomp: model.get('fecomp'),
          nodeId: model.id,
          slug: model.get('requerimiento').emotivation,
        });

        window.open('http://fondo.cultura.gob.ar','_self');
        //DocManager.trigger('fondorequest:edit', model)

      });

    });

  };

  var enviarmail = function(template, data){
      var mailModel = new DocManager.Entities.SendMail({
          from: 'intranet.mcn@gmail.com',
          subject:'[FONDO] Inscripción Fondo Argentino de Desarrollo Cultural - Movilidad',
      });

      mailModel.set('to',getSession().currentUser.get('username'));
      
      //todo:ver donde configurar el servidor de produccion
      //console.log('enviarMail: currentDomain: [%s]',DocManager.getCurrentDomain());
      mailModel.set( 'server',DocManager.getCurrentDomain());
      //mailModel.set( 'server','http://localhost:3000');

      mailModel.set(data)
      mailModel.setTemplate(template);      
      mailModel.buildMailContent();
      //console.log(sendMail.getData());

      //console.dir(mailModel.attributes);

      mailModel.sendmail();
  };
    


  var registerStepTwoEvents = function(session, layout){
    var stepTwoForm = new Edit.StepTwoForm({model: session.model['stepTwo']});
    session.views.stepTwoForm = stepTwoForm;

    // var representanteCol = new Entities.RepresentanteCol(session.model.representantes);
    // var representante = new Entities.Representante();
    // session.representantes = representanteCol;

    layout.on("show", function(){
      layout.formRegion.show(stepTwoForm);
      //DocManager.trigger('representante:edit',representante);
    });
  };


  var registerStepThreeEvents = function(session, layout){
    var stepThreeForm = new Edit.StepThreeForm({model: session.model['stepThree']});
    session.views.stepThreeForm = stepThreeForm;

    var tramosCol = new Entities.TramosCol(session.model.tramos);
    var tramo = new Entities.Tramo();
    session.tramos = tramosCol;

    var pasajerosCol = new Entities.PasajerosCol(session.model.pasajeros);
    var pasajero = new Entities.Pasajero();
    session.pasajeros = pasajerosCol;


    layout.on("show", function(){
      layout.formRegion.show(stepThreeForm);
      DocManager.trigger('tramos:edit',tramo);
      DocManager.trigger('pasajeros:edit',pasajero);
    });
  };


  var registerStepFourEvents = function(session, layout){
    var stepFourForm = new Edit.StepFourForm({model: session.model['stepFour']});
    session.views.stepFourForm = stepFourForm;

    layout.on("show", function(){
      layout.formRegion.show(stepFourForm);
    });

  };

  var populateNavigationBar = function(list, id, mode){
    getSession().previousProfiles = new DocManager.Entities.FondoRegistrationFindByQueryCol();
    if(!list){
      //console.log('Caso 0: list is null');
      DocManager.navigate("inscripcion/nueva");
      return new DocManager.Entities.FondoRegistration();

    }
    if(list.whoami === 'FondoRegistracion'){
      if(list.id){
        if(profileVigente(list)){
          //console.log('Caso 1.1.: existing Model');
          DocManager.navigate("inscripcion/" + list.id + "/edit");
          return list;

        }else{
          //console.log('Caso 1.2.: new Model');
          DocManager.navigate("inscripcion/nueva");
          return list;          
        }

      }else{
        //console.log('Caso 1.2.: new Model');
        DocManager.navigate("inscripcion/nueva");
        return list;

      }

    }else if(list.whoami === 'FondoRegistrationFindByQueryCol'){
      getSession().previousProfiles = list;
      createButtonAccess(list);
      if(list.length){

        var entity = selectOneFromList(list, id, mode);
        if(entity.id && profileVigente(entity)){
          //console.log('Caso 2.1.1: Retrieve id');
          DocManager.navigate("inscripcion/" + entity.id + "/edit");
        }else{
          //console.log('Caso 2.1.2: id not found');
          DocManager.navigate("inscripcion/nueva");
 
        }
        return entity;

      }else{
        //console.log('Caso 2.2: collection has no models');
        DocManager.navigate("inscripcion/nueva");
        return new DocManager.Entities.FondoRegistration();

      }

    }

  };

  var createButtonAccess = function(list){
    $('#fondo-active-profiles').html('');
    var colView = new Edit.ActiveRecordsCollectionView({collection: list, el:$('#fondo-active-profiles') });
    colView.render();
  };

  var selectOneFromList = function(list, id, mode){
    var model;
    if(mode === 'add'){
      return new DocManager.Entities.FondoRegistration();
    }else if(id){
      model = list.find(function(model){
        if(model.id === id && profileVigente(model)) return true;
        else return false;
      })
      return model || new DocManager.Entities.FondoRegistration();
    }else{
      return list.at(0);
    }

  };

  var profileVigente = function(model){
    if(model.get('requerimiento').tsolicitud === 'movilidad_mica' && model.get('estado_alta') === 'activo'){
      return false;
    }else{
      return true;
    }
  };

  var API = {
 
    initTramosView: function(model){
      var session = getSession();
      var crudManager = new Edit.CrudManager(
          {
            gridcols:[
              {name:'fesalida', label:'Salida', cell:'string', editable:false},
              {name:'origen',   label:'Origen', cell:'string', editable:false},
              {name:'destino',  label:'Destino', cell:'string', editable:false},
              {name:'eventname',  label:'Evento', cell:'string', editable:false},
              {label: 'Acciones', cell: 'ItinerarioAction', editable:false, sortable:false},
            ],
            filtercols:['origen', 'destino'],
            editEventName: 'tramos:edit',

          },
          {
            test: 'TestOK',
            layoutTpl: utils.templates.ItinerarioLayout,
            formTpl: utils.templates.ItinerarioForm,
            collection: session.tramos,
            editModel: Entities.Tramo,
            modelToEdit: model,
            editorOpts: {},
          }
      );
      session.views.stepThree.itinerarioRegion.show(crudManager.getLayout());

    },

    initPasajerosView: function(model){
      var session = getSession();
      var crudManager = new Edit.CrudManager(
          {
            gridcols:[
              {name:'pnombre',   label:'Nombre', cell:'string', editable:false},
              {name:'papellido', label:'Apellido', cell:'string', editable:false},
              {name:'pdni',      label:'DNI', cell:'string', editable:false},
              {label: 'Acciones', cell: 'PasajeroAction', editable:false, sortable:false},
            ],
            filtercols:['pnombre', 'papellido', 'pmail'],
            editEventName: 'pasajeros:edit',

          },
          {
            test: 'TestOK',
            layoutTpl: utils.templates.PasajeroLayout,
            formTpl: utils.templates.PasajeroForm,
            collection: session.pasajeros,
            editModel: Entities.Pasajero,
            modelToEdit: model,
            editorOpts: {},
          }
      );
      session.views.stepThree.pasajeroRegion.show(crudManager.getLayout());

    },

    saveStep: function(step){
      var session = getSession();
      session.model.update(session.currentUser, session.pasajeros, session.tramos, function(error, model){

      });
    },

  };

  DocManager.on("wizard:next:step", function(step){
    API.saveStep(step);
  });

  DocManager.on("tramos:edit", function(model){
    API.initTramosView(model);
  });

  DocManager.on("pasajeros:edit", function(model){
    API.initPasajerosView(model);
  });


});
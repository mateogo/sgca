DocManager.module("MicaRequestApp.Showcase", function(Showcase, DocManager, Backbone, Marionette, $, _){
  
  var Entities = DocManager.module('Entities');
  
  Showcase.Controller = {
      
      editInscripcion: function(id){
        loadModel(id).then(function(){
          createLayoutView();
          createWizardFormViews();
        });
        $('body').scrollTop(0);
      },
      
      addInscripcion: function(){
        loadModel().then(function(){
          createLayoutView();
          createWizardFormViews();
        });
        $('body').scrollTop(0);
      },
  };
  
  var getSession = function(){
    if(!Showcase.Session){
      Showcase.Session = {views:{},model:null};
    }
    return Showcase.Session;
  }
  
  var loadModel = function(id){

    var defer = $.Deferred(),
        fetchingEntity,
        fetchingMicaRequest;

    dao.gestionUser.getUser(DocManager, function (user){
      //console.log('Dao Get Current user: [%s]', user.get('username'));
      getSession().currentUser = user;

      //Verificación: el usuario YA TIENE una inscripción en MICA
      fetchingMicaRequest = DocManager.request("micarqst:factory:new", user, "mica");
      $.when(fetchingMicaRequest).done(function(micarqst){
        //console.log('FETCHING MicaRequest [%s] [%s]', micarqst.whoami, micarqst.id);
        if(micarqst && micarqst.id ){
          // YA TIENE una inscripción

          if(id){
              fetchingEntity = DocManager.request("showcase:entity", id);
          }else{
              fetchingEntity = DocManager.request("showcase:factory:new", user, "mica_showcase");
          }
         
          $.when(fetchingEntity).done(function(entity){
            //console.log('MicaRequestApp.Showcase BEGIN [%s] [%s]', entity.whoami, entity.id);

            entity.initDataForEdit();

            getSession().model = entity;

            setDefaultData(user, entity, micarqst);
            defer.resolve(entity);
             
          });

        }else{
          // NO TIENE una inscripción
          Message.confirm('ATENCIÓN: es necesario <strong>INSCRIBIRSE en MICA</strong><br> para aplicar al SHOWCASE MICA-2015.<br>Desea INSCRIBIRSE o VOLVER a la página de MICA?',['Volver','Inscribirme'], function(response){
            if(response === 'Volver'){
              window.open('http://mica.cultura.gob.ar','_self');
            }else{
              window.open('/mica/#bienvenido','_self');
            }

          });

        }

      });




 
    });
    return defer.promise();
  };

  var setDefaultData = function(user, model, micarqst){

    if(!model.id){
      if(user){
        model.get('responsable').rmail = user.get('mail');
        model.stepTwo.set('rmail', user.get('mail'));
        model.stepTwo.set('rmail2', user.get('mail'));
        model.stepTwo.set('rname', micarqst.get('responsable').rname);
        model.stepTwo.set('rdocnum', micarqst.get('responsable').rdocnum);
        model.stepTwo.set('rtel', micarqst.get('responsable').rtel);
        model.stepTwo.set('rcel', micarqst.get('responsable').rcel);
      }

    }

  };

  var createNotFound = function(){
    DocManager.mainRegion.show(new Showcase.NotFoundView());
    
  };
  
  // ***** LAYOUT ****************
  var createLayoutView = function(){
    var session = getSession();
    
    session.views.layout = new Showcase.Layout({model:session.model});
    
    registerLayoutEvents(session.views.layout);
  };

  var registerLayoutEvents = function(layout){
    DocManager.mainRegion.show(layout);
  };
  
  // ********** Carátula de la tramitación: Vista y edición
  var createWizardFormViews = function(){
    var session = getSession();
    var layout = Showcase.Session.views.layout;
    var wizardlayout = new Showcase.MicaWizardLayout({model:session.model});
    var stepOne = new Showcase.StepOneForm({model: session.model['stepOne']});

    var stepTwo = new Showcase.StepTwoLayout({model: session.model['stepTwo']});
    registerStepTwoEvents(session, stepTwo);

    var stepThree = new Showcase.StepThreeLayout({model: session.model['stepThree']});
    registerStepThreeEvents(session, stepThree);

    var stepFour = new Showcase.StepFourLayout({model: session.model['stepFour']});
    registerStepFourEvents(session, stepFour);


    session.views.wizardlayout = wizardlayout;
    session.views.stepOne   = stepOne;
    session.views.stepTwo   = stepTwo;
    session.views.stepThree = stepThree;
    session.views.stepFour = stepFour;

    //         this.trigger('adminrequest:cost:changed', costo_total);
    registerBasicViewEvents(session, wizardlayout);

    layout.getRegion('formRegion').show(wizardlayout);
    wizardlayout.getRegion('steponeRegion').show(stepOne);
    wizardlayout.getRegion('steptwoRegion').show(stepTwo);
    wizardlayout.getRegion('stepthreeRegion').show(stepThree);
    wizardlayout.getRegion('stepfourRegion').show(stepFour);


  };

/*
  // ********** Carátula de la tramitación: Vista y edición
  var createWizardFormViews = function(){
    var session = getSession();
    var layout = Showcase.Session.views.layout;
    var wizardlayout = new Showcase.MicaWizardLayout({model:session.model});
    var stepOne = new Showcase.StepOneForm({model: session.model['stepOne']});

    var stepTwo = new Showcase.StepTwoLayout({model: session.model['stepTwo']});


    var stepThree = new Showcase.StepThreeLayout({model: session.model['stepThree']});
    registerStepThreeEvents(session, stepThree);

    var stepFour = new Showcase.StepFourLayout({model: session.model['stepFour']});
    registerStepFourEvents(session, stepFour);

    session.views.wizardlayout = wizardlayout;
    session.views.stepOne   = stepOne;
    session.views.stepTwo   = stepTwo;
    session.views.stepThree = stepThree;
    session.views.stepFour = stepFour;


    //         this.trigger('adminrequest:cost:changed', costo_total);
    registerBasicViewEvents(session, wizardlayout);

    layout.getRegion('formRegion').show(wizardlayout);
    wizardlayout.getRegion('steponeRegion').show(stepOne);
    wizardlayout.getRegion('steptwoRegion').show(stepTwo);
    wizardlayout.getRegion('stepthreeRegion').show(stepThree);
    wizardlayout.getRegion('stepfourRegion').show(stepFour);


  };

*/


  var registerBasicViewEvents = function(session, wizardlayout){
    wizardlayout.on("submit:form:provisorio", function(model){
      //console.log('******** provisorio SUBMIT PROVISORIO BEGINS********[%s]', model.whoami)
      
      getSession().model.update(session.currentUser, session.integrantes, session.mreferencias, session.areferencias, function(error, model){
        Message.success('Los datos han sido guardados en modo borrador.');

        enviarmail(utils.templates.MailShowcaseProvisorio, {
          toName: getSession().currentUser.get('displayName'),
          cnumber: model.get('cnumber'),
          fecomp: model.get('fecomp'),
          nodeId: model.id,
          slug: model.get('solicitante').emotivation,
        });

        window.open('http://mica.cultura.gob.ar','_self');
        //DocManager.trigger('micarequest:edit', model)

      });
    });

    wizardlayout.on("submit:form:definitivo", function(model){
      //console.log('******** definitivo SUBMIT DEFINITIVO BEGINS********[%s]', model.whoami, model.get('solicitante').emotivation)

      getSession().model.update(session.currentUser, session.integrantes, session.mreferencias, session.areferencias, function(error, model){

        Message.success('Grabación exitosa. Recibirás un correo electrónico de confirmación');
        enviarmail(utils.templates.MailShowcaseDefinitivo, {
          toName: getSession().currentUser.get('displayName'),
          cnumber: model.get('cnumber'),
          fecomp: model.get('fecomp'),
          nodeId: model.id,
          slug: model.get('solicitante').emotivation,
        });

        window.open('http://mica.cultura.gob.ar','_self');
        //DocManager.trigger('micarequest:edit', model)

      });

    });

  };

  var enviarmail = function(template, data){
      var mailModel = new DocManager.Entities.SendMail({
          from: 'intranet.mcn@gmail.com',
          subject:'[MICA] Solicitud de Inscripción para el Showcase MICA - 2015',
      });

      mailModel.set('to',getSession().currentUser.get('username'));
      
      //todo:ver donde configurar el servidor de produccion
      mailModel.set( 'server','http://200.80.154.217:3000');
      //mailModel.set( 'server','http://localhost:3000');

      mailModel.set(data)
      mailModel.setTemplate(template);      
      mailModel.buildMailContent();
      //console.log(sendMail.getData());
      //console.dir(mailModel.attributes);

      mailModel.sendmail();
  };
    


  var registerStepTwoEvents = function(session, layout){

    //console.log('RESPONSABLES:  [%s]',  session.model.integrantes.length);
    var stepTwoForm = new Showcase.StepTwoForm({model: session.model['stepTwo']});
    session.views.stepTwoForm = stepTwoForm;

    var integranteCol = new Entities.IntegranteCol(session.model.integrantes);
    var integrante = new Entities.Integrante();

    session.integrantes = integranteCol;

    layout.on("show", function(){
      layout.formRegion.show(stepTwoForm);
      DocManager.trigger('integrante:edit',integrante);
    });
  };

  var registerStepThreeEvents = function(session, layout){

    var stepThreeForm = new Showcase.StepThreeForm({model: session.model['stepThree']});
    session.views.stepThreeForm = stepThreeForm;

    var referenciaCol = new Entities.ReferenciaCol(session.model.mreferencias);
    var referencia = new Entities.Referencia();

    session.mreferencias = referenciaCol;

    layout.on("show", function(){
      layout.formRegion.show(stepThreeForm);
      DocManager.trigger('musica:referencias:edit',referencia);
    });
  };


  var registerStepFourEvents = function(session, layout){

    var stepFourForm = new Showcase.StepFourForm({model: session.model['stepFour']});
    session.views.stepFourForm = stepFourForm;

    var referenciaCol = new Entities.ReferenciaCol(session.model.areferencias);
    var referencia = new Entities.Referencia();

    session.areferencias = referenciaCol;

    layout.on("show", function(){
      layout.formRegion.show(stepFourForm);
      DocManager.trigger('artes:referencias:edit',referencia);
    });

  };

  var API = {

    initIntegranteView: function(integrante){
      var session = getSession();
      var crudManager = new DocManager.MicaRequestApp.Edit.CrudManager(
          {
            gridcols:[
              {name:'aname',  label:'Nombre', cell:'string', editable:false},
              {name:'acargo', label:'Cargo',  cell:'string', editable:false},
              {name:'adni',  label:'DNI',   cell:'string', editable:false},
              {label: 'Acciones', cell: 'integranteAction', editable:false, sortable:false},
            ],
            filtercols:['aname', 'acargo', 'adni'],
            editEventName: 'integrante:edit',

          },
          {
            layoutTpl: utils.templates.IntegranteLayout,
            formTpl: utils.templates.IntegranteForm,
            collection: session.integrantes,
            editModel: Entities.Integrante,
            modelToEdit: integrante,
            editorOpts: {},
          }
      );
      session.views.stepTwo.integranteRegion.show(crudManager.getLayout());


    },

    initEnlacesMusicaView: function(referencia){
      var session = getSession();
      var crudManager = new DocManager.MicaRequestApp.Edit.CrudManager(
          {
            gridcols:[
              {name:'tlink',  label:'Tipo de Enlace', cell:'string', editable:false},
              {name:'targeturl', label:'URL',  cell:'string', editable:false},
              {name:'slug',  label:'Descripción',   cell:'string', editable:false},
              {label: 'Acciones', cell: 'referenciaAction', editable:false, sortable:false},
            ],
            filtercols:['tlink', 'slug', 'targeturl'],
            editEventName: 'musica:referencias:edit',

          },
          {
            layoutTpl: utils.templates.ReferenceLayout,
            formTpl: utils.templates.ReferenceForm,
            collection: session.mreferencias,
            editModel: Entities.Referencia,
            modelToEdit: referencia,
            editorOpts: {},
          }
      );
      session.views.stepThree.mreferenceRegion.show(crudManager.getLayout());


    },
 
    initEnlacesArtesView: function(referencia){
      var session = getSession();
      var crudManager = new DocManager.MicaRequestApp.Edit.CrudManager(
          {
            gridcols:[
              {name:'tlink',     label:'Tipo de Enlace', cell:'string', editable:false},
              {name:'targeturl', label:'URL',            cell:'string', editable:false},
              {name:'slug',      label:'Descripción',    cell:'string', editable:false},
              {label: 'Acciones', cell: 'referenciaAction', editable:false, sortable:false},
            ],
            filtercols:['tlink', 'slug', 'targeturl'],
            editEventName: 'artes:referencias:edit',

          },
          {
            layoutTpl: utils.templates.ReferenceLayout,
            formTpl: utils.templates.ReferenceForm,
            collection: session.areferencias,
            editModel: Entities.Referencia,
            modelToEdit: referencia,
            editorOpts: {},
          }
      );
      session.views.stepFour.areferenceRegion.show(crudManager.getLayout());


    },
 

    saveStep: function(step){
      var session = getSession();
 
      session.model.update(session.currentUser, session.integrantes, session.mreferencias, session.areferencias, function(error, model){
        session.views.stepThree.$('#musica').prop('checked', false);
        session.views.stepThree.$('#musica').prop('disabled', true);
        session.views.stepFour.$('#aescenica').prop('checked', false);
        session.views.stepFour.$('#aescenica').prop('disabled', true);
        session.views.stepThree.$('#infomusica').toggleClass("hidden", true);
        session.views.stepFour.$('#infoaescenica').toggleClass("hidden", true);
        if(session.model.get('solicitante').tsolicitud === 'musica' ){
          session.views.stepThree.$('#musica').prop('disabled', false);
          session.views.stepThree.$('#musica').prop('checked', true);
          session.views.stepThree.$('#infomusica').toggleClass("hidden", false);
        }
        if(session.model.get('solicitante').tsolicitud === 'aescenicas'){
          session.views.stepFour.$('#aescenica').prop('disabled', false);
          session.views.stepFour.$('#aescenica').prop('checked', true);
          session.views.stepFour.$('#infoaescenica').toggleClass("hidden", false);
        }

      });
    },

  };
  var checkReferencias = function(refCol, errors){
    if(refCol.length === 0){
      errors.referencias = 'ATENCIÓN: debe ingresar ENLACES <br> a modo de REFERENCIAS';
      Message.error(errors.referencias);
      return false;
    }else if(refCol.length <5){
      errors.referencias = 'ATENCIÓN: te recordamos la importancia de informar al menos 5 enlaces';
      Message.warning(errors.referencias);
      return true;

    }else{
      return true;
    }
  }

  DocManager.reqres.setHandler("validate:mreferencias", function(view){
    var session = getSession();
    var errors = {};
    return checkReferencias(session.mreferencias, errors);

  });

  DocManager.reqres.setHandler("validate:areferencias", function(view){
    var session = getSession();
    var errors = {};
    return checkReferencias(session.areferencias, errors);
  });

  DocManager.on("showcase:wizard:next:step", function(step){
    API.saveStep(step);
  });

  DocManager.on("integrante:edit", function(model){
    API.initIntegranteView(model);
  });

  DocManager.on("musica:referencias:edit", function(model){
    API.initEnlacesMusicaView(model);
  });

  DocManager.on("artes:referencias:edit", function(model){
    API.initEnlacesArtesView(model);
  });



});
DocManager.module("MicaRequestApp.Edit", function(Edit, DocManager, Backbone, Marionette, $, _){
  
  var Entities = DocManager.module('Entities');
  
  Edit.Controller = {
      
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
    if(!Edit.Session){
      Edit.Session = {views:{},model:null};
    }
    return Edit.Session;
  }
  
  var loadModel = function(id){

    var defer = $.Deferred(),
        fetchingMicaRequest;

    dao.gestionUser.getUser(DocManager, function (user){
      //console.log('Dao Get Current user: [%s]', user.get('username'));
      getSession().currentUser = user;

      if(user && dao.gestionUser.hasPermissionTo('mica:user', 'mica', {} ) ){
        if(id){
            fetchingMicaRequest = DocManager.request("micarqst:entity", id);
        }else{
            fetchingMicaRequest = DocManager.request("micarqst:factory:new", user, "mica");
        }
       
        $.when(fetchingMicaRequest).done(function(micarqst){
          //console.log('MicaRequestApp.Edit BEGIN [%s] [%s]', micarqst.whoami, micarqst.id);
          if(micarqst.id){
            micarqst.initDataForEdit()

            getSession().model = micarqst;

            initDataForEdit(user, micarqst)
            defer.resolve(micarqst);
          }else{
            console.log('MICA está cerrado para nuevas inscripciones');
            Message.warning('Se han cerrado las inscripciones para MICA 2015');
            window.open('/mica/#bienvenido', '_self');
          }
           
        });
      }else{
        console.log('No validó el Usuario');
        Message.warning('Debe iniciar sesión y estar inscripto en MICA 2015');
        window.open('/mica/#bienvenido', '_self');
      }
 
    });
    return defer.promise();
  };

  var initDataForEdit = function(user, model){
    if(user){
      model.get('responsable').rmail = user.get('mail');
      model.stepTwo.set('rmail', user.get('mail'))
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
    DocManager.mainRegion.show(layout);
  };
  
  // ********** Carátula de la tramitación: Vista y edición
  var createWizardFormViews = function(){
    var session = getSession();
    var layout = Edit.Session.views.layout;
    var wizardlayout = new Edit.MicaWizardLayout({model:session.model});
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


    //         this.trigger('adminrequest:cost:changed', costo_total);
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
      
      getSession().model.update(session.currentUser, session.representantes, session.vporfolios, session.cporfolios, function(error, model){
        Message.success('Los datos han sido guardados en modo borrador.');

        enviarmail(utils.templates.MailFormGuardarProvisorio, {
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

      getSession().model.update(session.currentUser, session.representantes, session.vporfolios, session.cporfolios, function(error, model){

        Message.success('Grabación exitosa. Recibirás un correo electrónico de confirmación');
        enviarmail(utils.templates.MailFormSubmitNotification, {
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
          subject:'[MICA] Inscripción en Mica 2015',
      });

      mailModel.set('to',getSession().currentUser.get('username'));
      
      //todo:ver donde configurar el servidor de produccion
      mailModel.set( 'server', DocManager.getCurrentDomain());
      //mailModel.set( 'server','http://localhost:3000');

      mailModel.set(data)
      mailModel.setTemplate(template);      
      mailModel.buildMailContent();
      //console.log(sendMail.getData());

      //console.dir(mailModel.attributes);

      mailModel.sendmail();
  };
    


  var registerStepTwoEvents = function(session, layout){
    session.views.stepTwo = layout;
    var responsable = session.model['stepTwo'];
    //console.log('RESPONSABLES: [%s] [%s]', responsable.get('rmail'), session.model.representantes.length);


    var stepTwoForm = new Edit.StepTwoForm({model: responsable});


    var representanteCol = new Entities.RepresentanteCol(session.model.representantes);
    var representante = new Entities.Representante();

    session.representantes = representanteCol;


    layout.on("show", function(){
      layout.formRegion.show(stepTwoForm);
      DocManager.trigger('representante:edit',representante);
    });
  };


  var registerStepThreeEvents = function(session, layout){
    session.views.stepThree = layout;
    var stepThreeForm = new Edit.StepThreeForm({model: session.model['stepThree']});

    var porfolioCol = new Entities.PorfolioCol(session.model.vporfolios);
    var porfolio = new Entities.Porfolio();

    session.vporfolios = porfolioCol;


    layout.on("show", function(){
      layout.formRegion.show(stepThreeForm);
      DocManager.trigger('vporfolio:edit',porfolio);
    });
  };


  var registerStepFourEvents = function(session, layout){
    session.views.stepFour = layout;
    var stepFourForm = new Edit.StepFourForm({model: session.model['stepFour']});

    var porfolioCol = new Entities.PorfolioCol(session.model.cporfolios);
    var porfolio = new Entities.Porfolio();

    session.cporfolios = porfolioCol;


    layout.on("show", function(){
      layout.formRegion.show(stepFourForm);
      DocManager.trigger('cporfolio:edit',porfolio);
    });

  };

/*
  var registerPorfolioEvent = function(layout, form, modelCol, model ){
    console.log('registerSaveEvent Called: form:[%s] model:[%s]', form.cid, model.cid)
    layout.on('save:crud:editor', function(){
      form.commit();
      modelCol.add(model);
      console.log('[%s]Adding Model[%s] To Col: [%s]:[%s]',form.cid, model.cid,model.get('denominacion'), modelCol.length)
      DocManager.trigger('porfolio:edit',new Entities.Porfolio());
      // model.on('edit:me', function(){
      //   layout.formRegion.reset();
      //   editPorfolio(layout, modelCol, model);
      // });
      ///
      // var porfolio = new Entities.Porfolio();
      // layout.formRegion.reset();
      // editPorfolio(layout, modelCol, porfolio);
    });
    //

  };

  var editPorfolio = function(layout, modelCol, model){
    //console.log('editPorfolio modelCol:[%s]', modelCol.length)
    //model.set('itemssofar', modelCol.length);
    var crudForm = new Backbone.Form({
      model: model,
      template: utils.templates.PorfolioForm,
      collection: modelCol,
    });

    //registerPorfolioModel(layout, model);

    registerPorfolioEvent(layout, crudForm, modelCol, model);

    layout.formRegion.show(crudForm);
  };

*/
/*

  var createGridController = function(layout, col){
    var table = Edit.gridFactory(col,[
          {name:'denominacion', label:'Descripción del producto/proyecto/servicio', cell:'string', editable:false},
          {label: 'Acciones', cell: 'action', editable:false, sortable:false},  
      ]);
    var filter = Edit.filterFactory(col, ['denominacion']);
    console.log('createGridController')

    layout.filterRegion.show(filter);
    layout.tableRegion.show(table);
  };

*/
  var API = {

    initRepresentanteView: function(representante){
      var session = getSession();
      var crudManager = new Edit.CrudManager(
          {
            gridcols:[
              {name:'aname',  label:'Nombre', cell:'string', editable:false},
              {name:'acargo', label:'Cargo',  cell:'string', editable:false},
              {name:'amail',  label:'Mail',   cell:'string', editable:false},
              {label: 'Acciones', cell: 'representanteAction', editable:false, sortable:false},
            ],
            filtercols:['aname', 'acargo', 'amail'],
            editEventName: 'representante:edit',

          },
          {
            layoutTpl: utils.templates.RepresentanteLayout,
            formTpl: utils.templates.RepresentanteForm,
            collection: session.representantes,
            editModel: Entities.Representante,
            modelToEdit: representante,
            editorOpts: {},
          }
      );
      session.views.stepTwo.representanteRegion.show(crudManager.getLayout());


    },
 
    initPorfolioCompradorView: function(porfolio){
      var session = getSession();
      var crudManager = new Edit.CrudManager(
          {
            gridcols:[
              {name:'slug', label:'LISTADO DE PORTOLIOS', cell:'string', editable:false},
              {label: 'Acciones', cell: 'cporfolioAction', editable:false, sortable:false},
            ],
            filtercols:['slug'],
            editEventName: 'cporfolio:edit',

          },
          {
            test: 'TestOK',
            layoutTpl: utils.templates.PorfolioLayout,
            formTpl: utils.templates.PorfolioForm,
            collection: session.cporfolios,
            editModel: Entities.Porfolio,
            modelToEdit: porfolio,
            EditorView: Edit.PorfolioEditorView,
            editorOpts: {parentModel: session.model['stepFour']},
          }
      );
      session.views.stepFour.porfolioRegion.show(crudManager.getLayout());
    },

    initPorfolioVendedorView: function(porfolio){
      var session = getSession();
      var crudManager = new Edit.CrudManager(
          {
            gridcols:[
              {name:'slug', label:'LISTADO DE PORTOLIOS', cell:'string', editable:false},
              {label: 'Acciones', cell: 'vporfolioAction', editable:false, sortable:false},
            ],
            filtercols:['slug'],
            editEventName: 'vporfolio:edit',

          },
          {
            test: 'TestOK',
            layoutTpl: utils.templates.PorfolioLayout,
            formTpl: utils.templates.PorfolioForm,
            collection: session.vporfolios,
            editModel: Entities.Porfolio,
            modelToEdit: porfolio,
            EditorView: Edit.PorfolioEditorView,
            editorOpts: {parentModel: session.model['stepThree']},
          }
      );
      session.views.stepThree.vporfolioRegion.show(crudManager.getLayout());

    },

    saveStep: function(step){
      var session = getSession();

      session.model.update(session.currentUser, session.representantes, session.vporfolios, session.cporfolios, function(error, model){

      });
    },

  };

  DocManager.on("wizard:next:step", function(step){
    API.saveStep(step);
  });


  DocManager.on("vporfolio:edit", function(model){
    API.initPorfolioVendedorView(model);
  });


  DocManager.on("cporfolio:edit", function(model){
    API.initPorfolioCompradorView(model);
  });


  DocManager.on("representante:edit", function(model){
    API.initRepresentanteView(model);
  });



});
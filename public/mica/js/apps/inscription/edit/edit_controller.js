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

    console.log('MicaRequestApp.Edit.Controller.loadModel');
    dao.gestionUser.getUser(DocManager, function (user){
      console.log('Dao Get Current user: [%s]', user.get('username'));
      getSession().currentUser = user;

      if(id){
          fetchingMicaRequest = DocManager.request("micarqst:entity", id);
      }else{
          fetchingMicaRequest = DocManager.request("micarqst:factory:new", user, "mica");
      }
     
      $.when(fetchingMicaRequest).done(function(micarqst){
        console.log('MicaRequestApp.Edit BEGIN [%s] [%s]', micarqst.whoami, micarqst.id);

        micarqst.initDataForEdit()

        getSession().model = micarqst;

        initDataForEdit(user, micarqst)
        defer.resolve(micarqst);
         
      });
 
    });
    return defer.promise();
  };

  var initDataForEdit = function(user, model){
    if(user){
      console.log('usermail: [%s]', user.get('mail'))
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
    
    console.log('ready to Show Main Region')
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
    session.views.stepThree = stepThree;


    //         this.trigger('adminrequest:cost:changed', costo_total);
    registerBasicViewEvents(session, wizardlayout);

    layout.getRegion('formRegion').show(wizardlayout);
    wizardlayout.getRegion('steponeRegion').show(stepOne);
    wizardlayout.getRegion('steptwoRegion').show(stepTwo);
    wizardlayout.getRegion('stepthreeRegion').show(stepThree);
    wizardlayout.getRegion('stepfourRegion').show(stepFour);


  };

  var registerBasicViewEvents = function(session, wizardlayout){
    wizardlayout.on("submit:form", function(model){
      console.log('********SUBMIT PROVISORIO BEGINS********[%s]', model.whoami)

      getSession().model.update(session.currentUser, session.representantes, function(error, model){

        enviarmail(utils.templates.MailFormSubmitNotification, {
          toName: getSession().currentUser.get('displayName'),
          cnumber: model.get('cnumber'),
          fecomp: model.get('fecomp'),
          nodeId: model.id,
          slug: model.get('solicitante').emotivation,

        });

        DocManager.trigger('micarequest:edit', model)

      });


    });

    wizardlayout.on("submit:form:definitivo", function(model){
      console.log('********SUBMIT DEFINITIVO BEGINS********[%s]', model.whoami, model.get('solicitante').emotivation)

      enviarmail(utils.templates.MailFormSubmitNotification, {
        toName: getSession().currentUser.get('displayName'),
        cnumber: model.get('cnumber'),
        fecomp: model.get('fecomp'),
        nodeId: model.id,
        slug: model.get('solicitante').emotivation,

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
      mailModel.set( 'server','http://sisplan.cultura.gob.ar:3000');
      //mailModel.set( 'server','http://localhost:3000');

      mailModel.set(data)
      mailModel.setTemplate(template);      
      mailModel.buildMailContent();
      //console.log(sendMail.getData());

      console.dir(mailModel.attributes);

      mailModel.sendmail();
  };
    


  var registerStepTwoEvents = function(session, layout){
    session.views.stepTwo = layout;
    var responsable = session.model['stepTwo'];
    console.log('RESPONSABLES: [%s] [%s]', responsable.get('rmail'), session.model.representantes.length);


    var stepTwoForm = new Edit.StepTwoForm({model: responsable});


    var representanteCol = new Entities.RepresentanteCol(session.model.representantes);
    var representante = new Entities.Representante();

    session.representantes = representanteCol;


    layout.on("show", function(){
      console.log('**************Layout.on show')

      layout.formRegion.show(stepTwoForm);
      DocManager.trigger('representante:edit',representante);
    });
  };


  var registerStepThreeEvents = function(session, layout){
    session.views.stepThree = layout;
    var stepThreeForm = new Edit.StepThreeForm({model: session.model['stepThree']});
    console.dir(session.model['stepThree'].attributes);

    var porfolioCol = new Entities.PorfolioCol();
    var porfolio = new Entities.Porfolio();

    session.vporfolios = porfolioCol;


    layout.on("show", function(){
      console.log('**************Layout.on show')
      layout.formRegion.show(stepThreeForm);

      DocManager.trigger('vporfolio:edit',porfolio);
    });
  };


  var registerStepFourEvents = function(session, layout){
    session.views.stepFour = layout;
    var stepFourForm = new Edit.StepFourForm({model: session.model['stepFour']});

    var porfolioCol = new Entities.PorfolioCol();
    var porfolio = new Entities.Porfolio();

    session.porfolios = porfolioCol;


    layout.on("show", function(){
      console.log('**************Layout.on show')
      layout.formRegion.show(stepFourForm);

      DocManager.trigger('porfolio:edit',porfolio);
    });

  

   //  console.log('Porfolio:[%s]', utils.templates.PorfolioForm);


   //  //console.log('onRender:[%s]', this.model.whoami);
   //  //this.form.render();
   //  //this.$el.find('#formContainer').html(this.form.el);
   //  //this.formRegion.show(this.form.el);


   //  crudLayout.on('save:crud:editor', function(){
   //    console.log('save:crud:editor BUBBLED')
   //    crudForm.commit()


   //    var pf = new Entities.Porfolio(model.attributes)
   //    pf.on('edit:me', function(){
   //      var crudForm = new Backbone.Form({
   //        model: pf,
   //        template: utils.templates.PorfolioForm
   //      });
   //      crudLayout.form = crudForm;
   //      crudLayout.formRegion.show(crudForm);
   //      console.log('Edit:me items:[%s]', porfolioCol.length);

   //    });
   //    porfolioCol.add(pf);
 
   //  });

   //  table.on('edit:item:action', function(){
   //    console.log('EDIT:ITEM:ACTION ON LAYOUT')
   //  });


   // crudLayout.on('edit:item:action', function(){
   //    console.log('EDIT:ITEM:ACTION ON LAYOUT')
   //  });

  };


  var registerSaveEvent = function(layout, form, modelCol, model ){
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

    registerSaveEvent(layout, crudForm, modelCol, model);

    layout.formRegion.show(crudForm);
  };




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
          }
      );
      session.views.stepTwo.representanteRegion.show(crudManager.getLayout());


    },
 
    initCrudView: function(porfolio){
      var session = getSession();
      var crudManager = new Edit.CrudManager(
          {
            gridcols:[
              {name:'denominacion', label:'Descripción del producto/proyecto/servicio', cell:'string', editable:false},
              {label: 'Acciones', cell: 'porfolioAction', editable:false, sortable:false},
            ],
            filtercols:['denominacion'],
            editEventName: 'porfolio:edit',

          },
          {
            test: 'TestOK',
            layoutTpl: utils.templates.PorfolioLayout,
            formTpl: utils.templates.PorfolioForm,
            collection: session.porfolios,
            editModel: Entities.Porfolio,
            modelToEdit: porfolio,
          }
      );
      session.views.stepFour.porfolioRegion.show(crudManager.getLayout());
    },

    initPorfolioVendedorView: function(porfolio){
      var session = getSession();
      var crudManager = new Edit.CrudManager(
          {
            gridcols:[
              {name:'denominacion', label:'Descripción del producto/proyecto/servicio', cell:'string', editable:false},
              {label: 'Acciones', cell: 'vporfolioAction', editable:false, sortable:false},
            ],
            filtercols:['denominacion'],
            editEventName: 'vporfolio:edit',

          },
          {
            test: 'TestOK',
            layoutTpl: utils.templates.PorfolioLayout,
            formTpl: utils.templates.PorfolioForm,
            collection: session.vporfolios,
            editModel: Entities.Porfolio,
            modelToEdit: porfolio,
          }
      );
      session.views.stepThree.vporfolioRegion.show(crudManager.getLayout());

    },

  };


  DocManager.on("vporfolio:edit", function(model){
    console.log('PORFOLIOS VENDEDOR')
    API.initPorfolioVendedorView(model);
  });


  DocManager.on("porfolio:edit", function(model){
    console.log('PORFOLIOS')
    API.initCrudView(model);
  });


  DocManager.on("representante:edit", function(model){
    console.log('REPRESENTANTES')
    API.initRepresentanteView(model);
  });





});
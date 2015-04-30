DocManager.module("FondoRequestApp.Edit", function(Edit, DocManager, Backbone, Marionette, $, _){
  
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

    console.log('FondoRequestApp.Edit.Controller.loadModel');
    
    var defer = $.Deferred(),
        fetchingFondoRequest;

    if(id){
        fetchingFondoRequest = DocManager.request("fondorqst:entity", id);
    }else{
        fetchingFondoRequest = DocManager.request("fondorqst:factory:new");
    }
   
    $.when(fetchingFondoRequest).done(function(fondorqst){
      console.log('FondoRequestApp.Edit BEGIN [%s]', fondorqst.whoami);
      getSession().model = fondorqst;

      dao.gestionUser.getUser(DocManager, function (user){
          console.log('Dao Get Current user: [%s]', user.get('username'));

          getSession().currentUser = user;
          defer.resolve(fondorqst);
       
      });
          
    });
    return defer.promise();
  }

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
    var wizardlayout = new Edit.MovilidadWizardLayout({model:session.model});
    var stepOne = new Edit.StepOneForm({model: session.model['stepOne']});
    var stepTwo = new Edit.StepTwoForm({model: session.model['stepTwo']});
    var stepThree = new Edit.StepThreeForm({model: session.model['stepThree']});
    var stepFour = new Edit.StepFourForm({model: session.model['stepFour']});
    var stepFive = new Edit.StepFiveForm({model: session.model['stepFive']});

    session.views.wizardlayout = wizardlayout;
    session.views.stepOne   = stepOne;
    session.views.stepTwo   = stepTwo;
    session.views.stepThree = stepThree;
    session.views.stepFour = stepFour;
    session.views.stepFive = stepFive;

    //         this.trigger('adminrequest:cost:changed', costo_total);
    registerBasicViewEvents(session, wizardlayout);

    layout.getRegion('formRegion').show(wizardlayout);
    wizardlayout.getRegion('steponeRegion').show(stepOne);
    wizardlayout.getRegion('steptwoRegion').show(stepTwo);
    wizardlayout.getRegion('stepthreeRegion').show(stepThree);
    wizardlayout.getRegion('stepfourRegion').show(stepFour);
    wizardlayout.getRegion('stepfiveRegion').show(stepFive);

  };

  var registerBasicViewEvents = function(session, wizardlayout){
  };


});
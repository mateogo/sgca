DocManager.module("LoginApp.Edit", function(Edit, DocManager, Backbone, Marionette, $, _){
  
  Edit.Controller = {};
  
  Edit.Controller.login = function(path, targetUser){
  	console.log('EditController BEGIN [%s] : [%s]', path, targetUser);
	  dao.gestionUser.getUser(DocManager, function (user){
	  	console.log('user: [%s] [%s]', user.whoami, user.id)

	    if(false){ //user.id
	    	console.log('LOGIN: usuario detectado, redireccionando a [%s]',path)
	
	    }else{
    		console.log('LOGIN FORM BEGINS')
	      var layout = createLayout();
	      loginForm(layout, path, targetUser)
	    }
	  });

  };
  createLayout = function(){
		var layout = new Edit.Layout();
	  Edit.Session = {};
		Edit.Session.views = {};
		Edit.Session.views.layout = layout;
    DocManager.mainRegion.show(layout);
		return layout;
  };

  loginForm = function(layout, path, targetUser){
  	console.log('LOGIN FORM INIT')

  	var userFacet = new DocManager.Entities.UserFacet();

		userFacet.set('target', path || '');
    userFacet.set('targetUser',targetUser || '');
 
    var loginForm = new Edit.LoginForm({model: userFacet});

    layout.getRegion('loginRegion').show(loginForm);

    loginForm.on('register:user:form', function(){
    	console.log('REGISTER USER BUBBLED on LoginForm');
    	signUpForm(layout, path, targetUser);
    })

    loginForm.on('login:user', function(){
    	console.log('REGISTER USER BUBBLED on LoginForm');
    })

  };

  var signUpForm = function(layout, path, targetUser){
  	var userFacet = new DocManager.Entities.UserFacet();

    userFacet.set('target', path || '');
    userFacet.set('targetUser',targetUser || '');
 
  	var registerForm = new Edit.SignUpForm({model: userFacet});
    layout.getRegion('loginRegion').show(registerForm);

    registerForm.on('login:user:form', function(){
    	console.log('LOGIN USER BUBBLED on LoginForm');
    	loginForm(layout, path, targetUser);
    });

    registerForm.on('create:new:user', function(model){
      console.log('CREATE NEW USER BUBBLED on LoginForm [%s]', model.whoami);
      model.addNewUser(function(user){
        console.log('and... we are back!....[%s] [%s]', user.id, user.get('displayName'));
        loginForm(layout, path, targetUser);
      })
    });
  };
  
});

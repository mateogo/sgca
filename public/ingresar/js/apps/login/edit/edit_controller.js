DocManager.module("LoginApp.Edit", function(Edit, DocManager, Backbone, Marionette, $, _){
  
  Edit.Controller = {};
  
  Edit.Controller.login = function(path, targetUser){
	  dao.gestionUser.getUser(DocManager, function (user){

	    if(false){ //user.id
	    	console.log('LOGIN: usuario detectado, redireccionando a [%s]',path)
	
	    }else{
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

  loginForm = function(layout, path, targetUser, username){

  	var userFacet = new DocManager.Entities.UserFacet();
    if(username){
      userFacet.set('username', username);
    }

		userFacet.set('target', path || '');
    userFacet.set('targetUser',targetUser || '');
 
    var loginForm = new Edit.LoginForm({model: userFacet});

    layout.getRegion('loginRegion').show(loginForm);

    loginForm.on('register:user:form', function(){
    	signUpForm(layout, path, targetUser);
    })

    loginForm.on('login:user', function(){
    })

  };

  var signUpForm = function(layout, path, targetUser){
  	var userFacet = new DocManager.Entities.UserFacet();

    userFacet.setTarget(path, targetUser);
 
  	var registerForm = new Edit.SignUpForm({model: userFacet});
    layout.getRegion('loginRegion').show(registerForm);

    registerForm.on('login:user:form', function(){
    	loginForm(layout, path, targetUser);
    });

    registerForm.on('create:new:user', function(model){

      model.addNewUser(function(user){
        
        enviarmail(targetUser, user);
        
        DocManager.confirm('El ALTA ha sido exitosa',{okText: 'Ingresar', cancelText: 'cancelar'}).done(function(){

          loginForm(layout, path, targetUser, user.get('username'));

        });        
      });

    });
  };
  var isEmployee = function(targetUser){
    if(targetUser){
      if(targetUser === 'sisplan') return true;
    }

    return false;
  };
  
  var enviarmail = function(targetUser, user){
      var data;
      var mailModel = new DocManager.Entities.SendMail({
          from: 'intranet.mcn@gmail.com',
          subject:'[MCN] Alta de usuario',
      });

      mailModel.set('to',user.get('username'));
      
      //todo:ver donde configurar el servidor de produccion
      mailModel.set( 'server','http://sisplan.cultura.gob.ar:3000');
      //mailModel.set( 'server','http://localhost:3000');
      if(targetUser){
        if(targetUser === 'mica'){

          data = {
            username: user.get('username'),
            toName: user.get('displayName'),
            cnumber: '',
            fecomp: '',
            nodeId: '',
            slug: 'Alta de Usuario para MICA',

          };

          mailModel.set(data)
          mailModel.setTemplate(utils.templates.MailAltaUsuarioMica);        

          mailModel.buildMailContent();
          //console.log(sendMail.getData());

          mailModel.sendmail();

        }else if(targetUser === 'sisplan'){

        }
      }else{

      }

  };
    




});

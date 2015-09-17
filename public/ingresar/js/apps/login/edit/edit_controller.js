DocManager.module("LoginApp.Edit", function(Edit, DocManager, Backbone, Marionette, $, _){

  Edit.Controller = {};

  Edit.Controller.login = function(path, targetUser){
	  dao.gestionUser.getUser(DocManager, function (user){

	    if(false){ //user.id

	    }else{
	      var layout = createLayout();
	      loginForm(layout, path, targetUser);
	    }
	  });
  };

  Edit.Controller.recovery = function(idUser){
    var layout = createLayout();

    var p = DocManager.request('user:entity',idUser);
    p.done(function(user){
      var view = new Edit.RecoveryView({model:user});
      layout.getRegion('loginRegion').show(view);
      view.once('password:changed',function(){
        DocManager.trigger('login:user');
      });
    });
  };

  Edit.Controller.browseuser = function(username){
    var layout = createLayout(),
        user;

    var p = DocManager.request('user:by:username',username);
    p.done(function(userCol){
      if(userCol.length){
        user = userCol.at(0);
        console.log('User Fetched: [%s]', user.get('username'));

        var view = new Edit.UserView({model:user});
        layout.getRegion('loginRegion').show(view);
        view.once('password:changed',function(){
          //DocManager.trigger('login:user');
        });

      }else{
        console.log('no se encontró al USER: [%s]', username);
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
    });

    loginForm.on('login:user', function(){
    });

    loginForm.on('login:recoverpass',function(){
        recoveryPass(userFacet.get('username'));
    });

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

  var recoveryPass = function(username){
    var userFacet = new DocManager.Entities.UserFacet();
    userFacet.set('username',username);
    var view = Edit.recoveryPassPopup(userFacet);
    view.on('user:recovery',function(user){
      enviarEmailRecovery(user);
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
      mailModel.set( 'server', DocManager.getCurrentDomain());
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

          mailModel.set(data);
          mailModel.setTemplate(utils.templates.MailAltaUsuarioMica);

          mailModel.buildMailContent();
          //console.log(sendMail.getData());

          mailModel.sendmail();

        }else if(targetUser === 'fondo'){

          data = {
              username: user.get('username'),
              toName: user.get('displayName'),
              cnumber: '',
              fecomp: '',
              nodeId: '',
              slug: 'Alta de Usuario para el Fondo Argentino de Desarrollo Cultural',
            };

            mailModel.set(data);
            mailModel.setTemplate(utils.templates.MailAltaUsuarioFondo);

            mailModel.buildMailContent();

            mailModel.sendmail();

        }else if(targetUser === 'salonnacional'){

          data = {
              username: user.get('username'),
              toName: user.get('displayName'),
              cnumber: '',
              fecomp: '',
              nodeId: '',
              slug: 'Alta de Usuario para el Salón Nacional de las Artes Visuales',
            };

            mailModel.set(data);
            mailModel.setTemplate(utils.templates.MailAltaUsuarioFondo);

            mailModel.buildMailContent();

            mailModel.sendmail();

        }else if(targetUser === 'sisplan'){


        }else if(targetUser === 'obras'){

          data = {
              username: user.get('username'),
              toName: user.get('displayName'),
              cnumber: '',
              fecomp: '',
              nodeId: '',
              slug: 'Alta de Usuario para Obras',

            };

            mailModel.set(data);
            mailModel.setTemplate(utils.templates.MailAltaUsuarioObras);

            mailModel.buildMailContent();

            mailModel.sendmail();
        }
      }else{

      }

  };


  var enviarEmailRecovery = function(user){
    var data;
    var mailModel = new DocManager.Entities.SendMail({
        from: 'intranet.mcn@gmail.com',
        subject:'[MCN] Recuperación de contraseña',
    });

    mailModel.set('to',user.get('username'));

    //todo:ver donde configurar el servidor de produccion
    mailModel.set( 'server', DocManager.getCurrentDomain());
    mailModel.set('id',user.id);

    data = {
      username: user.get('username'),
      toName: user.get('displayName'),
      cnumber: '',
      fecomp: '',
      nodeId: '',
      slug: 'Recuperación de contraseña de Usuario para MICA',

    };

    mailModel.set(data);
    mailModel.setTemplate(utils.templates.MailRecoveryPass);

    mailModel.buildMailContent();
    //console.log(sendMail.getData());

    DocManager.message('Enviando correo electronico...','alert-warning');
    var p = mailModel.sendmail();
    p.done(function(){
      DocManager.message('Correo enviado, revise su casilla de entrada','alert-success');
    }).fail(function(){
      DocManager.message('No se pudo enviar el correo electronico','alert-danger');
    });
  };

});

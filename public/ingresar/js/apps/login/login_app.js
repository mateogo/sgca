DocManager.module('LoginApp',function(LoginApp,DocManager,Backbonone,Marionette,$, _){

	LoginApp.Router = Marionette.AppRouter.extend({
		appRoutes: {
			'mica': 'loginMica',
			'inscripcion/nueva': 'loginMica',

			'showcase': 'loginShowcase',
			'showcase/nueva': 'loginShowcase',

			'sisplan': 'loginSisplan',

			'obras':'loginObras',

			'usuario(/*path)': 'loginUser',

		}
	});
	
	LoginApp.Model = {selectedAction: null}; 

	var API = {
		loginUser: function(path, targetUser){
			console.log('API: loginUser');
			LoginApp.Edit.Controller.login(path, targetUser);
		},
	
		loginMica: function(){
			console.log('API: Login MICA');
			this.loginUser('mica/#inscripcion/nueva', 'mica')
		},

		loginShowcase: function(){
			console.log('API: Login SHOWCASE');
			this.loginUser('mica/#showcase/nueva', 'mica')
		},

		loginSisplan: function(){
			console.log('API: Login SISPLAN');
			this.loginUser('sisplan', 'sisplan')
		},
		
		loginObras: function(){
		  this.loginUser('obras', 'obras');
		}

	};

	DocManager.on('login:user',function(path){
		console.log('Login user: [%s]',path);
		if(path){
			DocManager.navigate('usuario/'+path);
		}else{
			DocManager.navigate('usuario');		
		}
		API.loginUser(path);
  });
	
	DocManager.on('login:mica:inscripcion',function(){
		console.log('Login MICA:');
		DocManager.navigate('inscripcion/nueva');
		API.loginMica(path);
  });
	
	DocManager.addInitializer(function(){
		new LoginApp.Router({
			controller: API
		});
	});
});
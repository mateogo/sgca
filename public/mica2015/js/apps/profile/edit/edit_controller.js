DocManager.module("ProfileApp.Edit", function(Edit, DocManager, Backbone, Marionette, $, _){

  Edit.Controller = {
    profileManager: function(){
      console.log('ProfileApp.Edit.Controller.profileManager');

      dao.gestionUser.getUser(DocManager, function (user){
 
        if(user){

          mainProcessStart(user);

        }else{
          console.log('Tiene que estar loggeado....')
          DocManager.trigger('home:show');
        }
      });
            
    }
  };

  var mainProcessStart = function(user){
    Edit.Session = {};
    Edit.Session.views = {};

    Edit.Session.user = user;
    Edit.Session.layout = new Edit.Layout();
    
    DocManager.mainRegion.show(Edit.Session.layout);

    renderUserView(user, Edit.Session.layout);
    renderPasswordView(user, Edit.Session.layout);

    DocManager.request('user:load:persons', user, 'es_usuario_de', function(person){
      if(person){
        Edit.Session.person = person;

        renderPersonView(person, Edit.Session.layout, 'person');

      }else{
        Edit.Session.person = null;
      }

    });

    DocManager.request('user:load:persons', user, 'es_representante_de', function(person){
      if(person){
        Edit.Session.empresa = person;

        renderPersonView(person, Edit.Session.layout, 'related');

      }else{
        Edit.Session.empresa = null;
      }
    });



  };

  // ===== USER PROFILE ========================
  var renderUserView = function(user, layout){

    var userForm = new Edit.Profile({
      model: user,
      formtemplate: 'user'
    });

    registerUserProfileEvents(userForm);

    layout.userRegion.show(userForm);
  };

  var registerUserProfileEvents = function(view){
    Edit.Session.views.userFormView = view;

    view.on("form:submit", function(model){
        saveUser(model, function(result){
          if(result){
            console.log('success');
            view.showAlert('Exito', 'Datos actualizados', 'alert-success');
          }
        });
    });
  };
  var saveUser = function(user, cb){
    var data = {
      displayName: user.get('displayName'),
      username: user.get('username'),
      mail: user.get('username'),
    };
console.log('Password:[%s]: [%s]', user.get('password'), user.get('password').length)
    if(user.get('password').length < 15){
      data.password = user.get('password');
    }
    
    user.updateProfile(data, function(user){
      if(cb) cb(true);
    })
  };



  // ===== PERSON PROFILE ========================
  var renderPersonView = function(person, layout, tipo){

    loadContactInfo(person);

    var personForm = new Edit.Profile({
      model: person,
      formtemplate: tipo
    });
    registerPersonProfileEvents(personForm);

    if(tipo === 'person'){
      Edit.Session.layout.personRegion.show(personForm);
    }else{
      Edit.Session.layout.relatedRegion.show(personForm);
    }

  };

  var loadContactInfo = function(person){
    var list = person.get('contactinfo');
    person.set({
      fdireccion:'',
      fcelular:'',
      ftelefono: '',
      fmail: '',
      fweb: '',
    });
    console.log('CONTACTINFO [%s]', list.length);

    _.each(list, function(item){
      if(item.tipocontacto === 'direccion'){
        person.set('fdireccion', item.contactdata)

      }else if(item.tipocontacto === 'mail'){
        person.set('fmail', item.contactdata)

      }else if(item.tipocontacto === 'web'){
        person.set('fweb', item.contactdata)

      }else if(item.tipocontacto === 'telefono'){
        if(item.subcontenido === 'celular'){
          person.set('fcelular', item.contactdata)
        }else if (item.subcontenido === 'trabajo'){
          person.set('ftelefono', item.contactdata)          
        }
      }
    })

  };

  var registerPersonProfileEvents = function(view){
    Edit.Session.views.personFormView = view;

    // =========== grabación =============
    view.on("form:submit", function(model){
        savePerson(model, function(result){
          if(result){
            console.log('success');
            view.showAlert('Exito', 'Datos actualizados', 'alert-success');

          }else{

          }
        });
    });
  };

  var savePerson = function(person, cb){
    var data = buildPersonData(person);
    
    person.updateProfile(data, function(person){
      if(cb) cb(true);
    })
  };

  var buildPersonData = function(person){
    var data = {
      displayName: person.get('displayName'),
      nickName: person.get('nickName'),
      name: person.get('name')
    }
    var list = person.get('contactinfo');
    updateContactInfo(list, 'direccion',  'principal',  person.get('fdireccion'));
    updateContactInfo(list, 'mail',       'principal',  person.get('fmail'));
    updateContactInfo(list, 'telefono',   'celular',    person.get('fcelular'));
    updateContactInfo(list, 'telefono',   'trabajo',    person.get('ftelefono'));
    updateContactInfo(list, 'web',        'principal',  person.get('fweb'));
    data.contactinfo = list;
    return data;
  };

  var updateContactInfo = function(list, tipo, subtipo, dato){
    var node = _.find(list, function(item){
      return (item.tipocontacto === tipo && item.subcontenido === subtipo)
    })
    if(node){
      node.contactdata = dato
    }else{
      node = {
        tipocontacto: tipo,
        subcontenido: subtipo,
        contactdata: dato
      }
      list.push(node);
    }
  }

  // ===== Password PROFILE ========================
  var renderPasswordView = function(user, layout){

    var userForm = new Edit.Profile({
      model: user,
      formtemplate: 'password'
    });

    registerUserPasswordEvents(userForm);

    layout.passwordRegion.show(userForm);
  };

  var registerUserPasswordEvents = function(view){
    Edit.Session.views.passwordFormView = view;

    view.on("form:submit", function(model){
      console.log('TodDo!!!')

    });
  };


});



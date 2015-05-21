 /*!
  * SGCA - 2014
 */

if (process.env.NODE_ENV) {
  // XXX: tomar development por defecto para que las instalaciones actuales siguan funcionando.
  process.env.NODE_ENV = 'development';
}
var config = require('config');

var rootPath = __dirname;
var publicPath = config.get('app.publicPath');

var express = require('express');
var path = require('path');
var http = require('http');
var fs = require('fs');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

// XXX FIXME: esto tiene que estar en un app aparte.
require(rootPath + '/calendar/config/init');
var user = require(rootPath + '/calendar/controllers/user');
var BaseModel = require(rootPath + '/calendar/models/basemodel');
var requireModel = require(rootPath + '/calendar/models/requireModel');

// var options = {
//   key: fs.readFileSync('key.pem'),
//   cert: fs.readFileSync('key-cert.pem')
// }

console.log('server: BEGIN at: ['+ __dirname +"]");
console.log('NODE_APP_ENV: ['+process.env.NODE_APP_ENV +"]");
console.log('NODE_PORT: ['+process.env.NODE_PORT +"]");
console.log('NODE_LOG: ['+process.env.NODE_LOG +"]");


var app = express();
var mongodb = require(path.join(rootPath + '/core/dbconnect'));
var BSON = mongodb.BSON;

app.set('port', config.get('app.port'));

passport.use(new LocalStrategy({usernameField: 'username',passwordField: 'password'},
  // verify callback
  function(username, password, done) {
    //console.log('passport verify: username[%s] pass[%s] ',username,password);
    // VERIFY CALLBACK
    //  return done(null, user); // ok
    //  return done(null, false, { message: 'Incorrect username.' }); // ToDo: implementar FLASH
    //  return done(err); // server error
    //  return (new Error('User ' + id + ' does not exist'));
    //  process.nextTick(function () {

    user.findOne({ username: username }, function (err, userdao) {
      if (err) {
        //console.log('passport error');
        return done(err);
      }
      if (!userdao) {
        //console.log('passport USER NOT FOUND');
        //return done(null, false, { message: 'Incorrect username.' });
        return done(null, false);
      }

      user.comparePassword(userdao.password, password, function(err, isMatch) {
        if (isMatch) {
          var pp = app;
          var xx = express;
          console.log('match!!!');
          return done(null, userdao);
        } else {

          console.log('noooooooooo match!');
            return done(null, false, { message: 'Incorrect password.' });
          }
      });
    });

  }
));

passport.serializeUser(function(user, done) {
  //console.log('serialize:[%s]',user.name);
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  //console.log('deserialize:[%s]',id);
  user.fetchById(id, function(err, user) {
    done(err, user);
  });
});

app.use(express.logger('dev'));  /* 'default', 'short', 'tiny', 'dev' */
app.use(express.cookieParser());
// deprecated: app.use(express.bodyParser());
// see: https://github.com/senchalabs/connect/wiki/Connect-3.0
//https://groups.google.com/forum/#!msg/express-js/iP2VyhkypHo/5AXQiYN3RPcJ
app.use(express.json());
app.use(express.urlencoded());
app.use(express.session({ secret: 'keyboard cat' }));
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
app.use(express.static(publicPath));

var apps = config.get('apps');
mongodb.connect(function(err, db){
  if (err) {
    console.log('Error al conectar con Mongo: ', err);
    process.exit(127);
  }

  BaseModel.setDb(db).setBSON(BSON);

  for(var ix = 0; ix<apps.length; ix++){
      var routes_path = path.join(rootPath,  apps[ix] + '/config/routes.js');
      var init_path = path.join(rootPath,  apps[ix] + '/config/init.js');
      var controllers_path = path.join(rootPath, apps[ix] + '/controllers/');

      require(init_path);
      require(routes_path)(config, app);

      fs.readdirSync(controllers_path).forEach(function (file) {
        if (!file.match(/\.js$/)) { return; }

        var controller = require(path.join(controllers_path, file));

        controller.setDb(db);
        controller.setBSON(BSON);
        controller.setConfig({publicpath:publicPath});
        if (controller.configRoutes) {
          controller.configRoutes(app);
        }
      });
  }
});

//se agrego https conexion ssl
//var server = http.createServer(options, app);
var server = http.createServer(app);
server.listen(app.get('port'), function () {
    console.log("Express server listening on port " + app.get('port'));
});

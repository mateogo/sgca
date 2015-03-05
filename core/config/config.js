/*
 *  core config.js
 *  package: /core/config
 *  Use:
 *     Exporta un objeto con las configuraciones basicas para devel, test, production
 */
var path = require('path');
var rootPath = path.normalize(__dirname + '/../..');
var publicPath = path.join(rootPath, 'public');
var fs = require('fs');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;



//Installed Dbases
var dbaseDevel = 'mongodb://localhost/sgcadb_dev'; //port = 27017  ojo: {auto_reconnect: true}
var dbaseTest = 'mongodb://localhost/sgcadb_test'; //port = 27017  ojo: {auto_reconnect: true}
var dbaseProd = 'mongodb://localhost/sgcadb';      //port = 27017  ojo: {auto_reconnect: true}

//Installed applications
var mailerTplPth = path.normalize(__dirname + '/mailer/templates'); //ojo
var calendarApp    = rootPath + '/calendar';
var bacuaApp    = rootPath + '/bacua';
var coreApp  = rootPath + '/core';
var apps = [calendarApp];


//Mailer options
var notifier = {
  APN: false,
  email: false, // true
  actions: ['comment'],
  tplPath: mailerTplPth,
  postmarkKey: 'POSTMARK_KEY',
  parseAppId: 'PARSE_APP_ID',
  parseApiKey: 'PARSE_MASTER_KEY'
};

var instanceDbListeners = function (db,BSON) {
  //loads modules that needs a reference to the db connection
  for(var ix = 0; ix<apps.length; ix++){
      var controllers_path = path.normalize( apps[ix] + '/controllers/');
      fs.readdirSync(controllers_path).forEach(function (file) {
        require(controllers_path+file).setDb(db).setBSON(BSON).setConfig({publicpath:publicPath});
      });
      
      var models_path = path.normalize( apps[ix] + '/models/');
      fs.readdirSync(models_path).forEach(function (file) {
        require(models_path+file).setDb(db);
      });
  }
};

var routesBootstrap = function (app, express) {

 



  app.set('port', 3000);
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

  
  require(rootPath + '/calendar/controllers/artactivities.js').configRoutes(app);
};


module.exports = {
  development: {
    dburi: dbaseDevel,
    coreApp: coreApp,
    apps: apps,
    root: rootPath,
    publicpath: publicPath,
    notifier: notifier,
    connectionListeners: instanceDbListeners,
    routesBootstrap: routesBootstrap,
    app: {
      name: 'SGAC - Desarrollo'
    },
    facebook: {
      clientID: "APP_ID",
      clientSecret: "APP_SECRET",
      callbackURL: "http://localhost:3000/auth/facebook/callback"
    },
    twitter: {
      clientID: "CONSUMER_KEY",
      clientSecret: "CONSUMER_SECRET",
      callbackURL: "http://localhost:3000/auth/twitter/callback"
    },
    github: {
      clientID: 'APP_ID',
      clientSecret: 'APP_SECRET',
      callbackURL: 'http://localhost:3000/auth/github/callback'
    },
    google: {
      clientID: "APP_ID",
      clientSecret: "APP_SECRET",
      callbackURL: "http://localhost:3000/auth/google/callback"
    }
  },
  test: {
    dburi: dbaseTest,
    coreApp: coreApp,
    apps: apps,
    root: rootPath,
    publicpath: publicPath,
    notifier: notifier,
    connectionListeners: instanceDbListeners,
    routesBootstrap: routesBootstrap,
    app: {
      name: 'SGIC - Test'
    },
    facebook: {
      clientID: "APP_ID",
      clientSecret: "APP_SECRET",
      callbackURL: "http://localhost:3000/auth/facebook/callback"
    },
    twitter: {
      clientID: "CONSUMER_KEY",
      clientSecret: "CONSUMER_SECRET",
      callbackURL: "http://localhost:3000/auth/twitter/callback"
    },
    github: {
      clientID: 'APP_ID',
      clientSecret: 'APP_SECRET',
      callbackURL: 'http://localhost:3000/auth/github/callback'
    },
    google: {
      clientID: "APP_ID",
      clientSecret: "APP_SECRET",
      callbackURL: "http://localhost:3000/auth/google/callback"
    }
  },
  production: {}
}

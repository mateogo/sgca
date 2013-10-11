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

//Installed Dbases
var dbaseDevel = 'mongodb://localhost/sgcadb_dev'; //port = 27017  ojo: {auto_reconnect: true}
var dbaseTest = 'mongodb://localhost/sgcadb_test'; //port = 27017  ojo: {auto_reconnect: true}
var dbaseProd = 'mongodb://localhost/sgcadb';      //port = 27017  ojo: {auto_reconnect: true}

//Installed applications
var mailerTplPth = path.normalize(__dirname + '/mailer/templates'); //ojo
var calendarApp    = rootPath + '/calendar';
var bacuaApp    = rootPath + '/bacua';
var coreApp  = rootPath + '/core';
var apps = [calendarApp, bacuaApp];


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
  }
};

var routesBootstrap = function (app, express) {
  app.configure(function () {
    app.set('port', process.env.NODE_PORT || 3000);
    app.use(express.logger('dev'));  /* 'default', 'short', 'tiny', 'dev' */
    app.use(express.bodyParser());
    app.use(app.router);
    app.use(express.static(publicPath));
  });

  for(var ix = 0; ix<apps.length; ix++){
      var routes_path = path.normalize( apps[ix] + '/config/routes.js');
      require(routes_path)(this, app);
  }
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

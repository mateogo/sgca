var path = require('path');
var rootPath = path.normalize(__dirname + '/..');
var publicPath = path.join(rootPath, 'public');   // relativo a server.js

module.exports = {
    db: {
      uri: 'mongodb://localhost/sgcadb_default',    //port = 27017  ojo: {auto_reconnect: true}
    },
    app: {
      name: 'SGAC - DEFAULT',
      rootPath: rootPath,
      publicPath: publicPath,                       // relativo a server.js
      port: 3000,
    },
    root: rootPath,                                 // XXX FIXME: hacer que los routes de las aplicaciones tomen el de app y no este.
    publicPath: publicPath,                         // XXX FIXME: hacer que los routes de las aplicaciones tomen el de app y no este.
    apps: ['common_api', 'calendar', 'sisplan'],
    notifier: {
      APN: false,
      email: false, // true
      actions: ['comment'],
      tplPath: 'mailer/templates',
      postmarkKey: 'POSTMARK_KEY',
      parseAppId: 'PARSE_APP_ID',
      parseApiKey: 'PARSE_MASTER_KEY'
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
}

module.exports = function (config, app) {
    var rootPath = config.root;
    var utils = require(rootPath + '/core/util/utils');
    var http = require("http");
    var passport = require('passport');

    var ensureAuthenticated = function (req, res, next) {
        console.log('autenticando!!!!');
        if (req.isAuthenticated()) {
            console.log('Autenticación OK');
            return next();
        }
        console.log('FALLÓ AUTENTICACIÓN!!!!');
        res.redirect('/');
    };

    // sisplan - Locaciones
    var locaciones = require(rootPath + '/sisplan/controllers/locaciones');
    app.get   ('/sisplan/locaciones/locaciones',     locaciones.findAll);
    app.get   ('/sisplan/locaciones/locaciones/:id', locaciones.findById);
    app.post  ('/sisplan/locaciones/locaciones',     ensureAuthenticated, locaciones.add);
    app.put   ('/sisplan/locaciones/locaciones/:id', ensureAuthenticated, locaciones.update);
    app.delete('/sisplan/locaciones/locaciones/:id', ensureAuthenticated, locaciones.delete);
};
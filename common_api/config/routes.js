/*
 *  common api routes.js
 *  package: /common_api/config
 *  DOC: Configura los routes para api comun a todos los proyectos
 *
 *
 *  Use:
 *     Exporta la funcion que asigna las rutas al objeto app de Express
 */
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

    // sisplan - Recursos Linea/Familia/Modelo
    var kvstore = require(rootPath + '/common_api/controllers/keyvaluestore');
    app.get   ('/api/kvstore',     kvstore.findAll);
    app.get   ('/api/kvstore/:id', kvstore.findById);
    app.post  ('/api/kvstore',     ensureAuthenticated, kvstore.add);
    app.put   ('/api/kvstore/:id', ensureAuthenticated, kvstore.update);
    app.delete('/api/kvstore/:id', ensureAuthenticated, kvstore.delete);

    app.get   ('/api/kvstore-by-tag',      kvstore.findAll);
    app.get   ('/api/kvstore-by-tag/:id',  kvstore.findByTag);
    app.post  ('/api/kvstore-by-tag',      ensureAuthenticated, kvstore.update_by_tag);
    app.put   ('/api/kvstore-by-tag/:tag', ensureAuthenticated, kvstore.update_by_tag);
    app.delete('/api/kvstore-by-tag/:tag', ensureAuthenticated, kvstore.delete_by_tag);

};

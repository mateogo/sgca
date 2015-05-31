/*
 *  sisplan routes.js
 *  package: /sisplan/config
 *  DOC: Configura los routes para Sisplan.
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
            return next();
        console.log('autenticando!!!!');
        if (req.isAuthenticated()) {
            console.log('Autenticación OK');
            return next();
        }
        console.log('FALLÓ AUTENTICACIÓN!!!!');
        res.redirect('/');
    };

    // sisplan - Recursos Linea/Familia/Modelo
    var familias = require(rootPath + '/sisplan/controllers/familias');
    app.get   ('/sisplan/recursos/familias',     familias.findAll);
    app.get   ('/sisplan/recursos/familias/:id', familias.findById);
    app.post  ('/sisplan/recursos/familias',     ensureAuthenticated, familias.add);
    app.put   ('/sisplan/recursos/familias/:id', ensureAuthenticated, familias.update);
    app.delete('/sisplan/recursos/familias/:id', ensureAuthenticated, familias.delete);

    // sisplan - Recursos Tipos
    var tipos = require(rootPath + '/sisplan/controllers/tipos');
    app.get   ('/sisplan/recursos/tipos',     tipos.findAll);
    app.get   ('/sisplan/recursos/tipos/:id', tipos.findById);
    app.post  ('/sisplan/recursos/tipos',     ensureAuthenticated, tipos.add);
    app.put   ('/sisplan/recursos/tipos/:id', ensureAuthenticated, tipos.update);
    app.delete('/sisplan/recursos/tipos/:id', ensureAuthenticated, tipos.delete);

    // sisplan - Recursos
    var recursos = require(rootPath + '/sisplan/controllers/recursos');
    app.get   ('/sisplan/recursos/recursos',     recursos.findAll);
    app.get   ('/sisplan/recursos/recursos/:id', recursos.findById);
    app.post  ('/sisplan/recursos/recursos',     ensureAuthenticated, recursos.add);
    app.put   ('/sisplan/recursos/recursos/:id', ensureAuthenticated, recursos.update);
    app.delete('/sisplan/recursos/recursos/:id', ensureAuthenticated, recursos.delete);
};

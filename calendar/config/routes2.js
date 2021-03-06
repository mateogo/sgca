/*
 *  bacua routes.js
 *  package: /bacua/config
 *  DOC: Configura los routes para Bacua.
 *       
 *       
 *  Use:
 *     Exporta la funcion que asigna las rutas al objeto app de Exrpess
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

    app.post('/login',
        passport.authenticate('local', {failureRedirect:'/login'}), function(req, res){
            console.log("/login [%s] [%s]", req.user.username, utils.anywModule());
            console.log('AUTHENTICATE OK!!!![%s] [%s]', req, res)
            res.redirect(utils.userHome(req.user));
    });

    app.get('/login', function(req,res,next){
        console.log("/login:routes.js ");
        res.redirect('/');
    });


    app.get('/logout', function(req, res){
      req.logout();
      res.redirect('/');
    });
    
    app.get('/inicio', function(req,res,next){
        //console.log("/inicio:routes.js ");
        res.redirect(utils.userHome(req.user));
    });




/*
    app.post('/login', function(req, res, next) {
        console.log('athentication BEGINS: [%s] [%s]', req.password, req.username);
        console.log('athentication BEGINS: [%s] [%s]', req.body.password, req.body.username);
        //req.username = req.body.username;
        //req.password = 'mateogo';
        passport.authenticate('local', function(err, user, info) {
            console.log('CALLBACK!! [%s],[%s] [%s]',err, user, info);

            if (err) { return next(err); }
            if (!user) { return res.send({username:'error'}); }
            
            req.logIn(user, function(err) {
                if (err) { return next(err); }
                return res.send(user);
            });
        })(req, res, next);
    });
*/

/*
    app.post('/login',

        passport.authenticate('local', { successRedirect: '/',
                                       failureRedirect: '/login',
                                       failureFlash: false })
    );
*/

/*
    app.post('/login',function(req,res,next){
        //console.log("/login [%s]  [%s]", req.user.username, req.body.username);
        res.redirect('/gestion');

    });
*/
    app.post('/files', function(req,res,next){
        //console.log("/files:routes.js ");
        utils.moveFile(req, res, rootPath);
    });

    app.get('/background/img', function(req,res,next){
        console.log("/files:routes.js ");
        res.redirect(utils.getBgImage());
    });

    app.get('/geocode', function(req,res){
        //console.log("/geocode:routes.js ");
        //4266,conecpcion arenal,capitalfederal,argentina

        var pa = '/maps/api/geocode/json?address=';

        pa += utils.safeAddress(req.query.address);
        pa += '&sensor=false';
        //console.log('feini: [%s]',req.query.feinicio);
        //console.log('fefin: [%s]',req.query.fefinal);
        //console.log('pa: [%s]',pa);

        var options = {
            host: 'maps.googleapis.com',
            //path: '/webservice/response/client.php?Method=GetEventosListFiltered&FechaInicio=2013-10-28&FechaFin=2013-10-30&Latitud=-34.60834737727606&Longitud=-58.39688441711421&OrdenarPor=Distancia&Limit=10'
            path: pa
        };

        //console.log("/geocode:routes.js 1");
        http.get(options, function (http_res) {
            // initialize the container for our data
            var data = "";

            // this event fires many times, each time collecting another piece of the response
            //console.log("/geocode:routes.js 2");
            http_res.on("data", function (chunk) {
                // append this chunk to our growing `data` var
                //console.log("/geocode:routes.js 3");
                data += chunk;
            });

            http_res.on('error',function(e){
                //console.log("Error: " + e.message); 
                //console.log( e.stack );
            });

            // this event fires *one* time, after all the `data` events/chunks have been gathered
            http_res.on("end", function () {
                // you can use res.send instead of console.log to output via express
                //console.log(data);
                res.send(data);
            });
        });
        //console.log("/agendacultural:routes.js ");
        //res.redirect();
    });


    app.get('/agendacultural', function(req,res){
        //console.log("/agendacultural:routes.js ");

        var http = require("http");

        var pa = '/webservice/response/client.php?Method=GetEventosListFiltered&Latitud=-34.5919216&Longitud=-58.45105059999999&OrdenarPor=Distancia&Limit=30';

        if(req.query.eventid){
            pa += '&IdEvento='+req.query.eventid;
        }else{
            pa += '&FechaInicio='+req.query.feinicio;
            pa += '&FechaFin='+req.query.fefinal;
            if(req.query.tipoevento) pa += '&IdTipoEvento='+req.query.tipoevento;
            if(req.query.title) pa += '&Titulo='+req.query.title;
        }

        //console.log('feini: [%s]',req.query.feinicio);
        //console.log('fefin: [%s]',req.query.fefinal);
        console.log('pa: [%s]',pa);

        var options = {
            host: 'agendacultural.buenosaires.gob.ar',
            //path: '/webservice/response/client.php?Method=GetEventosListFiltered&FechaInicio=2013-10-28&FechaFin=2013-10-30&Latitud=-34.60834737727606&Longitud=-58.39688441711421&OrdenarPor=Distancia&Limit=10'
            path: pa
        };

        console.log("/agendacultural:routes.js 1");
        http.get(options, function (http_res) {
            // initialize the container for our data
            var data = "";

            // this event fires many times, each time collecting another piece of the response
            console.log("/agendacultural:routes.js 2");
            http_res.on("data", function (chunk) {
                // append this chunk to our growing `data` var
                console.log("/agendacultural:routes.js 3");
                data += chunk;
            });

            http_res.on('error',function(e){
                console.log("Error: " + e.message); 
                console.log( e.stack );
            });

            // this event fires *one* time, after all the `data` events/chunks have been gathered
            http_res.on("end", function () {
                // you can use res.send instead of console.log to output via express
                console.log(data);
                res.send(data);
            });
        });
        //console.log("/agendacultural:routes.js ");
        //res.redirect();
    });

    app.get('/lugaresagenda', function(req,res){
        console.log("/lugaresagenda:routes.js ");

        var http = require("http");
        var pa = '/webservice/response/client.php?Method=GetLugaresListFiltered&OrdenarPor=NombreUrl&Orden=ASC&Limit=10&Offset=0';

        pa += '&NombreUrl='+utils.safeName(req.query.nombre);
        
        console.log('pa: [%s]',pa);

        var options = {
            host: 'agendacultural.buenosaires.gob.ar',
            //path: '/webservice/response/client.php?Method=GetEventosListFiltered&FechaInicio=2013-10-28&FechaFin=2013-10-30&Latitud=-34.60834737727606&Longitud=-58.39688441711421&OrdenarPor=Distancia&Limit=10'
            path: pa
        };

        console.log("/lugaresagenda:routes.js 1");
        http.get(options, function (http_res) {
            // initialize the container for our data
            var data = "";

            // this event fires many times, each time collecting another piece of the response
            console.log("/lugaresagenda:routes.js 2");
            http_res.on("data", function (chunk) {
                // append this chunk to our growing `data` var
                console.log("/lugaresagenda:routes.js 3");
                data += chunk;
            });

            http_res.on('error',function(e){
                console.log("Error: " + e.message); 
                console.log( e.stack );
            });

            // this event fires *one* time, after all the `data` events/chunks have been gathered
            http_res.on("end", function () {
                // you can use res.send instead of console.log to output via express
                console.log(data);
                res.send(data);
            });
        });
        //console.log("/agendacultural:routes.js ");
        //res.redirect();
    });

 
    // projects routes
    var project = require(rootPath + '/calendar/controllers/projects');
    app.get('/proyectos', project.findAll);
    app.post('/navegar/proyectos', project.find);
    app.get('/proyectos/:id', project.findById);
    app.post('/proyectos', project.add);
    app.put('/proyectos/:id', project.update);
    app.delete('/proyectos/:id', project.delete);

    // request routes
    var request = require(rootPath + '/calendar/controllers/requests');
    app.get('/solicitudes', request.findAll);
    app.post('/navegar/solicitudes', ensureAuthenticated, request.find);
    app.get('/solicitudes/:id', request.findById);
    app.post('/solicitudes', request.add);
    app.put('/solicitudes/:id', request.update);
    app.delete('/solicitudes/:id', request.delete);

    // resources routes
    var resource = require(rootPath + '/calendar/controllers/resources');
    app.get('/recursos', resource.find);
    app.post('/navegar/recursos', resource.find);
    app.get('/recursos/:id', resource.findById);
    app.post('/recursos', resource.add);
    app.put('/recursos/:id', resource.update);
    app.delete('/recursos/:id', resource.delete);

    // quotation routes
    var quotation = require(rootPath + '/calendar/controllers/quotations');
    app.post('/navegar/requisitorias', quotation.find);
    app.get('/requisitorias/:id', quotation.findById);
    app.post('/requisitorias', quotation.add);
    app.put('/requisitorias/:id', quotation.update);
    app.delete('/requisitorias/:id', quotation.delete);

    // products routes
    var product = require(rootPath + '/calendar/controllers/products');
    app.get('/productos', product.findAll);
    app.post('/actualizar/productos', product.partialupdate);
    app.get('/productos/:id',ensureAuthenticated, product.findById);
    app.post('/navegar/productos', product.find);
    app.get('/refine/productos', product.findAll);
    app.post('/productos', product.add);
    app.put('/productos/:id', product.update);
    app.delete('/productos/:id', product.delete);

    // asset (activos) routes
    var asset = require(rootPath + '/calendar/controllers/assets');
    app.post('/recuperar/activos', asset.find);
    app.get('/activos/:id', asset.findById);
    app.post('/activos', asset.add);
    app.put('/activos/:id', asset.update);
    app.delete('/activos/:id', asset.delete);
    app.get('/asset/render/img/:id', asset.renderImg);
    app.get('/asset/render/video/:id', asset.renderVideo);

    // article (articulos) routes
    var article = require(rootPath + '/calendar/controllers/articles');
    app.post('/recuperar/articulos', article.find);
    app.get('/articulos/:id', article.findById);
    app.post('/articulos', article.add);
    app.put('/articulos/:id', article.update);
    app.delete('/articulos/:id', article.delete);

    // user (usuarios) routes
    var user = require(rootPath + '/calendar/controllers/user');
    app.post('/recuperar/usuarios', user.find);   
    app.get('/currentuser', user.findCurrentUser);
    app.get('/usuarios/:id', user.findById);
    app.post('/usuarios', user.add);
    app.put('/usuarios/:id', user.update);
    app.delete('/usuarios/:id', user.delete);

    // person (personas) routes
    var person = require(rootPath + '/calendar/controllers/persons');
    app.get('/personas', person.findAll);
    app.post('/recuperar/personas', person.find);
    app.post('/navegar/personas', person.find);
    app.get('/personas/:id', person.findById);
    app.post('/personas', person.add);
    app.put('/personas/:id', person.update);
    app.delete('/personas/:id', person.delete);

    // receipt (comprobantes) routes
    var receipt = require(rootPath + '/calendar/controllers/receipts');
    app.get ('/comprobantes',           receipt.findAll);
    app.post('/actualizar/comprobantes', receipt.partialupdate);
    app.post('/recuperar/comprobantes', receipt.find);
    app.post('/comprobante/fetch',      receipt.findOne);
    app.post('/navegar/comprobantes',   receipt.find);
    app.get ('/comprobantes/:id',       receipt.findById);
    app.post('/comprobantes',           receipt.add);
    app.put ('/comprobantes/:id',       receipt.update);
    app.delete('/comprobantes/:id',     receipt.delete);

    // report (reportes) routes
    var report = require(rootPath + '/calendar/controllers/reports');
    app.get('/reportes', report.findAll);
    app.post('/recuperar/reportes', report.find);
    app.post('/navegar/reportes', report.find);
    app.post('/reporte/fetch',  report.findOne);
    app.get('/reportes/:id', report.findById);
    app.post('/reportes', report.add);
    app.put('/reportes/:id', report.update);
    app.delete('/reportes/:id', report.delete);

    // activity (actividades - partes diarios) routes
    var activity = require(rootPath + '/calendar/controllers/activities');
    app.post ('/activities/controller',           activity.controller);


    // anyw (studio) routes
    var anyw = require(rootPath + '/calendar/controllers/anyw');
    app.get('/studio/login', anyw.login);
    app.get('/studio/productions', anyw.findAllProductions);
    app.get('/studio/producciones/:id', anyw.findById);
    app.post('/studio/producciones', anyw.add);
    app.post('/studio/entities', anyw.fetchEntities);
    app.post('/studio/createentities', anyw.createEntities);
    app.put('/studio/createentities', anyw.updateEntities);
    app.post('/studio/pushsession', anyw.pushSession);
    app.post('/studio/ingest', anyw.ingest);
};

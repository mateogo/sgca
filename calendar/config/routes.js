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
    var formidable = require('formidable');
    var http = require("http");
    var passport = require('passport');

    var ensureAuthenticated = function (req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        res.redirect('/');
    };

    app.post('/login',
        passport.authenticate('local', {failureRedirect:'/ingresar'}), function(req, res){
            //console.log("/login [%s] [%s]", req.user.username, utils.anywModule());
            res.redirect(utils.userHome(req.user));
    });

    app.post('/login/:route',
        passport.authenticate('local', {failureRedirect:'/ingresar' }), function(req, res){
            //console.log('ROUTE AUTHENTICATE OK!!!![%s] [%s] route:[%s]', req, res, req.params.route)
            var route = req.params.route;
            if(route){
                res.redirect(route);
            }else{
                res.redirect(utils.userHome(req.user));
            }
    });

    app.get('/login', function(req,res,next){
        //console.log("/login:routes.js ");
        res.redirect('/');
    });

    app.post('/mica/login',
        passport.authenticate('local', {failureRedirect:'/mica'}), function(req, res){
            //console.log("/mica/login [%s] [%s]", req.user.username, utils.anywModule());
            res.redirect(utils.userHome(req.user));
    });

	app.post('/img', function (req, res){
		var form = new formidable.IncomingForm();
		form.parse(req, function(err, fields, files) {
			res.writeHead(200, {'content-type': 'application/json'});
			res.end(JSON.stringify({status:"success", url: 'uploads/'+files.img.name}));
		});

		form.on('end', function(fields, files) {
			/* Temporary location of our uploaded file */
			var temp_path = this.openedFiles[0].path;
			/* The file name of the uploaded file */
			var file_name = this.openedFiles[0].name;
			/* Location where we want to copy the uploaded file */
			var new_location = 'img/';
			fs.copy(temp_path, new_location + file_name, function(err) {
				if (err) {
					console.error(err);
				} else {
				}
			});
		});
	});
    app.get('/mica/login', function(req,res,next){
        res.redirect('/');
    });

    app.get('/logout', function(req, res){
      req.logout();
      res.redirect('/ingresar');
    });

    app.get('/logout/:route', function(req, res){
      req.logout();
      res.redirect(req.params.route);
    });


    app.get('/inicio', function(req,res,next){
        res.redirect(utils.userHome(req.user));
    });

    app.post('/excelfactory', function(req,res,next){

        utils.uploadExcelData(req, res, next, rootPath);

    });

    app.post('/excelbuilder', function(req,res,next){
        var request = req.body;
        request.data = JSON.parse(req.body.data);

        //validar datos
        var error = utils.excelBuilder(request, rootPath, function(error){
            if(error.file) {
                res.send(error);
            }
        });

    });

    app.post('/sendmail', function(req,res,next){
        //validar datos
        var error = utils.sendMail(req.body, function(error){
                    res.send(error)
        });

    });

    app.post('/files', function(req,res,next){
        utils.moveFile2(req, res, next, rootPath);
    });

    app.get('/background/img', function(req,res,next){
        res.redirect(utils.getBgImage());
    });

    app.get('/geocode', function(req,res){
        //console.log("/geocode:routes.js ");

        var pa = '/maps/api/geocode/json?address=';

        pa += utils.safeAddress(req.query.address);
        pa += '&sensor=false';

        var options = {
            host: 'maps.googleapis.com',
            //path: '/webservice/response/client.php?Method=GetEventosListFiltered&FechaInicio=2013-10-28&FechaFin=2013-10-30&Latitud=-34.60834737727606&Longitud=-58.39688441711421&OrdenarPor=Distancia&Limit=10'
            path: pa
        };
        http.get(options, function (http_res) {
            // initialize the container for our data
            var data = "";

            http_res.on("data", function (chunk) {
                // append this chunk to our growing `data` var
                data += chunk;
            });

            http_res.on('error',function(e){
            });

            // this event fires *one* time, after all the `data` events/chunks have been gathered
            http_res.on("end", function () {
                // you can use res.send instead of console.log to output via express
                res.send(data);
            });
        });
    });

    // micasuscriptions -perfil inscriptos MICA- routes
    var micasuscriptions = require(rootPath + '/calendar/controllers/micasuscriptions');
    app.post('/actualizar/micasuscriptions', micasuscriptions.partialupdate);
    app.get ('/micasuscriptions',            micasuscriptions.findAll);
    app.post('/micasuscriptions/fetch',      micasuscriptions.findOne);
    app.post('/navegar/micasuscriptions',    micasuscriptions.find);
    app.get('/query/micasuscriptions',      micasuscriptions.findByQuery);
    app.get ('/fetch/micasuscriptions',      micasuscriptions.fetchByQuery);

    app.get ('/micasuscriptions/:id',        micasuscriptions.findById);
    app.post('/micasuscriptions',            micasuscriptions.add);
    app.put ('/micasuscriptions/:id',        micasuscriptions.update);
    app.delete('/micasuscriptions/:id',      micasuscriptions.delete);
    app.get('/confirmaciones-estadistica',      micasuscriptions.estaditicaConfirmacion);


    // micainteractions - ronda entre participantes MICA- routes
    var micainteractions = require(rootPath + '/calendar/controllers/micainteractions');
    app.get ('/buildmicaranking/stats',       micainteractions.rankingstats);
    app.get ('/buildmicaranking',            micainteractions.buildranking);

    app.get ('/micainteractions',            micainteractions.findAll);
    app.post('/micainteractions',            micainteractions.add);
    app.get ('/micainteractions/ranking',    micainteractions.findRankingByQuery);

    app.post('/actualizar/micainteractions', micainteractions.partialupdate);
    app.post('/micainteractions/fetch',      micainteractions.findOne);
    app.post('/navegar/micainteractions',    micainteractions.find);
    app.get('/query/micainteractions',       micainteractions.findByQuery);

    app.get ('/micainteractions/:id',        micainteractions.findById);
    app.put ('/micainteractions/:id',        micainteractions.update);
    app.delete('/micainteractions/:id',      micainteractions.delete);


    // micashowcase -perfil inscriptos MICA- routes
    var micashowcase = require(rootPath + '/calendar/controllers/micashowcase');
    app.post('/actualizar/micashowcase', micashowcase.partialupdate);
    app.get ('/micashowcase',            micashowcase.findAll);
    app.post('/micashowcase/fetch',      micashowcase.findOne);
    app.post('/navegar/micashowcase',    micashowcase.find);
    app.get ('/query/micashowcase',      micashowcase.findByQuery);
    app.get ('/fetch/micashowcase',      micashowcase.fetchByQuery);

    app.get ('/micashowcase/:id',        micashowcase.findById);
    app.post('/micashowcase',            micashowcase.add);
    app.put ('/micashowcase/:id',        micashowcase.update);
    app.delete('/micashowcase/:id',      micashowcase.delete);

    // salonosuscribe -perfil inscriptos FONDO- routes
    var salonsuscribe = require(rootPath + '/calendar/controllers/salonsuscriptions');
    app.post('/actualizar/salonsuscriptions', salonsuscribe.partialupdate);
    app.get ('/salonsuscriptions',            salonsuscribe.findAll);
    app.post('/salonsuscriptions/fetch',      salonsuscribe.findOne);
    app.post('/navegar/salonsuscriptions',    salonsuscribe.find);
    app.get('/query/salonsuscriptions',       salonsuscribe.findByQuery);
    app.get ('/fetch/salonsuscriptions',      salonsuscribe.fetchByQuery);

    app.get ('/salonsuscriptions/:id',        salonsuscribe.findById);
    app.post('/salonsuscriptions',            salonsuscribe.add);
    app.put ('/salonsuscriptions/:id',        salonsuscribe.update);
    app.delete('/salonsuscriptions/:id',      salonsuscribe.delete);


    // fondosuscribe -perfil inscriptos FONDO- routes
    var fondosuscribe = require(rootPath + '/calendar/controllers/fondosuscriptions');
    app.post('/actualizar/fondosuscriptions', fondosuscribe.partialupdate);
    app.get ('/fondosuscriptions',            fondosuscribe.findAll);
    app.post('/fondosuscriptions/fetch',      fondosuscribe.findOne);
    app.post('/navegar/fondosuscriptions',    fondosuscribe.find);
    app.get('/query/fondosuscriptions',       fondosuscribe.findByQuery);
    app.get ('/fetch/fondosuscriptions',      fondosuscribe.fetchByQuery);

    app.get ('/fondosuscriptions/:id',        fondosuscribe.findById);
    app.post('/fondosuscriptions',            fondosuscribe.add);
    app.put ('/fondosuscriptions/:id',        fondosuscribe.update);
    app.delete('/fondosuscriptions/:id',      fondosuscribe.delete);

     // adminrequests (acciones) routes
    var admrqst = require(rootPath + '/calendar/controllers/adminrequests');
    app.post('/actualizar/tramitaciones', admrqst.partialupdate);
    app.get ('/sisplan/tramitacion/:id',          admrqst.findByCnumber);
    app.get ('/tramitaciones',            admrqst.findAll);
    app.post('/recuperar/tramitaciones',  admrqst.find);
    app.post('/admrqst/fetch',        admrqst.findOne);
    app.post('/navegar/tramitaciones',    admrqst.find);
    app.get ('/tramitaciones/:id',        admrqst.findById);
    app.post('/tramitaciones',            admrqst.add);
    app.put ('/tramitaciones/:id',        admrqst.update);
    app.delete('/tramitaciones/:id',      admrqst.delete);



     // action (acciones) routes
    var budget = require(rootPath + '/calendar/controllers/budgets');
    app.post('/actualizar/presupuestos', budget.partialupdate);
    app.get ('/presupuestos',            budget.findAll);
    app.post('/recuperar/presupuestos',  budget.find);
    app.post('/budget/fetch',            budget.findOne);
    app.post('/navegar/presupuestos',    budget.find);
    app.get ('/presupuestos/:id',        budget.findById);
    app.post('/presupuestos',            budget.add);
    app.put ('/presupuestos/:id',        budget.update);
    app.delete('/presupuestos/:id',      budget.delete);



    var action = require(rootPath + '/calendar/controllers/actions');
    app.post('/actionbudget/fetch',  action.fetchActionBudgetCol);
    app.post('/actionlocations/fetch',  action.fetchActionLocations);
    app.post('/actualizar/acciones', action.partialupdate);
    app.get ('/acciones',            action.findAll);
    app.post('/recuperar/acciones',  action.find);
    app.post('/action/fetch',        action.findOne);
    app.post('/navegar/acciones',    action.find);
    app.get ('/acciones/:id',        action.findById);
    app.post('/acciones',            action.add);
    app.put ('/acciones/:id',        action.update);
    app.delete('/acciones/:id',      action.delete);

    app.put('/acciones/:id/participantes',action.addParticipant);
    app.post('/acciones/:id/participantes',action.addParticipant);

    app.post('/acciones/:id/locaciones',action.addLocation);

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
    app.get('/recuperar/activos', asset.find);
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
    app.post('/actualizar/usuarios', user.partialupdate);
    app.post('/recuperar/usuarios', user.find);
    app.get('/currentuser', user.findCurrentUser);
    app.get('/usuarios', user.findAll);
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

/*
 *  calendar routes.js
 *  package: /calendar/config
 *  DOC: Configura los routes para Calendar.
 *       
 *       
 *  Use:
 *     Exporta la funcion que asigna las rutas al objeto app de Exrpess
 */
module.exports = function (config, app) {
    var rootPath = config.root;
    // user routes
    app.post('/login', function(req,res,next){
        var usr = req.body.user;
        console.log("user1: ["+usr+"]");
        console.log("user2: ["+usr.name+"]");
        console.log("user3: ["+usr.pass+"]");
        res.redirect('/');
    });

    var strutils = require(rootPath + '/calendar/util/strutils');
    app.post('/files', function(req,res,next){
        console.log("/files:routes.js ");
        var fs = require('fs');
        var times = new Date().getTime();
        var times_str = times.toString()+'_';
        var filename = strutils.safeFileName(req.files.loadfiles.name);
        var serverFolder = rootPath + '/public/files' + req.body.folder;
        var urlPath = 'files' + req.body.folder + '/' + times_str + filename;
        var serverPath = serverFolder + '/' + times_str + filename;
        //console.log("path: "+serverPath);
        //console.log("req: "+JSON.stringify(req.files.loadfiles));
        //todo: revisar filename
        console.log("req.body: "+JSON.stringify(req.body));
        console.log("req.files: "+JSON.stringify(filename));

        if(!fs.existsSync(serverFolder)) fs.mkdirSync(serverFolder);
        fs.rename(req.files.loadfiles.path,serverPath,function(error){
                if(error){
                    res.send({error: 'Ooops! algo salio mal!'});
                     return;
                }
                res.send({
                        name: filename,
                        urlpath: urlPath,

                        fileversion:{
                            name: filename,
                            urlpath: urlPath,
                            mime: req.files.loadfiles.mime,
                            type: req.files.loadfiles.type,
                            size: req.files.loadfiles.size,
                            lastModifiedDate: req.files.loadfiles.lastModifiedDate,
                            uploadDate: times
                        }
                    });
            }
        );
    });

    // projects routes
    var project = require(rootPath + '/calendar/controllers/projects');
    app.get('/proyectos', project.findAll);
    app.post('/navegar/proyectos', project.find);
    app.get('/proyectos/:id', project.findById);
    app.post('/proyectos', project.add);
    app.put('/proyectos/:id', project.update);
    app.delete('/proyectos/:id', project.delete);

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
    app.post('/navegar/productos', product.find);
    app.get('/productos/:id', product.findById);
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
};

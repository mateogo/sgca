/*
 *  core utils.js
 *  package: /core/utils/utils
 *  Use:
 *     Exporta un objeto con funciones utilitarias
 */


var fs = require('fs');

var _ = require('underscore');

var SpreadsheetWriter = require('pyspreadsheet').SpreadsheetWriter;

var nodemailer = require('nodemailer');
var formidable = require('formidable');
var util = require('util');

var anyw = false;

var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        //user: 'intranet.mcn.2@gmail.com',
        user: 'intranet.mcn@gmail.com',
        pass: 'NaY-yZM-S9M-wVU'
       }
});

var subjecttpl = _.template("<%= subject %>");
var bodytpl = _.template(
            "<br>"+
            "<div><%= body %></div>"+
            "<br>"+
            "<br>"+
            "<br>"+
            "<div>"+
            "<p>Si usted esta recibiendo este mail en forma indebida, por favor comuniquese al teléfono (54 11) 4120 2400</p>"+
            "<p><a href='http://www.cultura.gob.ar'>Ministerio de Cultura</a></p>"
);

var es_cutoff = {
    "á" : "a",
    "Á" : "A",
    "é" : "e",
    "É" : "E",
    "í" : "i",
    "Í" : "I",
    "ó" : "o",
    "Ó" : "O",
    "ú" : "u",
    "Ú" : "U",
    "ñ" : "n"
};
var bgImages = [
    '/css/img/bg-001.jpg',
    '/css/img/bg-002.jpg',
    '/css/img/bg-003.jpg',
    '/css/img/bg-004.jpg',
    '/css/img/bg-005.jpg',
    '/css/img/bg-006.jpg',
    '/css/img/bg-007.jpg',
    '/css/img/bg-008.jpg',
    '/css/img/bg-009.jpg',
    '/css/img/bg-010.jpg',
    '/css/img/bg-011.jpg',
];

var rndBetween = function (min,max){
    //min: inclusive  max: exclusive
    return Math.floor(Math.random() * (max-min) + min);

    //min: inclusive  max: inclusive
    //return Math.floor(Math.random() *(max - min + 1) + min);
};

var safeFileName = function(name){
	var str = name;
	str = str.split(' ').join('_');
	str = str.replace(/[áÁéÉíÍóÓúÚñ]/g,function(c) { return es_cutoff[c]; });
	return str;
};

var createFolder = function(publicPath, today){
    var day    = today.getDate()<10 ? '0'+today.getDate() : today.getDate();
    var month = today.getMonth()+1;
    month  = month<10 ? '0'+month : month;
    var year = today.getFullYear();

    var serverPath = 'files'
    if(!fs.existsSync(publicPath + serverPath)) fs.mkdirSync(publicPath + serverPath);

    serverPath += '/assets';
    if(!fs.existsSync(publicPath + serverPath)) fs.mkdirSync(publicPath + serverPath);

    serverPath += '/'+year;
    if(!fs.existsSync(publicPath + serverPath)) fs.mkdirSync(publicPath + serverPath);

    serverPath += '/'+month;
    if(!fs.existsSync(publicPath + serverPath)) fs.mkdirSync(publicPath + serverPath);

    serverPath += '/'+day;
    if(!fs.existsSync(publicPath + serverPath)) fs.mkdirSync(publicPath + serverPath);

    return serverPath;
};

var rutas = {
    'no_definido'                  :'/#navegar/proyectos',
    'procedencias:list'            :'/#navegar/proyectos',
    'solicitudes:list'             :'/#navegar/solicitudes',
    'productos:list'               :'/#navegar/productos',
    'gestion:comprobantes:list'    :'/gestion/#comprobantes',
    'sisplan:acciones:list'        :'/sisplan/#acciones',
    'studio:producciones:list'     :'/studio',
    'mica:rondas'    			   :'/mica',
    'fondo:inscripcion'            :'/fondo/#inscripcion/nueva'
};


exports.anywModule = function(){
    return anyw;
};


exports.getBgImage = function(){
    var index = rndBetween(0,bgImages.length);
    //console.log('getBgImate: index:[%s] l:[%s]',index, bgImages.length);
    return bgImages[index];
};

exports.userHome = function (user){
    var location;
    if(user){
        if(user.home) {
            location = rutas[user.home];
        }
    }
    return (location ? location : rutas['no_definido'])
};

var isFalsey = function(data){
    if (!data) return true;

    if (data === '0')
    {
        return true;
    };
    return false;
};

var parseData = function(dataCol ,options){
    var row,
        parsedCol = [],
        iType,
        indexLinks,
        parsedLinks;

    _.each(dataCol, function(itemRow){
        //console.log('ProgNum:[%s] tipomov:[%s] tagasto:[%s] cantidad:[%s] impo:[%s] nivel_ej:[%s] estado_alta:[%s] tramita:[%s] slug:[%s]',itemRow[0], itemRow[1], itemRow[2], itemRow[3], itemRow[4], itemRow[18], itemRow[19], itemRow[13], itemRow[6] );
        indexLinks = -1;
        parsedLinks = [];


        row = _.map(itemRow, function(item, index){
            if(item === 'sin_dato')
                return 'sin_dato';

            iType = options[index].itemType;
            //console.log('Element: [%s], index:[%s] iType:[%s]',item,index,iType);
            if(iType === 'Text') {
                return item;

            }else if(iType === 'Number') {
                return parseFloat(item);

            }else if(iType === 'Date') {
                return parseDateStr(item);

            }else if(iType === 'Boolean') {
                return (isFalsey(item) ? 0 : 1);

            }else if(iType === 'Url') {
                if(item && (item.indexOf('|') !== -1 || item.indexOf(';') !== -1)) {
                    indexLinks = index;
                    parsedLinks = item.split(/[|;]+/);
                    parsedLinks = _.map(parsedLinks, function(item){
                        return item.substr(0,200);
                    });
                    return 'Siguen referencias:'
                }else{
                    return 'Sin referencias';
                }

            }else{
                return item;
            }
        });
        if(indexLinks !== -1){
            row = row.concat(parsedLinks);
        }
        parsedCol.push(row);
    });
    return parsedCol;
};

exports.uploadExcelData = function(req, res, next, rootPath){
  var form = new formidable.IncomingForm();

  form.maxFieldsSize = 30 * 1024 * 1024;
  //form.type = 'multipart';
  //form.type = 'urlencoded';

  form.parse(req, function(err, fields, files){
    fields.data = JSON.parse(fields.data);
    fields.heading = JSON.parse(fields.heading);

    exports.excelBuilder(fields, rootPath, function(data){
        res.send(data);
    });

    // res.writeHead(200, {'content-type': 'text/plain'});
    // res.write('received upload:\n\n');
    // res.end(util.inspect({fields: fields, files: files}));

  });
};


var excelHeadings = function(headings){
    var labels = [];
    _.each(headings, function(token){
        labels.push(token.label);
    });
    return labels;
};

exports.excelBuilder = function (request, rootPath, cb){
    //console.log("utils:begin")
    var heading = excelHeadings(request.heading);
    var options = request.options;

    var publicPath = rootPath + '/public/';

    var name = saveFileName(rootPath, request.name + '.xlsx');

    var relativeName = name.substr(publicPath.length - 1);

    var writer = new SpreadsheetWriter(name);

    var pData = parseData(request.data, request.heading);


    writer.addFormat('heading', { font: { bold: true } });
    writer.write(0, 0, heading, 'heading');

    writer.append(pData);

    writer.addFormat('options', { font: { bold: true }, alignment: 'right' } );
    writer.write('D5', options, 'options');

    writer.save(function (err) {
        if (err) throw err;

        if(cb){
            var respdata = {
                error: "save concretado",
                file: relativeName
            };
            cb(respdata);
        }
    });

};

exports.sendMail = function (mailOptions,cb){
    mailOptions.subject = subjecttpl({subject:mailOptions.subject});
    mailOptions.html = bodytpl({body:mailOptions.html});
    // send mail with defined transport object
    transporter.sendMail(mailOptions, function(error, info){
        if (error) throw error;
        if(cb){
            var error = {
                error: 'Message sent: ' + info.response,
            };
        cb(error);
        }

    });
};

exports.safeName = function (name){
    var str = name.toLowerCase();
    str = str.split(' ').join('-');
    str = str.replace(/[áÁéÉíÍóÓúÚñ]/g,function(c) { return es_cutoff[c]; });
    return str;
};

exports.safeAddress = function (name){
    var str = name.toLowerCase();
    str = str.split(' ').join('%20');
    str = str.replace(/[áÁéÉíÍóÓúÚñ]/g,function(c) { return es_cutoff[c]; });
    return str;
};

exports.safeAddress = function (name){
    var str = name.toLowerCase();
    str = str.split(' ').join('%20');
    str = str.replace(/[áÁéÉíÍóÓúÚñ]/g,function(c) { return es_cutoff[c]; });
    return str;
};


exports.moveFile = function(req, res, next,rootPath){
    var today = new Date();
    var times = today.getTime();
    var times_str = times.toString()+'_';

    var filename = safeFileName(req.files.loadfiles.name);

    var publicPath = rootPath + '/public/';

    var urlPath = createFolder(publicPath, today) + '/' + times_str + filename;

    var serverPath = rootPath + '/public/' + urlPath;

    //console.log("req.body: "+JSON.stringify(req.body));
    //console.log("req.files: "+JSON.stringify(filename));

    fs.rename(req.files.loadfiles.path, serverPath, function(error){
        if(error){
            res.send({error: 'Ooops! algo salio mal!'});
        }else{
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
    });
};



exports.moveFile2 = function(req, res, next, rootPath){
  var today = new Date();
  var times = today.getTime();
  var times_str = times.toString()+'_';

  var form = new formidable.IncomingForm();

  form.parse(req, function(err, fields, files) {

    var filename = safeFileName(files.loadfiles.name);

    var publicPath = rootPath + '/public/';
    var urlPath = createFolder(publicPath, today) + '/' + times_str + filename;
    var serverPath = rootPath + '/public/' + urlPath;

    fs.rename(files.loadfiles.path, serverPath, function(error){
        if(error){
            res.send({error: 'Ooops! algo salio mal!'});
        }else{
            res.send({
                name: filename,
                urlpath: urlPath,
                fileversion:{
                    name: filename,
                    urlpath: urlPath,
                    mime: files.loadfiles.mime,
                    type: files.loadfiles.type,
                    size: files.loadfiles.size,
                    lastModifiedDate: files.loadfiles.lastModifiedDate,
                    uploadDate: times
                }
            });
        }
        next();
    });
  });

  return;

};

var saveFileName = function(rootPath, name){
    var today = new Date();
    var times = today.getTime();
    var times_str = times.toString()+'_';

    var filename = safeFileName(name);

    var publicPath = rootPath + '/public/';

    var urlPath = createFolder(publicPath, today) + '/' + times_str + filename;

    var serverPath = rootPath + '/public/' + urlPath;

    return serverPath;
};

exports.dateToStr = function(date) {
    var prefix = '00';

    var da = (prefix+date.getDate()).substr(-prefix.length);
    var mo = (prefix+(date.getMonth()+1)).substr(-prefix.length);
    var ye = date.getFullYear();
    return da+"/"+mo+"/"+ye;
};

exports.getDeepValue = function(obj, path) {
  var parts = path.split('.'),
        rv,
        index;

    for (rv = obj, index = 0; rv && index < parts.length; ++index) {
        if(!(parts[index] in rv)){
          return '';
        }
        rv = rv[parts[index]];
    }
    return rv;
};

var parseDateStr = function(str) {
    //console.log('parseDate BEGIN [%s]',str)

    var mx = str.match(/(\d+)/g);
    var ty = new Date();
    if(mx.length === 0) return ty;
    if(mx.length === 1){
        if(mx[0]<0 || mx[0]>31) return null;
        else return new Date(ty.getFullYear(),ty.getMonth(),mx[0]);
    }
    if(mx.length === 2){
        if(mx[0]<0 || mx[0]>31) return null;
        if(mx[1]<0 || mx[1]>12) return null;
        else return new Date(ty.getFullYear(),mx[1]-1,mx[0]);
    }
    if(mx.length === 3){
        if(mx[0]<0 || mx[0]>31) return null;
        if(mx[1]<0 || mx[1]>12) return null;
        if(mx[2]<1000 || mx[2]>2020) return null;
        else return new Date(mx[2],mx[1]-1,mx[0]);
    }
    if(mx.length === 4){
        if(mx[0]<0 || mx[0]>31) return null;
        if(mx[1]<0 || mx[1]>12) return null;
        if(mx[2]<1000 || mx[2]>2020) return null;
        if(mx[3]<0 || mx[3]>24) return null;
        else return new Date(mx[2],mx[1]-1,mx[0],mx[3],0);
    }
    if(mx.length === 5){
        if(mx[0]<0 || mx[0]>31) return null;
        if(mx[1]<0 || mx[1]>12) return null;
        if(mx[2]<1000 || mx[2]>2020) return null;
        if(mx[3]<0 || mx[3]>24) return null;
        if(mx[4]<0 || mx[4]>60) return null;
        else return new Date(mx[2],mx[1]-1,mx[0],mx[3],mx[4]);
    }
}

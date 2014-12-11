/*
 *  core utils.js
 *  package: /core/utils/utils
 *  Use:
 *     Exporta un objeto con funciones utilitarias
 */


var fs = require('fs');

var _ = require('underscore');

var SpreadsheetWriter = require('pyspreadsheet').SpreadsheetWriter;

var anyw = false;

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
    'studio:producciones:list'     :'/studio'
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

var parseData = function(data,options){
   // var dateColumns = options.dateColumns;
    var dateColumns =[3];
    var booleanColumns =[5];
    var parsed = [];
    var numberColumns = [2,4];
    
    
    if (dateColumns){
        _.each(data,function(elem){
            var row = _.map(elem,function(item, index){
                         
                if (_.indexOf(dateColumns,index) != -1){
                    console.log(item,index,_.indexOf(dateColumns,index));
                    return new Date(item);
                }
    
                if (_.indexOf(booleanColumns,index) != -1){
                    console.log(item,index,_.indexOf(booleanColumns,index));
                    return (isFalsey(item) ? false : true);
                }
                if (_.indexOf(numberColumns,index) != -1){
           
                    return parseFloat(item);
                }

                return item;
            });
            parsed.push(row);
        });
        return parsed;
    }
    
    
};

exports.excelBuilder = function (query,rootPath,cb){
    console.log("utils:begin")
    var data = query.data;
    var heading = query.heading;
    var options = query.options;

    var publicPath = rootPath + '/public/';

    var name = saveFileName(rootPath, query.name + '.xlsx');
    console.log(name);
    
    var relativeName = name.substr(publicPath.length - 1);

    var writer = new SpreadsheetWriter(name);
    
    //var pData = parseData(data,options);
    
    writer.addFormat('heading', { font: { bold: true } });
    writer.write(0, 0, heading, 'heading');

    writer.append(data);

    writer.addFormat('options', { font: { bold: true }, alignment: 'right' } );
    writer.write('D5', options, 'options');

    writer.save(function (err) {
        if (err) throw err;
        console.log('file saved');
        if(cb){
            var error = {
                error: "save concretado",
                file: relativeName
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


exports.moveFile = function(req, res, rootPath){
    var today = new Date();
    var times = today.getTime();
    var times_str = times.toString()+'_';

    var filename = safeFileName(req.files.loadfiles.name);

    var publicPath = rootPath + '/public/';

    var urlPath = createFolder(publicPath, today) + '/' + times_str + filename;

    var serverPath = rootPath + '/public/' + urlPath;

    console.log("req.body: "+JSON.stringify(req.body));
    console.log("req.files: "+JSON.stringify(filename));

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

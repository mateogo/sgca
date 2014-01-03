/*
 *  calentdar products.js
 *  package: /calendar/controllers
 *  DOC: 'productos' collection controller
 *       Cada nodo representa un objeto digital-cultural (producto audiovisual, imagen, audio)
 *       a ser gestionado por el sistema.
 *       Este modulo contiene los 'controllers'
 *       para aplicar los metodos CRUD.
 *  Use:
 *     Exporta el objeto controller de un producto via 'exports'
 *     metodos exportados:
 *          open(); find(); findById; findAll; add(), update(); delete(); viewId
 */
var dbi ;
var BSON;
var config = {};
var productsCol = 'products';
var serialCol = 'seriales';
var MSGS = [
    'ERROR: No se pudo insertar el nodo en la base de datos',
    'ERROR: No se pudo borrar el nodo en la base de datos'
];
//ATENCION: para agregar un serial, agregar entrada en tpr_adapter y en series;
var series = ['pa101','pr101','pm101','im101','xx101','cu101','do101','au101','vi101'];

var seriales = {};

//ATENCION: para agregar un serial, agregar entrada en tpr_adapter y en series;
var tpr_adapter = {
    paudiovisual:{
        serie: 'pa101',
        base: 100000,
        prefix: 'A'
        },
    promo: {
        serie: 'pr101',
        base: 100000,
        prefix:'P'
        },
    micro: {
        serie: 'pm101',
        base: 200000,
        prefix: 'M'
        },
    catalogo:{
        serie: 'cu101',
        base: 100000,
        prefix:'C'
    },
    documento:{
        serie: 'do101',
        base: 100000,
        prefix:'D'
    },
    audio:{
        serie: 'au101',
        base: 100000,
        prefix:'U'
    },
    video:{
        serie: 'vi101',
        base: 100000,
        prefix:'V'
    },
    imagen:{
        serie: 'im101',
        base: 100000,
        prefix:'I'
    },
    poromision: {
        serie: 'xx101',
        base: 100000,
        prefix: 'X'
    }
};

var loadSeriales = function(){
    for(var key in series){
        fetchserial(series[key]);
    }
};


var addSerial = function(serial,data){
    seriales[serial] = data;
    console.log('addSerial:product.js INIT con exito: [%s] next:[%s]',seriales[serial].serie,seriales[serial].nextnum);
};

var initSerial = function(serie){
    var serial ={
        _id: null,
        serie: serie,
        nextnum: 1,
        feUltMod: new Date()
    };
    return serial;
};

var fetchserial = function(serie){
    console.log("INIT:fetchserie:product.js:[%s]",serie);
    var collection = dbi.collection(serialCol);
    collection.findOne({'serie':serie}, function(err, item) {
        if(!item){
            console.log('INIT:fetchserial:serial not found: [%s]',serie);
            item = initSerial(serie);

            collection.insert(item, {safe:true}, function(err, result) {
                if (err) {
                    console.log('Error initializing  [%s] error: %s',serialCol,err);
                } else {
                    console.log('NEW serial: se inserto nuevo [%s] [%s] nodos',serialCol,result);
                    addSerial(serie,result[0]);
                }
            });
        }else{
            addSerial(serie,item);
        }  
    });
};



var addNewProduct = function(req, res, pr){
    console.log("addNewProduct:products.js ["+pr.tipoproducto+"]");
    // a. Encontrar el código adecuado para este producto.
    setProductCode(pr);
    insertNewProduct(req,res,pr);
};

var setProductCode = function(pr){
    var adapter = tpr_adapter[pr.tipoproducto] || tpr_adapter['poromision'];
    pr.productcode = nextSerial(adapter);


};

var nextSerial = function (adapter){
    var serie = adapter.serie;
    var nxt = seriales[serie].nextnum + adapter.base;
    seriales[serie].nextnum += 1;
    seriales[serie].feUltMod = new Date();
    //
    updateSerialCollection(seriales[serie]);
    //
    return adapter.prefix + nxt;
};

var updateSerialCollection = function(serial){
    var collection = dbi.collection(serialCol);    
    collection.update( {'_id':serial._id}, serial,{w:1},function(err,result){});
};


var insertNewProduct = function (req, res, product){
    console.log('insertNewProduct:products.js BEGIN');
    //dbi.collection(productsCol, function(err, collection) {

    dbi.collection(productsCol).insert(product,{w:1}, function(err, result) {
            if (err) {
                res.send({'error':'An error has occurred'});
            } else {
                console.log('3.1. ADD: se inserto correctamente el nodo %s', JSON.stringify(result[0]));
                res.send(result[0]);
            }
        });
    //});
};

exports.setDb = function(db) {
    dbi = db;
    loadSeriales();
    return this;
};
exports.setConfig = function(conf){
    config = conf;
    return this;
};
exports.setBSON = function(bs) {
    BSON = bs;
    return this;
};

exports.viewId = function(req, res) {
    var id = req.params.id;
    //console.log('viewId: Retrieving %s id:[%s]', productsCol,id);
    //console.log(config.publicpath + '/requisitoria.html');

    //res.sendfile(config.publicpath + '/requisitoria.html');
};

exports.findById = function(req, res) {
    var id = req.params.id;
    console.log('findById: Retrieving %s id:[%s]', productsCol,id);
    dbi.collection(productsCol, function(err, collection) {
        collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, item) {
            res.send(item);
        });
    });
};

exports.find = function(req, res) {
    var query = req.body; //{};
    //OjO con esto MGO
    if(query.es_capitulo_de){
        if(query.es_capitulo_de==='false') query.es_capitulo_de={$exists:false};
    }
    
    /*
    console.log('**********find:product Retrieving product collection with query');
    for(var key in query){
        console.log('loop: [%s][%s]',key,query[key]['$exists']);
        var ob = query[key];
        for (var k2 in ob){
            console.log('s-loop: [%s] [%s]',k2,ob[k2]);
        }
    }
    */
    
    //console.log('find: Retrieving query1:[%s]',((query.project)?query.project._id:'null'));
    //console.log('find:product Retrieving query:',((query.es_capitulo_de) ? query['es_capitulo_de.product']:'nada'));
    //console.log('**********find:product Retrieving product collection with query');
    //var qu = {};
    //var pr = {product:'522f7581992f753b09000001',capnum:{$gt:0}} ;
    //var pr = {product:'522f7581992f753b09000001',capnum:2} ;
    //var elmatch = {'$elemMatch': {'product': '522f7581992f753b09000001'}};
    //var qu= {'es_capitulo_de':{$exists:false}};

    //console.log('qu: [%s]',qu.es_capitulo_de.product);

    dbi.collection(productsCol, function(err, collection) {
        collection.find(query).sort({slug:1}).toArray(function(err, items) {
            res.send(items);
        });
    });
};

exports.findAll = function(req, res) {
    console.log('findAll: Retrieving all instances of [%s] collection', productsCol);
    dbi.collection(productsCol, function(err, collection) {
        collection.find().sort({slug:1}).toArray(function(err, items) {
            res.send(items);
        });
    });
};

exports.add = function(req, res) {
    console.log('add:product.js: NEW PRODUCT BEGINS');
    var product = req.body;
    addNewProduct(req, res, product);
};

exports.update = function(req, res) {
    var id = req.params.id;
    var product = req.body;
    delete product._id;
    console.log('Updating node id:[%s] ',id);
    console.log(JSON.stringify(product));
    dbi.collection(productsCol, function(err, collection) {
        collection.update({'_id':new BSON.ObjectID(id)}, product, {safe:true}, function(err, result) {
            if (err) {
                console.log('Error updating %s error: %s',productsCol,err);
                res.send({error: MSGS[0] + err});
            } else {
                console.log('UPDATE: se insertaron exitosamente [%s] nodos',result);
                res.send(product);
            }
        });
    });
};

exports.delete = function(req, res) {
    var id = req.params.id;
    console.log('Deleting node: [%s] ', id);
    dbi.collection(productsCol, function(err, collection) {
        collection.remove({'_id':new BSON.ObjectID(id)}, function(err, result) {
            if (err) {
                res.send({error: MSGS[1] + err});
            } else {
                console.log('DELETE: se eliminaron exitosamente [%s] nodos',result);
                res.send(req.body);
            }
        });
    });
};

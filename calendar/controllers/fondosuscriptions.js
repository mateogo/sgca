/*
 *  calendar fondosuscriptions.js
 *  package: /calendar/controllers
 *  DOC: 'fondosuscriptions' collection controller
 *  Use:
 *     Exporta el objeto controller de un fondoprofile via 'exports'
 *     metodos exportados:
 *          open(); find(); findById; findAll; add(), update(); delete(); viewId
 *
 */
var config = require('config');
var _ = require('underscore');

var dbi ;
var BSON;
var fondosuscriptionsCol = config.get('Calendar.collections.fondosuscriptions');
var serialCol =            config.get('Calendar.collections.seriales');

var _ = require('underscore');


var MSGS = [
    'ERROR: No se pudo insertar el nodo en la base de datos',
    'ERROR: No se pudo borrar el nodo en la base de datos'
];

//ATENCION: para agregar un serial, agregar entrada en tfondoprofile_adapter y en series;
var series = ['movilidad2015','sustentabilidad2015','innovacion2015','infraestructura2015','fondo9999'];

var seriales = {};

//ATENCION: revisar el criterio de seleccion de registro en setNodeCode()
var tfondoprofile_adapter = {
    movilidad:{
        serie: 'movilidad2015',
        base: 100000,
        prefix: 'FDO-MOV'
        },
    sustentabilidad:{
        serie: 'sustentabilidad2015',
        base: 100000,
        prefix: 'FDO-SUS'
        },
    movilidad:{
        serie: 'innovacion2015',
        base: 100000,
        prefix: 'FDO-INN'
        },
    movilidad:{
        serie: 'infraestructura2015',
        base: 100000,
        prefix: 'FDO-INF'
        },
     poromision: {
        serie: 'fondo9999',
        base: 100000,
        prefix: 'X'
    }

};

var loadSeriales = function(){
    for(var key in series){
        fetchserial(series[key]);
    }
};

var fetchserial = function(serie){
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

var addSerial = function(serial,data){
    seriales[serial] = data;
    //console.log('addSerial:fondoprofile.js INIT con exito: [%s] next:[%s]',seriales[serial].serie,seriales[serial].nextnum);
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

var updateSerialCollection = function(serial){
    var collection = dbi.collection(serialCol);    
    collection.update( {'_id':serial._id}, serial,{w:1},function(err,result){});
};


var setNodeCode = function(node){
    //console.log('setNodeCode:[%s]',node.tregistro);
    var adapter = tfondoprofile_adapter[node.tregistro] || tfondoprofile_adapter['poromision'];
    node.cnumber = nextSerial(adapter);

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

var addNewProfile = function(req, res, node, cb){
    //console.log("addNewProfile:fondosuscriptions.js ");

    setNodeCode(node);
    insertNewProfile(req, res, node, cb);
};


var fetchOne = function(query, cb) {
    console.log('findProfile Retrieving fondoprofile collection for passport');

    dbi.collection(fondosuscriptionsCol, function(err, collection) {
        collection.findOne(query, function(err, item) {
            cb(err, item);
        });
    });
};

var insertNewProfile = function (req, res, fondoprofile, cb){
    //console.log('insertNewProfile:fondosuscriptions.js BEGIN [%s]',fondoprofile.slug);
    //dbi.collection(fondosuscriptionsCol, function(err, collection) {

    dbi.collection(fondosuscriptionsCol).insert(fondoprofile,{w:1}, function(err, result) {
            if (err) {
                if(res){
                    res.send({'error':'An error has occurred'});
                }else if(cb){
                    cb({'error':'An error has occurred:' + err})
                }
            } else {
                if(res){
                    console.log('3.1. ADD: se inserto correctamente el nodo %s', JSON.stringify(result[0]));
                    res.send(result[0]);
                }else if(cb){
                    console.log('3.1. ADD: se inserto correctamente el nodo [%s]  [%s] ', result[0]['_id'], JSON.stringify(result[0]['_id'].str));
                    cb({'model':result[0]})
                }
            }
        });
    //});
};

exports.setDb = function(db) {
    //console.log('***** Profile setDB*******');
    dbi = db;
    loadSeriales();
    return this;
};

exports.setConfig = function(conf){
    return this;
};

exports.setBSON = function(bs) {
    BSON = bs;
    return this;
};

exports.findOne = function(req, res) {
    var query = req.body;


    var sort = {cnumber: 1};
    if (query.cnumber['$lt']) sort = {cnumber: -1};

    console.log('findONE:fondoprofile Retrieving fondoprofile collection with query [%s] sort:[%s]',query.cnumber, sort.cnumber);
 
    dbi.collection(fondosuscriptionsCol, function(err, collection) {
        collection.find   (query).sort(sort).toArray(function(err, items) {
            res.send(items[0]);
        });
    });
};

exports.fetchById = function(id, cb) {
    console.log('findById: Retrieving %s id:[%s]', fondosuscriptionsCol,id);
    dbi.collection(fondosuscriptionsCol, function(err, collection) {
        collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, item) {
            cb(err, item);
        });
    });
};

exports.findById = function(req, res) {
    var id = req.params.id;
    console.log('findById: Retrieving %s id:[%s]', fondosuscriptionsCol,id, req.user);
    dbi.collection(fondosuscriptionsCol, function(err, collection) {
        collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, item) {
            res.send(item);
        });
    });
};

exports.find = function(req, res) {
    var query = req.body; //{};

    console.log('find:fondoprofile Retrieving fondoprofile collection with query');

    dbi.collection(fondosuscriptionsCol, function(err, collection) {
        collection.find(query).sort({cnumber:1}).toArray(function(err, items) {
            res.send(items);
        });
    });
};

exports.findAll = function(req, res) {
    console.log('findAll: Retrieving all instances of [%s] collection', fondosuscriptionsCol);
    dbi.collection(fondosuscriptionsCol, function(err, collection) {
        collection.find().sort({cnumber:1}).toArray(function(err, items) {
            res.send(items);
        });
    });
};

exports.add = function(req, res) {
    console.log('add:fondoprofile.js: NEW RECEIPT BEGINS');
    var fondoprofile = req.body;
    addNewProfile(req, res, fondoprofile);
};

exports.update = function(req, res) {
    var id = req.params.id;
    var fondoprofile = req.body;
    delete fondoprofile._id;
    console.log('Updating node id:[%s] ',id);
    console.log(JSON.stringify(fondoprofile));
    dbi.collection(fondosuscriptionsCol, function(err, collection) {
        collection.update({'_id':new BSON.ObjectID(id)}, fondoprofile, {safe:true}, function(err, result) {
            if (err) {
                console.log('Error updating %s error: %s',fondosuscriptionsCol,err);
                res.send({error: MSGS[0] + err});
            } else {
                console.log('UPDATE: se insertaron exitosamente [%s] nodos',result);
                res.send(fondoprofile);
            }
        });
    });
};

var buildTargetNodes = function(data){
    if(!data.nodes) return;
    var list = [];
    var nodes = data.nodes;
    for (var i = 0; i<nodes.length; i++){
        var node = {};
        var id = nodes[i];

        console.log('buildTargetNodes: [%s] [%s]', id, typeof id);
        node._id = new BSON.ObjectID(id);
        list.push(node);
    }
    if(list.length){
        var query = {$or: list};
        return query
    }
};
var buildUpdateData = function(data){
    if(!data.newdata) return;
    return data.newdata;
};

var buildQuery = function(qr){
    var query = {}; 
    if(!qr) return query;
    if(qr.areas){
        query.$or = buildAreaList(qr.areas);
    }
    return query;
};
var buildAreaList = function(areas){
    return _.map(areas, function(item){
        return {area: item};

    });
}


exports.partialupdate = function(req, res) {
    if (req){
        data = req.body;
    }
    var query = buildTargetNodes(data);
    var update = buildUpdateData(data);


    console.log('UPDATING partial fields nodes:[%s]', query.$or[0]._id );
    //res.send({query:query, update:update});

    dbi.collection(fondosuscriptionsCol).update(query, {$set: update}, {safe:true, multi:true}, function(err, result) {
        if (err) {
            console.log('Error partial updating %s error: %s',fondosuscriptionsCol,err);
            if(res){
                res.send({error: MSGS[0] + err});
            }else if(cb){
                cb({error: MSGS[0] + err});
            }

        } else {
            console.log('UPDATE: partial update success [%s] nodos',result);
            if(res){
                res.send({result: result});
            }else if(cb){
                cb({result: result});
            }
        }
    })
};

exports.delete = function(req, res) {
    var id = req.params.id;
    console.log('Deleting node: [%s] ', id);
    dbi.collection(fondosuscriptionsCol, function(err, collection) {
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






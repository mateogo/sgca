/*
 *  calendar fondosuscriptions.js
 *  package: /calendar/controllers
 *  DOC: 'fondosuscriptions' collection controller
 *  Use:
 *     Exporta el objeto controller de un fondosuscription via 'exports'
 *     metodos exportados:
 *          open(); find(); findById; findAll; add(), update(); delete(); viewId
 *
 */ 
var path = require('path');
var rootPath = path.normalize(__dirname + '/../..');
var _ = require('underscore');
var dbi ;
var BSON;
var config = {};
var fondosuscriptionsCol = 'fondosuscriptions';
var serialCol = 'seriales';

var utils = require(rootPath + '/core/util/utils');


var MSGS = [
    'ERROR: No se pudo insertar el nodo en la base de datos',
    'ERROR: No se pudo borrar el nodo en la base de datos'
];

//ATENCION: para agregar un serial, agregar entrada en tfondoprofile_adapter y en series;
var series = ['movilidad2015','sustentabilidad2015','innovacion2015','infraestructura2015','fondo9999'];

var seriales = {};

//ATENCION: revisar el criterio de seleccion de registro en setNodeCode()
var tfondosuscription_adapter = {
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
    innovacion:{
        serie: 'innovacion2015',
        base: 100000,
        prefix: 'FDO-INN'
        },
    infraestructura:{
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
            item = initSerial(serie);

            collection.insert(item, {safe:true}, function(err, result) {
                if (err) {
                    console.log('Error initializing  [%s] error: %s',serialCol,err);
                } else {
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
    //console.log('addSerial:fondosuscription.js INIT con exito: [%s] next:[%s]',seriales[serial].serie,seriales[serial].nextnum);
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
    var adapter = tfondosuscription_adapter[node.tregistro] || tfondosuscription_adapter['poromision'];
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

    setNodeCode(node);
    insertNewProfile(req, res, node, cb);
};


var fetchOne = function(query, cb) {
    dbi.collection(fondosuscriptionsCol, function(err, collection) {
        collection.findOne(query, function(err, item) {
            cb(err, item);
        });
    });
};

var insertNewProfile = function (req, res, fondosuscription, cb){

    dbi.collection(fondosuscriptionsCol).insert(fondosuscription,{w:1}, function(err, result) {
            if (err) {
                if(res){
                    res.send({'error':'An error has occurred'});
                }else if(cb){
                    cb({'error':'An error has occurred:' + err})
                }
            } else {
                if(res){
                    res.send(result[0]);
                }else if(cb){
                    cb({'model':result[0]})
                }
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

exports.findOne = function(req, res) {
    var query = req.body;

    dbi.collection(fondosuscriptionsCol, function(err, collection) {
        collection.find(query).sort({cnumber:1}).toArray(function(err, items) {
            res.send(items[0]);
        });
    });
 
};

exports.fetchById = function(id, cb) {
    dbi.collection(fondosuscriptionsCol, function(err, collection) {
        collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, item) {
            cb(err, item);
        });
    });
};

exports.findById = function(req, res) {
    var id = req.params.id;
    dbi.collection(fondosuscriptionsCol, function(err, collection) {
        collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, item) {
            res.send(item);
        });
    });
};

exports.findByQuery = function(req, res) {
    var query = buildQuery(req.query); 
    var resultset;
    var itemcount = 0;
    var page = parseInt(req.query.page);
    var limit = parseInt(req.query.per_page);
    var cursor;
    ///// dummy
    //req.query.textsearch = 'altersoft';
    /////
    var textsearch = initTextSearch(req.query);

    //console.log('find:fondosuscription Retrieving fondosuscription collection with QUERY [%s] [%s]', page, limit);

    cursor = dbi.collection(fondosuscriptionsCol).find(query).sort({cnumber:1});
    if(textsearch){
        cursor.toArray(function(err, items){
            resultset = textFilter(textsearch, items);
            itemcount = resultset.length;
            //console.log('====RETURNING: [%s] page:[%s] limit: [%s] itemslength [%s] =========',resultset.length, (page-1)*limit, limit, items.length);
            res.send([{total_entries: itemcount}, resultset.splice((page-1) * limit, limit)  ]);
        });

    }else if(req.query){
        cursor.count(function(err, total){
            //console.log('CUrsor count: [%s]', total);
            cursor.skip((page-1) * limit).limit(limit).toArray(function(err, items){

                res.send([{total_entries: total}, items]);

            });
        })

    }else{
        cursor.toArray(function(err, items) {
                res.send(items);
        });
    }
};

var initTextSearch = function(query){
    if(!query || !query.textsearch) return null;

    return utils.safeName(query.textsearch);
}

var textFilter = function(textsearch, items){
    var rset = [];
    var querystr;
    var test;
    rset = _.filter(items, function(item){
        querystr = utils.safeName(item.responsable.edisplayName + item.responsable.ename + item.responsable.email + item.responsable.actividadppal + item.responsable.rname + item.movilidad.description + item.requerimiento.eventname );
        test = querystr.indexOf(textsearch) !== -1 ? true : false;
        return test;
    });
    return rset;
};


exports.find = function(req, res) {
    var query = req.body; //{};

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
    console.log('add:fondosuscription.js: NEW RECEIPT BEGINS');
    var fondosuscription = req.body;
    addNewProfile(req, res, fondosuscription);
};

exports.update = function(req, res) {
    var id = req.params.id;
    var fondosuscription = req.body;
    delete fondosuscription._id;
    console.log('Updating node id:[%s] ',id);
    console.log(JSON.stringify(fondosuscription));
    dbi.collection(fondosuscriptionsCol, function(err, collection) {
        collection.update({'_id':new BSON.ObjectID(id)}, fondosuscription, {safe:true}, function(err, result) {
            if (err) {
                console.log('Error updating %s error: %s',fondosuscriptionsCol,err);
                res.send({error: MSGS[0] + err});
            } else {
                console.log('UPDATE: se insertaron exitosamente [%s] nodos',result);
                res.send(fondosuscription);
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

// BUILD QUERY
var buildQuery = function(qr){
    var query = {},
        prov = [], 
        subc = {},
        subv = {},
        tmp = {},
        conditions = [];

    if(!qr) return query;


    if(qr.tsolicitud && qr.tsolicitud !== 'no_definido') conditions.push({'requerimiento.tsolicitud': qr.tsolicitud});
    if(qr.provincia && qr.provincia !== 'no_definido') conditions.push({'responsable.eprov': qr.provincia});
    if(qr.cnumber) conditions.push({cnumber: qr.cnumber});
    if(qr.evento) conditions.push({evento: qr.evento});

    if(qr.nivel_ejecucion && qr.nivel_ejecucion !== 'no_definido') conditions.push({nivel_ejecucion: qr.nivel_ejecucion});
    if(qr.estado_alta && qr.estado_alta !== 'no_definido'){ 
        conditions.push({estado_alta: qr.estado_alta});
    }else{
        conditions.push({estado_alta: 'activo'});
    }


    console.dir(conditions);


    query['$and'] = conditions;

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

    dbi.collection(fondosuscriptionsCol).update(query, {$set: update}, {safe:true, multi:true}, function(err, result) {
        if (err) {
            console.log('Error partial updating %s error: %s',fondosuscriptionsCol,err);
            if(res){
                res.send({error: MSGS[0] + err});
            }else if(cb){
                cb({error: MSGS[0] + err});
            }

        } else {
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






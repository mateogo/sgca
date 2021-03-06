/*
 *  calendar admrqsts.js
 *  package: /calendar/controllers
 *  DOC: 'admrqsts' collection controller
 *  Use:
 *     Exporta el objeto controller de un admrqst via 'exports'
 *     metodos exportados:
 *          open(); find(); findById; findAll; add(), update(); delete(); viewId
 *
 */
var dbi ;
var BSON;
var config = {};
var admrqstsCol = 'admrqsts';
var serialCol = 'seriales';
var MSGS = [
    'ERROR: No se pudo insertar el nodo en la base de datos',
    'ERROR: No se pudo borrar el nodo en la base de datos'
];

var series = ['admrqst101','admrqst999'];

var seriales = {};

//ATENCION: para agregar un serial, agregar entrada en trequest_adapter y en series;
var trequest_adapter = {
    tramitacion:{
        serie: 'admrqst101',
        base: 10000000,
        prefix: 'ST'
        },
    poromision: {
        serie: 'admrqst999',
        base: 10000000,
        prefix: 'X'
    }

};

var loadSeriales = function(){
    for(var key in series){
        fetchserial(series[key]);
    }
};

var fetchserial = function(serie){
    //console.log("INIT:fetchserie:adminrequest.js:[%s]",serie);
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
    //console.log('addSerial:adminrequest.js INIT con exito: [%s] next:[%s]',seriales[serial].serie,seriales[serial].nextnum);
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
    var adapter = trequest_adapter['tramitacion'] || trequest_adapter['poromision'];
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

var addNewAdminrequest = function(req, res, node, cb){
    console.log("addNewAdminrequest:admrqsts.js ");

    setNodeCode(node);
    
    insertNewAdminrequest(req, res, node, cb);
};


var fetchOne = function(query, cb) {
    //console.log('findAdminrequest Retrieving admrqst collection for passport');

    dbi.collection(admrqstsCol, function(err, collection) {
        collection.findOne(query, function(err, item) {
            cb(err, item);
        });
    });
};

var insertNewAdminrequest = function (req, res, admrqst, cb){
    //console.log('insertNewAdminrequest:admrqsts.js BEGIN [%s]',admrqst.slug);
    //dbi.collection(admrqstsCol, function(err, collection) {

    dbi.collection(admrqstsCol).insert(admrqst,{w:1}, function(err, result) {
            if (err) {
                if(res){
                    res.send({'error':'An error has occurred'});
                }else if(cb){
                    cb({'error':'An error has occurred'})
                }
            } else {
                if(res){
                    //console.log('3.1. ADD: se inserto correctamente el nodo %s', JSON.stringify(result[0]));
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

    var sort = {cnumber: 1};
    if (query.cnumber['$lt']) sort = {cnumber: -1};

    //console.log('findONE:admrqst Retrieving admrqst collection with query [%s] sort:[%s]',query.cnumber, sort.cnumber);
 
    dbi.collection(admrqstsCol, function(err, collection) {
        collection.find   (query).sort(sort).toArray(function(err, items) {
            res.send(items[0]);
        });
    });
};

exports.fetchById = function(id, cb) {
    console.log('findById: Retrieving %s id:[%s]', admrqstsCol,id);
    dbi.collection(admrqstsCol, function(err, collection) {
        collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, item) {
            cb(err, item);
        });
    });
};

exports.findByCnumber = function(req, res) {
    var cnumber = req.params.id;
    console.log('findByCnumber: Retrieving %s id:[%s]', admrqstsCol,cnumber);
    dbi.collection(admrqstsCol, function(err, collection) {
        collection.findOne({'cnumber':cnumber}, function(err, item) {
            res.send(item);
        });
    });
};

exports.findById = function(req, res) {
    var id = req.params.id;
    console.log('findById: Retrieving %s id:[%s]', admrqstsCol,id);
    dbi.collection(admrqstsCol, function(err, collection) {
        collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, item) {
            res.send(item);
        });
    });
};

exports.find = function(req, res) {
    var query = req.body; //{};
    //console.dir(query);

    dbi.collection(admrqstsCol).find(query).toArray(function(err, items) {
            res.send(items);
    });
};

exports.findAll = function(req, res) {
    //console.log('findAll: Retrieving all instances of [%s] collection', admrqstsCol);
    dbi.collection(admrqstsCol, function(err, collection) {
        collection.find().sort({cnumber:1}).toArray(function(err, items) {
            res.send(items);
        });
    });
};

exports.createNew = function(docum, cb) {
    //console.log('createNew:admrqst.js: NEW RECEIPT BEGINS');
    addNewAdminrequest(null, null, docum, cb);
};

exports.add = function(req, res) {
    //console.log('add:admrqst.js: NEW RECEIPT BEGINS');
    var admrqst = req.body;
    addNewAdminrequest(req, res, admrqst);
};

exports.update = function(req, res) {
    var id = req.params.id;
    var admrqst = req.body;
    delete admrqst._id;
    console.log('Updating node id:[%s] ',id);
    console.log(JSON.stringify(admrqst));
    dbi.collection(admrqstsCol, function(err, collection) {
        collection.update({'_id':new BSON.ObjectID(id)}, admrqst, {safe:true}, function(err, result) {
            if (err) {
                console.log('Error updating %s error: %s',admrqstsCol,err);
                res.send({error: MSGS[0] + err});
            } else {
                console.log('UPDATE: se insertaron exitosamente [%s] nodos',result);
                res.send(admrqst);
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
}

exports.partialupdate = function(req, res) {
    if (req){
        data = req.body;
    }
    var query = buildTargetNodes(data);
    var update = buildUpdateData(data);


    console.log('UPDATING partial fields nodes:[%s]', query.$or[0]._id );
    //res.send({query:query, update:update});

    dbi.collection(admrqstsCol).update(query, {$set: update}, {safe:true, multi:true}, function(err, result) {
        if (err) {
            console.log('Error partial updating %s error: %s',admrqstsCol,err);
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
    dbi.collection(admrqstsCol, function(err, collection) {
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


exports.importNewAdminrequest = function (data, cb){

    addNewAdminrequest(null, null, data, cb);
    //});
};



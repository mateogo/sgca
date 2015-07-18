/*
 *  calendar micainteractions.js
 *  package: /calendar/controllers
 *  DOC: 'micainteractions' collection controller
 *  Use:
 *     Exporta el objeto controller de un micainteraction via 'exports'
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
var micainteractionsCol = 'micainteractions';
var serialCol = 'seriales';

var utils = require(rootPath + '/core/util/utils');


var MSGS = [
    'ERROR: No se pudo insertar el nodo en la base de datos',
    'ERROR: No se pudo borrar el nodo en la base de datos'
];

//ATENCION: para agregar un serial, agregar entrada en tmicainteraction_adapter y en series;
var series = ['micarondas01','micarondas99'];

var seriales = {};

//ATENCION: revisar el criterio de seleccion de registro en setNodeCode()
var tmicainteraction_adapter = {
    solreunion:{
        serie: 'micarondas01',
        base: 100000,
        prefix: 'R'
        },
    poromision: {
        serie: 'micarondas99',
        base: 1000000,
        prefix: 'X'
    }

};

var loadSeriales = function(){
    for(var key in series){
        fetchserial(series[key]);
    }
};

var fetchserial = function(serie){
    //console.log("INIT:fetchserie:micainteraction.js:[%s]",serie);
    var collection = dbi.collection(serialCol);
    collection.findOne({'serie':serie}, function(err, item) {
        if(!item){
            console.log('INIT:fetchserial:serial not found: [%s]',serie);
            item = initSerial(serie);

            collection.insert(item, {safe:true}, function(err, result) {
                if (err) {
                    console.log('Error initializing  [%s] error: %s',serialCol,err);
                } else {
                    //console.log('NEW serial: se inserto nuevo [%s] [%s] nodos',serialCol,result);
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
    //console.log('addSerial:micainteraction.js INIT con exito: [%s] next:[%s]',seriales[serial].serie,seriales[serial].nextnum);
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
    var adapter = tmicainteraction_adapter[node.tregistro] || tmicainteraction_adapter['poromision'];
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
    //console.log("addNewProfile:micainteractions.js ");

    setNodeCode(node);
    insertNewProfile(req, res, node, cb);
};


var fetchOne = function(query, cb) {
    //console.log('findProfile Retrieving micainteraction collection for passport');

    dbi.collection(micainteractionsCol, function(err, collection) {
        collection.findOne(query, function(err, item) {
            cb(err, item);
        });
    });
};

var insertNewProfile = function (req, res, micainteraction, cb){
    //console.log('insertNewProfile:micainteractions.js BEGIN [%s]',micainteraction.slug);
    //dbi.collection(micainteractionsCol, function(err, collection) {

    dbi.collection(micainteractionsCol).insert(micainteraction,{w:1}, function(err, result) {
            if (err) {
                if(res){
                    res.send({'error':'An error has occurred'});
                }else if(cb){
                    cb({'error':'An error has occurred:' + err})
                }
            } else {
                if(res){
                    //console.log('3.1. ADD: se inserto correctamente el nodo %s', JSON.stringify(result[0]));
                    res.send(result[0]);
                }else if(cb){
                    //console.log('3.1. ADD: se inserto correctamente el nodo [%s]  [%s] ', result[0]['_id'], JSON.stringify(result[0]['_id'].str));
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
    config = conf;
    return this;
};

exports.setBSON = function(bs) {
    BSON = bs;
    return this;
};

exports.findOne = function(req, res) {
    var query = req.body;

    //console.log('findONE:micainteraction Retrieving micainteraction collection with query');

    dbi.collection(micainteractionsCol, function(err, collection) {
        collection.find(query).sort({cnumber:1}).toArray(function(err, items) {
            res.send(items[0]);
        });
    });
 
};

exports.fetchById = function(id, cb) {
    //console.log('findById: Retrieving %s id:[%s]', micainteractionsCol,id);
    dbi.collection(micainteractionsCol, function(err, collection) {
        collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, item) {
            cb(err, item);
        });
    });
};

exports.findById = function(req, res) {
    var id = req.params.id;
    //console.log('findById: Retrieving %s id:[%s]', micainteractionsCol,id, req.user);
    dbi.collection(micainteractionsCol, function(err, collection) {
        collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, item) {
            res.send(item);
        });
    });
};

exports.findByQuery = function(req, res) {
    //console.log('Query=====************=============[%s][%s]', req.query.page), req.page
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

    //console.log('find:micainteraction Retrieving micainteraction collection with QUERY [%s] [%s]', page, limit);

    cursor = dbi.collection(micainteractionsCol).find(query).sort({cnumber:1});
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
        querystr = utils.safeName(item.solicitante.edisplayName + item.solicitante.ename + item.solicitante.edescription);
        test = querystr.indexOf(textsearch) !== -1 ? true : false;
        return test;
    });
    return rset;
};


exports.find = function(req, res) {
    var query = req.body; //{};

    console.log('find:micainteraction Retrieving micainteraction collection with query');

    dbi.collection(micainteractionsCol, function(err, collection) {
        collection.find(query).sort({cnumber:1}).toArray(function(err, items) {
            res.send(items);
        });
    });
};

exports.findAll = function(req, res) {
    //console.log('findAll: Retrieving all instances of [%s] collection', micainteractionsCol);
    dbi.collection(micainteractionsCol, function(err, collection) {
        collection.find().sort({cnumber:1}).toArray(function(err, items) {
            res.send(items);
        });
    });
};

exports.add = function(req, res) {
    //console.log('add:micainteraction.js: NEW RECEIPT BEGINS');
    var micainteraction = req.body;
    addNewProfile(req, res, micainteraction);
};

exports.update = function(req, res) {
    var id = req.params.id;
    var micainteraction = req.body;
    delete micainteraction._id;
    dbi.collection(micainteractionsCol, function(err, collection) {
        collection.update({'_id':new BSON.ObjectID(id)}, micainteraction, {safe:true}, function(err, result) {
            if (err) {
                console.log('Error updating %s error: %s',micainteractionsCol,err);
                res.send({error: MSGS[0] + err});
            } else {
                //console.log('UPDATE: se insertaron exitosamente [%s] nodos',result);
                res.send(micainteraction);
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

        //console.log('buildTargetNodes: [%s] [%s]', id, typeof id);
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

    if(qr.rolePlaying && qr.rolePlaying !== 'no_definido'){
        if(qr.rolePlaying === 'comprador'){
            conditions.push({'comprador.rolePlaying.comprador': true});
        }else{
            conditions.push({'vendedor.rolePlaying.vendedor': true});
        }
    }
    if(qr.sector && qr.sector !== 'no_definido'){
        conditions.push({'$or': [{'comprador.cactividades': qr.sector}, {'vendedor.vactividades': qr.sector}] });

        if(qr.subsector && qr.subsector !== 'no_definido'){
            subc['comprador.sub_' + qr.sector + '.' + qr.subsector] = true;
            subv['vendedor.sub_' + qr.sector + '.' + qr.subsector] = true;
            conditions.push({'$or': [{'$and': [subc, {'comprador.cactividades': qr.sector}]}, {'$and': [subv, {'vendedor.vactividades': qr.sector}]} ]} );
        }
    }



    if(qr.provincia && qr.provincia !== 'no_definido') conditions.push({'solicitante.eprov': qr.provincia});
    if(qr.nivel_ejecucion && qr.nivel_ejecucion !== 'no_definido') conditions.push({nivel_ejecucion: qr.nivel_ejecucion});

    if(qr.cnumber) conditions.push({cnumber: qr.cnumber});
    if(qr.evento) conditions.push({evento: qr.evento});
    if(qr.rubro) conditions.push({rubro: qr.rubro});


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


    //console.log('UPDATING partial fields nodes:[%s]', query.$or[0]._id );
    //res.send({query:query, update:update});

    dbi.collection(micainteractionsCol).update(query, {$set: update}, {safe:true, multi:true}, function(err, result) {
        if (err) {
            console.log('Error partial updating %s error: %s',micainteractionsCol,err);
            if(res){
                res.send({error: MSGS[0] + err});
            }else if(cb){
                cb({error: MSGS[0] + err});
            }

        } else {
            //console.log('UPDATE: partial update success [%s] nodos',result);
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
    dbi.collection(micainteractionsCol, function(err, collection) {
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






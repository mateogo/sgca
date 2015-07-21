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
var micasuscriptionsCol = 'micasuscriptions';

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
    dbi.collection(micainteractionsCol).insert(micainteraction,{w:1}, function(err, result) {
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

    dbi.collection(micainteractionsCol, function(err, collection) {
        collection.find(query).sort({cnumber:1}).toArray(function(err, items) {
            res.send(items[0]);
        });
    });
 
};

exports.fetchById = function(id, cb) {
    dbi.collection(micainteractionsCol, function(err, collection) {
        collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, item) {
            cb(err, item);
        });
    });
};

exports.findById = function(req, res) {
    var id = req.params.id;
    dbi.collection(micainteractionsCol, function(err, collection) {
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

    dbi.collection(micainteractionsCol, function(err, collection) {
        collection.find(query).sort({cnumber:1}).toArray(function(err, items) {
            res.send(items);
        });
    });
};

exports.findAll = function(req, res) {
    dbi.collection(micainteractionsCol, function(err, collection) {
        collection.find().sort({cnumber:1}).toArray(function(err, items) {
            res.send(items);
        });
    });
};

exports.add = function(req, res) {
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


    dbi.collection(micainteractionsCol).update(query, {$set: update}, {safe:true, multi:true}, function(err, result) {
        if (err) {
            console.log('Error partial updating %s error: %s',micainteractionsCol,err);
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

exports.ranking = function(req, res) {
    var query = req.body; //{};

    dbi.collection(micasuscriptionsCol, function(err, collection) {
        collection.find(query).sort({cnumber:1}).toArray(function(err, profiles) {

            dbi.collection(micainteractionsCol, function(err, collection) {
                collection.find(query).sort({cnumber:1}).toArray(function(err, items) {

                    res.send(getRankedList(profiles, items));
                });
            });
        });
    });

};

var getRankedList = function(profiles, list){
    var output = normalizeProfiles(profiles);

    console.log('list: [%s]', list.length)

    _.each(list, function(item){
        sumarizedIteration(output, item);

    });

    
    return filterOutput(output);

};
var filterOutput = function(profiles){
    var filtered;
    filtered = _.filter(profiles, function(item){
        if(item.emisor_requests>0 || item.receptor_requests>0){
            return true;
        }else{
            return false;
        }


    })
    return filtered;
}

var sumarizedIteration = function(nprofiles, action){
    var emisor = _.find(nprofiles, function(item){
        return (action.emisor_inscriptionid == item.profileid );
    })
    if(emisor){
        emisor.emisor_requests = emisor.emisor_requests + 1;
        emisor.receptorlist.push(action.receptor_inscriptionid);
    }else{
    }

    var receptor = _.find(nprofiles, function(item){
        return (action.receptor_inscriptionid == item.profileid );
    })
    if(receptor){
        receptor.receptor_requests = receptor.receptor_requests + 1;
        receptor.emisorlist.push(action.emisor_inscriptionid);
    }else{
    }

};
var normalizeProfiles = function(profiles){
    var normalized, 
        profile;

    normalized = _.map(profiles, function(item, index){
        profile = {
            profileid: item._id,
            cnumber: item.cnumber,
            userid: item.user.userid,
            usermail: item.user.usermail,
            rname: item.responsable.rname,
            ename: item.solicitante.displayName,
            epais: item.solicitante.epais,
            eprov: item.solicitante.eprov,



            isvendedor: item.vendedor.rolePlaying.vendedor,
            vactividades: item.vendedor.vactividades,
            
            iscomprador: (item.comprador.rolePlaying.comprador && (item.nivel_ejecucion === 'comprador_aceptado')),
            vactividades: item.comprador.cactividades,
            
            nivel_ejecucion: item.nivel_ejecucion,
            estado_alta: item.estado_alta,


            emisor_requests: 0,
            receptor_requests: 0,
            emisorlist:[],
            receptorlist:[],

        };
        return profile;
    });

    _.each(normalized, function(item){
        console.log('[%s] [%s] [%s] v:[%s] c:[%s]', item._id, item.cnumber, item.rname, item.isvendedor, item.iscomprador);

    });
    return normalized;

};




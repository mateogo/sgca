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
var PONDERACION = 5;

var micainteractionsCol = 'micainteractions';
var micasuscriptionsCol = 'micasuscriptions';
var micarankingCol = 'micaranking';

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

    console.log('find: [%s]', micainteractionsCol)
    console.dir(query);

    dbi.collection(micainteractionsCol, function(err, collection) {
        collection.find(query).sort({cnumber:1}).toArray(function(err, items) {
            res.send(items);
        });
    });
};

exports.findAll = function(req, res) {

    console.log('findall: [%s]', micainteractionsCol)
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

// SUSCRIPTION QUERY
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
            if(qr.nivel_ejecucion === 'no_definido')
                conditions.push({$and: [{'comprador.rolePlaying.comprador': true}, {nivel_ejecucion: 'comprador_aceptado'}] } );
            else
                conditions.push({'comprador.rolePlaying.comprador': true} );
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
    if(qr.favorito && (qr.favorito == true || qr.favorito == "true") && qr.userid){
        var token = {};
        token[qr.userid+'.favorito'] =  true;
        conditions.push(token);
    }


    if(qr.receptor && qr.receptor == 1 && qr.userid){
        var token = {};
        token[qr.userid+'.receptor'] = {$gt: 0};
        conditions.push(token);
    }
    if(qr.emisor && qr.emisor == 1 && qr.userid){
        var token = {};
        token[qr.userid+'.emisor'] = {$gt: 0};
        conditions.push(token);
    }

 
    if(qr.provincia && qr.provincia !== 'no_definido') conditions.push({'solicitante.eprov': qr.provincia});

    if(qr.nivel_ejecucion && qr.nivel_ejecucion !== 'no_definido') conditions.push({nivel_ejecucion: qr.nivel_ejecucion});
    if(qr.estado_alta && qr.estado_alta !== 'no_definido'){ 
        conditions.push({estado_alta: qr.estado_alta});
    }else{
        conditions.push({estado_alta: 'activo'});
    }

    if(qr.cnumber) conditions.push({cnumber: qr.cnumber});
    if(qr.evento) conditions.push({evento: qr.evento});
    if(qr.rubro) conditions.push({rubro: qr.rubro});
    //console.dir(conditions);


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

/************************
 * RANKING ranking
 ************************/
// BUILD QUERY
var buildRankingQuery = function(qr){
    var query = {},
        prov = [], 
        subc = {},
        subv = {},
        tmp = {},
        lk = [],
        conditions = [];

    if(!qr) return query;

    // ======= OjO Caso especial =======
    if(qr.linkedlist){
        lk = _.map(qr.linkedlist, function(item){
            return BSON.ObjectID(item);
        });
        query['profileid'] = {$in: lk};
        return query;        
    }
    // ========= OjO =================

    if(qr.rolePlaying && qr.rolePlaying !== 'no_definido'){
        if(qr.rolePlaying === 'comprador'){
            conditions.push({'iscomprador': true});
        }else{
            conditions.push({'isvendedor': true});
        }
    }
    
    if(qr.sector && qr.sector !== 'no_definido'){
        conditions.push({'$or': [{'cactividades': qr.sector}, {'vactividades': qr.sector}] });

        if(qr.subsector && qr.subsector !== 'no_definido'){
            subc['csubact' + '.' + qr.subsector] = true;
            subv['vsubact' + '.' + qr.subsector] = true;
            conditions.push({'$or': [{'$and': [subc, {'cactividades': qr.sector}]}, {'$and': [subv, {'vactividades': qr.sector}]} ]} );
        }
    }

    if(qr.provincia && qr.provincia !== 'no_definido') conditions.push({'eprov': qr.provincia});

    if(qr.nivel_ejecucion && qr.nivel_ejecucion !== 'no_definido') conditions.push({nivel_ejecucion: qr.nivel_ejecucion});
    if(qr.estado_alta && qr.estado_alta !== 'no_definido'){ 
        conditions.push({estado_alta: qr.estado_alta});
    }else{
        conditions.push({estado_alta: 'activo'});
    }

    if(qr.cnumber) conditions.push({cnumber: qr.cnumber});
    //console.log('micainteractions#376');
    //console.dir(conditions);


    query['$and'] = conditions;

    return query;
};


exports.findRankingByQuery = function(req, res) {
    var query = buildRankingQuery(req.query); 
    var resultset;
    var itemcount = 0;
    var page = parseInt(req.query.page);
    var limit = parseInt(req.query.per_page);
    var cursor;
    ///// dummy
    //req.query.textsearch = 'altersoft';
    /////
    var textsearch = initTextSearch(req.query);

    // console.log('#538 ranking by query');
    // console.dir(query);


    cursor = dbi.collection(micarankingCol).find(query).sort([['peso', -1]]);
    if(textsearch){
        cursor.toArray(function(err, items){
            resultset = textFilter(textsearch, items);
            itemcount = resultset.length;
            //console.log('====RETURNING: [%s] page:[%s] limit: [%s] itemslength [%s] =========',resultset.length, (page-1)*limit, limit, items.length);
            res.send([{total_entries: itemcount}, resultset.splice((page-1) * limit, limit)  ]);
        });

    }else if(req.query){
        cursor.count(function(err, total){
            //console.log('Cursor count: [%s]', total);
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

// BUILD QUERY
var buildLinkedProfilesQuery = function(qr){
    var query = {},
        prov = [], 
        subc = {},
        subv = {},
        tmp = {},
        conditions = [];

    if(!qr) return null;
    if(!qr.profilelist) return null;


    query['$or'] = qr.prfilelist;

    return query;
};


exports.findLinkedProfiles = function(req, res) {
    var query = buildLinkedProfilesQuery(req.query); 
    var resultset;
    var itemcount = 0;
    var page = parseInt(req.query.page);
    var limit = parseInt(req.query.per_page);
    var cursor;
    ///// dummy
    //req.query.textsearch = 'altersoft';
    /////
    var textsearch = initTextSearch(req.query);
    if(!query){ 
        res.send([{total_entries: 0}, {}]);
        return;
    }



    cursor = dbi.collection(micarankingCol).find(query).sort({cnumber:1});
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

exports.rankingstats = function(req, res){
    console.log('RankingStats BEGIN')
    dbi.collection(micarankingCol).find().toArray(function(err, profiles) {
        console.log('profiles [%s] ', profiles.length)
        res.send(getStats(profiles));
    });


};
var initToken = function(){
    token = {
        total: {
            profiles: 0,
            vendedor:{
                total: 0,
                aescenicas: 0,
                audiovisual: 0,
                disenio: 0,
                editorial: 0,
                musica: 0,
                videojuegos: 0,
                sindato: 0,
            },
            comprador:{
                total: 0,
                aescenicas: 0,
                audiovisual: 0,
                disenio: 0,
                editorial: 0,
                musica: 0,
                videojuegos: 0,
                sindato: 0,
            },
            sinsector: 0,
        },
        aescenicas: {
            comprador: 0,
            vendedor: 0,
            comprador_unique_receptor: 0,
            comprador_unique_emisor: 0,
            vendedor_unique_receptor: 0,
            vendedor_unique_emisor: 0,
            comprador_total_receptor: 0,
            comprador_total_emisor: 0,
            vendedor_total_receptor: 0,
            vendedor_total_emisor: 0,
            comovendedor:{
                total: 0,
                aescenicas: 0,
                audiovisual: 0,
                disenio: 0,
                editorial: 0,
                musica: 0,
                videojuegos: 0,
                sindato: 0,
            },
        },
        audiovisual: {
            comprador: 0,
            vendedor: 0,
            comprador_unique_receptor: 0,
            comprador_unique_emisor: 0,
            vendedor_unique_receptor: 0,
            vendedor_unique_emisor: 0,
            comprador_total_receptor: 0,
            comprador_total_emisor: 0,
            vendedor_total_receptor: 0,
            vendedor_total_emisor: 0,
            comovendedor:{
                total: 0,
                aescenicas: 0,
                audiovisual: 0,
                disenio: 0,
                editorial: 0,
                musica: 0,
                videojuegos: 0,
                sindato: 0,
            },
        },
        disenio: {
            comprador: 0,
            vendedor: 0,
            comprador_unique_receptor: 0,
            comprador_unique_emisor: 0,
            vendedor_unique_receptor: 0,
            vendedor_unique_emisor: 0,
            comprador_total_receptor: 0,
            comprador_total_emisor: 0,
            vendedor_total_receptor: 0,
            vendedor_total_emisor: 0,
            comovendedor:{
                total: 0,
                aescenicas: 0,
                audiovisual: 0,
                disenio: 0,
                editorial: 0,
                musica: 0,
                videojuegos: 0,
                sindato: 0,
            },
        },
        editorial: {
            comprador: 0,
            vendedor: 0,
            comprador_unique_receptor: 0,
            comprador_unique_emisor: 0,
            vendedor_unique_receptor: 0,
            vendedor_unique_emisor: 0,
            comprador_total_receptor: 0,
            comprador_total_emisor: 0,
            vendedor_total_receptor: 0,
            vendedor_total_emisor: 0,
            comovendedor:{
                total: 0,
                aescenicas: 0,
                audiovisual: 0,
                disenio: 0,
                editorial: 0,
                musica: 0,
                videojuegos: 0,
                sindato: 0,
            },
        },
        musica: {
            comprador: 0,
            vendedor: 0,
            comprador_unique_receptor: 0,
            comprador_unique_emisor: 0,
            vendedor_unique_receptor: 0,
            vendedor_unique_emisor: 0,
            comprador_total_receptor: 0,
            comprador_total_emisor: 0,
            vendedor_total_receptor: 0,
            vendedor_total_emisor: 0,
            comovendedor:{
                total: 0,
                aescenicas: 0,
                audiovisual: 0,
                disenio: 0,
                editorial: 0,
                musica: 0,
                videojuegos: 0,
                sindato: 0,
            },
        },
        videojuegos: {
            comprador: 0,
            vendedor: 0,
            comprador_unique_receptor: 0,
            comprador_unique_emisor: 0,
            vendedor_unique_receptor: 0,
            vendedor_unique_emisor: 0,
            comprador_total_receptor: 0,
            comprador_total_emisor: 0,
            vendedor_total_receptor: 0,
            vendedor_total_emisor: 0,
            comovendedor:{
                total: 0,
                aescenicas: 0,
                audiovisual: 0,
                disenio: 0,
                editorial: 0,
                musica: 0,
                videojuegos: 0,
                sindato: 0,
            },
        },
        sindato: {
            comprador: 0,
            vendedor: 0,
            comprador_unique_receptor: 0,
            comprador_unique_emisor: 0,
            vendedor_unique_receptor: 0,
            vendedor_unique_emisor: 0,
            comprador_total_receptor: 0,
            comprador_total_emisor: 0,
            vendedor_total_receptor: 0,
            vendedor_total_emisor: 0,
            comovendedor:{
                total: 0,
                aescenicas: 0,
                audiovisual: 0,
                disenio: 0,
                editorial: 0,
                musica: 0,
                videojuegos: 0,
                sindato: 0,
            },
        },
    }
    return token;
};

var buildStats = function(profile, stats){
    var vendedor,
        actividad;
    if(!profile.cactividades) profile.cactividades = 'sindato';
    if(!profile.vactividades) profile.vactividades = 'sindato';

    stats.total.profiles += 1;

    if(profile.iscomprador){
        actividad = profile.cactividades
        stats['total']['comprador']['total'] += 1;
        stats['total']['comprador'][actividad] += 1;

        stats[actividad]['comprador'] += 1

        if(profile.isvendedor){
            stats[actividad]['comovendedor'][profile.vactividades] += 1;
            stats[actividad]['comovendedor']['total'] += 1;
        }
        if(profile.emisor_requests){
            stats[actividad]['comprador_unique_emisor'] += 1;
            stats[actividad]['comprador_total_emisor'] += profile.emisor_requests;
        }
        if(profile.receptor_requests){
            stats[actividad]['comprador_unique_receptor'] += 1;
            stats[actividad]['comprador_total_receptor'] += profile.receptor_requests;
        }

    }else if(profile.isvendedor){
        actividad = profile.vactividades

        stats['total']['vendedor']['total'] += 1;
        stats['total']['vendedor'][actividad] += 1;

        stats[actividad]['vendedor'] += 1

        if(profile.emisor_requests){
            stats[actividad]['vendedor_unique_emisor'] += 1;
            stats[actividad]['vendedor_total_emisor'] += profile.emisor_requests;
        }
        if(profile.receptor_requests){
            stats[actividad]['vendedor_unique_receptor'] += 1;
            stats[actividad]['vendedor_total_receptor'] += profile.receptor_requests;
        }

    }else{
        stats['total']['sinsector'] += 1;
    }
}

var getStats = function(profiles){
    var stats = initToken();
    console.log('getStats BEGIN')

    _.each(profiles, function(profile){
        console.log('proflie iteration [%s]', profile.cnumber)
        buildStats(profile, stats);
    });

    return stats;
};


// Genera la colección rankeada
exports.buildranking = function(req, res) {
    var query = req.body; //{};

    dbi.collection(micasuscriptionsCol, function(err, collection) {
        collection.find(query).sort({cnumber:1}).toArray(function(err, profiles) {

            dbi.collection(micainteractionsCol, function(err, collection) {
                collection.find().sort({cnumber:1}).toArray(function(err, items) {

                    getRankedList(profiles, items, res);

                });
            });
        });
    });

};

var getRankedList = function(profiles, interactionList, res){
    var normalizedProfiles = normalizeProfiles(profiles);

    _.each(interactionList, function(interaction){
        sumarizedIteration(normalizedProfiles, interaction);

    });

    saveProfiles(normalizedProfiles, res);
    //return normalizedProfiles;
};
var saveProfiles = function(profiles, res){
    var collection = dbi.collection(micarankingCol);
    collection.remove({}, function(err, result){
        collection.insert(profiles, {w:1}, function(err, result) {
            if (err) {
                console.log('ERROR INSERTING save profiles:[%s]', err);
                res.send({error: err});
            } else {
                res.send({result: result.length, profiles: profiles.length });
            }
        });        
    });
};

var addReceptorToList = function(profile, interaction){
    // Lista en la que el profile le SOLICITA reunión a un cierto RECEPTOR
    var token = {
        receptor_rol:            interaction.receptor_rol,
        receptor_inscriptionid:  interaction.receptor_inscriptionid,
        receptor_displayName:    interaction.receptor_displayName,
        receptor_slug:           interaction.receptor_slug,
        receptor_nivel_interes:  interaction.receptor_nivel_interes,

        emisor_rol:              interaction.emisor_rol,
        emisor_slug:             interaction.emisor_slug,
        emisor_nivel_interes:    interaction.emisor_nivel_interes,

        meeting_id:              (interaction.meeting_id || 0),
        meeting_number:          (interaction.meeting_number || 0),
        meeting_estado:          (interaction.meeting_estado || 'no_definido'),
 
    };
    profile.receptorlist.push(token);
};

var addEmisorToList = function(profile, interaction){
    // Lista en la que el profile RECIBE pedido de reunión a un cierto EMISOR
    var token = {
        emisor_rol:             interaction.emisor_rol,
        emisor_inscriptionid:   interaction.emisor_inscriptionid,
        emisor_displayName:     interaction.emisor_displayName,
        emisor_slug:            interaction.emisor_slug,
        emisor_nivel_interes:   interaction.emisor_nivel_interes,
 
        receptor_rol:           interaction.receptor_rol,
        receptor_slug:          interaction.receptor_slug,
        receptor_nivel_interes: interaction.receptor_nivel_interes,
 
        meeting_id:             (interaction.meeting_id || 0),
        meeting_number:         (interaction.meeting_number || 0),
        meeting_estado:         (interaction.meeting_estado || 'no_definido'),
    };

    profile.emisorlist.push(token);
};

var sumarizedIteration = function(profileList, interaction){
    var emisorProfile = _.find(profileList, function(profile){
        return (interaction.emisor_inscriptionid == profile.profileid );
    })
    if(emisorProfile){
        emisorProfile.emisor_requests = emisorProfile.emisor_requests + 1;
        addReceptorToList(emisorProfile, interaction);
        emisorProfile.peso = emisorProfile.peso + 1;

    }else{
        //console.log('Emisor No Encontrado [%s]',interaction.emisor_inscriptionid)
    }

    var receptorProfile = _.find(profileList, function(profile){
        return (interaction.receptor_inscriptionid == profile.profileid );
    })
    if(receptorProfile){
        receptorProfile.receptor_requests = receptorProfile.receptor_requests + 1;
        //receptor.emisorlist.push(interaction.emisor_inscriptionid);
        addEmisorToList(receptorProfile, interaction);
        receptorProfile.peso = receptorProfile.peso + (1 * PONDERACION);
    }else{
    }

};

var filterProfiles = function(profiles){
    var filtered;

    filtered = _.filter(profiles, function(item, index){
        if(!item.cnumber || !item.user || !item.comprador || !item.vendedor || !item.estado_alta || !item.nivel_ejecucion || !item.responsable || !item.solicitante){
            return false;
        }
        if(item.estado_alta !== 'activo') return false;

        return true;

    });
    return filtered;
};

var normalizeProfiles = function(profiles){
    var normalized, 
        profile;

    profiles = filterProfiles(profiles);

    normalized = _.map(profiles, function(item, index){
        //console.log('iterating#446: [%s] [%s] [%]', item._id, item.cnumber, item.user);
        profile = {
            profileid: item._id,
            cnumber: item.cnumber,
            userid: item.user.userid,
            rname: item.responsable.rname,
            rmail:  item.responsable.rmail,
            rcel:  item.responsable.rcel,

            ename: item.solicitante.edisplayName,
            epais: item.solicitante.epais,
            eprov: item.solicitante.eprov,

            isvendedor: item.vendedor.rolePlaying.vendedor,
            vactividades: item.vendedor.vactividades,
            vsubact: item.vendedor['sub_' + item.vendedor.vactividades] || {},
            vporfolios: item.vendedor.vporfolios.length,
            vexperienciaintl: item.vendedor.vexperienciaintl,
            
            iscomprador: (item.comprador.rolePlaying.comprador && (item.nivel_ejecucion === 'comprador_aceptado')),
            cactividades: item.comprador.cactividades,
            csubact: item.comprador['sub_' + item.comprador.cactividades] || {},
            cporfolios: item.comprador.cporfolios.length,
            cexperienciaintl: item.comprador.cexperienciaintl,
            
            nivel_ejecucion: item.nivel_ejecucion,
            estado_alta: item.estado_alta,

            emisor_requests: 0,
            receptor_requests: 0,
            peso: 10000,
            emisorlist:[],
            receptorlist:[],
        };
        return profile;
    });

    return normalized;
};



//deprecated
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
};

var isVendedor = function(item){
    return (item.vendedor.rolePlaying.vendedor  && item.estado_alta === 'activo');
};

var isComprador = function(item){
    return (item.comprador.rolePlaying.comprador && (item.nivel_ejecucion === 'comprador_aceptado') && (item.estado_alta === 'activo'));
};





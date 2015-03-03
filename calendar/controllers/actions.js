/*
 *  calendar actions.js
 *  package: /calendar/controllers
 *  DOC: 'actions' collection controller
 *  Use:
 *     Exporta el objeto controller de un action via 'exports'
 *     metodos exportados:
 *          open(); find(); findById; findAll; add(), update(); delete(); viewId
 *
 */
var _ = require('underscore');
var async = require('async');
var ObjectID = require('mongodb').ObjectID;

var path = require('path');
var rootPath = path.normalize(__dirname + '/../..');

var persons = require(rootPath + '/calendar/controllers/persons.js');


var dbi ;
var BSON;
var config = {};
var actionsCol = 'actions';
var budgetsCol = 'budgets';
var serialCol = 'seriales';

var _ = require('underscore');


var MSGS = [
    'ERROR: No se pudo insertar el nodo en la base de datos',
    'ERROR: No se pudo borrar el nodo en la base de datos'
];

//ATENCION: para agregar un serial, agregar entrada en taction_adapter y en series;
var series = ['action101','action102','action103'];

var seriales = {};

//ATENCION: para agregar un serial, agregar entrada en taction_adapter y en series;
var taction_adapter = {
    accion:{
        serie: 'action101',
        base: 1000000,
        prefix: 'A'
        },
    programa:{
        serie: 'action102',
        base: 1000000,
        prefix: 'P'
        },
    actividad: {
        serie: 'action103',
        base: 1000000,
        prefix:'T'
        },
    poromision: {
        serie: 'action999',
        base: 1000000,
        prefix: 'X'
    }

};

var API = {
    update: function(action,cb){
      if(!action || !action._id){
        cb('action _id not found');
        return;
      }
      var id = action._id;
      delete action._id;
      console.log('Updating node id:[%s] ',id);
      console.log(JSON.stringify(action));
      dbi.collection(actionsCol, function(err, collection) {
          collection.update({'_id':new BSON.ObjectID(id)}, action, {safe:true},cb);
      });
    }
};

var loadSeriales = function(){
    for(var key in series){
        fetchserial(series[key]);
    }
};

var fetchserial = function(serie){
    //console.log("INIT:fetchserie:action.js:[%s]",serie);
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
    //console.log('addSerial:action.js INIT con exito: [%s] next:[%s]',seriales[serial].serie,seriales[serial].nextnum);
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
    var adapter = taction_adapter[node.tregistro] || taction_adapter['poromision'];
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

var addNewAction = function(req, res, node, cb){
    //console.log("addNewAction:actions.js ");

    setNodeCode(node);
    insertNewAction(req, res, node, cb);
};


var fetchOne = function(query, cb) {
    console.log('findAction Retrieving action collection for passport');

    dbi.collection(actionsCol, function(err, collection) {
        collection.findOne(query, function(err, item) {
            cb(err, item);
        });
    });
};

var insertNewAction = function (req, res, action, cb){
    //console.log('insertNewAction:actions.js BEGIN [%s]',action.slug);
    //dbi.collection(actionsCol, function(err, collection) {

    dbi.collection(actionsCol).insert(action,{w:1}, function(err, result) {
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


var participantManager = {
    /**
     * verifica que no exista otro persons que tenga el mismo value para field
     * @param {String} field - nombre el campo
     * @param {string} value - valor
     * @param {String} idPerson - id de la persona que quiere ese field:valor
     * @param {fucntion} cb - callback
     */ 
    _checkUniqueField: function(field,value,idPerson,cb){
      var query = {$and:[]};
      var t = {};
      t[field] = value;
      query.$and.push(t);
      query.$and.push({'_id':{'$ne':new BSON.ObjectID(idPerson)}});
      
      persons.api.find(query,function(err,items){
        if(err) return cb(err);
        
        var ok = (items && items.length === 0);
        
        if(ok){
          cb(null);  
        }else{
          cb({error:{code:'repeated_field','field':field,description:'Ya existe otra persona con ('+field +':'+value+')'}});
        }
      });
    },
    
    _validate: function(participant,action,cb){
      
      var idPerson = participant.person_id;
      
      async.series([
                    function(callback){
                      if(participant.email && participant.email.trim() !== ''){
                        participantManager._checkUniqueField('email', participant.email, idPerson, callback);
                      }else{
                        callback(null);
                      }
                    },
                    function(callback){
                      participantManager._checkUniqueField('nickName', participant.nickName, idPerson, callback);
                    }
                  ],
                  cb);
    },
    
    _registerPerson: function(participant,cb){
      var rawObj = _.clone(participant);
      rawObj = _.omit(rawObj,'id','vip');
      if(typeof (rawObj.person_id) !== 'undefined'){
        rawObj._id = rawObj.person_id;
        delete rawObj.person_id;
      }
      
      persons.api.update(rawObj,function(err,r){
        if(err) return cb(err);
        
        if(r._id){
          participant.person_id = r._id;
        }
        cb(null,r);
      });
    },
    
    _saveParticipant: function(participant,action,cb){
      if(!participant || !participant.person_id){
        return cb('participante no tiene person asociado');
      }
      
      if(!action.participants){
        action.participants = [];
      }
      
      var pos = _.findIndex(action.participants,{person_id:participant.person_id});
      if(pos >-1){
        action.participants[pos] = participant;
      }else{
        action.participants.push(participant);
      }
      
      API.update(action,function(err,r){
        if(err) return cb(err);
        
        cb(null,participant);
      });
    },
    
    
    /**
     * Agrega o actualiza un participante para una accion determinada
     * @param {String} idAction
     * @param {Entities.ActionParticipant} participant
     * @param {Function} cb - callback
     */
    addParticipant: function(idAction,participant,cb){
      console.log('MAN idAccion '+idAction);
      //trae accion
      
      var action;
      async.series([
            // busca el action
            function(callback){
              exports.fetchById(idAction,function(err,actionResult){
                if(err) return callback(err,null);
                
                action = actionResult;
                callback();
              });
            },
            
            //valida a un participante, verifica que no se repita email ni nickName
            function(callback){
              participantManager._validate(participant,action,callback);
            },
            
            //resgistra al participante en person
            function(callback){
              participantManager._registerPerson(participant,callback);
            },
            
            //se guarda el participante en actions
            function(callback){
              participantManager._saveParticipant(participant,action,callback);
            }
      ],
      function(err,results){
          if(err) return cb(err);
          
          var saved = results[results.length-1];
          cb(null,saved);
      });
    }
};


var locationManager = {
    _save: function(location,action,cb){
      
      if(!action.locations){
        action.locations = [];
      }
      
      id = location.id;
      if(!id){
        location.id = new BSON.ObjectID();
      }
       
      var pos = -1;
      for (var i = 0; i < action.locations.length && pos === -1; i++) {
        var item = action.locations[i];
        if(item.id == id){
          pos = i;
        }
      }
      if(pos >-1){
        action.locations[pos] = location;
      }else{
        action.locations.push(location);
      }
      
      API.update(action,function(err,r){
        if(err) return cb(err);
        
        cb(null,location);
      });
    },
    addLocation: function(idAction,location,cb){
      console.log('MAN idAccion '+idAction);
      //trae accion
      
      var action;
      async.series([
            // busca el action
            function(callback){
              exports.fetchById(idAction,function(err,actionResult){
                if(err) return callback(err,null);
                
                action = actionResult;
                callback();
              });
            },
            
            //se guarda el location en actions
            function(callback){
              locationManager._save(location,action,callback);
            }
      ],
      function(err,results){
          if(err) return cb(err);
          
          var saved = results[results.length-1];
          cb(null,saved);
      });
    }
};

exports.setDb = function(db) {
    //console.log('***** Action setDB*******');
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

    console.log('findONE:action Retrieving action collection with query [%s] sort:[%s]',query.cnumber, sort.cnumber);
 
    dbi.collection(actionsCol, function(err, collection) {
        collection.find   (query).sort(sort).toArray(function(err, items) {
            res.send(items[0]);
        });
    });
};

exports.fetchById = function(id, cb) {
    console.log('findById: Retrieving %s id:[%s]', actionsCol,id);
    dbi.collection(actionsCol, function(err, collection) {
        collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, item) {
            cb(err, item);
        });
    });
};

exports.findById = function(req, res) {
    var id = req.params.id;
    console.log('findById: Retrieving %s id:[%s]', actionsCol,id, req.user);
    dbi.collection(actionsCol, function(err, collection) {
        collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, item) {
            res.send(item);
        });
    });
};

exports.find = function(req, res) {
    var query = req.body; //{};

    console.log('find:action Retrieving action collection with query');

    dbi.collection(actionsCol, function(err, collection) {
        collection.find(query).sort({cnumber:1}).toArray(function(err, items) {
            res.send(items);
        });
    });
};

exports.findAll = function(req, res) {
    console.log('findAll: Retrieving all instances of [%s] collection', actionsCol);
    dbi.collection(actionsCol, function(err, collection) {
        collection.find().sort({cnumber:1}).toArray(function(err, items) {
            res.send(items);
        });
    });
};

exports.createNew = function(docum, cb) {
    console.log('createNew:action.js: NEW RECEIPT BEGINS');
    addNewAction(null, null, docum, cb);
};

exports.add = function(req, res) {
    console.log('add:action.js: NEW RECEIPT BEGINS');
    var action = req.body;
    addNewAction(req, res, action);
};

exports.update = function(req, res) {
    var id = req.params.id;
    var action = req.body;
    delete action._id;
    console.log('Updating node id:[%s] ',id);
    console.log(JSON.stringify(action));
    dbi.collection(actionsCol, function(err, collection) {
        collection.update({'_id':new BSON.ObjectID(id)}, action, {safe:true}, function(err, result) {
            if (err) {
                console.log('Error updating %s error: %s',actionsCol,err);
                res.send({error: MSGS[0] + err});
            } else {
                console.log('UPDATE: se insertaron exitosamente [%s] nodos',result);
                res.send(action);
            }
        });
    });
};

var buildTargetNodes = function(data){
    var list = [], 
        query,
        nodes;
    if(!data.nodes) return;

    nodes = data.nodes;
    for (var i = 0; i<nodes.length; i++){

        list.push({_id: new BSON.ObjectID(nodes[i]) });
    }
    if(list.length){
        query = {$or: list};
        return query
    }
};
var buildUpdateData = function(data){
    if(!data.newdata) return;
    return data.newdata;
};


exports.fetchActionBudgetCol = function(req, res){
    var resultCol,
        query = buildQuery(req.body);

    console.log('fetchActionBudgetCol BEGIN')
    console.dir(query);

    dbi.collection(actionsCol).find(query).sort({cnumber:1}).toArray(function(err, actItems) {
        dbi.collection(budgetsCol).find().sort({owner_id:1}).toArray(function(err, budItems) {
            resultCol = loadActionBudgetCol(actItems, budItems);
            res.send(resultCol);
        });
    });
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

var loadActionBudgetCol = function(actions, budgets){
    var resultCol = [],
        budgetsGroup = _.groupBy(budgets, 'owner_id');

    _.each(actions, function(action){
        _.each(budgetsGroup[action._id], function(budget){
            budget.parent_action = action;
            resultCol.push(budget);
        });

    })

    console.log('resultCol leng[%s]', resultCol.length);
    return resultCol;
};



exports.partialupdate = function(req, res) {
    if (req){
        data = req.body;
    }
    var query = buildTargetNodes(data);
    var update = buildUpdateData(data);


    console.log('UPDATING partial fields nodes:[%s]', query.$or[0]._id );
    dbi.collection(actionsCol).update(query, {$set: update}, {safe:true, multi:true}, function(err, result) {
        if (err) {
            console.log('Error partial updating %s error: %s',actionsCol,err);
            res.send({error: MSGS[0] + err});
 
        } else {
            console.log('UPDATE: partial update success [%s] nodos',result);
            res.send({result: result});
        }
    })
};

exports.delete = function(req, res) {
    var id = req.params.id;
    console.log('Deleting node: [%s] ', id);
    dbi.collection(actionsCol, function(err, collection) {
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

exports.addParticipant = function(req,res){
  var idAction  = req.params.id;
  var participant = req.body;
  
  participantManager.addParticipant(idAction,participant,function(err,response){
    if(err){
      res.send(err);
    }else{
      res.send(response);
    }
  });
};

exports.addLocation = function(req,res){
  var idAction  = req.params.id;
  var location = req.body;
  
  locationManager.addLocation(idAction,location,function(err,response){
    if(err) return res.send(err);
    
    res.send(response);
  });
};


/*
var fetchActions = function(query, cb) {
    console.log('fetchActions: retrieven Actions Col');

    dbi.collection(actionsCol, function(err, collection) {
        collection.find(query).sort({cnumber:1}).toArray(function(err, items) {
            cb(items);
        });
    });
};

var buildActionBudgetCol = function(query, cb){
    fetchActions(query, function(actionsCol){
        

    });

};

*/
exports.importNewAction = function (data, cb){

    addNewAction(null, null, data, cb);
    //});
};
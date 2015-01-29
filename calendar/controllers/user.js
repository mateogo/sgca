/*
 *  calentdar users.js
 *  package: /calendar/controllers
 *  DOC: 'articlos' collection controller
 *  Use:
 *     Exporta el objeto controller de un usero via 'exports'
 *     metodos exportados:
 *          open(); find(); findById; findAll; add(), update(); delete(); viewId
 *
 * Todo: cachear los usuarios activos para no leer de la base de datos en cada acceso.
    Ojo: Administrar el cache: ver c´mo

 */

var path = require('path');
var rootPath = path.normalize(__dirname + '/../..');

var utils = require(rootPath + '/core/util/utils');
var anyw  = require(rootPath + '/calendar/controllers/anyw');

var bcrypt = require('bcrypt-nodejs');
var salt = bcrypt.genSaltSync(12);

var dbi ;
var BSON;
var config = {};
var usersCol = 'users';
var serialCol = 'seriales';
var MSGS = [
    'ERROR: No se pudo insertar el nodo en la base de datos',
    'ERROR: No se pudo borrar el nodo en la base de datos'
];

var userlist = {};
var getUserFromList = function(id){
    return userlist[id];
};
var deleteUserFromList = function(id){
    if(getUserFromList(id)){
        delete userlist[id];
    }
};

var setUserInList = function(id, user){
    console.log('updating USERLIST [%s] [%s]',user._id, user.username);
    userlist[id] = user;
};

var addNewUser = function(req, res, node){
    console.log("addNewUser:users.js ");
		//add encrypted hash to password
    node.password = bcrypt.hashSync(node.password, salt);
    insertNewUser(req,res,node);
};


var insertNewUser = function (req, res, user){
    console.log('insertNewUser:users.js BEGIN [%s]',user.username);
    //dbi.collection(usersCol, function(err, collection) {

    dbi.collection(usersCol).insert(user,{w:1}, function(err, result) {
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


exports.findOne = function(query, cb) {
    //console.log('findUser Retrieving user collection for passport');
    console.log("user/findOne [%s] [%s]", query, utils.anywModule());

    dbi.collection(usersCol, function(err, collection) {
        collection.findOne(query, function(err, item) {
            cb(err, item);
        });
    });
};

exports.comparePassword = function(currentUser, candidatePassword, cb) {
  bcrypt.compare(candidatePassword, currentUser, function(err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

exports.fetchById = function(id, cb) {
    //console.log('findById: Retrieving %s id:[%s]', usersCol,id);
    var user = getUserFromList(id);
    if(user){
        //console.log('findById: USER FOUND in USER LIST');
        cb(null,user);
    } else {
        dbi.collection(usersCol, function(err, collection) {
            collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, item) {
                console.log('findById: db findOne [%s]',item._id);
                if(utils.anywModule()){
                    anyw.auth(item.displayName, item.password, function(token){
                        item.anyw_token = token;
                        console.log('findById: Token [%s]',item.anyw_token);
                        setUserInList(id,item);
                        cb(err, item);
                    });
                }else{
                    setUserInList(id,item);
                    cb(err, item);
                }
            });
        });
    }
};

exports.findById = function(req, res) {
    var id = req.params.id;
    //console.log('findById: Retrieving %s id:[%s]', usersCol,id);
    dbi.collection(usersCol, function(err, collection) {
        collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, item) {
            res.send(item);
        });
    });
};

exports.findCurrentUser = function(req, res) {
    var user = req.user;
    //console.log('findCurrentUser [%s]',user.username);
    res.send(user);


};

exports.find = function(req, res) {
    var query = req.body; //{};

    //console.log('find:user Retrieving user collection with query [%s]',query['es_usuario_de.id']);
    dbi.collection(usersCol, function(err, collection) {
        collection.find(query).sort({username:1}).toArray(function(err, items) {
            //console.log('recuperados [%s]',items.length)
            res.send(items);
        });
    });
};

exports.findAll = function(req, res) {
    //console.log('findAll: Retrieving all instances of [%s] collection', usersCol);
    dbi.collection(usersCol, function(err, collection) {
        collection.find().sort({username:1}).toArray(function(err, items) {
            res.send(items);
        });
    });
};

exports.add = function(req, res) {
    console.log('add:user.js: NEW USER BEGINS');
    var user = req.body;
    addNewUser(req, res, user);
};

exports.update = function(req, res) {
    var id = req.params.id;
    var user = req.body;
    delete user._id;
    //console.log('UPDATING node id:[%s] ',id);
    //console.log(JSON.stringify(user));

    if(user.password){
        if(user.password.length < 15){
            user.password = bcrypt.hashSync(user.password, salt);
        }
    }

    dbi.collection(usersCol, function(err, collection) {
        collection.update({'_id':new BSON.ObjectID(id)}, user, {safe:true}, function(err, result) {
            if (err) {
                console.log('Error updating %s error: %s',usersCol,err);
                res.send({error: MSGS[0] + err});
            } else {
                console.log('UPDATE: se insertaron exitosamente [%s] nodos',result);
                user._id = id;
                setUserInList(id, user);
                res.send(user);
            }
        });
    });
};


exports.partialupdate = function(req, res) {
    if (req){
        data = req.body;
    }
    var query = buildTargetNodes(data);
    var update = buildUpdateData(data);

    console.log('UPDATING partial fields nodes:[%s]', query.$or[0]._id);
    dbi.collection(usersCol).update(query, {$set: update}, {safe:true, multi:true}, function(err, result) {
        if (err) {
            console.log('Error partial updating %s error: %s',usersCol,err);
            res.send({error: MSGS[0] + err});

        } else {
            console.log('UPDATE: partial update success [%s] nodos',result);
            res.send({result: result});
        }
    })
};

var buildTargetNodes = function(data){
    var list = [], 
        query,
        nodes;
    if(!data.nodes) return;

    nodes = data.nodes;
    for (var i = 0; i<nodes.length; i++){

        list.push({_id: new BSON.ObjectID(nodes[i]) });
        deleteUserFromList(nodes[i]);
    }
    if(list.length){
        query = {$or: list};
        return query
    }
};
var buildUpdateData = function(data){
    if(!data.newdata) return;

    if(data.newdata.password){
        data.newdata.password = bcrypt.hashSync(data.newdata.password, salt);
    }

    return data.newdata;
};


exports.delete = function(req, res) {
    var id = req.params.id;
    console.log('Deleting node: [%s] ', id);
    dbi.collection(usersCol, function(err, collection) {
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

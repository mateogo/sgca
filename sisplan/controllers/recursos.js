/*
 *  sisplan recursos.js
 *  package: /sisplan/controllers
 */
var dbi ;
var BSON;

var config = require('config');
var entityCol = config.get('Sisplan.collections.recursos');

var MSGS = [
    'ERROR: No se pudo insertar el nodo en la base de datos',
    'ERROR: No se pudo borrar el nodo en la base de datos'
];
exports.setDb = function(db) {
    dbi = db;
    return this;
};
exports.setBSON = function(bs) {
    BSON = bs;
    return this;
};
exports.setConfig = function(conf){
    return this;
},

exports.findById = function(req, res) {
    var id = req.params.id;
    console.log('findById: Retrieving %s id:[%s]', entityCol,id);
    dbi.collection(entityCol, function(err, collection) {
        collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, item) {
            res.send(item);
        });
    });
};

exports.findAll = function(req, res) {
    console.log('findAll: Retrieving all instances of [%s] collection', entityCol);
    dbi.collection(entityCol, function(err, collection) {
        var query = req.query || {parent_id:null};
        collection.find(query).sort({cnumber:1}).toArray(function(err, items) {
            res.send(items);
        });
    });
};

exports.add = function(req, res) {
    var resource = req.body;

    if (resource.parent_id) {
      resource.parent_id = new BSON.ObjectID(resource.parent_id);
    }

    //console.log('Adding rq: [%s]', JSON.stringify(req));
    //console.log('Adding body: [%s]', JSON.stringify(resource));
    dbi.collection(entityCol, function(err, collection) {
        collection.insert(resource, function(err, result) {
            if (err) {
                res.send({'error':'An error has occurred'});
            } else {
                console.log('ADD: se inserto correctamente el recurso %s', JSON.stringify(result[0]));
                res.send(result[0]);
            }
        });
    });
}

exports.update = function(req, res) {
    var id = req.params.id;
    var resource = req.body;

    if (resource.parent_id) {
      resource.parent_id = new BSON.ObjectID(resource.parent_id);
    }

    delete resource._id;
    console.log('Updating node id:[%s] ',id);
    console.log(JSON.stringify(resource));
    dbi.collection(entityCol, function(err, collection) {
        collection.update({'_id':new BSON.ObjectID(id)}, resource, function(err, result) {
            if (err) {
                console.log('Error updating %s error: %s',entityCol,err);
                res.send({error: MSGS[0] + err});
            } else {
                console.log('UPDATE: se insertaron exitosamente [%s] nodos',result);
                res.send(resource);
            }
        });
    });
}

exports.delete = function(req, res) {
    var id = req.params.id;
    console.log('Deleting node: [%s] ', id);
    dbi.collection(entityCol, function(err, collection) {
        collection.remove({'_id':new BSON.ObjectID(id)}, function(err, result) {
            if (err) {
                res.send({error: MSGS[1] + err});
            } else {
                console.log('DELETE: se eliminaron exitosamente [%s] nodos',result);
                res.send(req.body);
            }
        });
    });
}


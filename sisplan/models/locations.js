var rootPath = '../../calendar/models/';

var serializer = require(rootPath + 'serializer.js');
var _ = require('underscore');

var BaseModel = require(rootPath + 'basemodel.js');

var dbi;

var entityCol = 'locations';
var serieKey = 'location';

serializer.initSeries([
        {
            serie: serieKey,
            base: 1000000,
            prefix: 'LOC'
        }]
);


var Location = BaseModel.extend({
    defaults: {
        name: '',
        nickName: '',
        displayName : '',
        direccion: null,
        provincia: null,
        departamento: null,
        localidad: null,
        notas: 'TextArea'
    },
    entityCol: entityCol
});


module.exports.getModel = function(){
    return Location;
};

module.exports.createNew = function(){
    return new Location();
};

module.exports.setDb = function(db){
    dbi = db;
    return this;
};
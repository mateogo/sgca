var path = require('path');
var rootPath = path.normalize(__dirname + '/..');

module.exports = {
    db: {
      uri: 'mongodb://localhost/sgcadb_prod',       //port = 27017  ojo: {auto_reconnect: true}
    },
    app: {
      name: 'SGAC - Producción',
    },
}

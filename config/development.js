var path = require('path');
var rootPath = path.normalize(__dirname + '/..');

module.exports = {
    db: {
      uri: 'mongodb://localhost/sgcadb_dev',        //port = 27017  ojo: {auto_reconnect: true}
    },
    app: {
      name: 'SGAC - Desarrollo',
    },
}

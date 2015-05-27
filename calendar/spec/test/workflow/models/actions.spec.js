var root = '../../../../';

var async = require('async');

var actions = require(root + 'workflow/obras/models/actions.js');
var tokenTypes = require(root + 'workflow/obras/models/tokentypes.js');
var groups = require(root + 'workflow/obras/models/groups.js');


var solicitud;
var token;

describe('Worflow',function(){

  describe('Acciones del workflow de obras',function(){

      it('Deberia encontrar la acción',function(){

        var selected = actions.getByToken(tokenTypes.MODIFICACION,[groups.FALICITADORES]);

        expect(selected.length).toBe(3);
      });

    });

  });

var root = '../../../../';
var MicaAgenda = require(root + 'calendar/models/micaagenda.js').getModel();


describe('models',function(){

  describe('MicaAgenda',function(){


      it('Deberia retornar estadisticas',function(done){
        MicaAgenda.statistics(function(err,result){
          expect(err).toBe(null);

          if(result && result.length > 0){
            var row = result[0];
            expect(row.number).toBeDefined();
            expect(row.subtotal_count).toBeDefined();
          }

          done();
        });
      });

    });
  });

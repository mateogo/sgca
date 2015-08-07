var root = '../../../../';
var MicaSuscription = require(root + 'calendar/models/micasuscription.js').getModel();


describe('models',function(){

  describe('MicaSuscription',function(){


      it('Deberia encontrar una suscripcion',function(done){
        var idStr =  '5559284c06547cf95ea1eecb';
        MicaSuscription.findById(idStr,function(err,result){
          expect(err).toBe(null);
          expect(result).toBeDefined();
          done();
        });
      });

    });
  });

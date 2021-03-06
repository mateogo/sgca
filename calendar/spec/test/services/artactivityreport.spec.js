var root = '../../../../';
var ArtActivityReport = require(root + 'calendar/services/artactivityreport.js');
var ArtActivty = require(root + 'calendar/models/artactivity.js').getModel();
var Event = require(root + 'calendar/models/event.js').getModel();


var service = new ArtActivityReport();


describe('services',function(){

  describe('ArtActivityReport',function(){

      it('Deberia obtener el valor por defecto',function(){
        var obj = {'field1':'campo 1','field2':'campo 2'};

        expect(service.getParam(obj,'field1')).toBe(obj.field1);
        expect(service.getParam(obj,'field434','pepe')).toBe('pepe');
      });

      it('Deberia retornar al menos un array vacio',function(done){
        service.search({desde:'2015-03-01',hasta:'2015-03-31'},function(err,result){
          expect(err).toBeFalsy();

          expect(result).toBeTruthy();

          expect(typeof(result.length)).not.toBe('undefined');
          if(result.length > 0){
              expect(typeof(result[0].title)).not.toBe('undefined');
          }
          done();
        });
      });

  });
});

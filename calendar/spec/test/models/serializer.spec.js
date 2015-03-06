var root = '../../../../';
var serializer = require(root + 'calendar/models/serializer.js');
var async = require('async');

describe('Models',function(){
  describe('serializer',function(){
    
    var adapters = [{
          serie: 'test101',
          base: 1000000,
          prefix: 'TEST'
        }];

    it('deberia inicializar un serial',function(done){
        
        serializer.initSeries(adapters,function(err,r){
          done();
        });
    });
    
    it('Deberia devolver un código segun el formato',function(done){
      serializer.nextSerie('test101',function(err,number){
        expect(number).toBeDefined();
        expect(number).not.toBe(NaN);
        expect(typeof(number)).toBe('string');
        expect(number.indexOf('TEST')).toBe(0);
        done();
      });
    });
    
    it('Deberia incrementar el código segun el formato',function(done){
      
      async.series([function(cb){
                        serializer.nextSerie('test101',cb);
                      },
                      function(cb){
                        serializer.nextSerie('test101',cb);
                      }],function(err,results){
                            expect(err).toBeFalsy();
                          
                            var code1 = results[0];
                            var code2 = results[1];
                            expect(code1).not.toBe(code2);
                            done();
                      });
    });

  });
});

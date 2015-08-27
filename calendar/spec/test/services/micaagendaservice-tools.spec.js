var root = '../../../../';
var async = require('async');

var MicaSuscription = require(root + 'calendar/models/micasuscription.js').getModel();
var MicaAgenda = require(root + 'calendar/models/micaagenda.js').getModel();
var MicaInteraction = require(root + 'calendar/models/micainteraction.js').getModel();
var MicaAgendaService = require(root + 'calendar/services/micaagendaservice.js');
var MicaToolsService = require(root + 'calendar/services/micatoolsservice.js');

var interaction = null;
var idComprador,
    idVendedor,
    comprador,
    vendedor,
    reunion;

var userLogged = {_id:'53b6eaf34795894846788fa1',username:'jasminetest',name:'Jasmine Tester',mail:'jasmine@test.com'};

describe('models',function(){

  describe('MicaAgendaService - Tools',function(){


      it('Buscar numeros repetidos',function(done){
        var service = new MicaToolsService();
        service.searchRepeatNumReunion(function(err,results){
          expect(err).toBe(null);

          expect(results).toBeTruthy();

          done();
        });
      });

      it('Buscar cnumber repetidos',function(done){
        var service = new MicaToolsService();
        service.checkCNumber(function(err,results){
          expect(err).toBe(null);

          expect(results).toBeTruthy();
          done();
        });
      });

      it('Arregla repetidos',function(done){
        var service = new MicaToolsService();
        service.fixCNumber(function(err,results){
          expect(err).toBe(null);

          done();
        });
      });

      it('Buscar excesos de quota',function(done){
        var service = new MicaToolsService();
        service.quotaExceeded(function(err,results){
          expect(err).toBe(null);

          expect(results).toBeTruthy();
          done();
        });
      });

      it('Buscar perfiles cruzados',function(done){
        var service = new MicaToolsService();
        service.crossProfile(function(err,results){
          expect(err).toBe(null);

          expect(results).toBeTruthy();
          console.log('CASOS cruzados',results)
          console.log('CANTIDAD DE CASOS cruzados',results.length);
          done();
        });
      });

  });
});

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

  describe('MicaAgendaService - Exportacion excel',function(){


      // it('Deberia exportar archivo',function(done){
      //   var service = new MicaAgendaService(userLogged);
      //   service.buildCompradoresExcel(function(err,result){
      //     expect(err).toBe(null);
      //
      //     expect(result).toBeTruthy();
      //     done();
      //   });
      // });

      it('Deberia limpiear archivos',function(done){
        var service = new MicaAgendaService(userLogged);
        service.clearExport(function(err,result){
          expect(err).toBeFalsy();

          done();
        });
      });

      it('Deberia exportar archivo',function(done){
        var service = new MicaAgendaService(userLogged);
        service.buildVendedoresExcel('musica',function(err,result){
          expect(err).toBeFalsy();

          expect(result).toBeTruthy();
          done();
        });
      });

      it('Deberia exportar archivo',function(done){
        var service = new MicaAgendaService(userLogged);
        service.buildVendedoresExcel('editorial',function(err,result){
          expect(err).toBeFalsy();

          expect(result).toBeTruthy();
          done();
        });
      });

      it('Deberia exportar archivo',function(done){
        var service = new MicaAgendaService(userLogged);
        service.buildVendedoresExcel('disenio',function(err,result){
          expect(err).toBeFalsy();

          expect(result).toBeTruthy();
          done();
        });
      });

      it('Deberia generar zip',function(done){
        var service = new MicaAgendaService(userLogged);
        service.buildZip(function(err,result){
          expect(err).toBeFalsy();

          console.log(result);
          done();
        });
      });

      it('Deberia existir el zip',function(done){
        var service = new MicaAgendaService(userLogged);
        service.getZipExporter(function(err,result){
          expect(err).toBeFalsy();

          expect(result.file).toBeTruthy();
          done();
        });
      });


  });
});

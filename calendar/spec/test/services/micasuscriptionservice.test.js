var root = '../../../../';
var async = require('async');
var _ = require('underscore');

var MicaSuscription = require(root + 'calendar/models/micasuscription.js').getModel();
var MicaAgenda = require(root + 'calendar/models/micaagenda.js').getModel();
var MicaAgendaService = require(root + 'calendar/services/micaagendaservice.js');
var MicaSuscriptionService = require(root + 'calendar/services/micasuscriptionservice.js');

var idComprador = '556a12e7a9cb6e1e7ebbe4a9';
var idVendedor = '555e57f9927fd2a932961976';
var comprador;
var vendedor;
var reunion;

var userLogged = {_id:'53b6eaf34795894846788fa1',username:'jasminetest',name:'Jasmine Tester',mail:'jasmine@test.com'};

describe('models',function(){

  describe('MicaAgendaService',function(){

      it('Deberia calcular estadistica de confirmaciones',function(done){
        var service = new MicaSuscriptionService(userLogged);
        service.estadisticaConfirmacion(function(err,result){
          expect(err).toBe(null);
          expect(result).toBeTruthy();
          console.log('los numeros',result);

          done();
        });
      });
  });
});

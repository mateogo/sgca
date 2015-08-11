var root = '../../../../';
var async = require('async');
var _ = require('underscore');

var MicaSuscription = require(root + 'calendar/models/micasuscription.js').getModel();
var MicaAgenda = require(root + 'calendar/models/micaagenda.js').getModel();
var MicaAgendaService = require(root + 'calendar/services/micaagendaservice.js');

var idComprador = '556a12e7a9cb6e1e7ebbe4a9';
var idVendedor = '555e57f9927fd2a932961976';
var comprador;
var vendedor;
var reunion;

var userLogged = {_id:'53b6eaf34795894846788fa1',username:'jasminetest',name:'Jasmine Tester',mail:'jasmine@test.com'};

describe('models',function(){

  describe('MicaAgendaService',function(){

      it('Deberia encontrar encontrar dos suscripciones',function(done){
          MicaSuscription.findByIds([idComprador,idVendedor],function(err,result){
            expect(err).toBe(null);
            expect(result).toBeDefined();
            expect(result.length).toBe(2);

            var id1 = result[0]._id.toString();
            var id2 = result[1]._id.toString();

            expect(id1).not.toBe(id2);
            expect(id1 === idComprador || id2 === idComprador).toBe(true);
            expect(id1 === idVendedor || id2 === idVendedor).toBe(true);

            if(id1 === idComprador){
              comprador = result[0];
              vendedor = result[1];
            }else{
              comprador = result[1];
              vendedor = result[0];
            }

            expect(comprador._id.toString()).toBe(idComprador);
            expect(vendedor._id.toString()).toBe(idVendedor);

            done();
          });
      });

      it('Deberia encontrar la agenda de un suscriptor',function(done){
        var service = new MicaAgendaService(userLogged);
        service.getAgenda(comprador,'comprador',function(err,result){
          expect(err).toBe(null);
          expect(result).toBeDefined();
          expect(result.length).toBe(MicaAgendaService.COUNT_REUNIONES);

          for (var i = 0; i < result.length; i++) {
            var reunion = result[i];
            expect(reunion.get('num_reunion')).toBe(i+1);
          }

          done();
        });
      });

      it('Deberia encontrar lugares libres',function(done){
        var service = new MicaAgendaService(userLogged);
        service.searchAvailability(comprador,'comprador',function(err,result){
          expect(err).toBe(null);
          expect(result).toBeDefined();
          expect(result.length).toBeDefined();
          done();
        });
      });

      it('Deberia encontrar TODOS los lugares disponibles',function(done){
        var service = new MicaAgendaService(userLogged);
        service._crossAvailability(comprador,vendedor,function(err,result){
          expect(err).toBe(null);
          expect(result).toBeDefined();
          expect(result.length).toBeDefined();

          //deberia haber 36 lugares disponibles
          expect(result.length).toBe(MicaAgendaService.COUNT_REUNIONES);
          done();
        });
      });

      it('Deberia crear una reunion',function(done){
        var service = new MicaAgendaService(userLogged);
        service.assign(idComprador,idVendedor,function(err,result){
          expect(err).toBe(null);
          expect(result instanceof MicaAgenda).toBeTruthy();

          expect(result.get('num_reunion')).toBeDefined();
          expect(parseInt(result.get('num_reunion'))).not.toBe(NaN);
          expect(result.get('comprador')._id).toBe(idComprador);
          expect(result.get('vendedor')._id).toBe(idVendedor);
          reunion = result;

          done();
        });
      });

      it('Deberia estar la reunion en la agenda del comprador',function(done){
        var service = new MicaAgendaService(userLogged);
        service.getAgenda(comprador,'comprador',function(err,results){
          expect(err).toBe(null);
          expect(results).toBeDefined();
          expect(results.length).toBeDefined();

          var reuniones = _.filter(results,function(reunion){
              return reunion.get('estado') !== 'libre' && reunion.get('vendedor')._id == idVendedor;
          });

          if(reunion.get('num_reunion') == 0){
            //tendria que estar en la lista pero con reunion unavailable
            // pueden haber varias con num_reunion 0;
            // TODO: completar caso
          }else{
            // deberia haber una sola reunion con ese numero
            expect(reuniones.length).toBe(1);
            expect(reuniones[0].get('num_reunion')).toBe(reunion.get('num_reunion'));
            expect(reuniones[0].get('estado')).toBe(MicaAgenda.STATUS_DRAFT);
          }
          done();
        });
      });

      it('Deberia estar la reunion en la agenda del vendedor por Id',function(done){
        var service = new MicaAgendaService(userLogged);
        service.getAgenda(idVendedor,'vendedor',function(err,results){
          expect(err).toBe(null);
          expect(results).toBeDefined();
          expect(results.length).toBeDefined();

          var reuniones = _.filter(results,function(reunion){
              return reunion.get('estado') !== 'libre' && reunion.get('comprador')._id == idComprador;
          });

          if(reunion.get('num_reunion') == 0){
            //tendria que estar en la lista pero con reunion unavailable
            // pueden haber varias con num_reunion 0;
            // TODO: completar caso
          }else{
            // deberia haber una sola reunion con ese numero
            expect(reuniones.length).toBe(1);
            expect(reuniones[0].get('num_reunion')).toBe(reunion.get('num_reunion'));
            expect(reuniones[0].get('estado')).toBe(MicaAgenda.STATUS_DRAFT);
          }
          done();
        });
      });

      it('Deberia encontrar no todos los lugares libres',function(done){
        var service = new MicaAgendaService(userLogged);
        service.searchAvailability(comprador,'comprador',function(err,result){
          expect(err).toBe(null);
          expect(result).toBeDefined();
          expect(result.length).toBeDefined();
          expect(result.length).toBe(MicaAgendaService.COUNT_REUNIONES-1);
          done();
        });
      });

      it('Deberia poder borrar la reunion',function(done){
        if(!reunion) return;

        reunion.remove(function(err,result){
          expect(err).toBe(null);
          done();
        });
      });

      it('Deberia encontrar TODOS los lugares disponibles (de nuevo)',function(done){
        var service = new MicaAgendaService(userLogged);
        service._crossAvailability(comprador,vendedor,function(err,result){
          expect(err).toBe(null);
          expect(result).toBeDefined();
          expect(result.length).toBeDefined();

          //deberia haber 36 lugares disponibles
          expect(result.length).toBe(MicaAgendaService.COUNT_REUNIONES);
          done();
        });
      });
  });
});

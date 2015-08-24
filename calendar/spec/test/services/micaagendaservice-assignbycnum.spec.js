var root = '../../../../';
var async = require('async');

var MicaSuscription = require(root + 'calendar/models/micasuscription.js').getModel();
var MicaAgenda = require(root + 'calendar/models/micaagenda.js').getModel();
var MicaInteraction = require(root + 'calendar/models/micainteraction.js').getModel();
var MicaAgendaService = require(root + 'calendar/services/micaagendaservice.js');

var interaction = null;
var idComprador,
    idVendedor,
    comprador,
    vendedor,
    reunion,
    reunion2;

var userLogged = {_id:'53b6eaf34795894846788fa1',username:'jasminetest',name:'Jasmine Tester',mail:'jasmine@test.com'};

describe('models',function(){

  describe('MicaAgendaService',function(){


      it('Buscar alguna iteraction para asignar',function(done){
        MicaInteraction.findPageable({'meeting_estado':'no_asignada'},function(err,results){
          expect(err).toBe(null);

          expect(results[1].length > 0).toBeTruthy();

          interaction = results[1][0];

          if(interaction.get('emisor_rol') === 'comprador'){
            idComprador = interaction.get('emisor_inscriptionid');
            idVendedor = interaction.get('receptor_inscriptionid');
          }else{
            idVendedor = interaction.get('emisor_inscriptionid');
            idComprador = interaction.get('receptor_inscriptionid');
          }

          done();
        });
      });

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

      it('Deberia crear una reunion por numero',function(done){
        var num_reunion = 12;
        var service = new MicaAgendaService(userLogged);
        service.assignToNum(idComprador,vendedor.cnumber,num_reunion,function(err,result){
          expect(err).toBeFalsy();
          expect(result instanceof MicaAgenda).toBeTruthy();

          expect(result.get('num_reunion')).toBeDefined();
          expect(parseInt(result.get('num_reunion'))).toBe(num_reunion);
          expect(result.get('comprador')._id).toBe(idComprador);
          expect(result.get('vendedor')._id).toBe(idVendedor);

          reunion = result;
          done();
        });
      });

      it('Deberia haber error al tratar de crear la reunion por el mismo numero',function(done){
        var num_reunion = 12;
        var service = new MicaAgendaService(userLogged);
        service.assignToNum(idComprador,vendedor.cnumber,num_reunion,function(err,result){
          expect(err).toBeTruthy();
          expect(err.reunion).toBeTruthy();
          expect(err.reunion instanceof MicaAgenda).toBeTruthy();

          result = err.reunion;
          expect(result.get('num_reunion')).toBeDefined();
          expect(parseInt(result.get('num_reunion'))).toBe(num_reunion);
          expect(result.get('comprador')._id).toBe(idComprador);
          expect(result.get('vendedor')._id).toBe(idVendedor);

          done();
        });
      });

      it('Deberia liberar la reunion',function(done){
        if(!reunion) return done();

        var service = new MicaAgendaService(userLogged);
        service.liberate(reunion,function(err,result){
          expect(err).toBe(null);

          expect(result.id).toBeFalsy();
          expect(result.get('estado')).toBe(MicaAgenda.STATUS_FREE);
          expect(result.get('num_reunion')).toBe(reunion.get('num_reunion'));
          done();
        });
      });

      it('Deberia encontrar TODOS los lugares disponibles (de nuevo)',function(done){
        var service = new MicaAgendaService(userLogged);
        service._crossAvailability(comprador,vendedor,function(err,result){
          expect(err).toBe(null);
          expect(result).toBeDefined();
          expect(result.length).toBeDefined();

          //deberia haber lugares disponibles
          expect(result.length).toBe(MicaAgendaService.COUNT_REUNIONES);
          done();
        });
      });

      it('Deberia reseter la interaccion',function(done){
        MicaInteraction.findById(interaction.id,function(err,result){
          expect(err).toBe(null);
          expect(result).toBeDefined();

          expect(result.id.toString()).toBe(interaction.id.toString());

          expect(result.get('meeting_estado')).toBe('no_asignada');
          expect(result.get('meeting_number')).toBe(-1);
          expect(result.get('meeting_id')).toBe('');
          done();
        });
      });
  });
});

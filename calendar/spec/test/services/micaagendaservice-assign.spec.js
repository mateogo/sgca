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
    reunion;

var userLogged = {_id:'53b6eaf34795894846788fa1',username:'jasminetest',name:'Jasmine Tester',mail:'jasmine@test.com'};

describe('models',function(){

  describe('MicaAgendaService',function(){


      it('Buscar alguna iteraction para asignar',function(done){
        MicaInteraction.findPageable({'estado_asignacion':'no_asignado'},function(err,results){
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

      it('Deberia tener estado unavailable si tiene num_reunion 0',function(){
        if(reunion.get('num_reunion') == 0){
            expect(reunion.get('estado')).toBe('unavailable');
        }
      });

      it('Deberia cambiar de estado la Interaction',function(done){
        MicaInteraction.findById(interaction.id,function(err,result){
          expect(err).toBe(null);
          expect(result).toBeDefined();


          expect(result.id.toString()).toBe(interaction.id.toString());

          expect(result.get('meeting_estado')).toBe(reunion.get('estado'));
          expect(result.get('meeting_number')).toBe(reunion.get('num_reunion'));
          expect(result.get('meeting_id')).toBe(reunion.id.toString());
          done();
        });
      });

      // BORRAR REUNION ASIGNADA
      // it('Deberia poder borrar la reunion',function(done){
      //   if(!reunion) return;
      //
      //   reunion.remove(function(err,result){
      //     expect(err).toBe(null);
      //     done();
      //   });
      // });
      //
      // it('Deberia encontrar TODOS los lugares disponibles (de nuevo)',function(done){
      //   var service = new MicaAgendaService(userLogged);
      //   service._crossAvailability(comprador,vendedor,function(err,result){
      //     expect(err).toBe(null);
      //     expect(result).toBeDefined();
      //     expect(result.length).toBeDefined();
      //
      //     //deberia haber 36 lugares disponibles
      //     expect(result.length).toBe(MicaAgendaService.COUNT_REUNIONES);
      //     done();
      //   });
      // });
  });
});

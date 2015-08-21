//testo de bloqueo de una reunion libre

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

var agenda;// array de reuniones

var userLogged = {_id:'53b6eaf34795894846788fa1',username:'jasminetest',name:'Jasmine Tester',mail:'jasmine@test.com'};

describe('models',function(){

  describe('MicaAgendaService - Cambio de estado.',function(){

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

      it('Deberia retorna la agenda de reuniones',function(done){
        var service = new MicaAgendaService(userLogged);
        service.getAgenda(comprador,'comprador',function(err,result){
          expect(err).toBe(null);
          expect(result).toBeDefined();
          expect(result.length).toBe(MicaAgendaService.COUNT_REUNIONES);

          for (var i = 0; i < result.length; i++) {
            var reunion = result[i];
            expect(reunion.get('num_reunion')).toBe(i+1);
          }

          agenda = result;

          done();
        });
      });

      it('Deberia poder guardar la reunion con bloqueo de una reunion libre',function(done){
        reunion = null;
        for (var i = 0; i < agenda.length && reunion === null; i++) {
          if(agenda[i].get('estado') === 'libre'){
            reunion = agenda[i];
          }
        }

        if(!reunion){
          expect(reunion).toBeTruthy();
          return done();
        }

        reunion.set('estado',MicaAgenda.STATUS_BLOCKED);

        var service = new MicaAgendaService(userLogged);
        service.save(reunion,function(err,result){
          expect(err).toBe(null);
          expect(result).toBeDefined();

          expect(result.get('estado')).toBe(MicaAgenda.STATUS_BLOCKED);
          expect(result.get('usermod')).toBeDefined();

          var compradorlocal = result.get('comprador');
          expect(compradorlocal).toBeTruthy();
          if(compradorlocal){
            expect(compradorlocal._id).toBe(idComprador);
          }

          reunion = result;
          done();
        });
      });

      it('El comprador Deberia tener la actividad',function(){
          expect(reunion.get('comprador').actividades).toBeDefined();
      });

      //BORRAR REUNION ASIGNADA
      it('Deberia poder borrar la reunion',function(done){
        if(!reunion) return;
        var service = new MicaAgendaService(userLogged);
        service.remove(reunion.id,function(err,result){
          expect(err).toBe(null);
          done();
        });
      });
  });
});

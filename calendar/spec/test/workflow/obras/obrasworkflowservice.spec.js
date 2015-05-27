var root = '../../../../';

var async = require('async');

var ObrasWorkflowService = require(root + 'workflow/obras/obrasworkflowservice.js');


var Solicitud = require(root + 'models/obraartesolicitud.js').getModel();
var Token = require(root + 'models/token.js').getModel();


var solicitud;
var token;

describe('services',function(){

  describe('ObrasWorkflowService',function(){

      it('Deberia retornar queries por grupo',function(done){
        var user = {id:'5564b6d7c626942129682e9c',name:'Un usuario de prueba',roles:['facilitadores','revisores']};
        var service = new ObrasWorkflowService(user);

        service.getQueries(function(err,queries){
          expect(err).toBe(null);
          expect(queries).toBeDefined();
          expect(queries.length > 0).toBeTruthy();
          done();
        });

      });

      it('Deberia crear una solicitud',function(done){
        solicitud = new Solicitud();
        solicitud.save(function(err,result){
          expect(err).toBe(null);
          done();
        });
      });


      it('Deberia crear el token de inicio de solicitud',function(done){
        var user = {id:'5564b6d7c626942129682e9c',name:'Un usuario de prueba',roles:['facilitador']};
        var service = new ObrasWorkflowService(user);

        service.iniciarSolicitud(solicitud,function(err,tokenResult){
          expect(err).toBe(null);
          expect(tokenResult).not.toBeNull();
          expect(tokenResult.get('obj').id.toString()).toBe(solicitud.get('_id').toString());

          token = tokenResult;
          done();
        });
      });

      it('Deberia retornar el ultimo token',function(done){
        var user = {id:'5564b6d7c626942129682e9c',name:'Un usuario de prueba',roles:['facilitador']};
        var service = new ObrasWorkflowService(user);

        expect(solicitud.get('_id')).toBeTruthy();

        service.getLastToken(solicitud.get('_id'),function(err,token){
          expect(err).toBe(null);
          expect(token).not.toBeNull();
          done();
        });
      });

      it('Deberia correr un query para asignar y traer un resultado',function(done){
        var user = {id:'5564b6d7c626942129682e9c',name:'Un usuario de prueba',roles:['facilitadores','revisores']};
        var service = new ObrasWorkflowService(user);

        service.runQuery('sol_news',function(err,tokens){
          expect(err).toBe(null);
          expect(tokens).toBeDefined();
          expect(tokens.length > 0).toBeTruthy();
          done();
        });

      });


      it('Deberia rechazar agregar el token sin tipo',function(done){
        var user = {id:'5564b6d7c626942129682e9c',name:'Un usuario de prueba',roles:['facilitador']};
        var service = new ObrasWorkflowService(user);
        var token = new Token();
        token.set('obj',{id:'5564b6d7c626942129682e9c',type:'solicitud'});

        service.add(token,function(err,result){
          expect(err).not.toBeNull();
          done();
        });
      });

      it('Deberia cerrar el token sin perder campos',function(done){
        token.closeToken(function(err,result){
          expect(err).toBeNull();

          expect(result.get('is_open')).toBe(false);
          expect(result.get('type')).toBeTruthy();
          done();
        });
      });


      it('Deberia borrar los registros',function(done){
        async.series([function(cb){
                        token.remove(cb);
                      },
                      function(cb){
                        solicitud.remove(cb);
                      }
                      ],function(errs,results){
            expect(errs).toBeFalsy();
            done();
        });
      });
  });
});

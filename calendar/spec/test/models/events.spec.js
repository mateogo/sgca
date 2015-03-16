var root = '../../../../';
var ArtActivity = require(root + 'calendar/models/artactivity.js').getModel();
var Event = require(root + 'calendar/models/event.js').getModel();


describe('models',function(){
  
  describe('event',function(){
    
      var activity;
      var event;
    
      it('Deberia crear una actividad',function(done){
          activity = new ArtActivity({action:{_id:'3453434sadf',cnumber:'dummy',slug:'demo'}});
          
          activity.save(function(err,res){
            expect(err).toBeNull();
            expect(res.get('cnumber')).toBeTruthy();
            activity = res;
            done();
          });
      });
      
      it('Deberia crear un evento',function(done){
        event = new Event({artactivity:activity});
        
        event.save(function(err,res){
          expect(err).toBeNull();
          expect(res).toBeTruthy();
          expect(res.id).toBeTruthy();
          expect(res.get('artactivity_id')).toBeTruthy();
          event = res;
          done();
        });
      });
      
      it('Deberia actualizar el evento',function(done){
        var headline = 'Titulo descripcion del evento';
        event.set('headline',headline);
        
        event.save(function(err,res){
            expect(err).toBeNull();
            
            expect(res).toBeTruthy();
            expect(res.get('headline')).toBe(headline);
            done();
        });
      });
      
      it('Deberia borrar el evento',function(done){
        event.remove(function(err,res){
          expect(err).not.toBeTruthy();
          
          expect(res).toBe(1);
          Event.findById(res.id,function(err,resFind){
            
            expect(resFind).not.toBeTruthy();
            done();  
          });
        });
      });
      
      it('Deberia borrar la actividad',function(done){
        activity.remove(function(err,res){
          expect(err).not.toBeTruthy();
          
          done();
        });
      });
      
  });
  
});
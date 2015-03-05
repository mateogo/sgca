var root = '../../../../';
var module = require(root + 'calendar/models/artactivity.js');
var initDb = require('../../helpers/initDb.js');


var ArtActivity = module.getModel();

var artActivity = null;

describe('Models',function(){
  describe('ArtActivity',function(){
    
    beforeEach(function(){
      module.setDb(initDb.getDb());
    });
    
    
    it('Debería crear un ArtActivity',function(){
        expect(module.createNew() instanceof ArtActivity).toBeTruthy();
    });
    
    it('Debería retornar registros',function(done){
      var art = new ArtActivity();
      
      art.fetch({},function(err,result){
        expect(err).toBe(null);
        expect(result).toBeDefined();
        expect(result.length).toBeDefined();
        done();
      });
    });
    
    it('Debería Guardar el registro',function(done){
      var art = new ArtActivity();
      
      art.save(function(err,result){
        
        expect(err).toBe(null);
        expect(result).toBeDefined();
        expect(result instanceof ArtActivity).toBeTruthy();
        expect(result.id).toBeDefined();
                
        artActivity = result;
        done();
      });      
    });

    it('Deberia tener codigo cnumber',function(){
      expect(artActivity.get('cnumber')).not.toBeNull();
    });
    
    it('Debería eliminar el registro',function(done){
        expect(artActivity).not.toBe(null);
        
        artActivity.remove(function(err,result){
          expect(err).toBe(null);
          
          done();  
        });
    });
  });
});
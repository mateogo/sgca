var root = '../../../../';
var module = require(root + 'calendar/models/artactivity.js');
var initDb = require('../../helpers/initDb.js');


var ArtActivity = module.getModel();

var artActivity = null;

describe('Models',function(){
  describe('ArtActivity',function(){
    
    
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
    
    it('Deberia tener fechas creacion y modificacion',function(){
      expect(artActivity.get('fealta')).not.toBeNull();
      expect(artActivity.get('feultmod')).not.toBeNull();
      
      var ahora = new Date();
      var ahoraStr = ahora.toDateString();
      var timeStr = ahora.toTimeString();
      expect(artActivity.get('fealta').toDateString()).toBe(ahoraStr);
      expect(artActivity.get('feultmod').toDateString()).toBe(ahoraStr);
      expect(artActivity.get('fealta').toTimeString()).toBe(timeStr);
      expect(artActivity.get('feultmod').toTimeString()).toBe(timeStr);
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
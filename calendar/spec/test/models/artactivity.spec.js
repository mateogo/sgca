var root = '../../../../';
var module = require(root + 'calendar/models/artactivity.js');
var initDb = require('../../helpers/initDb.js');


var ArtActivity = module.getModel();

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
    
    it('Debería retornar un error de construccion',function(done){
      var art = new ArtActivity();
      
      art.save(function(err,result){
        expect(err).toBe('insert under construction');
        done();
      });
    });
  });
});
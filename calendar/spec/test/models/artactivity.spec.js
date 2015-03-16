var root = '../../../../';
var module = require(root + 'calendar/models/artactivity.js');


var ArtActivity = module.getModel();

var artActivity = null;

describe('Models',function(){
  describe('ArtActivity',function(){
    
    
    it('Debería crear un ArtActivity',function(){
        expect(module.createNew() instanceof ArtActivity).toBeTruthy();
    });
    
    it('Debería retornar registros',function(done){
      
      ArtActivity.find({},function(err,result){
        expect(err).toBe(null);
        expect(result).toBeDefined();
        expect(result.length).toBeDefined();
        done();
      });
    });
    
    it('Debería Guardar el registro',function(done){
      var art = new ArtActivity({action:{_id:'3453434sadf',cnumber:'dummy',slug:'demo'}});
      
      art.save(function(err,result){
        expect(err).toBe(null);
        expect(result).toBeDefined();
        expect(result instanceof ArtActivity).toBeTruthy();
        expect(result.id).toBeTruthy();
                
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
    
    it('Deberia actualizar',function(done){
      artActivity.set('slug','denominacion del evento');
      
      artActivity.save(function(err,r){
        if(err){
          expect(err).toBeNull();
          done();
          return;
        }
        
        
        expect(r.get('slug')).toBe('denominacion del evento');
        
        done();
      });
    });
    
    it('Debería eliminar el registro',function(done){
        expect(artActivity).not.toBe(null);
        
        artActivity.remove(function(err,result){
          expect(err).toBe(null);
          
          done();  
        });
    });
    
    it('Deberia devolver error para busqueda por id mal formados',function(done){
      ArtActivity.findById('545645',function(err,res){
        expect(err).not.toBe(null);
        expect(res).toBeFalsy();
        done();
      });
    });
    
    it('Deberia devolver null para busqueda por id que no existen',function(done){
      ArtActivity.findById('54febe0aac1e3a9a187ff454',function(err,res){
        expect(err).toBe(null);
        expect(res).toBeFalsy();
        done();
      });
    });
    
  });
});
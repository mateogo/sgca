var config = require('config');


var serializer = require('./serializer.js');
var async = require('async');
var _ = require('underscore');


var BaseModel = require('./basemodel.js');


var dbi;

var entityCol = config.get('Calendar.collections.events');
var serieKey = 'events101';

serializer.initSeries([
  {
    serie: serieKey,
    base: 1000000,
    prefix: 'E'
  }]
);


var Event = BaseModel.extend({
  
  constructor: function(opts) {
    this.entityCol = entityCol;
    BaseModel.apply(this,arguments);
  },
  
  defaults: {
    artactivity_id: null,
    cnumber: null,
    fealta: null,
    feultmod: null,
    
    headline: '', // titulo
    subhead: '', // bajada
    subhead_pro: '', // bajada destacada
    volanta: '',
    
    estado_alta: null,
    nivel_ejecucion: null,
    nivel_importancia: null,
    obs: '',
    
    area: '',
    locacion: '',
    espacio: '',
    
    ftype: '', // tipo de fecha (puntual, fecha-hasta,repeticion)
    fdesde: null, //fecha 
    fhasta: null, //fecha
    hinicio: null,
    hfin: null,
    duration: 0,
    frepeat: '', //patron repeticion, ver rrule.js y iCalendar RFC
    
    content: '',
    artists: '', // descripción de los artistas que participan
    
    assets_id: [] //array de referencias a assets
  },
  
  validation: function(cb){
    var errors = [];
    if(!this.get('artactivity_id') && !this.get('artactivity')){
      errors.push('FK ArtActivity not found');
    }
    
    if(errors.length > 0){
      cb(errors);
    }else{
      cb(null);  
    }
  },
  
  _beforeSave: function(callback){
    var self = this;
    async.series([
       //setear el número código
       function(cb){
         if(self.get('cnumber') === null){
           
           serializer.nextSerie(serieKey,function(err,number){
             if(err) return cb(err);
             
             self.set('cnumber',number);
             cb();
           });
           
         }else{
           cb();  
         }
       },
       
       //setear fechas
       function(cb){
         if(self.isNew()){
           self.set('fealta',new Date());
         }
         self.set('feultmod',new Date());
         
         cb();
       },
       
       //serealizar actividad
       function(cb){
         if(self.isNew()){
           var artactivity = self.get('artactivity');
           if(!artactivity) return cb('ArtActivity must be present for the event');
           
           var idActivity = (artactivity.get) ? artactivity.get('_id') : artactivity._id;
           
           self.set('artactivity_id',idActivity);
           
         }
         self.unset('artactivity');
         cb();
       },
       
       //tomar campos heredados de ArtActivity
       function(cb){
         
         var ArtActivity = requireModel('artactivity');
         //console.log('acti model',self);
         
         
         ArtActivity.findById(self.get('artactivity_id'),function(err,artActivity){
           if(err || !artActivity){
             console.warn('No se encontro ArtActivity ',artactivity_id);
             return cb(err);
           }
           
           var fields = _.pick(artActivity.attributes,'rubro','subrubro','type_content');
           
           self.set(fields);
           
           cb();
         });
         
       }
       
    ],
    //done
    function(err,results){
      callback(err);
    });
  }
},{
  entityCol: entityCol,
  defaultSort: {cnumber:1},
  TYPE_REPEAT: 'repeticion',
  
  /**
   * actualiza los campos de eventos heredados de ArtActivity
   */
  updateByActivity: function(artActivity,cb){
    
    if(!artActivity || (!artActivity.id && !artActivity.attributes._id)){
      return cb('ArtActivity no definida');
    }
    
    var idActivity = (artActivity.id)? artActivity.id : artActivity.attributes._id;
    //Actualiza rubro, subrubro y tipodeaudiencia
    var raw = _.pick(artActivity.attributes,'rubro','subrubro','type_content');
    
    raw = {'$set':raw};
    BaseModel.dbi.collection(this.entityCol).update({'artactivity_id':idActivity}, raw, {multi:true}, function(err, count) {
      if(err){
        console.log(err);
        return cb(err);
      }
      
      cb();
    });
    
  }
});


module.exports.getModel = function(){
  return Event;
};

module.exports.createNew = function(){
  return new Event();
};

module.exports.setDb = function(db){
  dbi = db;
  return this;
};

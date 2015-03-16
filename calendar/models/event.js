
var BaseModel = require('./basemodel.js');
var serializer = require('./serializer.js');
var async = require('async');
var _ = require('underscore');

var dbi;

var entityCol = 'events';
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
    fdesde: null, //fecha y hora
    fhasta: null, //fecha y hora
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
           self.unset('artactivity');
         }
         cb();
       }
       
    ],
    //done
    function(err,results){
      callback(err);
    });
  }
},{
  entityCol: entityCol,
  defaultSort: {cnumber:1}
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

var root = '../';

var Backbone = require('backbone');
var _ = require('underscore');
var async = require('async');

var ArtActivty = require(root + 'models/artactivity.js').getModel();
var Event = require(root + 'models/event.js').getModel();


var Agenda = Backbone.Model.extend({
  
},{
  //STATIC
  find: function(query,modo,cb){
    var helper = (modo !== 'detalle') ? helperArtActivity : helperEvent;
    
    var desde = query.desde;
    var hasta = query.hasta;
    
    var $or = [];
    $or.push({fdesde : {'$gte':desde,'$lte':hasta}});
    $or.push({fdesde : {'$lte':desde}},{fhasta:{'$gte':hasta}});
    $or.push({fhasta : {'$gte':desde,'$lte':hasta}});
    
    query.$or = $or;
    delete query.desde;
    delete query.hasta;
    console.log(JSON.stringify(query));
    
    helper.find(desde,hasta,query,cb);
  }
});


var helperArtActivity = {
    find: function(desde,hasta,query,cb){
      ArtActivty.find(query,function(err,array){
        if(err) return cb(err);
        
        helperArtActivity.parse(array,cb);
      });
    },
    parse: function(array,cb){
      for (var i = 0; i < array.length; i++) {
        var item = array[i];
        
        item.title = item.slug;
      }
      cb(null,array);
    }
};


var helperEvent = {
    find: function(desde,hasta,query,cb){
      Event.find(query,function(err,array){
        if(err) return cb(err);
        
        helperEvent.parse(desde,hasta,array,cb);
      });
    },
    parse: function(desde,hasta,array,cb){
      var ret = [];
      
      desde = new Date(desde.substring(0,10));
      hasta = new Date(hasta.substring(0,10));
      
      for (var i = 0; i < array.length; i++) {
        var item = array[i];
        
        item.title = item.headline;
        item.description = item.subhead;
        
        if(item.artactivity){
          item.title = item.artactivity + ' '+item.title;
          delete item.artactivity;
        }
        
        
        
        if(item.ftype == Event.TYPE_REPEAT){
          for (var j = 0; j < item.dates.length; j++) {
            var day = item.dates[j];
            
            var fecha = new Date(day.dfecha.substring(0,10));
            
            if(desde <= fecha && fecha <= hasta){
            
              var inst = _.clone(item);
              
              inst.fdesde = day.dfecha;
              inst.hinicio = day.hinicio;
              inst.hfin = day.hfin;
              inst.duration = day.duration;
              inst.leyendafecha = day.leyenda;
              delete inst.dates;
              
              ret.push(inst);
            }
          }
        }else{
          ret.push(item);  
        }
      }
      cb(null,ret);
    }
};



module.exports.getModel = function(){
  return Agenda;
};

module.exports.createNew = function(){
  return new Agenda();
};
DocManager.module('Entities', function(Entities, DocManager, Backbone, Marionette, $, _){
  Entities.MicaAgenda = Backbone.Model.extend({
    whoami: 'MicaAgenda: micaagenda.js ',
    urlRoot: '/micaagenda',

    idAttribute: '_id',

    defaults: {
      comprador: null,
      vendedor: null,
      num_reunion: '',
      estado: '',

      fealta: null,
      feultmod: null,
      usermod: null
    },
    /** retorna acciones posibles para productores según el estado */
    getProdActions: function(){
      var estado = this.get('estado');
      var actions = [];
      if(estado === 'libre'){
        actions.push({name:'bloquear',label:'Bloquear'});
        actions.push({name:'asignarcnumber',label:'Asignar por Código'});

      }else if(estado === 'bloqueado'){
        actions.push({name:'desbloquear',label:'Desbloquear'});

      }else if(estado === 'asignado' || estado === 'borrador'){
        actions.push({name:'liberar',label:'Liberar'});

      }else if(estado === 'unavailable'){
        actions.push({name:'autoasignar',label:'reintento asignar'});
      }

      return actions;
    },

    getFechaReunion: function(){
      return API.getFechaReunion(this.get('num_reunion'));
    }
  },{
    STATUS: ['asignado','bloqueado','observado','unavailable','libre']
  });

  Entities.MicaAgendaCollection = Backbone.PageableCollection.extend({
    whoami: 'MicaAgendaCollection: micaagenda.js',
    model: Entities.MicaAgenda,
    url: "/micaagenda",

    state:{
      firstPage: 1,
      pageSize: 20,
    },

    setQuery: function(filter){
      var text = filter.get('textsearch');
      this.queryParams.textsearch = $.trim(text);


      if(this.queryParams.textsearch === ''){
        delete this.queryParams.textsearch;
      }

      if(filter.get('estado') && filter.get('estado') !== 'no_definido'){
        this.queryParams.estado = filter.get('estado');
      }else{
        delete this.queryParams.estado;
      }

      if(filter.get('cactividades') && filter.get('cactividades') !== 'no_definido'){
        this.queryParams.cactividades = filter.get('cactividades');
      }else{
        delete this.queryParams.cactividades;
      }

      if(filter.get('vactividades') && filter.get('vactividades') !== 'no_definido'){
        this.queryParams.vactividades = filter.get('vactividades');
      }else{
        delete this.queryParams.vactividades;
      }

      if(filter.get('confirmado') && filter.get('confirmado') !== 'no_definido'){
        this.queryParams.confirmado = filter.get('confirmado');
      }else{
        delete this.queryParams.confirmado;
      }


      this.getFirstPage();
    },


  });

  /**
   * Se usa para la agenda de un determinado suscriptor
   */
  Entities.MicaAgendaOneCollection = Backbone.Collection.extend({
    whoami: 'MicaAgendaCollection: micaagenda.js',
    model: Entities.MicaAgenda,
    initialize: function(opts){
      this.idSuscription = null;
      this.rol = 'undefined';
    },
    url: function(){
      return '/micaagenda/' + this.idSuscription + '/'+ this.rol;
    },
    parse: function(response) {
      var isAdmin = DocManager.request('userlogged:isMicaAdmin');
      if(!isAdmin || this.isPublicMode){
        // sacar las reuniones no disponibles y libres
        response = _.reject(response,function(item){
          return item.estado != 'asignado' && item.estado != 'borrador';
        });
      }
      return response;
    },
    setSuscription: function(suscription,rol){
      this.idSuscription = suscription;
      this.rol = rol;
      var self = this;
      this.fetch().done(function(){
        self.trigger('change');
      });
    },
    refresh: function(){
      var self = this;
      this.fetch().done(function(){
        self.trigger('change');
      });
    },
    activePublicMode:function(){
      this.isPublicMode =true;
    }
  });


  Entities.MicaAgendaFilterFacet = Backbone.Model.extend({
    whoami: 'Entities.MicaAgendaFilterFacet:micaagenda.js',
    schema: {
      cactividades:   {type: 'Select',  title: 'Sector Comprador',  options: tdata.sectorOL },
      vactividades:   {type: 'Select',  title: 'Sector Vendedor',  options: tdata.sectorOL },
      estado:   {type: 'Select',  title: 'Estado',  options: tdata.estado_reunion },
      confirmado:   {type: 'Select',  title: 'Confirmado',  options: tdata.estado_confirmado },
    }
  });

  Entities.MicaagendaStatistics = Backbone.Model.extend({
    whoami: 'Entities.MicaagendaStatistics:micaagenda.js',
  });

  Entities.MicaagendaStatisticsCollection = Backbone.Collection.extend({
    whoami: 'MicaagendaStatisticsCollection: micaagenda.js',
    model: Entities.MicaagendaStatistics,
    url: '/micaagenda-statistics'
  });

  Entities.MicaagendaStatisticsCollection2 = Backbone.Collection.extend({
    whoami: 'MicaagendaStatisticsCollection: micaagenda.js',
    model: Entities.MicaagendaStatistics,
    url: '/micaagenda-statistics/confirmado'
  });

  var mapfecha_reunion = {
    '1': new Date(2015,08,4,10,0)
  };

  var API = {
    /**
     * asigna a un comprador y vendedor
     * @param  {String} comprador - id de suscripcion
     * @param  {String} vendedor  - id de suscripcion
     */
    assign: function(comprador,vendedor){
      var data = {
        comprador: comprador,
        vendedor: vendedor
      };

      var p = $.ajax({
          type: 'post',
          url: '/micaagenda/assign',
          data: data,
          dataType: 'json'
      });

      p.done(function(){
        DocManager.trigger('micaagenda:changed');
      });

      return p;
    },

    remove: function(reunion){
      return reunion.destroy({wait:true,contentType: false, processData: false});
    },

    searchStatistics: function(){
      var collection = new Entities.MicaagendaStatisticsCollection();
      collection.fetch().done(function(){
        collection.trigger('change');
      });
      return collection;
    },

    searchStatistics2: function(){
      var collection = new Entities.MicaagendaStatisticsCollection2();
      collection.fetch().done(function(){
        collection.trigger('change');
      });
      return collection;
    },

    searchAgenda: function(idSuscription,rol){
      var collection = new Entities.MicaAgendaOneCollection();
      collection.setSuscription(idSuscription,rol);
      return collection;
    },

    changeStatus: function(reunion,newStatus){
      return reunion.save({estado:newStatus},{patch:true});
    },

    changeStatusAlta: function(reunion,newStatus){
      var p = reunion.save({estado_alta:newStatus},{patch:true});
      p.done(function(){
        reunion.trigger('change');
      });
      return p;
    },

    /**
     * @param  {Entities.MicaAgenda} reunion
     * @param  {String} mainRol (comprador,vendedor)
     */
    liberar: function(reunion,mainRol){
      var p = $.ajax({
          type: 'post',
          url: '/micaagenda/liberate',
          data: {_id: reunion.id},
          dataType: 'json'
      });

      p.done(function(result){
        //mantiene el rol principal
        if(mainRol){
          result[mainRol] = reunion.get(mainRol);
        }

        result._id = null;
        reunion.set(result);
      });

      return p;
    },

    // se re-intenta la autoasignacion
    autoAsignar: function(reunion){
      var idComprador = reunion.get('comprador')._id;
      var idVendedor = reunion.get('vendedor')._id;
      var p = this.assign(idComprador,idVendedor);
      p.done(function(result){
        if(result.estado === 'unavailable' ){
          Message.warning('No hay espacios disponibles');
        }
      });
      return p;
    },

    /**
     * Proceso de asignar reunion cnumber
     * @param {Object} param {cnumber:String,rol:String} rol: (comprador|vendedor)
     */
    asignarByCNumber: function(reunion,param){
      var data = {
        num_reunion: reunion.get('num_reunion')
      };
      var contraparte = (param.rol === 'comprador')? 'vendedor':'comprador';
      data[contraparte] = reunion.get(contraparte)._id;
      data[param.rol] = param.cnumber;

      var p = $.ajax({
          type: 'post',
          url: '/micaagenda/assigncnumber',
          data: data,
          dataType: 'json'
      });

      p.done(function(result){
        reunion.set(result);
        DocManager.trigger('micaagenda:changed');
      });

      return p;
    },

    countAssigned: function(suscriptor){
      var id = null;

      if(typeof(suscriptor) === 'string'){
        id = suscriptor;
      }else if(suscriptor.has && suscriptor.has('profileid')){
        id = suscriptor.get('profileid');
      }else if(suscriptor.id){
        id = suscriptor.id;
      }else if(suscriptor._id){
        id = suscriptor._id;
      }else{
        id = suscriptor;
      }

      var p = $.ajax({
          type: 'get',
          url: '/micaagenda-statistics/profile/'+id,
          dataType: 'json'
      });

      return p;
    },

    runAction: function(reunion,action,param){
      if(action === 'bloquear'){
        return this.changeStatus(reunion,'bloqueado');
      }else if(action === 'desbloquear'){
        return this.changeStatus(reunion,'libre');

      }else if(action === 'liberar'){
        return this.liberar(reunion,param);

      }else if(action === 'autoasignar'){
        return this.autoAsignar(reunion);

      }else if(action === 'asignarcnumber'){
        return this.asignarByCNumber(reunion,param);

      }else{
          Message.error('No se reconoce la acción. Disculpe las molestias');
      }
    },

    runTool: function(name,params){
      var data = {
        name: name,
        params: params
      };
      var p = $.ajax({
          type: 'post',
          url: '/micatools',
          data: data,
          dataType: 'json'
      });

      return p;
    },


    /**
     * retorna la fecha y la hora
     * @param  {int} number  - numero de reunion
     * @return {Date}        - Fecha y hora de la reunion
     */
    getFechaReunion: function(number){
      var n =  parseInt(number);
      if(isNaN(n) || !(n>=1 && n<=36)) return null;
      var key = n.toString();
      if(!(key in mapfecha_reunion)){
        var baseDate = new Date(2015,08,4,10,0);
        var incDay = Math.floor((n-1)/12);
        var incMinutes = ((n-1) % 12) * 15;
        var date = new Date(baseDate.getTime() + incDay*86400000 + incMinutes*60000);
        mapfecha_reunion[key] = date;
      }
      return mapfecha_reunion[key];
    }
  };



  DocManager.reqres.setHandler('micaagenda:assign', function(asignee){
    var comprador,vendedor;
    comprador = asignee.compradorid;
    vendedor = asignee.vendedorid;

    return API.assign(comprador,vendedor);
  });

  DocManager.reqres.setHandler('micaagenda:statistics', function(){
    return API.searchStatistics();
  });

  DocManager.reqres.setHandler('micaagenda:statistics:confirmado', function(){
    return API.searchStatistics2();
  });

  DocManager.reqres.setHandler('micaagenda:searchAgenda', function(idSuscription,rol){
    return API.searchAgenda(idSuscription,rol);
  });

  DocManager.reqres.setHandler('micaagenda:reunion:borrar', function(model){
    return API.remove(model);
  });

  DocManager.reqres.setHandler('micaagenda:reunion:changestatus', function(model,newStatus){
    return API.changeStatus(model,newStatus);
  });

  DocManager.reqres.setHandler('micaagenda:reunion:changestatusalta', function(model,newStatus){
    return API.changeStatusAlta(model,newStatus);
  });

  DocManager.reqres.setHandler('micaagenda:reunion:runaction', function(model,actionName,param){
    return API.runAction(model,actionName,param);
  });

  DocManager.reqres.setHandler('micaagenda:tools:run', function(name,params){
    return API.runTool(name,params);
  });

  DocManager.reqres.setHandler('micaagenda:profile:count',function(model,callback){
    var p =  API.countAssigned(model);
    if(callback){
      p.done(callback);
    }
    return p;
  });

});

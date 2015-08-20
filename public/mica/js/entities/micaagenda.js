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
        //actions.push({name:'asignar',label:'Asignar'});

      }else if(estado === 'bloqueado'){
        actions.push({name:'desbloquear',label:'Desbloquear'});

      }else if(estado === 'asignado' || estado === 'borrador'){
        //actions.push({name:'liberar',label:'Liberar'});
      }

      return actions;
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
    }
  });


  Entities.MicaAgendaFilterFacet = Backbone.Model.extend({
    whoami: 'Entities.MicaAgendaFilterFacet:micaagenda.js',
    schema: {
      cactividades:   {type: 'Select',  title: 'Sector Comprador',  options: tdata.sectorOL },
      vactividades:   {type: 'Select',  title: 'Sector Vendedor',  options: tdata.sectorOL },
      estado:   {type: 'Select',  title: 'Estado',  options: tdata.estado_reunion },
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

  var API = {
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

    runAction: function(reunion,action){
      if(action === 'bloquear'){
        return this.changeStatus(reunion,'bloqueado');
      }else if(action === 'desbloquear'){
        return this.changeStatus(reunion,'libre');
      }else{
        Message.error('No se reconoce la acción. Disculpe las molestias');
      }
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

  DocManager.reqres.setHandler('micaagenda:reunion:runaction', function(model,actionName){
    return API.runAction(model,actionName);
  });

});

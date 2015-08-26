DocManager.module('BackendApp.AgendaMica',function(AgendaMica, DocManager, Backbone, Marionette, $, _){

  var CommonsViews = DocManager.module('BackendApp.Common.Views');

  AgendaMica.ReunionEdit = Marionette.ItemView.extend({
    template: _.template('vista edicion de reunion'),
  });

  AgendaMica.SuscriptorCell = Backgrid.Cell.extend({
      className: "string-cell",
      render: function(){
        var fieldName = this.column.get('name');
        var suscriptor = this.model.get(fieldName);
        this.$el.html(renderLiteSuscriptor(suscriptor));
        return this;
      },
      events: {
        'click': function(e){
          e.stopPropagation();
          var rol = this.column.get('name');
          var suscriptor = this.model.get(rol);
          DocManager.trigger('micaagenda:agendaone:show:popup',suscriptor._id,rol);
        }
      }
  });

  AgendaMica.EstadoReunionCell = Backgrid.Cell.extend({
      className: "string-cell",
      render: function(){
        var fieldName = this.column.get('name');
        var estado = this.model.get('estado');

        var $span = $('<div class="text-center"></span>');
        $span.html(this.model.get(fieldName));
        if(estado === 'unavailable'){
          $span.addClass('text-danger');
          $span.html('<i class="glyphicon glyphicon-alert" style="font-size:18px"></i><br/> Sin disponibilidad');
        }
        this.$el.html($span);
        return this;
      }
  });

  AgendaMica.ActividadCell = Backgrid.Cell.extend({
      className: "string-cell",
      render: function(){
        var fieldName = this.column.get('name');
        var field = this.model.get(fieldName);
        var value = (field)?field.actividades:'';
        this.$el.html(CommonsViews.renderLabelActividad(value));
        return this;
      }
  });

  var drpDwnBtn = _.template('<div class="btn-group" role="group"> '+
              '<button type="button" class="btn btn-xs btn-default dropdown-toggle" title="modificar estado" data-toggle="dropdown" aria-expanded="false"> '+
              '   estado <i class="fa fa-edit"></i> '+
              ' </button> '+
              ' <ul class="dropdown-menu pull-right js-changeStatus" role="menu">'+
              '     <% _.each(tdata.estado_reunion,function(estado){ %> '+
              '         <li><a role="button" data-value="<%=estado.val%>"><%=estado.label%></a></li> '+
              '     <% }) %> '+
              '   </ul> '+
              ' </div>');

  var drpDwnEstadoAltaBtn = _.template('<div class="btn-group" role="group"> '+
              '<button type="button" class="btn btn-xs btn-default dropdown-toggle" title="modificar estado" data-toggle="dropdown" aria-expanded="false"> '+
              '   estado alta <i class="fa fa-edit"></i> '+
              ' </button> '+
              ' <ul class="dropdown-menu pull-right js-changeStatusAlta" role="menu">'+
              '     <% _.each(tdata.estadoalta_reunion,function(estado){ %> '+
              '         <li><a role="button" data-value="<%=estado.val%>"><%=estado.label%></a></li> '+
              '     <% }) %> '+
              '   </ul> '+
              ' </div>');


  AgendaMica.ActionsCells = Backgrid.Cell.extend({
    render: function(){
        if(!this.rendered){
           var $btnRemove = $('<button class="btn btn-xs btn-danger js-trash" title="borrar"><span class="glyphicon glyphicon-remove"></span></button>');
           var $btnChangeStatus = drpDwnBtn();
           this.$el.append($btnRemove).append($btnChangeStatus);
          //  var $btnChageStatusAlta = drpDwnEstadoAltaBtn(); this.$el.append($btnChageStatusAlta);
           this.rendered = true;
           this.$el.find('button').css('width','83px').css('margin-bottom','3px');
        }
      this.$el.css('width','95px');
      return this;
    },
    events: {
      'click .js-trash': 'doRemove',
      'click .js-changeStatus li a': 'doChangeStatus',
      'click .js-changeStatusAlta li a': 'doChangeStatusAlta'
    },
    doRemove: function(e){
      var self = this;
      e.stopPropagation();
      Message.confirm('<h3>¿Está seguro que desea borrar la reunión?</h3>',[{label:'cancelar'},{label:'Si',class:'btn-danger'}],function(r){
        if(r !== 'Si') return;
        var msg = Message.warning('Borrando...');
        var p = DocManager.request('micaagenda:reunion:borrar',self.model);
        p.done(function(){
          msg.update({type:'success',message:'Reunión borrada'});
        }).fail(function(){
          msg.update({type:'danger',message:'No se pudo borrar'});
        });

      });
    },
    doChangeStatus: function(e){
      var self = this;
      var $el = $(e.currentTarget);
      var newStatus = $el.data('value');
      if(newStatus === 'no_definido') return;
      Message.confirm('<h3>¿Está seguro que desea cambiar el estado a la reunión?</h3>',[{label:'cancelar'},{label:'Si',class:'btn-danger'}],function(r){
        if(r !== 'Si') return;
        var msg = Message.warning('Cambiando estado...');
        var p = DocManager.request('micaagenda:reunion:changestatus',self.model,newStatus);
        p.done(function(){
          msg.update({type:'success',message:'Guardado'});
        }).fail(function(){
          msg.update({type:'danger',message:'No se pudo cambiar'});
        });
      });
    },
    doChangeStatusAlta: function(e){
      var self = this;
      var $el = $(e.currentTarget);
      var newStatus = $el.data('value');
      if(newStatus === 'no_definido') return;
      Message.confirm('<h3>¿Está seguro que desea cambiar el estado de alta a la reunión?</h3>',[{label:'cancelar'},{label:'Si',class:'btn-danger'}],function(r){
        if(r !== 'Si') return;
        var msg = Message.warning('Cambiando estado...');
        var p = DocManager.request('micaagenda:reunion:changestatusalta',self.model,newStatus);
        p.done(function(){
           msg.update({type:'success',message:'Guardado'});
        }).fail(function(err){
          msg.update({type:'danger',message:'No se pudo modificar el estado'});
        });

      });
    }
  });

  AgendaMica.AgendaListItemBox = Marionette.ItemView.extend({
    tagName: 'div',
    className: 'box-agenda',
    template: _.template('<%=num_reunion%>'),
    onRender: function(){
      var estado = this.model.get('estado');

      var flagAddWrap = true;
      if(this._lastClazz){
        this.$el.removeClass(this._lastClazz);
        flagAddWrap = false;
      }
      this._lastClazz = 'box-agenda-'+estado;
      this.$el.addClass(this._lastClazz);

      var tooltip;
      if(estado === 'asignado' || estado === 'borrador'){
        var field = this.options.contraparte_rol;
        var contraparte = this.model.get(field);
        tooltip = contraparte.solicitante.edisplayName +
                  ' \n- '+contraparte.responsable.rname + ' -\n '+ contraparte.actividades;
      }else if(estado === 'libre'){
        tooltip = 'libre';

      }else if(estado === 'bloqueado'){
        tooltip = 'bloqueado';

      }else if(estado === 'unavailable'){
        tooltip = 'No disponible';
      }

      this.$el.attr('data-tooltip',tooltip);

      var num_reunion = parseInt(this.model.get('num_reunion'));
      var wrap = (num_reunion !== 0 && (num_reunion-1) % 12 === 0);
      if(wrap && flagAddWrap){
        var self = this;
        setTimeout(function(){
          self.$el.before('<br>');
        });
      }
    },

    modelEvents: {
      'change': 'render'
    }
  });

  AgendaMica.AgendaListItem = Marionette.ItemView.extend({
    tagName: 'li',
    className: 'list-group-item',
    getTemplate: function(){
      return utils.templates.AgendaListItem;
    },
    templateHelpers: function(){
      var self = this;
      return {
        getContraparte: function(){
          var estado =  self.model.get('estado');
          if(estado === 'libre'){
            return '<div class="text-success">libre</div>';
          }else if(estado === 'bloqueado'){
            return '<div class="text-muted">bloqueado</div>';
          }
          var field = self.options.contraparte_rol;
          var model = self.model;
          var ret = '';
          if(self.model.has(field)){
            var opts = {
              showToolbar:true,
              showActividad:true,
              showOpenAgenda:self.options.isAdmin
            };
            ret = renderSuscriptor(self.model.get(field),opts);
          }

          return ret;
        },
        getActions: function(){
          var actions = [];
          if(self.options.isAdmin){
            actions = self.model.getProdActions();
          }
          return actions;
        },
        getAvatar: function(){
          return self.model.getAvatar();
        },
      };
    },
    onRender: function(){
      var flagAddWrap = true;
      if(this._lastClazz){
        flagAddWrap = false;
        this.$el.removeClass(this._lastClazz);
      }
      this._lastClazz = 'list-item-agenda-'+this.model.get('estado');
      this.$el.addClass(this._lastClazz);
      var num_reunion = parseInt(this.model.get('num_reunion'));
      var wrap = ((num_reunion-1) % 12 === 0);
      if(wrap && flagAddWrap){
        var self = this;
        setTimeout(function(){
          var numDia =  (num_reunion/12) | 0;
          numDia += 1;
          self.$el.before('<li class="list-group-item list-item-space"><div>Día '+numDia+'</div></li>');
        });
      }
    },

    modelEvents: {
      'change': 'render'
    },
    events: {
      'click .js-runaction': 'runAction',
      'click .js-openagenda': 'openAgenda',
      'click .js-openperfil': 'openPerfil',
      'click .js-countassigned': 'countAssigned'
    },

    openAgenda: function(e){
      e.stopPropagation();
      var rol = this.options.contraparte_rol;
      var suscriptor = this.model.get(rol);
      DocManager.trigger('micaagenda:agendaone:show:popup',suscriptor._id,rol);
    },

    openPerfil: function(e){
      e.stopPropagation();
      var rol = this.options.contraparte_rol;
      var suscriptor = this.model.get(rol);
      DocManager.trigger('micaagenda:profile:show:popup',suscriptor._id);
    },

    countAssigned: function(e){
      e.stopPropagation();
      var rol = this.options.contraparte_rol;
      var suscriptor = this.model.get(rol);
      var p = DocManager.request('micaagenda:profile:count',suscriptor);
      p.done(function(result){
        if(result){
          Message.info('Comprador: '+result.comprador + '  ' + 'Vendedor: '+result.vendedor);
        }
      });
    },

    runAction: function(e){
      var self = this;
      var model = this.model;
      var rol = this.options.rol;
      var contraparteRol = this.options.contraparte_rol;
      var actionName = $(e.currentTarget).data('name');

      if(actionName === 'liberar'){
        Message.confirm('<h3 class="text-center">¿Está seguro que desea liberar la reunión?</h3>',
                          ['cancelar',{label:'Liberar',class:'btn-danger'}],function(r){
            if(r === 'Liberar'){
              DocManager.request('micaagenda:reunion:runaction',model,actionName,rol);
            }
          });
      }else if(actionName === 'asignarcnumber'){
        AgendaMica.Controller.asignarByCNumber(this.model,contraparteRol);

      }else{
        DocManager.request('micaagenda:reunion:runaction',model,actionName);
      }
    }
  });

  AgendaMica.AgendaSubList = Marionette.CollectionView.extend({
    childView: AgendaMica.AgendaListItemBox,
    childViewOptions: function(model,index){
      var self = this;
      return {
        rol: self.rol,
        contraparte_rol: self.options.contraparte_rol
      };
    }
  });

  AgendaMica.AgendaList = Marionette.CompositeView.extend({
    initialize: function(opts){
      this.rol = opts.rol;
      this.contraparte_rol = (opts.rol === 'comprador') ? 'vendedor' : 'comprador';
      var self = this;

      this.handlerMicaChanged = function(){
        self.collection.refresh();
      };
      DocManager.on('micaagenda:changed',this.handlerMicaChanged);
    },
    template: _.template('<div class="text-muted well"> '+
                         '  <h3 style="margin:0;margin-bottom:5px;">La agenda <small>como</small> <span class="label-rol" style="font-size: 18px"></span></h3>'+
                         '  <div class="owner-container"></div>  '+
                         //'         <div class="pull-right"><button class="btn btn-default bt-sm"> <i class="glyphicon glyphicon-th-list"></i>  </button><button class="btn btn-default bt-sm"> <i class="glyphicon glyphicon-th"></i> </button></div>  '+
                         //'         <div class="clearfix"></div> '+
                         '</div><div class="map-list well text-center" style="margin-bottom:20px"></div> <ul class="list-group"></ul>'),
    childViewContainer: 'ul',
    childView: AgendaMica.AgendaListItem,
    childViewOptions: function(model,index){
      var self = this;
      return {
        rol: self.rol,
        contraparte_rol:  self.contraparte_rol,
        isAdmin: self.options.isAdmin
      };
    },

    onRender: function(){
      var self = this;
      this.renderOwner();
    },

    onDestroy: function(){
      if(this.handlerMicaChanged){
        DocManager.unbind('micaagenda:changed',this.handlerMicaChanged);
        this.handlerMicaChanged = null;
      }
      if(this.mapList){
        this.mapList.destroy();
        this.mapList = null;
      }
    },

    renderOwner: function(){
      var rol = this.options.rol;
      var ret = '';
      if(this.collection.length > 0){
        var tmp = this.collection.at(0);
        ret = renderSuscriptor(tmp.get(rol),{showToolbar:false,showActividad:true});
      }
      this.$el.find('.owner-container').html(ret);
      this.$el.find('.label-rol').html(rol);
    },

    collectionEvents: {
      'change': 'onChangeCollection'
    },

    onChangeCollection: function(){
      this.render();
      var self = this;
      if(!this.mapList){
        this.mapList = new AgendaMica.AgendaSubList({collection:self.collection,contraparte_rol:self.contraparte_rol});
      }
      this.mapList.$el.empty();
      self.$el.find('.map-list').html(this.mapList.render().$el);

      self.renderOwner();

      var $children = self.$el.find('.list-item-agenda-unavailable');
      if($children.length > 0){
        $($children[$children.length-1])
          .css('border-bottom','1px solid #FF4136')
          .css('margin-bottom','10px');
      }

      var parentWidth = self.$el.parent().width();
      if(parentWidth < 400){
        self.$el.find('.hidden-xs').hide();
        // self.$el.parent().on('mousewheel',function(e,delta){
        //   if (this.scrollTop < 1 && delta > 0 ||
        //         (this.clientHeight + this.scrollTop) === this.scrollHeight && delta < 0
        //     ) {
        //       e.preventDefault();
        //     }
        // });
      }
    }

  });

  AgendaMica.AgendaPage = Marionette.LayoutView.extend({
    className: 'wrapper',
    template: _.template('<div style="margin-bottom:20px;"> <button class="btn btn-default btn-sm js-back"><span class="fa fa-angle-left"></span> Volver</button></div><div class="body-container"></div>'),
    regions: {
      'bodyRegion': '.body-container'
    },
    events: {
      'click .js-back':function(e){
        DocManager.navigateBack();
      }
    }
  });

  // doc ref: https://github.com/nicolaskruchten/pivottable
  AgendaMica.EstadisticView = Marionette.ItemView.extend({
    className: 'wrapper',
    template: _.template('<h1>Estadisticas</h1><div style="margin-bottom: 10px"><button class="btn btn-default btn-sm js-back"><span class="fa fa-angle-left"></span> Volver</button></div><div class="pivot"></div>'),
    //childView: RecountItem,
    //childViewContainer: '.body-container',
    initialize: function(opts){
      var self = this;
      opts.collection.once('change',function(){
          self.renderPivot();
      });
    },
    onRender: function(){
      if(this.collection && this.collection.length > 0){
        this.renderPivot();
      }
    },

    renderPivot: function(){
      var dataSource = this.collection.toJSON();
      var $pivot = this.$el.find('.pivot').pivot(dataSource,{
              localeStrings: $.pivotUtilities.locales.es.localeStrings,
              rows: ["number"],
              cols: ["actividad"],
              aggregator: function(data,rowKey,colKey){
                return {
                  count: 0,
                  push: function(record) { this.count += record.subtotal_count; },
                  value: function() { return this.count; },
                  format: function(x) { return x; },
                  label: "Cantidad"
                };
              }
      });
    },

    events: {
      'click .js-back': function(){
        DocManager.navigateBack();
      }
    }
  });

  AgendaMica.MeetingUnavailableView = Marionette.ItemView.extend({
    template: _.template('<h3><p class="text-center text-danger">No disponible</p>'+
                         '<p>El <%=rol%> <i><%=mainName%></i> ya tiene asignado la reunión #<%=num_reunion%> con' +
                         ' <i><%=contraparteName%></i> </p></h3>' +
                         '<p class="btn-link js-openagenda text-primary">ver la agenda del <i><%=rol%> <%=mainName%></i></p>'),
   serializeData: function(){
     var data = this.model.toJSON();
     data.rol = this.options.rol;
     data.contraparte_rol = (data.rol === 'comprador') ? 'vendedor' : 'comprador';
     var main = this.model.get(data.rol);
     var contraparte = this.model.get(data.contraparte_rol);
     data.mainName = main.solicitante.edisplayName;//TODO ver cnumber + ' ('+main.cnumber+')';
     data.contraparteName = contraparte.solicitante.edisplayName;//TODO:ver cnumber + ' ('+contraparte.cnumber+')';;
     return data;
   },
   events: {
     'click .js-openagenda': 'openAgenda'
   },
    openAgenda: function(e){
      e.stopPropagation();
      this.trigger('closepopup');
      var rol = this.options.rol;
      var suscriptor = this.model.get(rol);
      DocManager.trigger('micaagenda:agendaone:show:popup',suscriptor._id,rol);
    }
  });

  AgendaMica.showMettingUnavailable = function(rol,reunion){
    var view = new AgendaMica.MeetingUnavailableView({rol:rol,model:reunion});

    var modal = new Backbone.BootstrapModal({
      content: view,
      okText: 'Cerrar',
      cancelText: '',
      enterTriggersOk: false,
    });

    //BOTONES POR DEFECTO
    modal.listenTo(modal,'ok',function(){
      modal.close();
    });

    modal.listenTo(modal,'cancel',function(){
      modal.close();
    });

    view.once('closepopup',function(){
      modal.close();
    });

    modal.open();
    return modal;
  };

  AgendaMica.showHaveAlready = function(msg){
    var view = '<h3><p class="text-center text-danger">Ya asignados</p><p class="text-center">'+ msg + '</p></h3>';

    var modal = new Backbone.BootstrapModal({
      content: view,
      okText: 'Cerrar',
      cancelText: '',
      enterTriggersOk: false,
    });

    //BOTONES POR DEFECTO
    modal.listenTo(modal,'ok',function(){
      modal.close();
    });

    modal.listenTo(modal,'cancel',function(){
      modal.close();
    });

    modal.open();
    return modal;
  };

  AgendaMica.requestCnumberUI = function(reunion,rol,callback){
    var contentStr = '<h4>Asignar reunión #'+reunion.get('num_reunion')+'</h4> <input type="text" class="form-control" placeholder="Ingrese código del '+rol+'" />';

    var modal = new Backbone.BootstrapModal({
      content: contentStr,
      okText: 'Asignar',
      cancelText: 'cancelar',
      enterTriggersOk: false,
    });

    //BOTONES POR DEFECTO
    modal.listenTo(modal,'ok',function(){
      callback(modal.$el.find('input[type=text]').val());
      modal.close();
    });

    modal.listenTo(modal,'cancel',function(){
      callback();
      modal.close();
    });
    modal.open();
    setTimeout(function(){
      modal.$el.find('input[type=text]').focus();
    });
    return modal;
  };

  /**
   *  Es un suscriptor serializado para micaagenda
   *  @param {Object} opts - {showActividad:bool,showToolbar:bool,showOpenAgenda:bool}
   */
  var renderSuscriptor = function(suscriptor,opts){
    if(!suscriptor || !suscriptor.responsable) return '';
    var responsable = suscriptor.responsable;
    var solicitante = suscriptor.solicitante;

    var template = utils.templates.AgendaSolicitanteRender;

    str = template({
      showToolbar: opts.showToolbar,
      showOpenAgenda: opts.showOpenAgenda,
      solicitante:solicitante,
      getAvatar: function(){
        var avatar = this.solicitante.eavatar;
        if(avatar && avatar.urlpath){
          return avatar.urlpath;
        }else{
          return 'mica/images/back-dotted.png';
        }
      },
      cnumber: suscriptor.cnumber,
      getActividad: function(){
        if(opts.showActividad){
          var $span = CommonsViews.renderLabelActividad(suscriptor.actividades);
          return $span.prop('outerHTML');
        }
        return '';
      }
    });

    return str;
  };
  CommonsViews.renderSuscriptor = renderSuscriptor;

  var renderLiteSuscriptor = function(suscriptor,showActividad){
    if(!suscriptor || !suscriptor.responsable) return '';
    var responsable = suscriptor.responsable;
    var solicitante = suscriptor.solicitante;
    var str = '<strong class="text-primary">'+solicitante.edisplayName + ' ('+suscriptor.cnumber+')' +'</strong> '+
              '<div class="hidden-xs"><div>'+responsable.rname + ' ('+responsable.rcargo+')' +'</div> '+
              '<div>'+  responsable.rmail + '</div> </div>';
    if(showActividad){
      var $span = CommonsViews.renderLabelActividad(suscriptor.actividades);
      str += $span.prop('outerHTML');
    }
    return str;
  };

});

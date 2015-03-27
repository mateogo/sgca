DocManager.module("AgendaApp.List", function(List, DocManager, Backbone, Marionette, $, _){
  
  var Entities =  DocManager.module('Entities');
  
  List.Layout = Marionette.LayoutView.extend({
    className: '',

    getTemplate: function(){
      return utils.templates.AgendaLayoutView;
    },
    
    regions: {
      tagFiterRegion:    '#tagfilter-region',
      mainRegion:    '#main-region'
    },
    
    events: {
      'click .js-filter': 'filterClicked'
    },
    filterClicked: function(e){
      e.stopPropagation();
      DocManager.trigger('agenda:openFilter');
    }
    
    
  });
  
  var RowView = Marionette.ItemView.extend({
    tagName: 'div',
    getTemplate: function(){
      return utils.templates.AgendaItemRender;
    },
    
    templateHelpers: function(){
      var self = this;
      return {
        formatDate: function(date){
          return moment(date).format('dddd LL');
        },
        getLabelWhen: function(){
          var str = '';
          if(self.model.get('fdesde')){
            str += this.formatDate(self.model.get('fdesde'));
          }
          if(self.model.get('fhasta')){
            str += ' al '+ this.formatDate(self.model.get('fhasta'));
          }
          
          return str;
        }
      };
    }
    
  });

  List.Table = Marionette.CollectionView.extend({
    childView: RowView
  });
  
  List.TagFilterView = Marionette.ItemView.extend({
    tagName: 'div',
    render: function(){
      this.$el.empty();
      var obj = this.model.toJSON();
      for(var key in obj){
        var text = this.renderField(key,obj[key]);
        
        this.$el.append($('<label></label>',{text:text,'class':'label label-primary'}));
      }
    },
    renderField: function(key,value){
      if(key === 'desde' || key === 'hasta'){
        return this.renderDate(key,value);
      }else{
        return this.getKeyLabel(key) + ': '+value;
      }
    },
    renderDate: function(key,value){
      return this.getKeyLabel(key) + ': ' + moment(value).format('LL');
    },
    
    getKeyLabel: function(key){
      var label = key;
      if(key in this.model.schema && this.model.schema[key].title){
        label = this.model.schema[key].title;
      }
      return label;
    }
  });
  
  
  List.FilterPopup = function(filter){
    if(!filter){
      filter = new Entities.AgendaFilter();
    }
    var form = new Backbone.Form({model:filter});
    
    var modal = new Backbone.BootstrapModal({
      content: form,
      title: 'Filtrar Actividades Artísticas',
      okText: 'aceptar',
      cancelText: 'cancelar',
      enterTriggersOk: false,
    });
    
    modal.on('ok',function(){
        form.commit();
        DocManager.trigger('agenda:filter',filter);
    });
    
    modal.open();
  };
  
  List.FilterView = Marionette.LayoutView.extend({
    getTemplate: function(){
      return utils.templates.AgendaFilterView;
    },
    onRender: function(){
      this.form = new Backbone.Form({model:this.model});
      
      this.$el.find('#form-region').html(this.form.render().el);
    },
    
    doFilter: function(modo){
      this.form.commit();
      this.model.set('modo',modo);
      
      var newWin = this.$el.find('#checkNewWin').prop('checked');
      DocManager.trigger('agenda:list',this.model,newWin);
    },
    
    events: {
      'click .js-resumido': 'onResumido',
      'click .js-detallado': 'onDetallado'
    },
    
    onResumido: function(e){
      this.doFilter('resumido');
    },
    
    onDetallado: function(e){
      this.doFilter('detallado');
    }
  });

});
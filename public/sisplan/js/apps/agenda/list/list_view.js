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
        return key + ': '+value;
      }
    },
    renderDate: function(key,value){
      return key + ': ' + moment(value).format('LL');
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

});
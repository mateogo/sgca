DocManager.module("WorkflowApp.Show", function(Show, DocManager, Backbone, Marionette, $, _){


  var SolicitudShow = DocManager.module('SolicitudApp.Show');

  Show.DisplayTokenView = Marionette.LayoutView.extend({
    getTemplate: function(){
      return utils.templates.DisplayTokenView;
    },
    regions: {
      detailRegion: '#detail-region',
      actionList: '#actionList'
    },

    onRender: function(){
      var obj = this.model.get('obj');
      this.detailRegion.show(new SolicitudShow.ShowLayoutView({model:obj}));
    },

    events: {
      'click .js-back': 'onBack',
      'click .js-history': 'onHistory'
    },

    onBack: function(){
      DocManager.trigger('query:runLastQuery');
    },

    onHistory: function(){
      DocManager.trigger('action:history',this.model.get('obj_id'));
    }
  });


  var ItemAction = Marionette.CollectionView.extend({
    tagName: 'button',
    className: 'btn btn-default btn-sm',
    template: _.template('<%=title%>'),
    onRender: function(){
      // this.$el.html('<a>'+this.model.get('title')+'</a>');
      this.$el.html(this.model.get('title'));
      this.$el.css('display','inline-block').css('margin-left','5px');
    },
    events:{
      'click': 'onClick'
    },
    onClick: function(){
      this.trigger('action:run',this.model);
    }
  });

  Show.ActionsListView = Marionette.CollectionView.extend({
      childView: ItemAction,
      tagName: 'span',
      childEvents: {
        'action:run': function(e,model){
          this.trigger('action:run',model);
        }
      },
      onRender: function(){
      }
  });

});

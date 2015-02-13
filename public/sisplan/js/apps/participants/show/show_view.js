DocManager.module('ParticipantsApp.Show',function(Show, DocManager, Backbone, Marionette, $, _){
    
  
    Show.ParticipantView = Marionette.ItemView.extend({
      className: 'panel',
      
      getTemplate: function(){
        return utils.templates.ParticipantsShow;
      },
      
      initialize : function(opts){
        this.collection = opts.action.participants;
        this.action =  opts.action;
        this.canEdit = (typeof opts.disabledEdit === undefined || opts.disabledEdit !== true);
        this.collapsable = opts.collapsable === true;
        
        this.listenTo(this.collection,'change',this.invalidate);
        
        Marionette.ItemView.prototype.initialize.apply(this,opts);
      },
      
      render: function(){
        var o = {
            items : this.collection.toJSON(),
            canEdit: this.canEdit,
            canCollapse: this.collapsable
        };
        this.$el.html(this.getTemplate()(o));
      },
      
      invalidate: function(){
        clearTimeout(this.handler);
        this.handler = setTimeout(this.render,100);
      },
      
      events: {
        'click .js-edit': 'editClicked',
        'click [data-toggle="collapse"]': 'onCollapseClick'
      },
      
      
      editClicked: function(e){
        e.preventDefault(); e.stopPropagation();
        var pos = $(e.currentTarget).data('pos');
        var participant = this.collection.at(pos);
        DocManager.trigger('participant:edit',this.action,participant);
      },
      
      onCollapseClick: function(e){
        if(!this.collapsable){
          return;
        }
        
        var t = $(e.currentTarget).data('target');
        $(t).toggleClass('collapse');
        
        
        var $icon = $(e.currentTarget).find('i');
        var hasMinus = $icon.hasClass('glyphicon-minus');
        $icon.toggleClass('glyphicon-minus',!hasMinus).toggleClass('glyphicon-plus',hasMinus);
      }
    });
});
DocManager.module('ParticipantsApp.Show',function(Show, DocManager, Backbone, Marionette, $, _){
    
  
    Show.ParticipantView = Marionette.ItemView.extend({
      className: 'panel',
      
      initialize : function(opts){
        this.collection = opts.action.participants;
        this.action =  opts.action;
        
        this.listenTo(this.collection,'change',this.invalidate);
        
        Marionette.ItemView.prototype.initialize.apply(this,opts);
      },
      
      getTemplate: function(){
        return utils.templates.ParticipantsShow;
      },
      
      
      render: function(){
        var o = {
            items : this.collection.toJSON()
        };
        this.$el.html(this.getTemplate()(o));
      },
      
      invalidate: function(){
        clearTimeout(this.handler);
        this.handler = setTimeout(this.render,100);
      },
      
      events: {
        'click .js-edit': 'editClicked'
      },
      
      
      editClicked: function(e){
        e.preventDefault(); e.stopPropagation();
        var pos = $(e.currentTarget).data('pos');
        var participant = this.collection.at(pos);
        DocManager.trigger('participant:edit',this.action,participant);
      }
    });
});
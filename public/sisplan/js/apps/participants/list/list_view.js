DocManager.module("ParticipantsApp.List", function(List, DocManager, Backbone, Marionette, $, _){

  var participantsApp = DocManager.module('ParticipantsApp');
  
  List.Layout = Marionette.LayoutView.extend({
    className: 'row row-offcanvas row-offcanvas-left',

    getTemplate: function(){
      return utils.templates.ParticipantListLayoutView;
    },
    
    regions: {
      navbarRegion:  '#navbar-region',
      sidebarRegion: '#sidebar-region',
      linksRegion:   '#panel-region',
      mainRegion:    '#main-region',
      tableRegion: '#table-region'
    },
    
    events: {
      'click button.js-participantnew': 'newClicked'
    },
    
    newClicked: function(e){
      this.trigger('participant:new');
    },
    
    
  });

  List.ActionNotFound = Marionette.ItemView.extend({
    getTemplate: function(){
      return utils.templates.ActionNotFound;
    }
  })
  
  var NoParticipantsView = Marionette.ItemView.extend({
    template: _.template('<td colspan="7">No hay participantes para mostrar</td>'),
    tagName: "tr",
    className: "alert"
  });
  
  List.Participant = Marionette.ItemView.extend({
    tagName: "tr",

    getTemplate: function(){
      return _.template(utils.buildRowRenderTemplate(utils.participantListTableHeader,utils.buildTableRowTemplates));
    },
    
    events: {
      'click button.js-edit': 'editClicked',
      'click button.js-trash': 'trashClicked',
    },
    
    editClicked: function(e){
      e.stopPropagation();e.preventDefault();
      //this.trigger('participant:edit',this.model);
      DocManager.trigger('participant:edit',participantsApp.Model.selectedAction,this.model);
    },
    
    trashClicked: function(e){
      e.stopPropagation();e.preventDefault();
      //this.trigger('participant:remove',this.model);
      DocManager.trigger('participant:remove',participantsApp.Model.selectedAction,this.model);
    }
    
  });

  List.Participants = Marionette.CompositeView.extend({
    tagName: "table",
    className: "table table-bordered table-hover table-condensed",

    getTemplate: function(){
      //console.log(utils.buildTableHeader(utils.documListTableHeader));
      return _.template(utils.buildTableHeader(utils.participantListTableHeader)+'<tbody></tbody>');
    },

    emptyView: NoParticipantsView,
    childView: List.Participant,
    childViewContainer: "tbody",

    events: {
      'click .js-sortcolumn': 'changeOrder',
      
    },

    changeOrder: function(event){
      var target = event.target;
      console.log('CLICKKKKKKKK!!!! [%s] [%s]',target,target.name);
      this.trigger("action:sort", target.name);
    },
    
    initialize: function(){
      this.listenTo(this.collection, "reset", function(){
        console.log('LIST_VIEW collection reset');
        this.appendHtml = function(collectionView, childView, index){
          collectionView.$el.append(childView.el);
        }
      });
      
      var self = this;
      this.listenTo(this.collection,'change',function(){
        self.render();
      })
    },

    onRenderCollection: function(){
      this.appendHtml = function(collectionView, childView, index){
        console.log('onRenderCollection.appendHtml');
        collectionView.$el.prepend(childView.el);
      }
    }
  });
  
  
});
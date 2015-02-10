DocManager.module("ParticipantsApp.Edit", function(Edit, DocManager, Backbone, Marionette, $, _){
  
  Edit.ContactInfo = Marionette.ItemView.extend({
    tagName: 'div',
    mode: 'view',
    
    getTemplate: function(){
      return (this.mode == 'view')? utils.templates.PartipantContactInfo : utils.templates.PartipantContactInfoEditor;
    },
    
    events: {
      'click .js-edit': 'addClicked',
      'click .js-ok': 'okClicked',
      'click .js-cancel': 'cancelClicked',
      'click [role=typeItem]': 'typeItemCLicked',
    },
    
    render: function(){
      var obj = this.model.toJSON();
      obj.typesContact = [{icon:'glyphicon glyphicon-envelope',name:'email'},
                          {icon:'glyphicon glyphicon-earphone',name:'teléfono'},
                          {icon:'glyphicon glyphicon-home',name:'dirección'},
                          {icon:'glyphicon glyphicon-globe',name:'web'},
                          {icon:'glyphicon glyphicon-info-sign',name:'información'},
                          ];
      obj.subContents = ['principal','trabajo','personal','otro'];
      $(this.el).html(this.getTemplate()(obj));
    },
    
    
    save: function(){
      var contactdata = $(this.el).find('#inputData').val();
      this.model.set('contactdata',contactdata);
    },
    
    addClicked: function(e){
      this.mode = 'editor';
      this.render();
    },
    
    okClicked: function(e){
      this.save();
      this.mode = 'view';
      this.render();
    },
    
    cancelClicked: function(e){
      this.mode = 'view';
      this.render();
    },
    
    typeItemCLicked: function(e){
      var pos = $(e.currentTarget).data('pos');
      alert('jeje ');
    }

  })  
})
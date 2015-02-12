DocManager.module("ParticipantsApp.Edit", function(Edit, DocManager, Backbone, Marionette, $, _){
  
  var TypesContact = {
      
      getTypeByName: function(name){
        var type = _.findWhere(TypesContact.data,{name:name});
        if(!type){
            type = _.findWhere(TypesContact.data,{name:'informacion'});
        }
        return type;
        
      },
      
      data: [{icon:'envelope',name:'email',label:'email'},
              {icon:'earphone',name:'telefono',label:'Teléfono'},
              {icon:'home',name:'direccion',label:'Dirección'},
              {icon:'globe',name:'web',label:'web'},
              {icon:'info-sign',name:'informacion',label:'Información'}]
  };
  
  var SubContents = ['principal','trabajo','personal','otro'];
  
  Edit.ContactInfo = Marionette.ItemView.extend({
    tagName: 'div',
    mode: 'view',
    
    initialize: function(opts){
      if(opts.model){
        this.editModel = opts.model.toJSON();
        if(!this.editModel.icon){
          this.editModel.icon = TypesContact.getTypeByName(this.editModel.tipocontacto).icon;
        }
      }
      
      if(opts.mode){
        this.mode = opts.mode;
      }
      
      Marionette.ItemView.prototype.initialize.apply(this,opts);
    },
    
    getTemplate: function(){
      return (this.mode == 'view')? utils.templates.PartipantContactInfo : utils.templates.PartipantContactInfoEditor;
    },
    
    events: {
      'click .js-edit': 'editClicked',
      'click .js-ok': 'okClicked',
      'click .js-remove': 'removeClicked',
      'change #inputData': 'dataChanged',
      'keydown #inputData': 'dataKeydown',
      'click [role=typeItem]': 'typeItemClicked',
      'click [role=subContentItem]': 'subContentItemClicked'
    },
    
    render: function(){
      var obj = _.clone(this.editModel);
      obj.typesContact = TypesContact.data;
      obj.subContents = SubContents;
      $(this.el).html(this.getTemplate()(obj));
    },
    
    getValue: function(){
      return this.editModel;
    },
    
    commit: function(){
      this.model.set(this.editModel);
      return this.model;
    },
    
    save: function(){
      var contactdata = $(this.el).find('#inputData').val();
      this.editModel.contactdata = contactdata;
    },
    
    
    cancelEdit: function(){
      this.mode = 'view';
      this.render();
    },
    
    editClicked: function(e){
      this.mode = 'editor';
      this.render();
    },
    
    okClicked: function(e){
      this.save();
      this.mode = 'view';
      this.render();
    },
    
    removeClicked: function(e){
      this.trigger('removed',this);
    },
    
    dataChanged:function(e){
      this.editModel.contactdata = $(this.el).find('#inputData').val();
    },
    
    dataKeydown: function(e){
      if(e.keyCode == 13){
        e.preventDefault();e.stopPropagation();
        this.okClicked();
        
      }else if(e.keyCode == 27){
        e.preventDefault();e.stopPropagation();
        this.cancelEdit();
      }
    },
    
    typeItemClicked: function(e){
      var pos = $(e.currentTarget).data('pos');
      var type = TypesContact.data[pos];
      this.editModel.tipocontacto = type.name;
      this.editModel.icon = type.icon;
      this.render();
    },
    
    subContentItemClicked: function(e){
      var pos = $(e.currentTarget).data('pos');
      var subcontent = SubContents[pos];
      this.editModel.subcontenido = subcontent;
      this.render();
    }

  });  
});
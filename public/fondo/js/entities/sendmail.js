DocManager.module("Entities", function(Entities, DocManager, Backbone, Marionette, $, _){

    Entities.SendMail = Backbone.Model.extend({
        urlRoot: "/sendmail",
        whoami: 'sendmail:backboneModel ',

        initialize: function (model, options) {
            if(options) this.options = options;
        },

        defaults: {
            from: '',
            to:'',
            cc:'',
            subject:'',
            html:'',

            toName: '',
            cnumber: '',
            fecomp: '',
            nodeId: '',
            slug: '',
            server: '',
           
        },
        setTemplate: function(tpl){
            this.template = tpl;
        },

        getMailContent: function(){
            return this.template(this.toJSON());
        },

        buildMailContent: function(data){
            this.set('html', this.template(this.toJSON()));
        },
        
        sendmail : function (){
            console.log('sendmail: Entities')
        
            $.ajax({
            type: "POST",
            url: "/sendmail",
            dataType: "text",
            data: this.toJSON(),
            success: function(data){
              console.log('Mail Enviado!!!!!')
            }
            });
        
        },
    
    });



});
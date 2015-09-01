DocManager.module("HomeApp.Show", function(Show, DocManager, Backbone, Marionette, $, _){
	
	Show.HomeLayoutView = Marionette.LayoutView.extend({
		getTemplate: function(){ 
			return utils.templates.HomeShowLayoutView;
		},
		regions: {
			mainRegion: '#submain-region',
		  featureRegion: '#feature-block-region',
		  itemsRegion: '#feature-items-region',
		  galleryRegion: '#gallery-grid-region',
		}
	});
	
	Show.RegisterView = Marionette.ItemView.extend({
		whoami: 'RegisterView:show_view.js',

    events: {
		//	"click .js-insertuser"     : "insertNewUser",     
			"change"	: "change",
		},
		
		insertNewUser: function(e){
			e.preventDefault();
			var self = this;
			
//		Fecha y hora del alta
			var fealta = new Date(),
					fecomp = utils.dateTimeToStr(fealta);
			
			self.model.set({
				fealta:fecomp,
				target:'mica'
			});
			
			self.model.validusername(this.model.get('username'),function(error){
				if(error){
					//console.log('error')
				}else{
					var errors = self.model.validate(self.model.attributes, {strict: true});
					if(errors){
						self.displayValidationErrors(errors);
					}else{
						
						self.model.addNewUser(function(user){
							$('#loginbox').toggleClass('hide show');
							$('#signupbox').toggleClass('hide show');
						});
						
					} 
				}
				
			});
		
		},  
//	end insertNewUser
		
		change: function(event){
			var target = event.target;
			var change = {};
			var error;

			if(target.type==='checkbox'){
					change[target.name] = target.checked;
			}else{
					change[target.name] = target.value;
			}
			
//		cuando cambia el att name lo seteo como displayName
			if (target.id == 'name'){
				this.model.set({
					displayName: target.value
				});
					
//			temporal para el check de termsofuse
				this.model.set({
					termsofuse: true
				});	
			}
			
//		cuando cambia el att password lo seteo como passwordcopia
			if (target.id == 'login-password'){
				this.model.set({
					passwordcopia: target.value
				});
			}
			
//		cuando cambia el att username lo seteo como mail
			if (target.id == 'username'){
				this.model.set({
					mail: target.value
				});
			};
			
			error = this.model.validate(change);

			if(error){
				if(error[target.name]){
					this.addValidationError(target.id, error[target.name], this.el);
				}else{
					this.removeValidationError(target.id, this.el);            
					this.model.set(change);
				}
			}else{
				this.removeValidationError(target.id, this.el);            
				this.model.set(change);    
			}
		}, 
//	Fin change
		
		displayValidationErrors: function (messages) {
			for (var key in messages) {
					if (messages.hasOwnProperty(key)) {
							this.addValidationError(key, messages[key], this.el);
					}
			}
			
    },

    addValidationError: function (field, message, context) {
			var controlGroup = $('#' + field, context).parent().parent();
			controlGroup.addClass('has-error');
			$('.help-block', controlGroup).html(message);
    },

    removeValidationError: function (field, context) {
			var controlGroup = $('#' + field, context).parent().parent();
			controlGroup.removeClass('has-error');
			$('.help-block', controlGroup).html('');
    },

    render:function () {
			return this;
    }
	
	});
	
	Show.HomeIntroView = Marionette.ItemView.extend({
		
		getTemplate: function(){
			return utils.templates.HomeShowIntroView;
		},
		
		events: {

    },
		

	});
	
	Show.HomeFeatureView = Marionette.CompositeView.extend({
    initialize: function(opts){
    	this.micarqst = opts.micarqst;

    },

		childView: Show.HomeFeatureItemDetail,

    templateHelpers: function(){
      var self = this;

      return {
        profileHasProblems: function(){
          return !self.micarqst.checkConsistency();
        },
        hasProfile: function(){
          return self.micarqst.id;
        },

        isVendedor: function(){
        	if(!self.micarqst.id) return false
          return self.micarqst.isVendedor();
        },

        isComprador: function(){
        	if(!self.micarqst.id) return false
          return self.micarqst.isComprador();
		    },
      };
    },
    
    events: {
			"click .js-agenda-comprador"	: "agendaComprador",
			"click .js-agenda-vendedor"	: "agendaVendedor",
		},
		agendaComprador: function(e){
			e.preventDefault(); e.stopPropagation();
			console.log('Agenda Comprador');
			DocManager.trigger('rondas:browse:agenda:comprador');

		},
		agendaVendedor: function(e){
			e.preventDefault(); e.stopPropagation();
			console.log('Agenda Vendedor');
			DocManager.trigger('rondas:browse:agenda:vendedor');

		},


		getTemplate: function(){
			return utils.templates.HomeShowFeatureItemComposite;
		},

  });


	Show.FeaturesItemsLayout = Marionette.LayoutView.extend({
		getTemplate: function(){
			return utils.templates.HomeShowFeatureItemDetail;
    },
  });	
	Show.HomeFeatureItems = Marionette.CollectionView.extend({
		childView: Show.FeaturesItemsLayout,	
	});
	

	
});

DocManager.module("HomeApp.Show", function(Show, DocManager, Backbone, Marionette, $, _){

	Show.Controller = {

		showHome: function(){

			dao.gestionUser.getUser(DocManager, function (user){

	      if(user.id ){// && dao.gestionUser.hasPermissionTo('mica:user', 'mica', {} ) ){

	        //Verificación: el usuario YA TIENE una inscripción en MICA
	        fetchingMicaRequest = DocManager.request("micarqst:fetchby:user", user, "mica");
	        $.when(fetchingMicaRequest).done(function(micarqst){
	        	launchDashboard(micarqst, dao.gestionUser.hasPermissionTo('mica:manager', 'mica', {} ) );
	        });


				}else{
				  Message.warning('Debe iniciar sesión y estar inscripto en MICA 2015');
				  window.open('/ingresar/#mica', '_self');
				}
			});

		}// end showHome
	};

	var launchDashboard = function(micarqst, isManager){
	  var homeLayout = new Show.HomeLayoutView();
		var home = DocManager.request("home:entity");

		var feature = DocManager.request("features:entity");
		var itemFeature = new DocManager.Entities.FeatureCollection(feature.get('items'));

		var homeView = new Show.HomeIntroView({
			model: home
		});

		var featureHeading = new Show.HomeFeatureView({
			model: feature,
			micarqst: micarqst,
			manager: isManager,
		});

		var featureItems = new Show.HomeFeatureItems({
			collection: itemFeature,
		});

		homeLayout.on("show", function(){
			homeLayout.mainRegion.show(homeView);
			homeLayout.featureRegion.show(featureHeading);
			homeLayout.itemsRegion.show(featureItems);
		});
		DocManager.mainRegion.show(homeLayout);
		DocManager.micarqst = micarqst;
	};

});

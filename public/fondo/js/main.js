utils.loadTemplate([
        'HomeShowLayoutView','HomeShowIntroView',
        'HomeShowFeatureItemComposite','HomeShowFeatureItemDetail',
        // Edit Profile
        'ProfileEditLayout', 'ProfileEditUserForm','ProfileEditPersonForm','ProfileEditRelatedForm','ProfileEditPasswordForm',
        // Menu principal
        'HeaderView',

        // Formulario inscripción
        'inscripcion/FileUploadingForm','inscripcion/FondoMovilidadInscriptionFormLayout','inscripcion/MovilidadCostosForm',
        'inscripcion/MovilidadDatosGeneralesForm','inscripcion/ParticipacionesAnterioresForm','inscripcion/RegistroEntidadForm',

    ], function() {

    $('[data-toggle=offcanvas]').click(function() {
        $('.row-offcanvas').toggleClass('active');
    });
	
    console.log('main: DocManager.start')
    DocManager.start();
});

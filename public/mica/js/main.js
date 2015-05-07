utils.loadTemplate([
        'HomeShowLayoutView','HomeShowIntroView',
        'HomeShowFeatureItemComposite','HomeShowFeatureItemDetail',
        // Edit Profile
        'ProfileEditLayout', 'ProfileEditUserForm','ProfileEditPersonForm','ProfileEditRelatedForm','ProfileEditPasswordForm',
        // Menu principal
        'HeaderView',

        // MailSender
        'MailTemplateDefault','MailFormSubmitNotification',
        // Formulario inscripción
        'inscripcion/MicaInscriptionFormLayout','inscripcion/MicaInscripcion01Form',
        'inscripcion/MicaInscripcion02Layout','inscripcion/MicaInscripcion02Form',
        'inscripcion/MicaInscripcion03Layout','inscripcion/MicaInscripcion03Form',
        'inscripcion/MicaInscripcion04Layout','inscripcion/MicaInscripcion04Form',
        'inscripcion/RepresentanteForm',
        'inscripcion/PorfolioLayout','inscripcion/PorfolioForm',
        'inscripcion/RepresentanteLayout','inscripcion/RepresentanteForm',
        //'inscripcion/FileUploadingForm','inscripcion/FondoMovilidadInscriptionFormLayout','inscripcion/MovilidadCostosForm',
        //'inscripcion/MovilidadDatosGeneralesForm','inscripcion/ParticipacionesAnterioresForm','inscripcion/RegistroEntidadForm',

    ], function() {

    $('[data-toggle=offcanvas]').click(function() {
        $('.row-offcanvas').toggleClass('active');
    });
	
    console.log('main: DocManager.start')
    DocManager.start();
});

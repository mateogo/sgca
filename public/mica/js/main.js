utils.loadTemplate([
        'HomeShowLayoutView','HomeShowIntroView',
        'HomeShowFeatureItemComposite','HomeShowFeatureItemDetail',
        // Edit Profile
        'ProfileEditLayout', 'ProfileEditUserForm','ProfileEditPersonForm','ProfileEditRelatedForm','ProfileEditPasswordForm',
        // Menu principal
        'HeaderView',

        // MailSender
        'MailTemplateDefault','MailFormSubmitNotification','MailFormGuardarProvisorio',

        // terminos y condiciones
        'inscripcion/MicaTerminosYCondiciones',

        // instructivos
        'inscripcion/MicaInstructivoArtesEscenicas',
        'inscripcion/MicaInstructivoMusica',
        'inscripcion/MicaInstructivoDisenio',
        'inscripcion/MicaInstructivoVideojuego',
        'inscripcion/MicaInstructivoAudiovisual',
        'inscripcion/MicaInstructivoEditorial',
        'inscripcion/MicaInstructivoDefault',

        // Avatar
        'attachmentview/PhotosLayoutView','attachmentview/PhotoItem','attachmentview/PhotoItemEditorView',
        'attachmentview/ImageBoxLayoutView','attachmentview/ImageBoxItem',


        // Referencias Editor
        'inscripcion/ReferenciasLayout','inscripcion/ReferenciasFormLayout','inscripcion/ReferenciasItemEditor',
        'inscripcion/ReferenciasItemView','inscripcion/ReferenciasItemList',


        // Formulario inscripción
        'inscripcion/MicaInscriptionFormLayout','inscripcion/MicaInscripcion01Form',
        'inscripcion/MicaInscripcion02Layout','inscripcion/MicaInscripcion02Form',
        'inscripcion/MicaInscripcion03Layout','inscripcion/MicaInscripcion03Form',
        'inscripcion/MicaInscripcion04Layout','inscripcion/MicaInscripcion04Form',
        'inscripcion/RepresentanteForm',
        'inscripcion/PorfolioLayout','inscripcion/PorfolioEditorLayout','inscripcion/PorfolioEditor',
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

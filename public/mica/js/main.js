utils.loadTemplate([
        'HomeShowLayoutView','HomeShowIntroView',
        'HomeShowFeatureItemComposite','HomeShowFeatureItemDetail',
        // Edit Profile
        'ProfileEditLayout', 'ProfileEditUserForm','ProfileEditPersonForm','ProfileEditRelatedForm','ProfileEditPasswordForm',
        // Menu principal
        'header/HeaderView','header/BucketHeaderView',

        // rondas browse
        'browse/FilterProfilesLayout','browse/FilterProfilesEditor','browse/BrowseProfilesLayout',
        'browse/ProfileItemView', 'browse/BrowseProfileView', 'browse/BrowseProfileLayout',
        'browse/InteractionResumeView','browse/AnswerEditor','browse/AskEditor',
        // Administra Inscripciones
        // -- Vistas basicas
        'list/CommonBaseLayout','list/CommonMainLayout','list/CommonModelEditorLayout',
        // -- Ranking
        //'list/CommonBaseLayout','list/CommonMainLayout',

        // -- Lista inscripciones
        'list/MicarequestsLayout','list/MicarequestsView',

        // -- Lista showcase
        'showcaselist/MicaShowcaseListLayout','showcaselist/MicaShowcaseItemLayout','showcaselist/MicaShowcaseItemView',

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

        // Formulario inscripción SHOWCASE
        'showcase/MicaShowcaseFormLayout','showcase/MicaShowcase01Form',
        'showcase/MicaShowcase02Layout','showcase/MicaShowcase02Form',
        'showcase/MicaShowcase03Layout','showcase/MicaShowcase03Form',
        'showcase/MicaShowcase04Layout','showcase/MicaShowcase04Form',
        'showcase/IntegranteLayout','showcase/IntegranteForm',
        'showcase/ReferenceLayout','showcase/ReferenceForm',
        'showcase/MailShowcaseProvisorio','showcase/MailShowcaseDefinitivo',


    ], function() {

    $('[data-toggle=offcanvas]').click(function() {
        $('.row-offcanvas').toggleClass('active');
    });
	
    //console.log('main: DocManager.start')
    DocManager.start();
});

utils.loadTemplate([
        'HomeShowLayoutView','HomeShowIntroView',
        'HomeShowFeatureItemComposite','HomeShowFeatureItemDetail',
        // Edit Profile
        'ProfileEditLayout', 'ProfileEditUserForm','ProfileEditPersonForm','ProfileEditRelatedForm','ProfileEditPasswordForm',
        // Menu principal
        'HeaderView',

        // Formulario inscripción MOVILIDAD
        'fondomov/FondoMovLayout',
        'fondomov/FondoMov01Form',
        'fondomov/FondoMov02Form','fondomov/FondoMov02Layout',
        'fondomov/FondoMov03Form','fondomov/FondoMov03Layout',
        'fondomov/FondoMov04Form','fondomov/FondoMov04Layout',

        // Templates Itinerario
        'itinerario/ItinerarioForm','itinerario/ItinerarioLayout',
        // Templates pasajer
        'pasajeros/PasajeroForm','pasajeros/PasajeroLayout',


        // Avatar
        //'attachmentview/PhotosLayoutView','attachmentview/PhotoItem','attachmentview/PhotoItemEditorView',
        'attachmentview/ImageBoxLayoutView','attachmentview/ImageBoxItem',
        'attachmentview/AttachmentItem','attachmentview/AttachmentItemEditorView','attachmentview/AttachmentLayoutView',

        // Anteriores
        'inscripcion/FileUploadingForm','inscripcion/FondoMovilidadInscriptionFormLayout','inscripcion/MovilidadCostosForm',
        'inscripcion/MovilidadDatosGeneralesForm','inscripcion/ParticipacionesAnterioresForm','inscripcion/RegistroEntidadForm',

    ], function() {

    $('[data-toggle=offcanvas]').click(function() {
        $('.row-offcanvas').toggleClass('active');
    });
	
    console.log('main: DocManager.start')
    DocManager.start();
});

utils.loadTemplate([
        'HomeShowLayoutView','HomeShowIntroView',
        'HomeShowFeatureItemComposite','HomeShowFeatureItemDetail',
        // Edit Profile
        'ProfileEditLayout', 'ProfileEditUserForm','ProfileEditPersonForm','ProfileEditRelatedForm','ProfileEditPasswordForm',
        // Menu principal
        'HeaderView',

        // Formulario inscripción MOVILIDAD
        'salonnacional/SalonMovLayout',
        'salonnacional/SalonMov01Form',
        'salonnacional/SalonMov02Form','salonnacional/SalonMov02Layout',
        'salonnacional/SalonMov03Form','salonnacional/SalonMov03Layout',
        //'salonnacional/SalonMov04Form','salonnacional/SalonMov04Layout',

        // -- Lista inscripciones
        'list/CommonBaseLayout','list/CommonMainLayout',
        'list/SalonrequestsLayout','list/SalonrequestsView','list/CommonModelEditorLayout',



        // Templates Itinerario
        'itinerario/ItinerarioForm','itinerario/ItinerarioLayout',
        // Templates pasajer
        'pasajeros/PasajeroForm','pasajeros/PasajeroLayout',
        
        // mails
        'mailtemplates/MailFormGuardarProvisorio','mailtemplates/MailFormSubmitNotification','mailtemplates/MailTemplateDefault',


        // terminos y condiciones
        'salonnacional/SalonTerminosYCondiciones',


        // Avatar
        //'attachmentview/PhotosLayoutView','attachmentview/PhotoItem','attachmentview/PhotoItemEditorView',
        'attachmentview/ImageBoxLayoutView','attachmentview/ImageBoxItem',
        'attachmentview/AttachmentItem','attachmentview/AttachmentItemEditorView','attachmentview/AttachmentLayoutView',


    ], function() {

    $('[data-toggle=offcanvas]').click(function() {
        $('.row-offcanvas').toggleClass('active');
    });
	
    console.log('main: DocManager.start')
    DocManager.start();
});

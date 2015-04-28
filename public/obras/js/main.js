utils.loadTemplate([

    'HeaderView',
    
    'common/MenuView','common/InternalLayoutView',
    
    'home/HomeView',
    
    'obras/ObrasWizard','obras/ObrasList','obras/ObrasListRow','obras/ObrasEditor',
    'obras/ObrasDescriptionEditor','obras/ObrasResume', 'obras/ObrasPartEditor','obras/ObrasPartStep',
    'obras/ObrasGracias','obras/ObrasItemSelection','obras/ObraItem',
    
    'autor/AutorEditor',
    
    'solicitud/SolicitudList','solicitud/SolicitudListRow',
    'solicitud/SolicitudWizard','solicitud/SolConfirmStep','solicitud/SolDescriptionEditor',
    'solicitud/SolExportadoresStep','solicitud/SolExportadorEditor','solicitud/SolObrasStep',
    'solicitud/SolDocsStep','solicitud/SolGracias',
    
    'attachmentview/AttachmentItemEditorView','attachmentview/AttachmentLayoutView','attachmentview/AttachmentItem',
    'attachmentview/PhotosLayoutView','attachmentview/PhotoItem','attachmentview/PhotoItemEditorView'
    
    ], function() {

    $('[data-toggle=offcanvas]').click(function() {
        $('.row-offcanvas').toggleClass('active');
    });
	
    console.log('main: DocManager.start')
    DocManager.start();
});
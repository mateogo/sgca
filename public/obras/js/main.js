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
    'solicitud/SolDocsStep','solicitud/SolGracias','solicitud/SolEditor',
    
    'attachmentview/AttachmentItemEditorView','attachmentview/AttachmentLayoutView','attachmentview/AttachmentItem',
    'attachmentview/PhotosLayoutView','attachmentview/PhotoItem','attachmentview/PhotoItemEditorView',
    'attachmentview/ImageBoxLayoutView','attachmentview/ImageBoxItem',
    
    ], function() {

    $('[data-toggle=offcanvas]').click(function() {
        $('.row-offcanvas').toggleClass('active');
    });
    
    accounting.settings = {
        currency: {
            symbol : "$",   // default currency symbol is '$'
            format: "%s%v", // controls output: %s = symbol, %v = value/number (can be object: see below)
            decimal : ",",  // decimal point separator
            thousand: ".",  // thousands separator
            precision : 0   // decimal places
        },
        number: {
            precision : 0,  // default precision on numbers is 0
            thousand: ".",
            decimal : ","
        }
    };
	
    console.log('main: DocManager.start')
    DocManager.start();
});
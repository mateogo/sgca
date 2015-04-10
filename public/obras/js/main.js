utils.loadTemplate([

    'HeaderView',
    
    'common/MenuView','common/InternalLayoutView',
    
    'obras/ObrasEditor','obras/ObrasList',
    
    'solicitud/SolicitudEditor'
    
    ], function() {

    $('[data-toggle=offcanvas]').click(function() {
        $('.row-offcanvas').toggleClass('active');
    });
	
    console.log('main: DocManager.start')
    DocManager.start();
});

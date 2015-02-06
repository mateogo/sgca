utils.loadTemplate([

    'HomeShowLayoutView','HomeShowIntroView','HomeShowFeatureItemComposite',
    'HomeShowFeatureItemDetail','HomeShowGalleryItemsView',

    'DocumEditMICore','DocumEditMILayout',
    'DocumEditMIRepresentante','DocumEditMIRepreHeader','DocumEditMIRepreList',
    'ProfileEditLayout', 'ProfileEditUserForm','ProfileEditPersonForm','ProfileEditRelatedForm','ProfileEditPasswordForm',

    'HeaderView', 'AboutView','DocumEditSolLayoutView', 'DocumListLayoutView', 'DocumNavbar',
    'DocumEditMin', 'DocumShowDef','DocumEditPT', 'SearchEntitiesForm','DocumEditPTLayout','DocumEditPTItem',
    'DocumEditRE', 'DocumEditREItem','DocumEditEM','DocumEditEMItem','DocumEditEMHeader', 'DocumShowLayoutView',
    'DocumShowBranding', 'DocumShowHeader','DocumShowPerfilCompra', 'DocumShowPerfilVenta', 'DocumShowOtrosRepreList', 'DocumShowOtrosRepreHeader', 'DocumShowItemPTHeader', 'DocumShowItemLayoutView','DocumShowItemPTComposite',
    'DocumShowItemPTDetail','DocumShowItemREHeader','DocumShowItemREComposite','DocumShowItemREDetail', 
    'DocumShowItemPEHeader', 'DocumShowItemPEComposite', 'DocumShowItemPEDetail',
    'DocumRelatedLayout', 'DocumRelatedPRHeader', 'DocumRelatedPR', 'DocumRelatedDOC',
    'DocumShowItemPDHeader', 'DocumShowItemPDComposite', 'DocumShowItemINSCRComposite', 'DocumShowItemINSCRDetail', 'DocumShowItemINSCRHeader',
    'DocumEditSO','DocumEditSOItem','DocumEditSOLayout',
    'DocumEditPSO','DocumEditPSOItems','DocumEditPSOHeader', 'DocumEditPSOSItems','DocumEditPSOSDetailsHeader','DocumEditPSOSDetails',
    'DocumShowItemSODetail','DocumShowItemSOComposite','DocumShowItemSOHeader',
    'ReportEditLayoutView', 'ReportEditCore', 'ReportNavbar','MailTemplateDefault'], function() {

    $('[data-toggle=offcanvas]').click(function() {
        $('.row-offcanvas').toggleClass('active');
    });
	
    console.log('main: DocManager.start')
    DocManager.start();
});

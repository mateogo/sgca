utils.loadTemplate(['HomeView', 'HeaderView', 

    'ActionEditLayout', 'ActionsNavbar',
    'ActionEditSidebarMenu', 
    'ActionEditMainLayout','ActionMainHeader',
    'ActionInlineFormHook',
    'ActionListLayoutView',
    'ActionBudgetHeader','ActionBudgetItem',
    'ActionShowLegacy','ActionShowHeader','ActionShowBranding','ActionShowBudgetComposite','ActionShowBudgetItem','ActionShowBudgetInstance',
    'ActionNotFound',

    'ProfileEditLayout', 'ProfileEditUserForm','ProfileEditPersonForm','ProfileEditRelatedForm','ProfileEditPasswordForm',

    'ActionReportLayoutView',
    'ActionReportItemLayout','ActionReportBranding','ActionReportBudgetComposite','ActionReportBudgetItem','ActionReportHeader',

    'BudgetListLayoutView','BudgetMainHeader','BudgetNavbar',
    'BudgetShowLegacy','BudgetShowHeader','BudgetShowBranding',

    'BudgetBuildLayout','BudgetBuildArtisticaComposite','BudgetBuildArtisticaItem','BudgetBuildControlPanelView',
 
    'ActivityEditLayout','ActivityEditDetailComposite','ActivityEditItemView','ActivityEditControlPanelView', //'BudgetMainHeader','ActionBudgetItem',
    'ActivityShowBudgetComposite','ActivityShowBudgetLayout','ActivityShowBudgetItemComposite','ActivityShowBudgetItem',


    'BplannerListLayout', 'BplannerListFilterView', 'BplannerListAnalyseView',
    'BplannerListSummaryView','BplannerListSummaryItem','BplannerMultieditView',
   
    'AboutView','DocumEditLayoutView','DocumEditSolLayoutView', 'DocumListLayoutView', 'DocumNavbar',
    'DocumEditMin', 'DocumShowDef','DocumEditCore','DocumEditPT', 'SearchEntitiesForm','DocumEditPTLayout','DocumEditPTItem',
    'DocumEditRE', 'DocumEditREItem','DocumEditEM','DocumEditEMItem','DocumEditEMHeader', 'DocumShowLayoutView',
    'DocumShowBranding', 'DocumShowHeader', 'DocumShowItemPTHeader', 'DocumShowItemLayoutView','DocumShowItemPTComposite',
    'DocumShowItemPTDetail','DocumShowItemREHeader','DocumShowItemREComposite','DocumShowItemREDetail', 
    'DocumShowItemPEHeader', 'DocumShowItemPEComposite', 'DocumShowItemPEDetail',
    'DocumRelatedLayout', 'DocumRelatedPRHeader', 'DocumRelatedPR', 'DocumRelatedDOC',
    'DocumShowItemPDHeader', 'DocumShowItemPDComposite',
    'DocumEditSO','DocumEditSOItem','DocumEditSOLayout',
    'DocumEditPSO','DocumEditPSOItems','DocumEditPSOHeader', 'DocumEditPSOSItems','DocumEditPSOSDetailsHeader','DocumEditPSOSDetails',
    'DocumShowItemSODetail','DocumShowItemSOComposite','DocumShowItemSOHeader',
    'ReportEditLayoutView', 'ReportEditCore', 'ReportNavbar','MailTemplateDefault', 
    
    'ParticipantListLayoutView','ParticipantEdit','PartipantContactInfo','PartipantContactInfoEditor','ParticipantsShow',
    
    'LocationListLayoutView','LocationEdit','LocationEditView',
    
    
    'artactivities/ArtActivityListLayoutView','artactivities/ArtActivityEditLayoutView','artactivities/ArtActivityEditHeaderInfoView',
    'artactivities/ArtActivityResumeView','artactivities/ArtActivityEditBasicView','artactivities/ArtActivityEditBasicForm',
    
    'events/EventListLayoutView','events/EventEditLayout','events/EventEditForm',
    'events/EventDateItemRender','events/EventDateItemEditor',
    
    'agenda/AgendaLayoutView','agenda/AgendaItemRender', 'agenda/AgendaFilterView',
    
    'common/DatePatternForm'
    
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
    //$.datepicker.setDefaults( $.datepicker.regional[ "es" ] );
    console.log('main: DocManager.start')
    DocManager.start();
});

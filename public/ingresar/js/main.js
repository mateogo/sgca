utils.loadTemplate([

    'LoginDefaultLayout','LoginForm','SignUpForm','SignUpFormFields','SignUpFormEmployeeFields',
    'MailAltaUsuarioMica','MailAltaUsuarioObras',
    'RecoveryPassword','MailRecoveryPass','ProfileEditPasswordForm'

    ], function() {


    //$.datepicker.setDefaults( $.datepicker.regional[ "es" ] );
    console.log('main: DocManager.start');
    DocManager.start();
});

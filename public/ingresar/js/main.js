utils.loadTemplate([

    'LoginDefaultLayout','LoginForm','SignUpForm','SignUpFormFields','SignUpFormEmployeeFields',
    'MailAltaUsuarioMica',
    
    ], function() {


    //$.datepicker.setDefaults( $.datepicker.regional[ "es" ] );
    console.log('main: DocManager.start')
    DocManager.start();
});

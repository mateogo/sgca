(function(){
    if(!Backbone.Form){
        return;
    }
    
    
    Backbone.Form.validators.errMessages.dni = 'DNI Invalido';
    Backbone.Form.validators.errMessages.cuit = 'CUIT Invalido';
    
    Backbone.Form.validators.dni = function(options){
        
        options = _.extend({
            type: 'dni',
            message: this.errMessages.dni
          }, options);
        
        
        return function dni(value){
            var err = {
                type: options.type,
                message: options.message
            };
            
            var isInt = /^\d+$/;
            if(value && value !== '' && (value.length !== 8 || !isInt.test(value))){
                return err;
            }
        }; 
    };
    
    Backbone.Form.validators.cuit = function(options){
        options = _.extend({
            type: 'cuit',
            message: this.errMessages.cuit
          }, options);
        
        
        return function cuit(value){
            var err = {
                type: options.type,
                message: options.message
            };
            
            if(value !== '' && !esCUITValida(value)){
                return err;
            }
        }; 
    };
    
    
    function esCUITValida(inputValor) {
        inputString = inputValor.toString();
        if (inputString.length == 11) {
            var Caracters_1_2 = inputString.charAt(0) + inputString.charAt(1);
            if (Caracters_1_2 == "20" || Caracters_1_2 == "23" || Caracters_1_2 == "24" || Caracters_1_2 == "27" || Caracters_1_2 == "30" || Caracters_1_2 == "33" || Caracters_1_2 == "34") {
                var Count = inputString.charAt(0) * 5 + inputString.charAt(1) * 4 + inputString.charAt(2) * 3 + inputString.charAt(3) * 2 + inputString.charAt(4) * 7 + inputString.charAt(5) * 6 + inputString.charAt(6) * 5 + inputString.charAt(7) * 4 + inputString.charAt(8) * 3 + inputString.charAt(9) * 2 + inputString.charAt(10) * 1;
                Division = Count / 11;
                if (Division == Math.floor(Division)) {
                    return true;
                }
            }
        }
        return false;
    }
    
})();
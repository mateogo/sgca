#Ejemplo para estructura organización en el servidor con test y models

/controllers (controladores de servicios, solo deberian tomar los parametros y delegar a servicio o a modelo)

/models (DAO's)

/services (si hace falta servicios, classes middleware)

/spec/test (carpeta de test)
        
        
#Instalación

    $ npm install        
        
        
#Test en servidor

herramienta sugerida para BDD http://jasmine.github.io/2.2/introduction.html


#Para correr

instalar jasmine si no se tiene

    $ npm install -g jasmine

entrar en carpeta calendar

    $ ls calendar

correr jasmine

    $ jasmine            

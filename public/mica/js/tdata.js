window.tdata = {

    whoami:'tdata.js',

    fetchListKey:function(list, key){
        var node = _.find(list, function(data){return data.val === key;});
        return node;
    },
    fetchLabel:function(list, key){
        var node = _.find(list, function(data){return data.val === key;});
        //console.log('LABEL: [%s] - [%s] [%s]',list, key, node ? node.label: key);
        return node ? node.label: key;
    },

    paisLabel:function(list, key){
        var node = _.find(list, function(data){return data.val === key;});
        //console.log('LABEL: [%s] - [%s] [%s]',list, key, node ? node.label: key);
        return node ? node.label: key;
    },

    buildSelectOptions: function(varname, data, actualvalue){
        var template = _.template("<option value='<%= val %>' <%= selected %> ><%= label %></option>");
        var optionStr = '';
        _.each(data,function(element, index, list){
            element.selected = (actualvalue == element.val ? 'selected' : '');
            optionStr += template(element);
        });
        return optionStr;
    },

    buildMultiSelectOptions: function(varname, data, actualvalue){
        var template = _.template("<option value='<%= val %>' <%= selected %> ><%= label %></option>");
        var optionStr = '';
        _.each(data,function(element, index, list){
            if(actualvalue.indexOf(element.val) !== -1 ){
                element.selected = 'selected';
                optionStr += template(element);
            }
        });
        return optionStr;
    },
    getSubactLabel: function(actividad, subactividad){
      if(this.subSectorOL[actividad]){
        return this.fetchLabel(this.subSectorOL[actividad], subactividad);
      }else{
        subactividad;
      }

    },


   	paisesOL: [
	    {val: "no_definido", label: 'Seleccione País'},
      {val: "AR", label:'Argentina'},
      {val: "BO", label:'Bolivia'},
      {val: "BR", label:'Brasil'},
      {val: "CL", label:'Chile'},
      {val: "CO", label:'Colombia'},
     	{val: "CR", label:'Costa Rica'},
      {val: "CU", label:'Cuba'},
      {val: "EC", label:'Ecuador'},
      {val: "GT", label:'Guatemala'},
      {val: "GY", label:'Guayana'},
      {val: "GF", label:'Guayana Francesa'},
      {val: "HN", label:'Honduras'},
      {val: "MX", label:'México'},
      {val: "PY", label:'Paraguay'},
      {val: "PE", label:'Perú'},
      {val: "UY", label:'Uruguay'},
      {val: "VE", label:'Venezuela'},
      {val: "xx", label:'---------------'},
      {val: "AF", label:'Afganistán'},
      {val: "AL", label:'Albania'},
      {val: "DE", label:'Alemania'},
      {val: "AD", label:'Andorra'},
      {val: "AO", label:'Angola'},
      {val: "AI", label:'Anguilla'},
      {val: "AQ", label:'Antártida'},
      {val: "AG", label:'Antigua y Barbuda'},
      {val: "AN", label:'Antillas Holandesas'},
      {val: "SA", label:'Arabia Saudí'},
      {val: "DZ", label:'Argelia'},
      {val: "AM", label:'Armenia'},
      {val: "AW", label:'Aruba'},
      {val: "AU", label:'Australia'},
      {val: "AT", label:'Austria'},
      {val: "AZ", label:'Azerbaiyán'},
      {val: "BS", label:'Bahamas'},
      {val: "BH", label:'Bahrein'},
      {val: "BD", label:'Bangladesh'},
      {val: "BB", label:'Barbados'},
      {val: "BE", label:'Bélgica'},
      {val: "BZ", label:'Belice'},
      {val: "BJ", label:'Benin'},
      {val: "BM", label:'Bermudas'},
      {val: "BY", label:'Bielorrusia'},
      {val: "MM", label:'Birmania'},
      {val: "BA", label:'Bosnia y Herzegovina'},
      {val: "BW", label:'Botswana'},
      {val: "BN", label:'Brunei'},
      {val: "BG", label:'Bulgaria'},
      {val: "BF", label:'Burkina Faso'},
      {val: "BI", label:'Burundi'},
      {val: "BT", label:'Bután'},
      {val: "CV", label:'Cabo Verde'},
      {val: "KH", label:'Camboya'},
      {val: "CM", label:'Camerún'},
      {val: "CA", label:'Canadá'},
      {val: "TD", label:'Chad'},
      {val: "CN", label:'China'},
      {val: "CY", label:'Chipre'},
      {val: "VA", label:'Ciudad del Vaticano (Santa Sede)'},
      {val: "KM", label:'Comores'},
      {val: "CG", label:'Congo'},
      {val: "CD", label:'Congo, República Democrática del'},
      {val: "KR", label:'Corea'},
      {val: "KP", label:'Corea del Norte'},
      {val: "CI", label:'Costa de Marfíl'},
      {val: "HR", label:'Croacia (Hrvatska)'},
      {val: "DK", label:'Dinamarca'},
      {val: "DJ", label:'Djibouti'},
      {val: "DM", label:'Dominica'},
      {val: "EG", label:'Egipto'},
      {val: "SV", label:'El Salvador'},
      {val: "AE", label:'Emiratos Árabes Unidos'},
      {val: "ER", label:'Eritrea'},
      {val: "SI", label:'Eslovenia'},
      {val: "ES", label:'España'},
      {val: "US", label:'Estados Unidos'},
      {val: "EE", label:'Estonia'},
      {val: "ET", label:'Etiopía'},
      {val: "FJ", label:'Fiji'},
      {val: "PH", label:'Filipinas'},
      {val: "FI", label:'Finlandia'},
      {val: "FR", label:'Francia'},
      {val: "GA", label:'Gabón'},
      {val: "GM", label:'Gambia'},
      {val: "GE", label:'Georgia'},
      {val: "GH", label:'Ghana'},
      {val: "GI", label:'Gibraltar'},
      {val: "GD", label:'Granada'},
      {val: "GR", label:'Grecia'},
      {val: "GL", label:'Groenlandia'},
      {val: "GP", label:'Guadalupe'},
      {val: "GU", label:'Guam'},
      {val: "GN", label:'Guinea'},
      {val: "GQ", label:'Guinea Ecuatorial'},
      {val: "GW", label:'Guinea-Bissau'},
      {val: "HT", label:'Haití'},
      {val: "HU", label:'Hungría'},
      {val: "IN", label:'India'},
      {val: "ID", label:'Indonesia'},
      {val: "IQ", label:'Irak'},
      {val: "IR", label:'Irán'},
      {val: "IE", label:'Irlanda'},
      {val: "BV", label:'Isla Bouvet'},
      {val: "CX", label:'Isla de Christmas'},
      {val: "IS", label:'Islandia'},
      {val: "KY", label:'Islas Caimán'},
      {val: "CK", label:'Islas Cook'},
      {val: "CC", label:'Islas de Cocos o Keeling'},
      {val: "FO", label:'Islas Faroe'},
      {val: "HM", label:'Islas Heard y McDonald'},
      {val: "FK", label:'Islas Malvinas'},
      {val: "MP", label:'Islas Marianas del Norte'},
      {val: "MH", label:'Islas Marshall'},
      {val: "UM", label:'Islas menores de Estados Unidos'},
      {val: "PW", label:'Islas Palau'},
      {val: "SB", label:'Islas Salomón'},
      {val: "SJ", label:'Islas Svalbard y Jan Mayen'},
      {val: "TK", label:'Islas Tokelau'},
      {val: "TC", label:'Islas Turks y Caicos'},
      {val: "VI", label:'Islas Vírgenes (EE.UU.)'},
      {val: "VG", label:'Islas Vírgenes (Reino Unido)'},
      {val: "WF", label:'Islas Wallis y Futuna'},
      {val: "IL", label:'Israel'},
      {val: "IT", label:'Italia'},
      {val: "JM", label:'Jamaica'},
      {val: "JP", label:'Japón'},
      {val: "JO", label:'Jordania'},
      {val: "KZ", label:'Kazajistán'},
      {val: "KE", label:'Kenia'},
      {val: "KG", label:'Kirguizistán'},
      {val: "KI", label:'Kiribati'},
      {val: "KW", label:'Kuwait'},
      {val: "LA", label:'Laos'},
      {val: "LS", label:'Lesotho'},
      {val: "LV", label:'Letonia'},
      {val: "LB", label:'Líbano'},
      {val: "LR", label:'Liberia'},
      {val: "LY", label:'Libia'},
      {val: "LI", label:'Liechtenstein'},
      {val: "LT", label:'Lituania'},
      {val: "LU", label:'Luxemburgo'},
      {val: "MK", label:'Macedonia, Ex-República Yugoslava de'},
      {val: "MG", label:'Madagascar'},
      {val: "MY", label:'Malasia'},
      {val: "MW", label:'Malawi'},
      {val: "MV", label:'Maldivas'},
      {val: "ML", label:'Malí'},
      {val: "MT", label:'Malta'},
      {val: "MA", label:'Marruecos'},
      {val: "MQ", label:'Martinica'},
      {val: "MU", label:'Mauricio'},
      {val: "MR", label:'Mauritania'},
      {val: "YT", label:'Mayotte'},
      {val: "FM", label:'Micronesia'},
      {val: "MD", label:'Moldavia'},
      {val: "MC", label:'Mónaco'},
      {val: "MN", label:'Mongolia'},
      {val: "MS", label:'Montserrat'},
      {val: "MZ", label:'Mozambique'},
      {val: "NA", label:'Namibia'},
      {val: "NR", label:'Nauru'},
      {val: "NP", label:'Nepal'},
      {val: "NI", label:'Nicaragua'},
      {val: "NE", label:'Níger'},
      {val: "NG", label:'Nigeria'},
      {val: "NU", label:'Niue'},
      {val: "NF", label:'Norfolk'},
      {val: "NO", label:'Noruega'},
      {val: "NC", label:'Nueva Caledonia'},
      {val: "NZ", label:'Nueva Zelanda'},
      {val: "OM", label:'Omán'},
      {val: "NL", label:'Países Bajos'},
      {val: "PA", label:'Panamá'},
      {val: "PG", label:'Papúa Nueva Guinea'},
      {val: "PK", label:'Paquistán'},
      {val: "PN", label:'Pitcairn'},
      {val: "PF", label:'Polinesia Francesa'},
      {val: "PL", label:'Polonia'},
      {val: "PT", label:'Portugal'},
      {val: "PR", label:'Puerto Rico'},
      {val: "QA", label:'Qatar'},
      {val: "UK", label:'Reino Unido'},
      {val: "CF", label:'República Centroafricana'},
      {val: "CZ", label:'República Checa'},
      {val: "ZA", label:'República de Sudáfrica'},
      {val: "DO", label:'República Dominicana'},
      {val: "SK", label:'República Eslovaca'},
      {val: "RE", label:'Reunión'},
      {val: "RW", label:'Ruanda'},
      {val: "RO", label:'Rumania'},
      {val: "RU", label:'Rusia'},
      {val: "EH", label:'Sahara Occidental'},
      {val: "KN", label:'Saint Kitts y Nevis'},
      {val: "WS", label:'Samoa'},
      {val: "AS", label:'Samoa Americana'},
      {val: "SM", label:'San Marino'},
      {val: "VC", label:'San Vicente y Granadinas'},
      {val: "SH", label:'Santa Helena'},
      {val: "LC", label:'Santa Lucía'},
      {val: "ST", label:'Santo Tomé y Príncipe'},
      {val: "SN", label:'Senegal'},
      {val: "SC", label:'Seychelles'},
      {val: "SL", label:'Sierra Leona'},
      {val: "SG", label:'Singapur'},
      {val: "SY", label:'Siria'},
      {val: "SO", label:'Somalia'},
      {val: "LK", label:'Sri Lanka'},
      {val: "PM", label:'St. Pierre y Miquelon'},
      {val: "SZ", label:'Suazilandia'},
      {val: "SD", label:'Sudán'},
      {val: "SE", label:'Suecia'},
      {val: "CH", label:'Suiza'},
      {val: "SR", label:'Surinam'},
      {val: "TH", label:'Tailandia'},
      {val: "TW", label:'Taiwán'},
      {val: "TZ", label:'Tanzania'},
      {val: "TJ", label:'Tayikistán'},
      {val: "TF", label:'Territorios franceses del Sur'},
      {val: "TP", label:'Timor Oriental'},
      {val: "TG", label:'Togo'},
      {val: "TO", label:'Tonga'},
      {val: "TT", label:'Trinidad y Tobago'},
      {val: "TN", label:'Túnez'},
      {val: "TM", label:'Turkmenistán'},
      {val: "TR", label:'Turquía'},
      {val: "TV", label:'Tuvalu'},
      {val: "UA", label:'Ucrania'},
      {val: "UG", label:'Uganda'},
      {val: "UZ", label:'Uzbekistán'},
      {val: "VU", label:'Vanuatu'},
      {val: "VN", label:'Vietnam'},
      {val: "YE", label:'Yemen'},
      {val: "YU", label:'Yugoslavia'},
      {val: "ZM", label:'Zambia'},
      {val: "ZW", label:'Zimbabue'},
    ],

    provinciasOL: [
	    {val: "no_definido", label: 'Seleccione Provincia'},
      {val: "intl", label:'Internacional'},
	    {val: "CABA", label: 'CABA'},
	    {val: "BuenosAires", label: 'Buenos Aires'},
	    {val: "Cordoba", label: 'Córdoba'},
	    {val: "SantaFe", label: 'Santa Fe'},
	    {val: "Corrientes", label: 'Corrientes'},
	    {val: "Misiones", label: 'Misiones'},
	    {val: "EntreRios", label: 'Entre Rios'},
	    {val: "SantiagoDelEstero", label: 'Santiago del Estero'},
	    {val: "Formosa", label: 'Formosa'},
	    {val: "Chaco", label: 'Chaco'},
	    {val: "Tucuman", label: 'Tucumán'},
	    {val: "Jujuy", label: 'Jujuy'},
	    {val: "Salta", label: 'Salta'},
	    {val: "LaRioja", label: 'La Rioja'},
	    {val: "Catamarca", label: 'Catamarca'},
	    {val: "SanJuan", label: 'San Juan'},
	    {val: "Mendoza", label: 'Mendoza'},
	    {val: "SanLuis", label: 'San luis'},
	    {val: "LaPampa", label: 'La Pampa'},
	    {val: "RioNegro", label: 'Rio Negro'},
	    {val: "Neuquen", label: 'Neuquen'},
	    {val: "Chubut", label: 'Chubut'},
	    {val: "SantaCruz", label: 'Santa Cruz'},
	    {val: "TierraDelFuego", label: 'Tierra del Fuego'},
    ],

    nivel_ejecucionOL:[
        {val:'no_definido',         label:'Nivel de Ejecución',  classattr:'info'},
        {val:'enproceso',           label:'Alta usuario',         classattr:'info'},
        {val:'submit_definitivo',   label:'Alta definitiva',      classattr:'warning'},
        {val:'comprador_aceptado',  label:'Aceptado',  classattr:'info'},
        {val:'comprador_rechazado', label:'Rechazado', classattr:'info'},
        {val:'observado',           label:'Observado', classattr:'info'},
    ],

    nivel_ejecucion_showcaseOL:[
        {val:'no_definido',         label:'Nivel de Ejecución',  classattr:'info'},
        {val:'enproceso',           label:'Alta usuario',         classattr:'info'},
        {val:'submit_definitivo',   label:'Alta definitiva',      classattr:'warning'},
        {val:'aceptado',            label:'Aceptado',  classattr:'info'},
        {val:'rechazado',           label:'Rechazado', classattr:'info'},
        {val:'observado',           label:'Observado', classattr:'info'},
    ],

    estado_altaOL:[
        {val:'no_definido',  label:'Nivel de Ejecución',  classattr:'info'},
        {val:'activo',       label:'Activo',         classattr:'info'},
        {val:'baja',         label:'Anulado/ baja',  classattr:'warning'},
    ],

    sectorOL: [
        {val: 'no_definido',  label:'Sector Cultural'},
        {val: 'aescenicas',  label:'Artes escénicas'},
        {val: 'audiovisual',  label:'Audiovisual'},
        {val: 'disenio',  label:'Diseño'},
        {val: 'editorial',  label:'Editorial'},
        {val: 'musica',  label:'Música'},
        {val: 'videojuegos',  label:'Videojuegos'},
    ],

    sectorUppercaseOL: [
        {val: 'no_definido',  label:'Sector Cultural'},
        {val: 'aescenicas',   label:'ARTES ESCÉNICAS'},
        {val: 'audiovisual',  label:'AUDIOVISUAL'},
        {val: 'disenio',      label:'DISEÑO'},
        {val: 'editorial',    label:'EDITORIAL'},
        {val: 'musica',       label:'MÚSICA'},
        {val: 'videojuegos',  label:'VIDEOJUEGOS'},
    ],

    subSectorOL:{
        no_definido:[
          {val: 'no_definido',  label:'Subsectores'},
        ],
        aescenicas:[
          {val: 'no_definido',  label:'Subsector de Artes Escénicas'},
          {val: 'diseniador', label: 'Diseñador/realizador/técnicos'},
          {val: 'direccion', label: 'Dirección'},
          {val: 'dramaturgia', label: 'Dramaturgia'},
          {val: 'coreografia', label: 'Coreografía'},
          {val: 'programadorfestivales', label: 'Progamadores festivales'},
          {val: 'programadorsalas', label: 'Programadores de salas de exhibición'},
          {val: 'camaras', label: 'Cámaras/ Asociaciones'},
          {val: 'proveedores', label: 'Proveedores de bienes o servicios'},
        ],
        audiovisual:[
          {val: 'no_definido',  label:'Subsector de Artes Audiovisuales'},
          {val: 'pservicios', label: 'Proveedores de bienes y servicios'},
          {val: 'pcontenidos', label: 'Productora de Contenido'},
          {val: 'servicios', label: 'Servicios de Producción'},
          {val: 'vjs', label: 'VJS, realizadores de videoclip'},
          {val: 'profesional', label: 'Profesionales'},
          {val: 'programador', label: 'Programadores de festivales'},
          {val: 'distribuidor', label: 'Distribuidores'},
          {val: 'exhibtelevision', label: 'Exhibidores TV'},
          {val: 'exhibcine', label: 'Exhibidores cine'},
          {val: 'exhibmultiplataforma', label: 'Exhibidores multiplataforma'},
          {val: 'camaras', label: 'Cámaras/ Asociaciones'},
          {val: 'editores', label: 'Editores de publicaciones'},
        ],
        disenio: [
          {val: 'no_definido',  label:'Subsector de Diseño'},
          {val: 'grafico', label: 'Gráfico/ Ilustración'},
          {val: 'indumentaria', label: 'Indumentaria'},
          {val: 'industrial', label: 'Industrial/ objetos'},
          {val: 'joyeria', label: 'Joyería'},
          {val: 'multimedia', label: 'Multimedia'},
        ],
        editorial: [
          {val: 'no_definido',  label:'Subsector de Editorial'},
          {val: 'editor', label: 'Editor'},
          {val: 'libreria', label: 'Librería'},
          {val: 'distribuidora', label: 'Distribuidora'},
          {val: 'ilustrador', label: 'Ilustrador'},
          {val: 'revistacultural', label: 'Revista cultural'},
          {val: 'elecronico', label: 'Editor de publicaciones'},
        ],
        musica: [
          {val: 'no_definido',  label:'Subsector de Música'},
          {val: 'representante', label: 'Representante'},
          {val: 'produccion', label: 'Producción'},
          {val: 'festival', label: 'Festival'},
          {val: 'salas', label: 'Sala de concierto'},
          {val: 'sello', label: 'Sello discográfico'},
          {val: 'servicios', label: 'Servicios afines'},
          {val: 'camaras', label: 'Cámaras/ Asociaciones'},
        ],
        videojuegos:[
          {val: 'no_definido',  label:'Subsector de Videojuegos'},
          {val: 'programacion',  label: 'Programación'},
          {val: 'arte',  label: 'Arte 2d/3d'},
          {val: 'disenio',  label: 'Diseñador Lúdico'},
          {val: 'guion',  label: 'Guión'},
          {val: 'produccion',  label: 'Producción'},
          {val: 'musica',  label: 'Música'},
          {val: 'testeo',  label: 'Testeo'},
          {val: 'comunicacion',  label: 'Comunicación y Marketing'},
          {val: 'comunidades',  label: 'Gestión de comunidades'},
        ],
    },

    rolesInteractionsOL: [
        {val:'no_definido', label:'Esta solicitud es para...'},
        {val:'comprador',   label:'Demandar productos o servicios'},
        {val:'vendedor',    label:'Ofrecer productos o servicios'},
    ],

    rolesOL: [
        {val:'no_definido', label:'Seleccione rol'},
        {val:'comprador',   label:'Comprador'},
        {val:'vendedor',    label:'Vendedor'},
    ],
    nivel_interesOL: [
        {val:'3' , label:'Muy interesado'},
        {val:'2' , label:'Interesado'},
        {val:'1' , label:'Poco interesado'},
        {val:'0' , label:'No interesado'},
    ],

    showcaseTSolicitudOL: [
        {val:'no_definido', label:'Seleccione Tipo de Solicitud'},
        {val:'aescenicas',  label:'Artes Escénicas'},
        {val:'musica',      label:'Música'},
    ],

    showcaseMusicaOL: [
        {val:'no_definido', label:'Seleccione Género'},
        {val:'tango',        label:'Tango'},
        {val:'folklore',     label:'Folklore'},
        {val:'tropical',     label:'Tropical'},
        {val:'rock',         label:'Rock'},
        {val:'reggae',       label:'Reggae'},
        {val:'electronica',  label:'Electrónica'},
        {val:'jazz',         label:'Jazz'},
        {val:'contemporanea', label:'Contemporánea'},
        {val:'fusion',       label:'Fusión'},
        {val:'otros',        label:'Otros géneros'},
    ],

    showcaseAEscenicasOL: [
        {val:'no_definido', label:'Seleccione Género'},
        {val:'teatro',      label:'Teatro'},
        {val:'teatrodanza', label:'Danza'},
        {val:'titeres',     label:'Títeres'},
        {val:'circo',       label:'Circo'},
        {val:'performance', label:'Performance'},
        {val:'comediamusical', label:'Comedia Musical'},
        {val:'otros',       label:'Otros géneros'},
    ],

    subgeneroOL: {
      no_definido: [
          {val:'no_definido', label:'Seleccione Género'},
      ],

      musica: [
          {val:'no_definido', label:'Seleccione Género'},
          {val:'tango',        label:'Tango'},
          {val:'folklore',     label:'Folklore'},
          {val:'tropical',     label:'Tropical'},
          {val:'rock',         label:'Rock'},
          {val:'reggae',       label:'Reggae'},
          {val:'electronica',  label:'Electrónica'},
          {val:'jazz',         label:'Jazz'},
          {val:'contemporanea', label:'Contemporánea'},
          {val:'fusion',       label:'Fusión'},
          {val:'otros',        label:'Otros géneros'},
      ],

      aescenicas: [
          {val:'no_definido', label:'Seleccione Género'},
          {val:'teatro',      label:'Teatro'},
          {val:'teatrodanza', label:'Danza'},
          {val:'titeres',     label:'Títeres'},
          {val:'circo',       label:'Circo'},
          {val:'performance', label:'Performance'},
          {val:'comediamusical', label:'Comedia Musical'},
          {val:'otros',       label:'Otros géneros'},
      ],
    },

    estado_reunion:[
        {val:'no_definido', label:'Seleccione Estado'},
        {val:'borrador',  label:'Borrador',  classattr:'info'},
        {val:'observado',       label:'Observado',         classattr:'info'},
        {val:'confirmado',         label:'Confirmado',  classattr:'warning'},
        {val:'unavailable',         label:'Sin disponibilidad',  classattr:'danger'},
    ]
};
